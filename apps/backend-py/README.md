# Staffless FastAPI backend

This folder contains the new FastAPI backend that replaces the previous Node/Express backend. It is designed to run against a Supabase Postgres database and to be deployed to Cloud Run. Secrets (DATABASE_URL, GEMINI_API_KEY, SUPABASE_SERVICE_ROLE_KEY) should be stored in Secret Manager in production.

Quick start (local)

1. Create a Python virtualenv and install deps:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Set environment variables in your shell or a .env file:

- DATABASE_URL (Supabase Postgres connection string)
- GEMINI_API_KEY (your Gemini API key) — optional for stub fallback
- GEMINI_API_URL (optional)
- SUPABASE_SERVICE_ROLE_KEY (if you plan server-side Supabase operations)

3. Run the app locally:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8080
```

Notes
- The app uses asyncpg for DB access and expects the schema from the original Prisma layout to be applied to the Supabase Postgres database. Use the repo's Prisma migrations to apply the schema to Supabase (see docs/DEVELOPMENT.md).
