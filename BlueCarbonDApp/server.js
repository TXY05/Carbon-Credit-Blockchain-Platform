const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'src')));

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) console.error("Database connection failed:", err);
    else console.log("📦 SQLite database connection successful!");
});



// ==========================================
// Initialize database tables
// ==========================================
db.serialize(() => {
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

    db.run(`
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            projName TEXT,
            devAddress TEXT,
            location TEXT,
            capacity INTEGER,
            deadline TEXT,
            carbonVolume INTEGER,
            status TEXT DEFAULT 'pending',
            createdAt TEXT
        )
    `);

    db.run(`ALTER TABLE projects ADD COLUMN ecosystemType TEXT`, () => { });
    db.run(`ALTER TABLE projects ADD COLUMN pricePerToken TEXT`, () => { });
    db.run(`ALTER TABLE projects ADD COLUMN minted INTEGER DEFAULT 0`, () => { });
    db.run(`ALTER TABLE projects ADD COLUMN onChainProjectID TEXT`, () => { });
    
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

// ==========================================
// User API: Register
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

// ================= Admin API =================

// Get all registered users awaiting approval
app.get('/pending-users', (req, res) => {
    const sql = `SELECT id, username, role FROM users WHERE status = 'pending'`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: "数据库错误" });
        res.json(rows);
    });
});

// Admin Approved User
app.post('/approve-user', (req, res) => {
    const { userId } = req.body;
    const sql = `UPDATE users SET status = 'approved' WHERE id = ?`;
    db.run(sql, [userId], function (err) {
        if (err) return res.json({ success: false, message: "Status update failed" });
        console.log(`✅ Admin approved user ID: ${userId}`);
        res.json({ success: true });
    });
});

// Admin Rejeected User
app.post('/reject-user', (req, res) => {
    const { userId } = req.body;
    const sql = `UPDATE users SET status = 'rejected' WHERE id = ?`;
    db.run(sql, [userId], function (err) {
        if (err) return res.json({ success: false, message: "Status update failed" });
        console.log(`🚫 Admin 已拒绝用户 ID: ${userId}`);
        res.json({ success: true, message: "✅ Registration successful! Please wait for Admin approval." });
    });
});

// Admin Get all user lists
app.get('/all-users', (req, res) => {
    db.all(`SELECT * FROM users`, [], (err, rows) => {
        if (err) return res.status(500).json({ success: false });
        res.json(rows);
    });
});

// Admin Logout (Permanent Deletion) Username
app.post('/delete-user', (req, res) => {
    const { userId } = req.body;
    const sql = `DELETE FROM users WHERE id = ?`;
    db.run(sql, [userId], function (err) {
        if (err) return res.json({ success: false, message: "Cancellation failed" });
        console.log(`🗑️ Admin has been completely logged out and the user has been released. ID: ${userId}`);
        res.json({ success: true });
    });
});

// ================= Developer & Project API =================

// 1. Developer Submit a new project
app.post('/submit-project', (req, res) => {
    const { username, projName, devAddress, location, capacity, deadline, ecosystemType, pricePerToken } = req.body;

    const carbonVolume = capacity * 5;

    const sql = `INSERT INTO projects (username, projName, devAddress, location, capacity, deadline, carbonVolume, ecosystemType, pricePerToken, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`;

    db.run(sql, [username, projName, devAddress, location, capacity, deadline, carbonVolume, ecosystemType, pricePerToken], function (err) {
        if (err) return res.status(500).json({ success: false, message: "Database write failure" });
        console.log(`🌱 New project submission: ${projName} - Submitter: ${username}`);
        res.json({ success: true });
    });
});

// 2. Admin retrieves projects awaiting review
app.get('/pending-projects', (req, res) => {
    const sql = `SELECT * FROM projects WHERE status = 'pending'`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ success: false });
        res.json(rows);
    });
});

// 3. Admin approves the project (called after token issuance on the blockchain)
app.post('/approve-project', (req, res) => {
    const { id } = req.body;
    const sql = `UPDATE projects SET status = 'approved' WHERE id = ?`;
    db.run(sql, [id], function (err) {
        if (err) return res.json({ success: false });
        res.json({ success: true });
    });
});

