# Frontend-Backend Integration Testing Guide

## Prerequisites

Before testing, ensure you have:
- Node.js (v16+) and npm
- Python 3.9+
- Git
- A PostgreSQL/Supabase database connection string
- Gemini API key (optional, can use stub)

## Complete Local Testing Setup

### Step 1: Clone and Setup Repository

```bash
# Clone the repository
git clone https://github.com/adedoj2/Staffless-AI.git
cd Staffless-AI

# Checkout the feature branch
git checkout feature/frontend-backend-integration
```

### Step 2: Setup Backend (FastAPI)

```bash
cd apps/backend-py

# Create and activate virtual environment
python -m venv .venv

# On macOS/Linux:
source .venv/bin/activate

# On Windows:
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with required variables
cat > .env << 'EOF'
DATABASE_URL=postgresql://user:password@localhost:5432/staffless_dev
GEMINI_API_KEY=your-gemini-api-key-or-stub
SUPABASE_SERVICE_ROLE_KEY=optional
EOF

# Run the backend
uvicorn main:app --reload --port 8080 --host 0.0.0.0
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8080
INFO:     Application startup complete
```

### Step 3: Setup Frontend - Web

Open a NEW terminal:

```bash
cd apps/frontend-web

# Install dependencies
npm install

# Create .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_BUSINESS_ID=demo-business
EOF

# Start development server
npm run dev
```

**Expected output:**
```
> frontend-web@0.1.0 dev
> next dev

ready - started server on 0.0.0.0:3000
```

### Step 4: Setup Frontend - Dashboard

Open ANOTHER new terminal:

```bash
cd apps/frontend-dashboard

# Install dependencies
npm install

# Create .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_BUSINESS_ID=demo-business
EOF

# Start development server
npm run dev
```

**Expected output:**
```
> frontend-dashboard@0.1.0 dev
> next dev

ready - started server on 0.0.0.0:3001
```

---

## Testing Checklist

### Test 1: Backend Health Check

```bash
# In a terminal, run:
curl http://localhost:8080/

# Expected response:
# {"status":"ok","service":"Staffless AI Backend"}
```

✅ Backend is running  
✅ CORS is configured  
✅ API is accessible

---

### Test 2: Frontend Web - Chat Widget

1. **Open browser** → http://localhost:3000

2. **Verify UI loads:**
   - See "Staffless — AI receptionist for small businesses" headline
   - Chat widget button in bottom right with "Chat with us" text
   - Teal-colored button

3. **Test chat functionality:**
   - Click "Chat with us" button
   - Widget opens with input field
   - Type: "Hello, do you have a service?"
   - Click "Send" or press Enter

4. **Verify response:**
   - Message appears in conversation (right side, teal)
   - AI response appears (left side, gray)
   - No console errors in DevTools (F12 → Console)

5. **Test persistence:**
   - Open browser DevTools (F12)
   - Go to Application → LocalStorage
   - See `staffless_customerId` stored
   - Refresh page
   - Previous customer ID is preserved
   - New messages continue conversation

6. **Test error handling:**
   - Stop the backend (Ctrl+C in backend terminal)
   - Send another message
   - See error message: "Sorry — message failed to send. Try again."
   - Restart backend
   - Message sends successfully

---

### Test 3: Frontend Dashboard - Overview Page

1. **Open browser** → http://localhost:3001

2. **Verify UI loads:**
   - Navigation bar with "Staffless" logo
   - Navigation links: Overview, Conversations, Leads
   - "Dashboard Overview" heading
   - Stats cards loading (may show loading state briefly)

3. **Verify stats display:**
   - See 4 stat cards:
     - Total Conversations (💬)
     - Active Leads (🏃)
     - Qualified Leads (✅)
     - Appointments (📅)
   - Numbers should be 0 or low initially

4. **Recent data sections:**
   - "Recent Conversations" section
   - "Recent Leads" section
   - Both showing "No conversations/leads yet" initially

