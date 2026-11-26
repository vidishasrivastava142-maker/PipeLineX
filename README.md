# PipeLineX - Automated CI/CD Deployment Platform

**Live demo:** https://pipe-line-x.vercel.app

PipeLineX is a web platform that automates everything between a code commit and production:
**GitHub -> Source Code -> Build -> Test -> Docker -> Deploy -> Monitor**, with instant rollback to any earlier good version.

## Features

| Feature | Status |
|---|---|
| Landing page describing the pipeline | Implemented |
| User registration and login (bcrypt password hashing + JWT) | Implemented |
| Session check (`/api/auth/me`) and logout | Implemented |
| Password strength meter, confirm-password validation | Implemented |
| Responsive dark UI | Implemented |
| Deployed on Vercel | Implemented |
| GitHub webhook trigger, isolated build/test, Docker image build, health-checked deploy, rollback, monitoring, live logs | Designed (prototype backend, not connected to this site yet) |

## Tech stack

- **Frontend:** React, TypeScript, Vite, CSS
- **Backend:** Node.js, Express (`server/` folder), JWT, bcryptjs
- **Database:** SQLite for local development (`server/`); Neon PostgreSQL for the Vercel deployment
- **Hosting:** Vercel
- **Version control:** Git and GitHub

## Architecture

```
Browser -> React + Vite site (Vercel) -> /api requests -> Express API -> Database -> JSON response
```

## Workflow

1. The user opens the site and registers (full name, email, password).
2. The frontend sends `POST /api/auth/register`.
3. The server validates the input, checks the email is unused, hashes the password and stores the user.
4. The server returns a JWT token and the user details.
5. On login, `POST /api/auth/login` compares the password with the stored hash.
6. On every page load, `GET /api/auth/me` verifies the token and returns the signed-in user.
7. Logout ends the session.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create an account (201) |
| POST | `/api/auth/login` | Sign in and receive a token (200) |
| GET | `/api/auth/me` | Get the current user (token required) |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/health` | Server health check |

Errors use one format: `{ "error": "text", "message": "text", "errors": { "field": "text" } }`
with status 400 (invalid input), 401 (not signed in / wrong login), 409 (email already used).

## Run locally

Requirements: Node.js 20 or newer.

**1. Backend** (terminal 1)
```
cd server
npm install
npm start
```
It runs on http://localhost:4000 (check http://localhost:4000/api/health).

**2. Frontend** (terminal 2, from the project root)
```
npm install
npm run dev
```
Open http://localhost:5173.

## Environment variables (backend)

| Name | Purpose |
|---|---|
| `JWT_SECRET` | Secret used to sign tokens (required in production) |
| `NODE_ENV` | Set to `production` when deployed |
| `CORS_ORIGINS` | Comma-separated list of allowed website addresses |
| `DB_PATH` | Optional SQLite file location |
| `DATABASE_URL` | Neon PostgreSQL connection string (Vercel deployment) |

Never commit real secrets. Set them in the Vercel or hosting dashboard.

## Security

- Passwords are hashed with bcrypt and never stored in plain text.
- JWT tokens expire after 7 days.
- The same error is returned for a wrong email or a wrong password.
- CORS only allows approved websites.
- `.env` files and database files are excluded from Git.

## Project structure

```
PipeLineX/
  server/            Express + SQLite backend
  api.ts             API client used by the frontend
  App.tsx            Main React component and pages
  main.tsx           React entry point
  styles.css         Styling
  index.html         HTML shell
  vite.config.ts     Vite configuration
  package.json
  docs/              Project presentation (PPT)
```

## Future scope

GitHub OAuth, connecting the full pipeline engine and dashboard (builds, tests, Docker images, deployments, rollback), live log streaming, CPU/memory charts, cloud deployment providers.

## Author

Your Name - Vidisha Srivastava, college-GLA University and course-btech cse here.
