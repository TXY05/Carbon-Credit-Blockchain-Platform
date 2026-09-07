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

app.post('/register', (req, res) => {

    const {
        walletAddress,
        username,
        email,
        phone,
        role
    } = req.body;

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

    if (
        role !== "buyer" &&
        role !== "developer"
    ) {
        return res.json({
            success: false,
            message: "Invalid account type."
        });
    }
    if (
        !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)
    ) {
        return res.json({
            success: false,
            message: "Invalid MetaMask wallet address."
        });
    }
    const createdAt =
        new Date()
            .toISOString()
            .replace('T', ' ')
            .substring(0, 19);

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


app.get('/pending-users', (req, res) => {
    const sql = `SELECT id, username, role FROM users WHERE status = 'pending'`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: "数据库错误" });
        res.json(rows);
    });
});

app.post('/approve-user', (req, res) => {
    const { userId } = req.body;
    const sql = `UPDATE users SET status = 'approved' WHERE id = ?`;
    db.run(sql, [userId], function (err) {
        if (err) return res.json({ success: false, message: "Status update failed" });
        console.log(`✅ Admin approved user ID: ${userId}`);
        res.json({ success: true });
    });
});

app.post('/reject-user', (req, res) => {
    const { userId } = req.body;
    const sql = `UPDATE users SET status = 'rejected' WHERE id = ?`;
    db.run(sql, [userId], function (err) {
        if (err) return res.json({ success: false, message: "Status update failed" });
        console.log(`🚫 Admin 已拒绝用户 ID: ${userId}`);
        res.json({ success: true, message: "✅ Registration successful! Please wait for Admin approval." });
    });
});

app.get('/all-users', (req, res) => {
    db.all(`SELECT * FROM users`, [], (err, rows) => {
        if (err) return res.status(500).json({ success: false });
        res.json(rows);
    });
});

app.post('/delete-user', (req, res) => {
    const { userId } = req.body;
    const sql = `DELETE FROM users WHERE id = ?`;
    db.run(sql, [userId], function (err) {
        if (err) return res.json({ success: false, message: "Cancellation failed" });
        console.log(`🗑️ Admin has been completely logged out and the user has been released. ID: ${userId}`);
        res.json({ success: true });
    });
});

app.post('/submit-project', (req, res) => {
    const { username, projName, devAddress, location, capacity, deadline, ecosystemType, pricePerToken, onChainProjectID } = req.body;

    const carbonVolume = capacity * 5;

    const sql = `INSERT INTO projects (username, projName, devAddress, location, capacity, deadline, carbonVolume, ecosystemType, pricePerToken, onChainProjectID, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`;

    db.run(sql, [username, projName, devAddress, location, capacity, deadline, carbonVolume, ecosystemType, pricePerToken, onChainProjectID], function (err) {
        if (err) {
            console.error("DB Write Error:", err);
            return res.status(500).json({ success: false, message: "Database write failure" });
        }
        console.log(`🌱 New project submission: ${projName} - Submitter: ${username}`);
        res.json({ success: true });
    });
});

app.get('/pending-projects', (req, res) => {
    const sql = `SELECT * FROM projects WHERE status = 'pending'`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ success: false });
        res.json(rows);
    });
});

app.post('/approve-project', (req, res) => {
    const { id } = req.body;
    const sql = `UPDATE projects SET status = 'approved' WHERE id = ?`;
    db.run(sql, [id], function (err) {
        if (err) return res.json({ success: false });
        res.json({ success: true });
    });
});

app.post('/reject-project', (req, res) => {
    const { id } = req.body;
    const sql = `UPDATE projects SET status = 'rejected' WHERE id = ?`;
    db.run(sql, [id], function (err) {
        if (err) return res.json({ success: false });
        console.log(`🚫 Admin 已驳回项目 ID: ${id}`);
        res.json({ success: true });
    });
});


app.post('/mark-project-minted', (req, res) => {
    const { id, onChainProjectID } = req.body;
    const sql = `UPDATE projects SET minted = 1, onChainProjectID = ? WHERE id = ?`;
    db.run(sql, [onChainProjectID, id], function (err) {
        if (err) return res.json({ success: false });
        console.log(`⛏️ Project ID ${id} has been marked as Minted，Connect ID: ${onChainProjectID}`);
        res.json({ success: true });
    });
});

app.post('/sync-onchain-id', (req, res) => {
    const { id, onChainProjectID } = req.body;
    if (!id || !onChainProjectID) {
        return res.json({ success: false, message: "Missing id or onChainProjectID" });
    }
    const sql = `UPDATE projects SET onChainProjectID = ? WHERE id = ? AND (onChainProjectID IS NULL OR onChainProjectID = '')`;
    db.run(sql, [onChainProjectID, id], function (err) {
        if (err) return res.json({ success: false, error: err.message });
        res.json({ success: true, changed: this.changes });
    });
});

app.get('/all-projects', (req, res) => {
    const sql = `SELECT * FROM projects`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ success: false });
        res.json(rows);
    });
});

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

app.get('/my-projects', (req, res) => {
    const { devAddress } = req.query;

    if (!devAddress) {
        return res.json({
            success: false, message: "Developer wallet address is required."
        });
    }

    const sql = `SELECT * FROM projects WHERE LOWER(devAddress) = LOWER(?) ORDER BY id DESC`;

    db.all(sql, [devAddress], (err, rows) => {
        if (err) {
            console.error("Error loading developer projects:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to load projects."
            });
        }

        res.json({
            success: true,
            data: rows
        });
    });
});

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