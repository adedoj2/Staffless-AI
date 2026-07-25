# Staffless AI

Staffless AI is a practical AI assistant for small businesses that want to respond faster to customer inquiries, capture leads, and reduce missed opportunities. The product combines a website chat experience with an internal dashboard so business owners and staff can review conversations, understand customer intent, and take action quickly.

## Why this project exists

Many small businesses lose leads because inquiries arrive through multiple channels and are answered inconsistently or too slowly. Staffless aims to solve that by giving them an always-on assistant that can:

- greet visitors and answer common questions
- detect intent such as booking requests, follow-up questions, or complaints
- store conversations and actions in a structured way
- give staff a simple dashboard to review and manage customer interactions

## What the product looks like

- A customer-facing chat widget on a business website
- A lightweight AI agent that interprets messages and suggests next steps
- A dashboard for internal users to monitor conversations and leads
- A backend that stores conversations, business context, and AI actions

## Architecture at a glance

- Frontend web experience: apps/frontend-web
- Internal dashboard: apps/frontend-dashboard
- Python API backend: apps/backend-py
- Shared AI logic and services: services/ai-agents
- Data layer: Supabase Postgres with Prisma-based models

The current backend direction is the FastAPI-based Python service in apps/backend-py. The older Node/Express backend remains in the repository for reference and migration purposes.

## For judges and potential contributors

This project is designed to be easy to explain in a demo:

1. A customer asks a question or asks to book something.
2. The assistant understands the intent.
3. The system logs the interaction and prepares a useful response or follow-up.
4. Staff can review everything in one place through the dashboard.

That makes Staffless a strong example of an AI product that is useful, concrete, and easy to understand, rather than just a technical demo.

## Quickstart for developers

### 1. Backend

```bash
cd apps/backend-py
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL="postgresql://..."
export GEMINI_API_KEY="..."
uvicorn main:app --reload --port 8080
```

### 2. Frontends

The web app and dashboard are Next.js applications. Set the API URL for the backend before running them:

```bash
cd apps/frontend-web
export NEXT_PUBLIC_API_URL="http://localhost:8080"
```

```bash
cd apps/frontend-dashboard
export NEXT_PUBLIC_API_URL="http://localhost:8080"
```

## Project structure

- apps/backend-py: FastAPI backend and AI integration entry points
- apps/frontend-web: public-facing website experience
- apps/frontend-dashboard: internal operations dashboard
- services/ai-agents: reusable AI agent logic
- docs/: setup, migration, and deployment notes

## Notes for contributors

- Keep secrets out of the repository. Use environment variables or a secret manager for API keys and database credentials.
- The project documentation in docs/ is a good place to start for deployment and migration details.
- If you are exploring the repo, begin with the backend and the frontend entry points to understand the full flow from chat input to stored conversation.

## Recommended next steps

- refine the AI conversation flows for real-world business scenarios
- improve the dashboard experience for staff review and follow-up
- add stronger testing and deployment automation
- prepare a polished demo script for judges and investors

