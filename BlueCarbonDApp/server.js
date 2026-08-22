const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 1. 初始化 SQLite 数据库
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) console.error("数据库连接失败:", err);
    else console.log("📦 SQLite 数据库连接成功！");
});



// 2. 创建用户表 (自动记录用户名、密码、角色和审核状态)
// 创建用户表 (新增 createdAt 字段)
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT,
        status TEXT DEFAULT 'pending',
        createdAt DATETIME DEFAULT (datetime('now', 'localtime'))
    )
`);

// 创建项目表 (新增 createdAt 字段)
db.run(`
    CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projName TEXT,
        devAddress TEXT,
        location TEXT,
        capacity INTEGER,
        deadline TEXT,
        carbonVolume INTEGER,
        status TEXT DEFAULT 'pending',
        createdAt DATETIME DEFAULT (datetime('now', 'localtime'))
    )
`);

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
    const sql = `INSERT INTO users (username, password, role, status, createdAt) VALUES (?, ?, ?, 'pending', ?)`;
    
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
    const { projName, devAddress, location, capacity, deadline } = req.body;
    
    // 核心业务逻辑：自动计算碳信用额度。假设 1 公顷 (Capacity) 对应 5 个 BCC 代币。
    const carbonVolume = capacity * 5; 
    
    const sql = `INSERT INTO projects (projName, devAddress, location, capacity, deadline, carbonVolume, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')`;
    
    db.run(sql, [projName, devAddress, location, capacity, deadline, carbonVolume], function(err) {
        if (err) return res.status(500).json({ success: false, message: "数据库写入失败" });
        console.log(`🌱 新项目提交: ${projName || location} - 等待 Admin 审核`);
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
    const { username } = req.query; // 前端传过来的当前用户名
    if (!username) return res.json({ success: false });

    // 从数据库中抓取该用户的所有真实字段（除了密码）
    const sql = `SELECT id, username, role, status, createdAt FROM users WHERE username = ?`;
    db.get(sql, [username], (err, row) => {
        if (err || !row) return res.json({ success: false, message: "找不到用户" });
        res.json({ success: true, data: row });
    });
});

// 启动服务器
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 后端服务器已启动！监听端口: http://localhost:${PORT}`);
});