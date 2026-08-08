const express = require('express');
const cors = require('cors');
const db = require('./db'); // our database connection from db.js

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// ROUTE 1: Get all notes — now reading from the database instead of an array
app.get('/notes', (req, res) => {
  const notes = db.prepare('SELECT * FROM notes').all();
  res.json(notes);
});

// ROUTE 2: Add a new note — now saved into the database file
app.post('/notes', (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Note text is required' });
  }

  const result = db.prepare('INSERT INTO notes (text) VALUES (?)').run(text);
  const newNote = { id: result.lastInsertRowid, text };

  res.status(201).json(newNote);
});

// ROUTE 3: Delete a note by id
app.delete('/notes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  db.prepare('DELETE FROM notes WHERE id = ?').run(id);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});