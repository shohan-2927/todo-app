const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET; // a random secret string, kept in .env

app.use(express.json());
app.use(cors());

// --- AUTH MIDDLEWARE ---
// Runs before any protected route. Checks for a valid token in the
// "Authorization" header, and figures out which user is making the request.
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization; // expected format: "Bearer <token>"

  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId; // attach the user's id to the request for later routes to use
    next(); // token is valid, continue to the actual route
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// --- SIGNUP ---
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const passwordHash = await bcrypt.hash(password, 10); // "10" = hashing strength

  try {
    const result = await db.execute({
      sql: 'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      args: [email, passwordHash],
    });

    const userId = Number(result.lastInsertRowid);
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token });
  } catch (err) {
    // Most likely cause: email already registered (UNIQUE constraint)
    res.status(400).json({ error: 'Email already in use' });
  }
});

// --- LOGIN ---
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email],
  });

  const user = result.rows[0];
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

// --- NOTES ROUTES (all now protected by requireAuth, and filtered by user) ---

app.get('/notes', requireAuth, async (req, res) => {
  const result = await db.execute({
    sql: 'SELECT * FROM notes WHERE user_id = ?',
    args: [req.userId],
  });
  res.json(result.rows);
});

app.post('/notes', requireAuth, async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Note text is required' });
  }

  const result = await db.execute({
    sql: 'INSERT INTO notes (text, user_id) VALUES (?, ?)',
    args: [text, req.userId],
  });

  res.status(201).json({ id: Number(result.lastInsertRowid), text });
});

app.put('/notes/:id', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const { text } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Note text is required' });
  }

  // The "AND user_id = ?" ensures you can only edit your OWN notes
  await db.execute({
    sql: 'UPDATE notes SET text = ? WHERE id = ? AND user_id = ?',
    args: [text, id, req.userId],
  });

  res.json({ id, text });
});

app.delete('/notes/:id', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  await db.execute({
    sql: 'DELETE FROM notes WHERE id = ? AND user_id = ?',
    args: [id, req.userId],
  });
  res.status(204).send();
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});