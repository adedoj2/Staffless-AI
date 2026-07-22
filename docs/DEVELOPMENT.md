# Development & Deployment Notes

This document contains practical instructions for developers running and deploying Staffless. It’s intended to be a single source of operational knowledge for local dev, seeds, CI, and recommended Cloud Run deployment.

Table of contents
- Local development quickstart
- Database & Prisma
- Seed data
- AI integration (local stub vs Gemini)
- Build & Docker
- CI basics
- Cloud Run + Secret Manager (summary)
- Troubleshooting

Local development quickstart
1. Clone repo and install root deps:
   git clone https://github.com/<you>/Staffless-AI.git
   cd Staffless-AI
   npm install

2. Start a local Postgres:
   docker run --name staffless-db -e POSTGRES_PASSWORD=devpass -e POSTGRES_DB=staffless -p 5432:5432 -d postgres:16

3. Backend:
   cd apps/backend-api
   npm install
   cp .env.example .env
   # Edit .env to set DATABASE_URL (postgres), JWT_SECRET, PORT
   npx prisma migrate dev --name init
   npx prisma generate
   npm run seed        # optional demo data
   npm run dev

4. Frontends:
   - apps/frontend-web and apps/frontend-dashboard each have their own package.json. Set NEXT_PUBLIC_API_URL in .env.local if needed and run npm run dev.

Database & Prisma
- Schema: apps/backend-api/prisma/schema.prisma
- Typical workflow:
  - edit schema
  - npx prisma migrate dev --name <migration_name>
  - npx prisma generate
- Use `npx prisma studio` to inspect data during development.

Seed data
- apps/backend-api/scripts/seed.js will create:
  - a demo Business, User (owner@demo.com / password), Customer, Conversation, Messages, Lead, an AIAction and prints a demo JWT and businessId.
- Run with:
  cd apps/backend-api
  npm run seed

AI integration
- Local stub: services/ai-agents/src/index.js contains a safe fallback that recognizes booking intent and returns a structured AgentResult.
- Remote LLM (Gemini):
  - The service checks process.env.GEMINI_API_KEY and process.env.GEMINI_API_URL. If present it attempts a remote call and falls back on the stub on failure.
  - For local dev, create apps/backend-api/.env.local with:
    GEMINI_API_KEY=your_key_here
    GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generate
  - Do NOT commit .env.local. Use Secret Manager + Cloud Run for production.

Building & Docker
- Backend Dockerfile: apps/backend-api/Dockerfile
- Build locally:
  cd apps/backend-api
  docker build -t staffless-backend:local .

CI (basic)
- .github/workflows/ci.yml contains a small job that installs root + backend deps. Add linting, tests, and smoke tests as you develop.

Cloud Run & Secret Manager (short)
- Recommended pattern:
  - Store DATABASE_URL, GEMINI_API_KEY, JWT_SECRET in Secret Manager.
  - Give Cloud Run service account roles/secretmanager.secretAccessor and roles/cloudsql.client.
  - Deploy with --set-secrets to inject secrets as env vars. Add Cloud SQL instances via --add-cloudsql-instances.
- Run migrations/seed as a Cloud Run Job (one-off) that uses the same image and secrets attached.

Troubleshooting
- 500 errors in backend: check backend logs and Prisma connection (DATABASE_URL).
- Missing keys: ensure GEMINI_API_KEY & GEMINI_API_URL are set for LLM calls; otherwise system falls back to stub.
- If you see "You don't have permission to push", run the provided local script or push from a user with write access.

Checklist before a demo
- No local host URLs in code (use NEXT_PUBLIC_API_URL)
- GEMINI key stored securely (Secret Manager for production)
- Seeded demo business exists and you have the demo JWT + businessId printed by the seed script
- Dashboard surfaces AIAction rows (they exist for every runAgentTurn call)
- Export simple runbook in docs/deploy.md with deploy commands and who can run them

If anything in this doc is unclear or you want me to produce the commands tailored to your GCP project (PROJECT_ID, REGION, INSTANCE_NAME), tell me and I will output the exact gcloud command sequence you can run in Cloud Shell.
