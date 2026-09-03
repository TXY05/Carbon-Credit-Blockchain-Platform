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
        walletAddress TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        email TEXT UNIQUE NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        createdAt TEXT
    )
`);

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

    // 🔴 新增字段：ecosystemType, pricePerToken, minted
    db.run(`ALTER TABLE projects ADD COLUMN ecosystemType TEXT`, () => { });
    db.run(`ALTER TABLE projects ADD COLUMN pricePerToken TEXT`, () => { });
    db.run(`ALTER TABLE projects ADD COLUMN minted INTEGER DEFAULT 0`, () => { });
    db.run(`ALTER TABLE projects ADD COLUMN onChainProjectID TEXT`, () => { });
    
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
// ==========================================
// User API: Register
// MetaMask wallet is the account identity
// ==========================================

app.post('/register', (req, res) => {

    const {
        walletAddress,
        username,
        email,
        phone,
        role
    } = req.body;


    // ----------------------------------
    // Validate
    // ----------------------------------

    if (
        !walletAddress ||
        !username ||
        !email ||
        !phone ||
        !role
    ) {

        return res.json({
            success: false,
            message: "Please fill in all registration information."
        });

    }


    // ----------------------------------
    // Validate role
    // ----------------------------------

    if (
        role !== "buyer" &&
        role !== "developer"
    ) {

        return res.json({
            success: false,
            message: "Invalid account type."
        });

    }


    // ----------------------------------
    // Validate wallet
    // ----------------------------------

    if (
        !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)
    ) {

        return res.json({
            success: false,
            message: "Invalid MetaMask wallet address."
        });

    }


    // ----------------------------------
    // Timestamp
    // ----------------------------------

    const createdAt =
        new Date()
            .toISOString()
            .replace('T', ' ')
            .substring(0, 19);


    // ----------------------------------
    // Check whether wallet already exists
    // ----------------------------------

    db.get(
        `SELECT * FROM users WHERE walletAddress = ?`,
        [walletAddress],
        (err, existingWallet) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });

            }


            if (existingWallet) {

                return res.json({
                    success: false,
                    message:
                        "This MetaMask wallet is already registered."
                });

            }


            // ----------------------------------
            // Insert user
            // ----------------------------------

            const sql = `
                INSERT INTO users
                (
                    walletAddress,
                    username,
                    role,
                    status,
                    email,
                    phone,
                    createdAt
                )
                VALUES (?, ?, ?, 'pending', ?, ?, ?)
            `;


            db.run(
                sql,
                [
                    walletAddress,
                    username,
                    role,
                    email,
                    phone,
                    createdAt
                ],
                function (err) {

                    if (err) {

                        console.error(
                            "Registration database error:",
                            err
                        );


                        if (
                            err.message.includes("UNIQUE")
                        ) {

                            return res.json({
                                success: false,
                                message:
                                    "Username, email, or phone number is already registered."
                            });

                        }


                        return res.status(500).json({
                            success: false,
                            message:
                                "Failed to save registration."
                        });

                    }


                    console.log(
                        `👤 New registration: ${username}`
                    );

                    console.log(
                        `🦊 Wallet: ${walletAddress}`
                    );

                    console.log(
                        `Role: ${role}`
                    );


                    return res.json({
                        success: true
                    });

                }
            );

        }
    );

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
    db.run(sql, [userId], function (err) {
        if (err) return res.json({ success: false, message: "更新状态失败" });
        console.log(`✅ Admin 已批准用户 ID: ${userId}`);
        res.json({ success: true });
    });
});

// Admin 拒绝用户
app.post('/reject-user', (req, res) => {
    const { userId } = req.body;
    const sql = `UPDATE users SET status = 'rejected' WHERE id = ?`;
    db.run(sql, [userId], function (err) {
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
    db.run(sql, [userId], function (err) {
        if (err) return res.json({ success: false, message: "注销失败" });
        console.log(`🗑️ Admin 已彻底注销并释放用户 ID: ${userId}`);
        res.json({ success: true });
    });
});

// ================= Developer & Project API =================

// 1. Developer 提交新项目
app.post('/submit-project', (req, res) => {
    const { username, projName, devAddress, location, capacity, deadline, ecosystemType, pricePerToken } = req.body;

    const carbonVolume = capacity * 5;

    const sql = `INSERT INTO projects (username, projName, devAddress, location, capacity, deadline, carbonVolume, ecosystemType, pricePerToken, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`;

    db.run(sql, [username, projName, devAddress, location, capacity, deadline, carbonVolume, ecosystemType, pricePerToken], function (err) {
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
    db.run(sql, [id], function (err) {
        if (err) return res.json({ success: false });
        res.json({ success: true });
    });
});

// 4. Admin 驳回项目
app.post('/reject-project', (req, res) => {
    const { id } = req.body;
    const sql = `UPDATE projects SET status = 'rejected' WHERE id = ?`;
    db.run(sql, [id], function (err) {
        if (err) return res.json({ success: false });
        console.log(`🚫 Admin 已驳回项目 ID: ${id}`);
        res.json({ success: true });
    });
});


// 5. Dev 完成链上 mint 后，标记数据库状态
app.post('/mark-project-minted', (req, res) => {
    const { id, onChainProjectID } = req.body;
    const sql = `UPDATE projects SET minted = 1, onChainProjectID = ? WHERE id = ?`;
    db.run(sql, [onChainProjectID, id], function (err) {
        if (err) return res.json({ success: false });
        console.log(`⛏️ 项目 ID ${id} 已标记为 Minted，链上 ID: ${onChainProjectID}`);
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
// ==========================================
// Get current user profile
// ==========================================

app.get('/user-profile', (req, res) => {

    const {
        walletAddress
    } = req.query;


    if (!walletAddress) {

        return res.json({
            success: false,
            message: "Wallet address is required."
        });

    }


    const sql = `
        SELECT
            id,
            walletAddress,
            username,
            role,
            status,
            email,
            phone,
            createdAt
        FROM users
        WHERE walletAddress = ?
    `;


    db.get(
        sql,
        [walletAddress],
        (err, row) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });

            }


            if (!row) {

                return res.json({
                    success: false,
                    message: "User profile not found."
                });

            }


            return res.json({
                success: true,
                data: row
            });

        }
    );

});

app.get('/user-profile', (req, res) => {

    const { walletAddress } = req.query;

    if (!walletAddress) {
        return res.json({
            success: false,
            message: "Wallet address is required."
        });
    }

    const sql = `
        SELECT
            id,
            walletAddress,
            username,
            role,
            status,
            email,
            phone,
            createdAt
        FROM users
        WHERE LOWER(walletAddress) = LOWER(?)
    `;

    db.get(
        sql,
        [walletAddress],
        (err, row) => {

            if (err) {

                console.error(
                    "User profile database error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });
            }

            if (!row) {

                console.log(
                    "Profile not found for wallet:",
                    walletAddress
                );

                return res.json({
                    success: false,
                    message: "User profile not found."
                });
            }

            console.log(
                "Profile found:",
                row.username,
                row.walletAddress
            );

            return res.json({
                success: true,
                data: row
            });

        }
    );

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