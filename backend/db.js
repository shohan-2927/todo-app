const Database = require('better-sqlite3');

// This creates (or opens, if it already exists) a file called notes.db
// in the backend folder. That file IS the database — all your data
// lives inside it, on disk, so it survives server restarts.
const db = new Database('notes.db');

// Create the "notes" table if it doesn't already exist.
// This runs every time the server starts, but it's harmless if the
// table already exists — "IF NOT EXISTS" skips it silently.
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL
  )
`);

module.exports = db;