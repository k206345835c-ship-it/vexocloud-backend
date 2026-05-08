const Database = require('better-sqlite3');
const db = new Database('database.db');

db.prepare(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT,
  avatar TEXT
)
`).run();

module.exports = db;
