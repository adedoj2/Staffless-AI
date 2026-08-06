# Staffless AI

**Staffless AI** is an AI-powered virtual receptionist for small businesses. It helps businesses answer customer questions, capture leads, understand customer intent, and manage conversations from a single dashboard.

The goal is simple: **help businesses respond faster, reduce missed opportunities, and improve customer engagement with an always-on AI assistant.**

---

## Why Staffless AI?

Small businesses often lose potential customers because:

- Customer inquiries arrive outside business hours
- Responses are delayed or inconsistent
- Conversations are spread across multiple channels
- Leads are difficult to track and follow up

Staffless AI solves these problems by providing an AI assistant that can answer questions, identify customer intent, and organize interactions for staff review.

---

## Features

- 🤖 AI-powered customer chat assistant
- 💬 Answers common customer questions
- 🎯 Detects customer intent (bookings, inquiries, complaints, follow-ups)
- 📋 Captures and stores conversations
- 📊 Internal dashboard for reviewing leads and customer interactions
- ⚡ FastAPI backend with reusable AI services
- 🗄️ Supabase PostgreSQL data storage

---

## How It Works

1. A customer starts a conversation through the website chat widget.
2. The AI interprets the customer's message and detects the intent.
3. A relevant response is generated using business context.
4. The conversation and AI actions are stored.
5. Staff review conversations and follow up through the dashboard.

---

## Architecture

| Component | Purpose |
|-----------|---------|
| `apps/frontend-web` | Customer-facing website and chat widget |
| `apps/frontend-dashboard` | Internal dashboard for staff |
| `apps/backend-py` | FastAPI backend and API endpoints |
| `services/ai-agents` | Shared AI logic and AI workflows |
| `Supabase` | PostgreSQL database for conversations and business data |

> **Current Backend:** FastAPI (`apps/backend-py`)  
> The legacy Node/Express backend remains in the repository for reference during migration.

---

## Repository Structure

```text
.
├── apps
│   ├── backend-py
│   ├── frontend-web
│   └── frontend-dashboard
│
├── services
│   └── ai-agents
│
├── docs
│
└── README.md
```

---

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript

### Backend

- Python
- FastAPI

### AI

- Google Gemini API

### Database

- Supabase
- PostgreSQL
- Prisma

---

# Quick Start

## Prerequisites

- Python 3.11+
- Node.js 20+
- npm (or your preferred package manager)
- Supabase project
- Gemini API key

---

## 1. Start the Backend

```bash
cd apps/backend-py

python -m venv .venv

source .venv/bin/activate        # macOS/Linux
# .venv\Scripts\activate         # Windows

pip install -r requirements.txt
```

Create the required environment variables:

```bash
export DATABASE_URL="postgresql://..."
export GEMINI_API_KEY="..."
```

Run the API:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8080
```

---

## 2. Start the Frontends

### Website

```bash
cd apps/frontend-web

export NEXT_PUBLIC_API_URL="http://localhost:8080"

npm install
npm run dev
```

### Dashboard

```bash
cd apps/frontend-dashboard

export NEXT_PUBLIC_API_URL="http://localhost:8080"

npm install
npm run dev
```

---

## Environment Variables

### Backend

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `GEMINI_API_KEY` | Gemini API key |

### Frontend

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL of the FastAPI backend |

---

## Documentation

Additional documentation is available in:

- `docs/DEVELOPMENT.md`
- `docs/MIGRATION_TO_FASTAPI.md`
- `apps/backend-py/README.md`

---

## Security

- Never commit API keys or credentials to source control.
- Store secrets using environment variables or a secure secret manager.
- Keep `.env` files out of the repository.
- Use production-grade secret management when deploying.

---

## Roadmap

- [ ] Improve AI conversation flows
- [ ] Enhance dashboard experience
- [ ] Add automated testing
- [ ] Add CI/CD pipeline
- [ ] Improve deployment automation
- [ ] Expand AI integrations
- [ ] Prepare production-ready demo

---

## Contributing

Contributions are welcome.

When contributing:

1. Create a feature branch.
2. Keep secrets out of the repository.
3. Follow the existing project structure.
4. Update documentation where appropriate.
5. Open a pull request with a clear description of your changes.

---

## License

Choose the license that best fits your project (MIT is recommended for open-source projects).

---

## Project Summary

**Staffless AI** combines AI-powered conversations with a lightweight operations dashboard, enabling small businesses to automate customer interactions while keeping staff informed and in control.

It is designed to be practical, easy to demonstrate, and simple to extend for real-world business use cases.
