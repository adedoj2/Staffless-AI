# FastAPI & Supabase migration

This repo has migrated the backend from Node/Express to FastAPI (apps/backend-py). The new backend expects the same database schema in a Supabase Postgres instance and supports the Gemini integration via GEMINI_API_KEY.

Quick deploy to Cloud Run (replace placeholders):

```bash
PROJECT_ID=your-gcp-project
IMAGE=gcr.io/$PROJECT_ID/staffless-fastapi:latest
# build
cd apps/backend-py
gcloud builds submit --tag $IMAGE
# create secrets in Secret Manager
gcloud secrets create DATABASE_URL --data-file=<(printf '%s' "$DATABASE_URL") --project=$PROJECT_ID
gcloud secrets create GEMINI_API_KEY --data-file=<(printf '%s' "$GEMINI_API_KEY") --project=$PROJECT_ID
# deploy
gcloud run deploy staffless-fastapi --image=$IMAGE --region=us-central1 --platform=managed --set-secrets=DATABASE_URL=DATABASE_URL:latest,GEMINI_API_KEY=GEMINI_API_KEY:latest --port=8080 --allow-unauthenticated
```
