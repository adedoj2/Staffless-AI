# Staffless — AI-powered small-business assistant

Staffless is a hackathon monorepo that demonstrates an AI agent operating a small business: handling customer chat, qualifying leads, proposing appointments, generating invoices, and logging AI actions for owner review. The project contains:

- apps/backend-api — Node/Express backend, Prisma schema, AI agent integration point
- apps/frontend-web — customer-facing Next.js app (chat widget demo)
- apps/frontend-dashboard — owner-facing Next.js dashboard (minimal admin UI)
- services/ai-agents — agent abstraction; safe stub + remote LLM integration point
- docs/ — project documentation and operational notes

This repo is intentionally scaffolded to let frontend and AI teams work in parallel against a stable API contract while the backend implements persistence and the runAgentTurn contract.

Why this exists
- Demo goal: show a complete loop from a website chat to AI actions (lead updates, appointment creation, invoice generation) surfaced in an owner dashboard.
- Designed for a short timeline: mock-first frontends, single shared API contract, and a minimal but auditable backend (AIAction records).

Quick links
- Backend API: apps/backend-api
- Frontend (web widget): apps/frontend-web
- Frontend (dashboard): apps/frontend-dashboard
- AI agents: services/ai-agents
- Prisma schema: apps/backend-api/prisma/schema.prisma
- Seed script: apps/backend-api/scripts/seed.js

Stack summary
- Language: TypeScript/JavaScript (Node 18+)
- Backend: Express + Prisma + Postgres (local Docker / Cloud SQL for cloud)
- Frontend: Next.js (customer + dashboard)
- State & UI: Zustand (planned), Tailwind + shadcn (recommended)
- LLM: pluggable services/ai-agents (local stub by default, Gemini integration via env)

Important security note (do this now if you posted keys)
- If you ever exposed a real API key in chat or commits, rotate it immediately in Google Cloud and stop using the compromised key.
- Never commit secrets (.env, API keys, service account JSON) into the repo.

Quickstart (developer)
1. Clone
   git clone https://github.com/<you>/Staffless-AI.git
2. Install (repo root)
   npm install
3. Backend: create .env
   - Copy apps/backend-api/.env.example → apps/backend-api/.env
   - Edit values: DATABASE_URL, JWT_SECRET, GEMINI_API_KEY (only for local testing), PORT
4. Start Postgres (local dev)
   docker run --name staffless-db -e POSTGRES_PASSWORD=devpass -e POSTGRES_DB=staffless -p 5432:5432 -d postgres:16
5. Backend setup
   cd apps/backend-api
   npm install
   npx prisma migrate dev --name init
   npx prisma generate
   npm run seed       # optional: creates demo business + prints demo JWT & businessId
   npm run dev
6. Frontends (run in separate terminals)
   cd apps/frontend-web
   npm install
   # set NEXT_PUBLIC_API_URL in .env.local if backend not at http://localhost:8080
   npm run dev

   cd apps/frontend-dashboard
   npm install
   npm run dev

Primary environment variables (apps/backend-api)
- DATABASE_URL — Postgres connection string used by Prisma
- JWT_SECRET — JWT signing secret
- GEMINI_API_KEY — Google Generative AI / Gemini API key (local testing only; do not commit)
- GEMINI_API_URL — optional provider URL the ai-agents service will call
- PORT — backend port (default 8080)

API contract (short summary)
- Public:
  - POST /chat/:businessId/message — customer chat entrypoint (creates customer/conversation, persists Message, calls runAgentTurn)
  - POST /auth/register, POST /auth/login — owner onboarding / login
- Authenticated (JWT in Authorization: Bearer <token>):
  - GET /businesses/me, PUT /businesses/me
  - GET /conversations, GET /conversations/:id/messages
  - GET /leads, PATCH /leads/:id
  - GET /appointments, PATCH /appointments/:id
  - GET /invoices, POST /invoices/generate, PATCH /invoices/:id
  - GET /ai-actions
  - GET /dashboard/summary
  - POST /marketing/generate
  - POST /operations/follow-ups/run

Where AI is wired
- services/ai-agents/src/index.js exposes runAgentTurn(context) and currently contains a safe local stub.
- When GEMINI_API_KEY + GEMINI_API_URL are provided in the environment, the stub will try the remote LLM and fall back to the local stub on failure.

Important dev artifacts
- Prisma schema: apps/backend-api/prisma/schema.prisma
- Seed script: apps/backend-api/scripts/seed.js
- Dockerfile (backend): apps/backend-api/Dockerfile
- CI (basic): .github/workflows/ci.yml

Recommended next actions (to complete a demo quickly)
1. Wire a real Gemini key: use Secret Manager in production or .env.local for local dev (do not commit key).
2. Polish frontend-dashboard UI with shadcn + Zustand and wire conversation thread + messages UI.
3. Add tests and simple CI smoke tests (currently a minimal CI job exists).
4. Add deployment docs (docs/DEVELOPMENT.md) and Cloud Run deploy + migrations steps.

Contributing
- Follow the project’s file layout: apps/* for applications, services/* for reusable services.
- When editing API shapes, update docs/docs-api.md (or a PR description) and notify frontend developers to avoid drift.
- Prefer small PRs per feature (auth, chat, leads, appointments, invoices, marketing, ops).

Need help?
- I can: (a) finish wiring the Gemini integration (code only — you keep/manage the key), (b) improve the frontend widget and dashboard, (c) create Cloud Run deploy scripts and migration jobs.
- If you want me to push commits, grant write access or run the scripts I supply locally and paste the results if anything fails.

License & authors
- MIT (or choose your preferred open source license)
- Authors: team Staffless (add your names / contacts)
