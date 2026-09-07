const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

db.all(`SELECT id, projName, onChainProjectID FROM projects`, [], (err, rows) => {
    if (err) {
        console.error("Query failed:", err);
        return;
    }
    console.log("All current projects：");
    console.table(rows);
    db.close();
});