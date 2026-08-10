const express = require('express');
const cors = require('cors');
const { db, initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000; // Render assigns its own PORT — this handles both cases

app.use(express.json());
app.use(cors());

// ROUTE 1: Get all notes
app.get('/notes', async (req, res) => {
  const result = await db.execute('SELECT * FROM notes');
  res.json(result.rows);
});

// ROUTE 2: Add a new note
app.post('/notes', async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Note text is required' });
  }

  const result = await db.execute({
    sql: 'INSERT INTO notes (text) VALUES (?)',
    args: [text],
  });

  res.status(201).json({ id: Number(result.lastInsertRowid), text });
});

// ROUTE 3: Update an existing note's text
app.put('/notes/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { text } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Note text is required' });
  }

  await db.execute({
    sql: 'UPDATE notes SET text = ? WHERE id = ?',
    args: [text, id],
  });

  res.json({ id, text });
});

// ROUTE 4: Delete a note
app.delete('/notes/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  await db.execute({
    sql: 'DELETE FROM notes WHERE id = ?',
    args: [id],
  });
  res.status(204).send();
});

// Start the server only after the database table is confirmed to exist
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});