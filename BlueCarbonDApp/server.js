const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path'); // 🔴 1. 新增：引入路径模块

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔴 2. 新增：告诉后端，把 src 文件夹里的 index.html 和 JS/CSS 发给浏览器！
app.use(express.static(path.join(__dirname, 'src')));

// 1. 初始化 SQLite 数据库
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) console.error("数据库连接失败:", err);
    else console.log("📦 SQLite 数据库连接成功！");
});



// ==========================================
// 初始化数据库表 (使用 db.serialize 强制按顺序执行)
// ==========================================
db.serialize(() => {
    // 1. 创建用户表
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT,
            status TEXT DEFAULT 'pending',
            email TEXT UNIQUE,
            phone TEXT UNIQUE,
            createdAt TEXT
        )
    `);

    // 🔴 2. 注入超级管理员账号 (如果不存在的话)
    // 用户名: admin | 密码: password | 状态: approved 自动通过
    const adminSql = `
        INSERT OR IGNORE INTO users (username, password, role, status, createdAt) 
        VALUES ('admin', 'password', 'admin', 'approved', '2026-08-23 12:00:00')
    `;
    db.run(adminSql, (err) => {
        if (err) console.error("Admin 注入失败:", err);
        else console.log("👑 超级管理员 (admin / password) 状态正常！");
    });

    // 3. 创建项目表
    // 创建项目表 (🔴 新增 username 字段)
    db.run(`
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,    /* 🔴 记录是谁交的 */
            projName TEXT,
            devAddress TEXT,  /* 记录收钱的钱包 */
            location TEXT,
            capacity INTEGER,
            deadline TEXT,
            carbonVolume INTEGER,
            status TEXT DEFAULT 'pending',
            createdAt TEXT
        )
    `);

    // 4. 创建交易记录表 (用于追踪 Quota 卖给谁了)
    db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            projectId INTEGER,
            buyerName TEXT,
            amount INTEGER,
            txDate TEXT
        )
    `);
});

// ================= API 接口 =================

// ==========================================
// User API: 注册新用户 (强制注入精准时间戳)
// ==========================================
app.post('/register', (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.json({ success: false, message: "请填写完整信息" });
    }

    // 🔴 核心修复：用 Node.js 抓取当下真实的服务器时间
    const now = new Date();
    // 将时间格式化为 YYYY-MM-DD HH:MM:SS 的标准格式
    const createdAt = now.toISOString().replace('T', ' ').substring(0, 19);

    // 显式地把 createdAt 塞进 INSERT 语句里！
    const sql = `INSERT INTO users (username, password, role, status, createdAt) 
    VALUES (?, ?, ?, 'pending', ?)`;
    
    db.run(sql, [username, password, role, createdAt], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE')) {
                return res.json({ success: false, message: "该用户名已被注册" });
            }
            return res.status(500).json({ success: false, message: "数据库写入失败" });
        }
        console.log(`👤 新用户注册: ${username} (${role}) - 注册时间: ${createdAt}`);
        res.json({ success: true });
    });
});

// 接口 2：处理用户登录与状态拦截
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    const sql = `SELECT * FROM users WHERE username = ? AND password = ?`;
    db.get(sql, [username, password], (err, row) => {
        if (err || !row) {
            return res.json({ success: false, message: "❌ 账号或密码错误！" });
        }

        // 核心逻辑：根据 status 决定能否放行
        if (row.status === 'pending') {
            return res.json({ success: false, message: "⏳ 您的账号正在等待 Admin 审核，请稍后再试。" });
        } else if (row.status === 'rejected') {
            return res.json({ success: false, message: "🚫 您的账号注册已被 Admin 拒绝。" });
        } else if (row.status === 'approved') {
            // 审核通过，放行并返回角色信息
            console.log(`✅ 用户登录成功: ${username} (${row.role})`);
            return res.json({ success: true, role: row.role, username: row.username });
        }
    });
});

// ================= Admin 专属 API =================

// 获取所有待审核的注册用户
app.get('/pending-users', (req, res) => {
    // 只查询 status 为 'pending' 的用户
    const sql = `SELECT id, username, role FROM users WHERE status = 'pending'`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: "数据库错误" });
        res.json(rows);
    });
});

// Admin 批准用户
app.post('/approve-user', (req, res) => {
    const { userId } = req.body;
    const sql = `UPDATE users SET status = 'approved' WHERE id = ?`;
    db.run(sql, [userId], function(err) {
        if (err) return res.json({ success: false, message: "更新状态失败" });
        console.log(`✅ Admin 已批准用户 ID: ${userId}`);
        res.json({ success: true });
    });
});

