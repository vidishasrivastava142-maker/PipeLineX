# PipeLineX — Code. Build. Test. Deploy. Monitor.
Status: **backend core + first-pass frontend (landing, auth, overview, projects, pipelines with live stage view)**. Not yet installed or run.

## Run
    cp .env.example server/.env && docker compose up -d
    npm install && cd server && npx prisma migrate dev --name init
    npm run dev:server   # http://localhost:4000
    npm run dev:client   # http://localhost:5173
    npm run dev:worker   # needs Docker + git on the worker host
    npm test

## Not built yet
GitHub OAuth/webhooks, deployment + rollback adapters, monitoring metrics, notifications, settings/secrets, SSE live updates, Docker image management, remaining frontend pages (repositories, deployments, docker, rollbacks, monitoring, logs, settings, notifications). UI uses plain CSS, not Tailwind/Framer Motion yet. Live updates poll every 2s rather than SSE.
The worker never reports a deployment as successful: DEPLOY is marked FAILED until an adapter exists.
