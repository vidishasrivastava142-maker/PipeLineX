const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { neon } = require("@neondatabase/serverless");

const PORT = process.env.PORT || 4000;
const allowedOrigins = new Set(
  (process.env.FRONTEND_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

let sql;
let schemaPromise;

async function database() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be configured.");
  }
  if (!sql) sql = neon(process.env.DATABASE_URL);
  if (!schemaPromise) {
    schemaPromise = sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `.catch((error) => {
      schemaPromise = undefined;
      throw error;
    });
  }
  await schemaPromise;
  return sql;
}

function jwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be configured.");
  }
  return process.env.JWT_SECRET;
}

const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      const localOrigin =
        origin && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
      callback(null, !origin || allowedOrigins.has(origin) || localOrigin);
    },
    credentials: true,
  }),
);
app.use(express.json());

const fail = (res, status, message, errors) =>
  res.status(status).json({
    error: message,
    message,
    ...(errors ? { errors } : {}),
  });
const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt || user.created_at,
});
const sendAuth = (res, status, user) => {
  const token = jwt.sign({ uid: user.id }, jwtSecret(), { expiresIn: "7d" });
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 864e5,
  });
  res.status(status).json({ token, accessToken: token, user: publicUser(user) });
};
const asyncRoute = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

app.get(
  "/api/health",
  asyncRoute(async (_req, res) => {
    await database();
    res.json({ ok: true });
  }),
);

app.post(
  "/api/auth/register",
  asyncRoute(async (req, res) => {
    const body = req.body || {};
    const name = String(body.name ?? body.fullName ?? body.full_name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const errors = {};
    if (!name) errors.name = "Full name is required";
    else if (name.length > 80) errors.name = "Name is too long";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Enter a valid email address";
    }
    if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    if (Object.keys(errors).length) {
      return fail(res, 400, Object.values(errors)[0], errors);
    }

    const db = await database();
    const [user] = await db`
      INSERT INTO users (name, email, password_hash)
      VALUES (${name}, ${email}, ${bcrypt.hashSync(password, 12)})
      ON CONFLICT (email) DO NOTHING
      RETURNING id, name, email, created_at AS "createdAt"
    `;
    if (!user) {
      return fail(res, 409, "An account with this email already exists", {
        email: "Email already registered",
      });
    }
    sendAuth(res, 201, user);
  }),
);

app.post(
  "/api/auth/login",
  asyncRoute(async (req, res) => {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const password = String(req.body?.password ?? "");
    if (!email || !password) {
      return fail(res, 400, "Email and password are required");
    }

    const db = await database();
    const [user] = await db`
      SELECT id, name, email, password_hash, created_at AS "createdAt"
      FROM users
      WHERE email = ${email}
    `;
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return fail(res, 401, "Invalid email or password");
    }
    sendAuth(res, 200, user);
  }),
);

const requireAuth = asyncRoute(async (req, res, next) => {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : /(?:^|;\s*)token=([^;]+)/.exec(req.headers.cookie || "")?.[1];
  const secret = jwtSecret();
  let payload;
  try {
    payload = jwt.verify(token || "", secret);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return fail(res, 401, "Not authenticated");
    }
    throw error;
  }

  const db = await database();
  const [user] = await db`
    SELECT id, name, email, created_at AS "createdAt"
    FROM users
    WHERE id = ${payload.uid}
  `;
  if (!user) return fail(res, 401, "Not authenticated");
  req.user = publicUser(user);
  next();
});

app.get("/api/auth/me", requireAuth, (req, res) =>
  res.json({ ...req.user, user: req.user }),
);
app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

app.use("/api", (_req, res) => fail(res, 404, "Not found"));
app.use((error, _req, res, _next) => {
  if (error.type === "entity.parse.failed") {
    return fail(res, 400, "Invalid JSON body");
  }
  console.error(error);
  fail(res, 500, "Server error");
});

if (require.main === module) {
  app.listen(PORT, () =>
    console.log(`PipelineX API running on http://localhost:${PORT}`),
  );
}

module.exports = app;