// Admin 拒绝用户
app.post('/reject-user', (req, res) => {
    const { userId } = req.body;
    const sql = `UPDATE users SET status = 'rejected' WHERE id = ?`;
    db.run(sql, [userId], function(err) {
        if (err) return res.json({ success: false, message: "更新状态失败" });
        console.log(`🚫 Admin 已拒绝用户 ID: ${userId}`);
        res.json({ success: true, message: "✅ 注册成功！已进入待审核队列，请等待 Admin 审批。" });
    });
});

// 获取所有用户 (用于 Overview 与过滤)
// Admin 获取所有用户大名单
app.get('/all-users', (req, res) => {
    db.all(`SELECT * FROM users`, [], (err, rows) => {
        if (err) return res.status(500).json({ success: false });
        res.json(rows);
    });
});

// Admin 注销(彻底删除)用户释放 Username
app.post('/delete-user', (req, res) => {
    const { userId } = req.body;
    const sql = `DELETE FROM users WHERE id = ?`;
    db.run(sql, [userId], function(err) {
        if (err) return res.json({ success: false, message: "注销失败" });
        console.log(`🗑️ Admin 已彻底注销并释放用户 ID: ${userId}`);
        res.json({ success: true });
    });
});

// ================= Developer & Project API =================

// 1. Developer 提交新项目
app.post('/submit-project', (req, res) => {
    // 🔴 加上 username
    const { username, projName, devAddress, location, capacity, deadline } = req.body; 
    
    const carbonVolume = capacity * 5; 
    
    // 🔴 SQL 语句也要加上 username
    const sql = `INSERT INTO projects (username, projName, devAddress, location, capacity, deadline, carbonVolume, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`;
    
    db.run(sql, [username, projName, devAddress, location, capacity, deadline, carbonVolume], function(err) {
        if (err) return res.status(500).json({ success: false, message: "数据库写入失败" });
        console.log(`🌱 新项目提交: ${projName} - 提交者: ${username}`);
        res.json({ success: true });
    });
});

// 2. Admin 获取待审核项目
app.get('/pending-projects', (req, res) => {
    const sql = `SELECT * FROM projects WHERE status = 'pending'`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ success: false });
        res.json(rows);
    });
});

// 3. Admin 批准项目 (上链发币后调用)
app.post('/approve-project', (req, res) => {
    const { id } = req.body;
    const sql = `UPDATE projects SET status = 'approved' WHERE id = ?`;
    db.run(sql, [id], function(err) {
        if (err) return res.json({ success: false });
        res.json({ success: true });
    });
});

// 4. Admin 驳回项目
app.post('/reject-project', (req, res) => {
    const { id } = req.body;
    const sql = `UPDATE projects SET status = 'rejected' WHERE id = ?`;
    db.run(sql, [id], function(err) {
        if (err) return res.json({ success: false });
        console.log(`🚫 Admin 已驳回项目 ID: ${id}`);
        res.json({ success: true });
    });
});

// 获取所有项目 (无论什么状态，供 Admin 的 Overview 过滤使用)
app.get('/all-projects', (req, res) => {
    const sql = `SELECT * FROM projects`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ success: false });
        res.json(rows);
    });
});

// ================= Admin Dashboard 真实数据 API =================
app.get('/admin-stats', (req, res) => {
    // 封装一个 Promise 函数，方便我们同时跑多条 SQL 统计
    const getStat = (sql) => new Promise((resolve, reject) => {
        db.get(sql, [], (err, row) => {
            if (err) reject(err);
            else resolve(Object.values(row)[0] || 0); // 抓取 COUNT 或 SUM 的结果
        });
    });

    Promise.all([
        // 1. 算出真正印了多少币 (所有 approved 项目的碳汇总和)
        getStat(`SELECT SUM(carbonVolume) FROM projects WHERE status = 'approved'`),
        // 2. 排队等待审核的项目数
        getStat(`SELECT COUNT(*) FROM projects WHERE status = 'pending'`),
        // 3. 排队等待审核的新用户数
        getStat(`SELECT COUNT(*) FROM users WHERE status = 'pending'`),
        // 4. 被无情驳回的用户数 + 项目数 (合并计算)
        getStat(`SELECT COUNT(*) FROM users WHERE status = 'rejected'`),
        getStat(`SELECT COUNT(*) FROM projects WHERE status = 'rejected'`),
        // 5. 计算生态供需比：已批准的开发者 vs 买家
        getStat(`SELECT COUNT(*) FROM users WHERE role = 'developer' AND status = 'approved'`),
        getStat(`SELECT COUNT(*) FROM users WHERE role = 'buyer' AND status = 'approved'`)
    ]).then(results => {
        const [totalMinted, pendingProj, pendingUsers, rejectedUsers, rejectedProj, devs, buyers] = results;
        
        res.json({
            success: true,
            totalMinted: totalMinted || 0, // 如果还没发过币，就是 0
            pendingProjects: pendingProj,
            pendingUsers: pendingUsers,
            totalRejections: rejectedUsers + rejectedProj,
            devCount: devs,
            buyerCount: buyers
        });
    }).catch(err => {
        console.error("统计数据失败:", err);
        res.status(500).json({ success: false });
    });
});

