const express = require('express'), cors = require('cors'), Database = require('better-sqlite3');
const bcrypt = require('bcryptjs'), jwt = require('jsonwebtoken'), path = require('path');

const PORT = process.env.PORT || 4000;
const SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-me';
if (!process.env.JWT_SECRET) console.warn('[warn] JWT_SECRET not set, using a development secret.');

// ---- database (file is created automatically next to this script) ----
const db = new Database(path.join(__dirname, 'pipelinex.db'));
db.pragma('journal_mode = WAL');
db.exec(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`);
const byEmail = db.prepare('SELECT * FROM users WHERE email = ?');
const byId = db.prepare('SELECT id, name, email, created_at AS createdAt FROM users WHERE id = ?');
const insert = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');

// ---- app ----
const app = express();
app.use(cors({ origin: (o, cb) => cb(null, !o || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(o)), credentials: true }));
app.use(express.json());

// Errors always look like: { error: "text", message: "text", errors?: { field: "text" } }
const fail = (res, status, msg, errors) => res.status(status).json({ error: msg, message: msg, ...(errors ? { errors } : {}) });
const publicUser = u => ({ id: u.id, name: u.name, email: u.email, createdAt: u.createdAt || u.created_at });
const sign = u => jwt.sign({ uid: u.id }, SECRET, { expiresIn: '7d' });
const sendAuth = (res, status, u) => {
  const token = sign(u), user = publicUser(u);
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 864e5 });
  res.status(status).json({ token, accessToken: token, user });
};

app.get('/api/health', (_q, res) => res.json({ ok: true }));

app.post('/api/auth/register', (req, res) => {
  const b = req.body || {};
  const name = String(b.name ?? b.fullName ?? b.full_name ?? '').trim();
  const email = String(b.email ?? '').trim().toLowerCase();
  const password = String(b.password ?? '');
  const errors = {};
  if (!name) errors.name = 'Full name is required';
  else if (name.length > 80) errors.name = 'Name is too long';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address';
  if (password.length < 8) errors.password = 'Password must be at least 8 characters';
  if (Object.keys(errors).length) return fail(res, 400, Object.values(errors)[0], errors);
  if (byEmail.get(email)) return fail(res, 409, 'An account with this email already exists', { email: 'Email already registered' });
  const id = insert.run(name, email, bcrypt.hashSync(password, 12)).lastInsertRowid;
  sendAuth(res, 201, byId.get(id));
});

app.post('/api/auth/login', (req, res) => {
  const email = String(req.body?.email ?? '').trim().toLowerCase(), password = String(req.body?.password ?? '');
  if (!email || !password) return fail(res, 400, 'Email and password are required');
  const u = byEmail.get(email);
  if (!u || !bcrypt.compareSync(password, u.password_hash)) return fail(res, 401, 'Invalid email or password');
  sendAuth(res, 200, byId.get(u.id));
});

const requireAuth = (req, res, next) => {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : /(?:^|;\s*)token=([^;]+)/.exec(req.headers.cookie || '')?.[1];
  try { req.user = byId.get(jwt.verify(token || '', SECRET).uid); } catch { req.user = null; }
  req.user ? next() : fail(res, 401, 'Not authenticated');
};

app.get('/api/auth/me', requireAuth, (req, res) => res.json({ ...req.user, user: req.user }));
app.post('/api/auth/logout', (_q, res) => { res.clearCookie('token'); res.json({ ok: true }); });

app.use('/api', (_q, res) => fail(res, 404, 'Not found'));
app.use((e, _q, res, _n) => {
  if (e.type === 'entity.parse.failed') return fail(res, 400, 'Invalid JSON body');
  console.error(e); fail(res, 500, 'Server error');
});
app.listen(PORT, () => console.log(`PipelineX API running on http://localhost:${PORT}`));