// 4. Admin rejected the project
app.post('/reject-project', (req, res) => {
    const { id } = req.body;
    const sql = `UPDATE projects SET status = 'rejected' WHERE id = ?`;
    db.run(sql, [id], function (err) {
        if (err) return res.json({ success: false });
        console.log(`🚫 Admin 已驳回项目 ID: ${id}`);
        res.json({ success: true });
    });
});


// 5. After Dev completes the on-chain mint, it marks the database state.
app.post('/mark-project-minted', (req, res) => {
    const { id, onChainProjectID } = req.body;
    const sql = `UPDATE projects SET minted = 1, onChainProjectID = ? WHERE id = ?`;
    db.run(sql, [onChainProjectID, id], function (err) {
        if (err) return res.json({ success: false });
        console.log(`⛏️ 项目 ID ${id} 已标记为 Minted，链上 ID: ${onChainProjectID}`);
        res.json({ success: true });
    });
});

app.get('/all-projects', (req, res) => {
    const sql = `SELECT * FROM projects`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ success: false });
        res.json(rows);
    });
});

// ================= Admin Dashboard 真实数据 API =================
app.get('/admin-stats', (req, res) => {
    const getStat = (sql) => new Promise((resolve, reject) => {
        db.get(sql, [], (err, row) => {
            if (err) reject(err);
            else resolve(Object.values(row)[0] || 0);
        });
    });

    Promise.all([
        getStat(`SELECT SUM(carbonVolume) FROM projects WHERE status = 'approved'`),
        getStat(`SELECT COUNT(*) FROM projects WHERE status = 'pending'`),
        getStat(`SELECT COUNT(*) FROM users WHERE status = 'pending'`),
        getStat(`SELECT COUNT(*) FROM users WHERE status = 'rejected'`),
        getStat(`SELECT COUNT(*) FROM projects WHERE status = 'rejected'`),
        getStat(`SELECT COUNT(*) FROM users WHERE role = 'developer' AND status = 'approved'`),
        getStat(`SELECT COUNT(*) FROM users WHERE role = 'buyer' AND status = 'approved'`)
    ]).then(results => {
        const [totalMinted, pendingProj, pendingUsers, rejectedUsers, rejectedProj, devs, buyers] = results;

        res.json({
            success: true,
            totalMinted: totalMinted || 0,
            pendingProjects: pendingProj,
            pendingUsers: pendingUsers,
            totalRejections: rejectedUsers + rejectedProj,
            devCount: devs,
            buyerCount: buyers
        });
    }).catch(err => {
        console.error("Statistical data failure:", err);
        res.status(500).json({ success: false });
    });
});

app.post('/update-profile', (req, res) => {
    const { username, email, phone } = req.body;

    if (!username) {
        return res.json({ success: false, message: "Missing username." });
    }

    const sql = `UPDATE users SET email = ?, phone = ? WHERE username = ?`;

    db.run(sql, [email, phone, username], function (err) {
        if (err) {
            if (err.message.includes("UNIQUE")) {
                return res.json({ success: false, message: "This email or contact number is already in use." });
            }
            return res.status(500).json({ success: false, message: "Database error." });
        }
        if (this.changes === 0) {
            return res.json({ success: false, message: "User not found." });
        }
        res.json({ success: true });
    });
});

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
// Developer API: Get all my historical projects submitted
// ==========================================
app.get('/my-projects', (req, res) => {
    const { username } = req.query;
    if (!username) return res.json({ success: false });

    const sql = `SELECT * FROM projects WHERE username = ? ORDER BY id DESC`;

    db.all(sql, [username], (err, rows) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, data: rows });
    });
});

// ==========================================
// Developer API: View project details and sales records
// ==========================================
app.get('/project-details', (req, res) => {
    const { id } = req.query;
    if (!id) return res.json({ success: false, message: "Missing ID" });

    db.get(`SELECT * FROM projects WHERE id = ?`, [id], (err, project) => {
        if (err || !project) return res.json({ success: false, message: "找不到项目" });

        db.all(`SELECT * FROM transactions WHERE projectId = ? ORDER BY id DESC`, [id], (err, txs) => {
            const transactions = txs || [];

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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 The backend server is running! Listening on port: http://localhost:${PORT}`);
});