// ==========================================
// User API: 获取当前登录用户的真实 Profile
// ==========================================
app.get('/user-profile', (req, res) => {
    const { username } = req.query; 
    if (!username) return res.json({ success: false });

    // 🔴 核心修复：把 email 和 phone 也一起抓取出来！
    const sql = `SELECT id, username, role, status, email, phone, createdAt FROM users WHERE username = ?`;
    db.get(sql, [username], (err, row) => {
        if (err || !row) return res.json({ success: false, message: "找不到用户" });
        res.json({ success: true, data: row });
    });
});

// ==========================================
// User API: 更新个人资料 (Email & Phone)
// ==========================================
app.post('/update-profile', (req, res) => {
    const { username, email, phone } = req.body;

    if (!username) return res.json({ success: false, message: "未提供用户名" });

    // 执行 UPDATE 语句，把新资料写进当前用户的行里
    const sql = `UPDATE users SET email = ?, phone = ? WHERE username = ?`;
    
    db.run(sql, [email, phone, username], function(err) {
        if (err) {
            // 如果触发了 UNIQUE 约束，说明别人已经用了这个邮箱或电话
            if (err.message.includes('UNIQUE')) {
                return res.json({ success: false, message: "该 Email 或 Contact Number 已被其他用户绑定！" });
            }
            return res.json({ success: false, message: "数据库更新失败" });
        }
        res.json({ success: true });
    });
});

// ==========================================
// User API: 独立修改密码 (无需 Admin 审批)
// ==========================================
app.post('/update-password', (req, res) => {
    const { username, oldPassword, newPassword } = req.body;

    if (!username || !oldPassword || !newPassword) {
        return res.json({ success: false, message: "请填写完整信息" });
    }

    // 1. 先去数据库核对“当前密码”是否正确
    const checkSql = `SELECT * FROM users WHERE username = ? AND password = ?`;
    db.get(checkSql, [username, oldPassword], (err, row) => {
        if (err || !row) {
            return res.json({ success: false, message: "❌ 当前密码错误，无法修改！" });
        }

        // 2. 如果当前密码正确，直接用新密码覆盖它
        const updateSql = `UPDATE users SET password = ? WHERE username = ?`;
        db.run(updateSql, [newPassword, username], function(updateErr) {
            if (updateErr) return res.json({ success: false, message: "密码更新失败" });
            
            console.log(`🔑 用户 ${username} 成功修改了密码`);
            res.json({ success: true });
        });
    });
});

// ==========================================
// Developer API: 获取我提交的所有历史项目
// ==========================================
app.get('/my-projects', (req, res) => {
    const { username } = req.query;
    if (!username) return res.json({ success: false });

    // 🔴 精准匹配真正的提交者！
    const sql = `SELECT * FROM projects WHERE username = ? ORDER BY id DESC`;
    
    db.all(sql, [username], (err, rows) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, data: rows });
    });
});

// ==========================================
// Developer API: 查看项目详情与销售记录
// ==========================================
app.get('/project-details', (req, res) => {
    const { id } = req.query;
    if (!id) return res.json({ success: false, message: "Missing ID" });

    // 1. 先查出这个项目的基本信息
    db.get(`SELECT * FROM projects WHERE id = ?`, [id], (err, project) => {
        if (err || !project) return res.json({ success: false, message: "找不到项目" });

        // 2. 再去交易表里，把这个项目所有的被买记录翻出来
        db.all(`SELECT * FROM transactions WHERE projectId = ? ORDER BY id DESC`, [id], (err, txs) => {
            const transactions = txs || [];
            
            // 3. 计算数学题：总共卖了多少？还剩多少？
            const totalSold = transactions.reduce((sum, tx) => sum + tx.amount, 0);
            const remainingQuota = project.carbonVolume - totalSold;

            res.json({
                success: true,
                project: project,
                sales: transactions,
                stats: { sold: totalSold, remaining: remainingQuota }
            });
        });
    });
});

// 启动服务器
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 后端服务器已启动！监听端口: http://localhost:${PORT}`);
});