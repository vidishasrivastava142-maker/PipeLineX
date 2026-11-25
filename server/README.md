# PipeLineX API (Express + Neon Postgres)

Requires Node.js 20 or newer and a Neon Postgres database.

## Configure and run locally

Set `DATABASE_URL` to your Neon connection string and `JWT_SECRET` to a long,
random value. Do not commit either value. Then run:

```
cd server
npm ci
npm start
```
You should see: `PipelineX API running on http://localhost:4000`
The `users` table is created automatically when the API first connects.

Check the API at http://localhost:4000/api/health. It should show `{"ok":true}`.
For local Vite development, run `npm run dev` from the repository root in another
terminal; Vite proxies `/api` requests to port 4000.

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
- Passwords are hashed with bcrypt. Tokens are JWTs valid for 7 days.
- Set `DATABASE_URL`, `JWT_SECRET`, and `FRONTEND_ORIGIN` in the Vercel backend
  project's environment variables. `FRONTEND_ORIGIN` should be the exact
  production frontend origin, such as `https://pipe-line-x.vercel.app`.
- Set `VITE_API_URL` in the Vercel frontend project to the backend's public URL
  followed by `/api`, for example `https://pipelinex-api.vercel.app/api`.
- The API project should use `server` as its Vercel Root Directory. Its
  `index.js` exports the Express app for Vercel and starts a local listener for
  development.
