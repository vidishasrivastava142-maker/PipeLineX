# PipelineX server (Express + SQLite)

Needs only Node.js 20 or newer. No Docker, PostgreSQL or Redis.

## Install and start
```
cd server
npm install
npm start
```
You should see: `PipelineX API running on http://localhost:4000`
Leave this terminal open. Run your Vite frontend in a second terminal (`npm run dev`).

Check it: open http://localhost:4000/api/health in a browser. It should show `{"ok":true}`.

## Endpoints
| Method | Path | Body | Success |
|---|---|---|---|
| POST | /api/auth/register | name, email, password | 201 `{ token, accessToken, user }` |
| POST | /api/auth/login | email, password | 200 `{ token, accessToken, user }` |
| GET | /api/auth/me | Authorization: Bearer TOKEN (or cookie) | 200 user fields, also under `user` |
| POST | /api/auth/logout | - | 200 `{ ok: true }` |
| GET | /api/health | - | 200 `{ ok: true }` |

Errors use one format: `{ "error": "text", "message": "text", "errors": { "field": "text" } }`
with status 400 (invalid input), 401 (bad login / not signed in), 409 (email already used).

## Notes
- The database file `pipelinex.db` is created automatically in this folder. Delete it to reset all accounts.
- Passwords are hashed with bcrypt. Tokens are JWTs valid for 7 days.
- Optional settings (environment variables): `PORT`, `JWT_SECRET` (set a long random value before any real use).
- CORS allows `http://localhost:<any port>`, so Vite on 5173 works with or without a proxy.

## If the frontend uses a proxy
In `vite.config.ts`: `server: { proxy: { '/api': 'http://localhost:4000' } }`

## Troubleshooting
- `EADDRINUSE`: something else is using port 4000 (for example the older pipelineX server). Stop it with Ctrl+C in its terminal.
- `npm install` fails on better-sqlite3: install the current Node LTS from nodejs.org, then run `npm install` again.
