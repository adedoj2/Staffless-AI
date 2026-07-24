# Frontend-Backend Integration Guide

## Overview

This document describes the integration between the Staffless frontend applications and the FastAPI backend.

## Architecture

### Frontend Applications

1. **frontend-web**: Customer-facing chat widget
   - Embedded chat interface for website visitors
   - Real-time messaging with AI receptionist
   - Lead capture and conversation tracking

2. **frontend-dashboard**: Admin/business management portal
   - View conversations and leads
   - Manage lead status and scores
   - Dashboard analytics and stats

### Backend API

The FastAPI backend (`apps/backend-py/main.py`) provides REST endpoints for:

- Chat messaging
- Conversation management
- Lead management
- Business analytics

## API Endpoints

### Chat Endpoints

#### POST `/chat/{business_id}/message`
Send a message and receive AI response

**Request Body:**
```json
{
  "customerId": "customer-uuid (optional)",
  "customerName": "Customer Name",
  "message": "What services do you offer?"
}
```

**Response:**
```json
{
  "reply": "We offer...",
  "conversationId": "conv-uuid",
  "customerId": "customer-uuid"
}
```

### Conversation Endpoints

#### GET `/business/{business_id}/conversations`
Retrieve all conversations for a business

**Response:**
```json
{
  "conversations": [
    {
      "id": "conv-uuid",
      "customerId": "customer-uuid",
      "status": "open",
      "customerName": "John Doe",
      "createdAt": "2024-01-01T12:00:00Z"
    }
  ]
}
```

#### GET `/conversation/{conversation_id}`
Retrieve conversation details with all messages

### Lead Endpoints

#### GET `/business/{business_id}/leads`
Retrieve all leads for a business

**Query Parameters:**
- `status`: Filter by status (qualified, unqualified, contacted)

#### GET `/lead/{lead_id}`
Retrieve detailed lead information

#### PATCH `/lead/{lead_id}`
Update lead information

**Request Body:**
```json
{
  "status": "qualified",
  "score": 85,
  "notes": "High potential customer"
}
```

### Analytics Endpoints

#### GET `/business/{business_id}/stats`
Retrieve business dashboard statistics

**Response:**
```json
{
  "total_conversations": 42,
  "active_leads": 15,
  "qualified_leads": 10,
  "total_appointments": 8
}
```

## Frontend Integration

### Environment Variables

Both frontend applications require:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_BUSINESS_ID=your-business-id
```

### API Client Usage

#### frontend-web

```javascript
import { apiClient } from '../lib/apiClient';

// Send a chat message
const response = await apiClient.sendMessage(businessId, {
  customerId,
  customerName,
  message: 'Hello'
});
```

#### frontend-dashboard

```javascript
import { dashboardApiClient } from '../lib/apiClient';
import { useConversations, useLeads } from '../hooks/useDashboardData';

// Get conversations
const { conversations, loading } = useConversations(businessId);

// Get leads
const { leads, loading } = useLeads(businessId);

// Update a lead
await dashboardApiClient.updateLead(leadId, { status: 'qualified' });
```

### Custom Hooks

#### `useApi()` (frontend-web)

Manages loading and error states for API calls

```javascript
const { loading, error, execute } = useApi();

await execute(async () => {
  return await apiClient.sendMessage(...);
});
```

#### `useDashboardData()` (frontend-dashboard)

Manages dashboard data fetching

```javascript
const { loading, error, execute } = useDashboardData();
```

#### `useConversations()` (frontend-dashboard)

Auto-fetches and manages conversations

```javascript
const { conversations, loading, error } = useConversations(businessId, filters);
```

#### `useLeads()` (frontend-dashboard)

Auto-fetches and manages leads

```javascript
const { leads, loading, error } = useLeads(businessId, filters);
```

## Development Setup

### 1. Start Backend

```bash
cd apps/backend-py
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL="postgresql://..."
export GEMINI_API_KEY="..."
uvicorn main:app --reload --port 8080
```

### 2. Start Frontend Applications

**frontend-web:**
```bash
cd apps/frontend-web
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local
npm run dev
```

**frontend-dashboard:**
```bash
cd apps/frontend-dashboard
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local
npm run dev
```

## CORS Configuration

The backend has CORS enabled for all origins in development. For production, update `main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH"],
    allow_headers=["*"],
)
```

## Error Handling

All API responses follow a consistent error format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

Frontend applications should handle HTTP error status codes:

- `400`: Bad request (missing required fields)
- `404`: Resource not found
- `500`: Server error

## Best Practices

1. **Always store customer IDs** in localStorage for session persistence
2. **Handle loading states** during API calls
3. **Display user-friendly error messages**
4. **Validate input** before sending to API
5. **Use environment variables** for API URLs
6. **Implement request timeouts** for slow networks

## Troubleshooting

### "Cannot reach API" errors

1. Verify backend is running on correct port (8080)
2. Check `NEXT_PUBLIC_API_URL` environment variable
3. Verify CORS headers are present in backend response
4. Check browser console for detailed error messages

### "Customer not found" errors

1. Ensure valid business ID is provided
2. Check localStorage for valid customer ID
3. Verify customer exists in database

### Lead data not updating

1. Verify PATCH endpoint is working
2. Check request body format matches schema
3. Ensure lead ID is valid