5. **Generate test data:**
   - Go to frontend-web (http://localhost:3000)
   - Send 2-3 chat messages
   - Go back to dashboard (http://localhost:3001)
   - **Refresh page** (F5)
   - Should see updated stats and new conversations

---

### Test 4: Frontend Dashboard - Conversations Page

1. **Navigate to** http://localhost:3001/conversations

2. **Verify UI loads:**
   - Left sidebar shows "All Conversations"
   - Empty state: "No conversations yet"

3. **Generate conversation data:**
   - In another tab, go to http://localhost:3000
   - Send a chat message
   - Return to conversations page
   - **Refresh page**

4. **Verify conversation appears:**
   - Conversation shows in left list with:
     - Customer name
     - Status badge
     - Creation date
   - Click on conversation
   - Right panel shows details:
     - Customer name and ID
     - All messages in conversation
     - Messages alternating between AI and customer

5. **Test message display:**
   - Customer messages: teal/right-aligned
   - AI messages: gray/left-aligned
   - Messages scroll if there are many

---

### Test 5: Frontend Dashboard - Leads Page

1. **Navigate to** http://localhost:3001/leads

2. **Verify UI loads:**
   - Left sidebar with "All Leads"
   - Status filter dropdown (All Status, Qualified, Unqualified, Contacted)
   - Empty state: "No leads yet"

3. **Generate lead data:**
   - In chat widget, send message about a service inquiry
   - If AI creates a lead, it should appear on this page
   - **Refresh page** to see it

4. **Test lead selection:**
   - Click on a lead
   - Right panel shows:
     - Lead name and ID
     - Status dropdown (can change status)
     - Lead score with progress bar
     - Service needed, budget, notes if available

5. **Test lead status update:**
   - Select different status from dropdown
   - Status updates immediately
   - Close and reopen lead
   - Status persists

6. **Test filtering:**
   - Change status filter to "Qualified"
   - List updates to show only qualified leads
   - Change to "Unqualified"
   - List updates accordingly

---

### Test 6: API Endpoints (Using curl or Postman)

#### Health Check
```bash
curl http://localhost:8080/
# Response: {"status":"ok","service":"Staffless AI Backend"}
```

#### Create Customer & Send Message
```bash
curl -X POST http://localhost:8080/chat/demo-business/message \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": null,
    "customerName": "Test User",
    "message": "What are your business hours?"
  }'

# Response example:
# {"reply":"Our business hours are...","conversationId":"conv-uuid","customerId":"cust-uuid"}
```

#### Get Conversations
```bash
curl http://localhost:8080/business/demo-business/conversations

# Response:
# {
#   "conversations": [
#     {
#       "id": "conv-uuid",
#       "customerId": "cust-uuid",
#       "status": "open",
#       "customerName": "Test User",
#       "createdAt": "2024-01-01T12:00:00Z"
#     }
#   ]
# }
```

#### Get Conversation Details
```bash
curl http://localhost:8080/conversation/CONVERSATION_ID_HERE

# Response includes all messages in conversation
```

#### Get Business Stats
```bash
curl http://localhost:8080/business/demo-business/stats

# Response:
# {
#   "total_conversations": 2,
#   "active_leads": 1,
#   "qualified_leads": 1,
#   "total_appointments": 0
# }
```

#### Get Leads
```bash
curl http://localhost:8080/business/demo-business/leads

# Optional: filter by status
curl http://localhost:8080/business/demo-business/leads?status=qualified
```

#### Update Lead Status
```bash
curl -X PATCH http://localhost:8080/lead/LEAD_ID_HERE \
  -H "Content-Type: application/json" \
  -d '{
    "status": "qualified",
    "notes": "High priority customer",
    "score": 95
  }'
```

---

## Common Issues & Fixes

### Issue: "Cannot reach http://localhost:8080"

**Solution:**
1. Verify backend is running (check terminal)
2. Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. Try accessing http://localhost:8080 directly in browser
4. Check for firewall issues
5. Verify port 8080 isn't in use: `lsof -i :8080`

### Issue: "Customer not found" error in chat

**Solution:**
1. Ensure backend database is running
2. Verify `DATABASE_URL` environment variable is set
3. Check database connection with: `psql $DATABASE_URL -c "SELECT 1"`
4. Check if `customer` table exists in database

### Issue: Stats/conversations showing "No data" after chat

**Solution:**
1. Backend may need time to process (check backend logs)
2. **Refresh the dashboard page** (F5)
3. Check backend terminal for error messages
4. Verify database connection is working

### Issue: CORS errors in browser console

**Solution:**
1. Backend CORS is configured in `main.py`
2. If still seeing errors, check browser console for exact error
3. Verify `NEXT_PUBLIC_API_URL` doesn't have trailing slash
4. Try clearing browser cache (Ctrl+Shift+Delete)

### Issue: Chat widget not sending messages

**Solution:**
1. Check browser console (F12) for error details
2. Verify backend is responding: `curl http://localhost:8080/`
3. Check NetworkTab in DevTools to see actual request/response
4. Verify `NEXT_PUBLIC_BUSINESS_ID` matches business in database

### Issue: "Cannot find module" errors

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Performance Testing

### Load Test Chat Widget
```bash
# Send 10 messages rapidly
for i in {1..10}; do
  curl -X POST http://localhost:8080/chat/demo-business/message \
    -H "Content-Type: application/json" \
    -d "{\"customerId\":null,\"customerName\":\"User $i\",\"message\":\"Hello $i\"}"
  sleep 0.5
done
```

### Monitor Backend Performance
```bash
# In backend terminal, watch logs while sending messages
# Look for response times and any errors
```

---

## Database Inspection

### Connect to Database
```bash
psql $DATABASE_URL
```

### Check Tables
```sql
-- List all conversations
SELECT id, customerId, status, createdAt FROM conversation LIMIT 10;

-- List all leads
SELECT id, customerId, status, score, createdAt FROM lead LIMIT 10;

-- List all messages
SELECT * FROM message LIMIT 20;
```

---

## Next Steps After Testing

If all tests pass:

1. ✅ **Fix any issues** found during testing
2. ✅ **Create a Pull Request** on GitHub:
   - Title: "Frontend-Backend Integration: Complete API and Dashboard Pages"
   - Description: Include what was tested and results
3. ✅ **Request code review** from team members
4. ✅ **Merge to main branch** after approval

---

## Quick Start Script

Save this as `test-setup.sh`:

```bash
#!/bin/bash

echo "Starting Staffless AI testing environment..."

# Terminal 1: Backend
echo "Starting backend..."
cd apps/backend-py
source .venv/bin/activate
uvicorn main:app --reload --port 8080 &

# Terminal 2: Frontend Web
echo "Starting frontend-web..."
cd apps/frontend-web
npm run dev &

# Terminal 3: Frontend Dashboard
echo "Starting frontend-dashboard..."
cd apps/frontend-dashboard
npm run dev &

echo "All services started!"
echo "Backend: http://localhost:8080"
echo "Frontend Web: http://localhost:3000"
echo "Frontend Dashboard: http://localhost:3001"
```

Run with: `bash test-setup.sh`

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend logs for error details
3. Check browser console (F12) for frontend errors
4. Create an issue on GitHub with:
   - Error message
   - Steps to reproduce
   - Environment details (OS, Node/Python versions)
