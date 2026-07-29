# Accounts & API Keys Checklist

Working doc for the external accounts/keys Staffless-AI needs. Check items off as you create them.

## Required — to run locally

- [ ] **Supabase** — hosted Postgres (the database)
  - Sign up: https://supabase.com → New project → set a **database password** (save it).
  - Copy two connection strings from **Project Settings → Database → Connection string → URI**:
    - **Session / Direct** (port `5432`) → used to create the schema / run migrations.
    - **Transaction pooler** (port `6543`, host contains `pooler`) → used by the app at runtime.
  - Goes into: `DATABASE_URL` in the backend `.env`.
  - Gotchas:
    - Percent-encode special chars in the password (`@`→`%40`, `#`→`%23`, etc.).
    - The Python backend (`asyncpg`) needs `statement_cache_size=0` when using the pooler.

- [ ] **GitHub** — already have it (`Vojaomo27`); need push access to `adedoj2/Staffless-AI`
  - Create a **fine-grained Personal Access Token** scoped to the `Staffless-AI` repo:
    Settings → Developer settings → Personal access tokens → Fine-grained → Generate.
    Permissions: **Contents: Read/write**, **Pull requests: Read/write**.
  - Do NOT paste the token into chat; feed it to the Git credential prompt only.

## Recommended — for real AI replies

- [ ] **Google AI Studio (Gemini)** — powers the AI agent
  - Get a key: https://aistudio.google.com/app/apikey
  - Goes into: `GEMINI_API_KEY` in the backend `.env`.
  - **Optional:** without a key the app falls back to a canned keyword stub and still runs.
  - ⚠️ The current code targets the dead PaLM `text-bison` endpoint — needs a code fix before the key works.

## Later — only when deploying (skip for local dev)

- [ ] **Google Cloud (GCP)** — Cloud Run + Secret Manager (per `docs/FASTAPI_DEPLOY.md`) for the backend.
- [ ] **Vercel** — suggested host for the two Next.js frontends (`frontend-web`, `frontend-dashboard`).

## Not needed (mentioned in docs but unused by code)

- `SUPABASE_SERVICE_ROLE_KEY` — only for server-side Supabase admin ops; code doesn't use it.
- `JWT_SECRET` — not an account, just a random string; only the deprecated Node backend uses it.

---

### Minimum to get running locally
Just **Supabase** (required) + **GitHub** (have it). Grab **Gemini** too since it's free. Ignore GCP/Vercel until deployment.
