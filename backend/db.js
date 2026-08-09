require('dotenv').config();
const { createClient } = require('@libsql/client');

// These values come from your .env file (kept secret, never uploaded to GitHub)
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Create the notes table if it doesn't exist yet.
// This runs every time the server starts.
async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL
    )
  `);
}

module.exports = { db, initDb };