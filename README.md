# Staffless — AI-powered small-business assistant

Staffless was migrated to a FastAPI backend (apps/backend-py) that runs against Supabase Postgres and is deployable to Cloud Run. The legacy Node/Express backend (apps/backend-api) has been deprecated and can be archived once you confirm parity.

See docs/DEVELOPMENT.md and docs/MIGRATION_TO_FASTAPI.md for migration and deployment instructions.

Quickstart (developer)

1. FastAPI backend (new)
   cd apps/backend-py
   python -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   export DATABASE_URL="postgresql://..."  # Supabase DB
   export GEMINI_API_KEY="..."
   uvicorn main:app --reload --port 8080

2. Frontends
   - apps/frontend-web
   - apps/frontend-dashboard

They remain Next.js apps; set NEXT_PUBLIC_API_URL to point at the FastAPI backend URL.

Security
- Store GEMINI_API_KEY, DATABASE_URL, and SUPABASE_SERVICE_ROLE_KEY in Secret Manager; never commit secrets.
