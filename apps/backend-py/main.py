import os
import json
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from db import init_db, close_db, fetchrow, fetch, execute
from ai_agent import run_agent_turn

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

app = FastAPI(title="Staffless FastAPI")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Consider restricting this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatReq(BaseModel):
    customerId: str | None = None
    customerName: str | None = None
    message: str

@app.on_event("startup")
async def startup():
    await init_db()

@app.on_event("shutdown")
async def shutdown():
    await close_db()

@app.get("/")
async def health():
    return {"status": "ok", "service": "Staffless AI Backend"}

@app.post("/chat/{business_id}/message")
async def chat_message(business_id: str, payload: ChatReq):
    """Send a message to the AI agent and get a response"""
    if not payload.message or not payload.message.strip():
        raise HTTPException(status_code=400, detail="message required")

    b = await fetchrow("SELECT id, name FROM business WHERE id = $1", business_id)
    if not b:
        raise HTTPException(status_code=404, detail="business not found")

    customer_id = payload.customerId
    if customer_id:
        c = await fetchrow("SELECT id FROM customer WHERE id = $1", customer_id)
        if not c:
            customer_id = None

    if not customer_id:
        rec = await fetchrow("INSERT INTO customer (businessId, name, channel, createdAt) VALUES ($1, $2, 'web', now()) RETURNING id", business_id, payload.customerName)
        customer_id = rec["id"]

    conv = await fetchrow("SELECT id FROM conversation WHERE businessId=$1 AND customerId=$2 AND status='open' LIMIT 1", business_id, customer_id)
    if not conv:
        conv = await fetchrow("INSERT INTO conversation (businessId, customerId, channel, status, createdAt) VALUES ($1,$2,'web','open',now()) RETURNING id", business_id, customer_id)
    conversation_id = conv["id"]

    await execute("INSERT INTO message (conversationId, sender, content, createdAt) VALUES ($1, 'customer', $2, now())", conversation_id, payload.message)

    context = {
        "business": {"id": b["id"], "name": b["name"]},
        "customer": {"id": customer_id, "name": payload.customerName},
        "recentMessages": [{"sender": "customer", "content": payload.message}]
    }

    agent_result = await run_agent_turn(context, payload.message)

    reply = None
    if agent_result and agent_result.get("replyText"):
        await execute(
            "INSERT INTO message (conversationId, sender, content, agentType, createdAt) VALUES ($1, 'ai', $2, $3, now())",
            conversation_id,
            agent_result["replyText"],
            agent_result.get("agentType")
        )
        reply = agent_result["replyText"]

    if agent_result and agent_result.get("leadUpdate"):
        existing = await fetchrow("SELECT id FROM lead WHERE businessId=$1 AND customerId=$2 LIMIT 1", business_id, customer_id)
        if existing:
            await execute(
                "UPDATE lead SET status=$1, notes=$2, score=$3 WHERE id=$4",
                agent_result["leadUpdate"].get("status", "qualified"),
                agent_result["leadUpdate"].get("notes"),
                agent_result["leadUpdate"].get("score"),
                existing["id"]
            )
        else:
            await execute(
                "INSERT INTO lead (businessId, customerId, score, status, serviceNeeded, budget, timeline, notes, createdAt) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,now())",
                business_id,
                customer_id,
                agent_result["leadUpdate"].get("score", 0),
                agent_result["leadUpdate"].get("status", "qualified"),
                agent_result["leadUpdate"].get("serviceNeeded"),
                agent_result["leadUpdate"].get("budget"),
                agent_result["leadUpdate"].get("timeline"),
                agent_result["leadUpdate"].get("notes")
            )

    if agent_result and agent_result.get("action"):
        act = agent_result["action"]
        if act.get("type") == "create_appointment":
            params = act.get("params", {})
            if not params.get("datetime"):
                await execute(
                    "INSERT INTO appointment (businessId, customerId, service, datetime, status, createdAt) VALUES ($1,$2,$3,now(),'pending',now())",
                    business_id,
                    customer_id,
                    params.get("service", "service")
                )
            else:
                await execute(
                    "INSERT INTO appointment (businessId, customerId, service, datetime, status, createdAt) VALUES ($1,$2,$3,$4,'pending',now())",
                    business_id,
                    customer_id,
                    params.get("service", "service"),
                    params.get("datetime")
                )

    await execute(
        "INSERT INTO \"AIAction\" (businessId, conversationId, agentType, action, result, createdAt) VALUES ($1,$2,$3,$4,$5,now())",
        business_id,
        conversation_id,
        agent_result.get("agentType"),
        json.dumps(agent_result.get("action") or {}),
        json.dumps(agent_result.get("leadUpdate") or {})
    )

    return {"reply": reply, "conversationId": conversation_id, "customerId": customer_id}

@app.get("/business/{business_id}/stats")
async def get_business_stats(business_id: str):
    """Get statistics for a business dashboard"""
    b = await fetchrow("SELECT id FROM business WHERE id = $1", business_id)
    if not b:
        raise HTTPException(status_code=404, detail="business not found")

    total_conversations = await fetchrow(
        "SELECT COUNT(*) as count FROM conversation WHERE businessId = $1",
        business_id
    )
    active_leads = await fetchrow(
        "SELECT COUNT(*) as count FROM lead WHERE businessId = $1 AND status = 'qualified'",
        business_id
    )
    qualified_leads = await fetchrow(
        "SELECT COUNT(*) as count FROM lead WHERE businessId = $1 AND status = 'qualified'",
        business_id
    )
    total_appointments = await fetchrow(
        "SELECT COUNT(*) as count FROM appointment WHERE businessId = $1",
        business_id
    )

    return {
        "total_conversations": total_conversations["count"] if total_conversations else 0,
        "active_leads": active_leads["count"] if active_leads else 0,
        "qualified_leads": qualified_leads["count"] if qualified_leads else 0,
        "total_appointments": total_appointments["count"] if total_appointments else 0,
    }

@app.get("/business/{business_id}/conversations")
async def get_conversations(business_id: str):
    """Get all conversations for a business"""
    b = await fetchrow("SELECT id FROM business WHERE id = $1", business_id)
    if not b:
        raise HTTPException(status_code=404, detail="business not found")

    conversations = await fetch(
        "SELECT c.id, c.customerId, c.status, c.createdAt, cust.name as customerName FROM conversation c LEFT JOIN customer cust ON c.customerId = cust.id WHERE c.businessId = $1 ORDER BY c.createdAt DESC LIMIT 100",
        business_id
    )

    return {"conversations": [dict(conv) for conv in conversations] if conversations else []}

@app.get("/conversation/{conversation_id}")
async def get_conversation_details(conversation_id: str):
    """Get detailed conversation with all messages"""
    conv = await fetchrow("SELECT * FROM conversation WHERE id = $1", conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="conversation not found")

    messages = await fetch(
        "SELECT * FROM message WHERE conversationId = $1 ORDER BY createdAt ASC",
        conversation_id
    )

    return {
        **dict(conv),
        "messages": [dict(msg) for msg in messages] if messages else []
    }

@app.get("/business/{business_id}/leads")
async def get_leads(business_id: str, status: str = None):
    """Get all leads for a business, optionally filtered by status"""
    b = await fetchrow("SELECT id FROM business WHERE id = $1", business_id)
    if not b:
        raise HTTPException(status_code=404, detail="business not found")

    if status:
        leads = await fetch(
            "SELECT l.*, c.name as customerName FROM lead l LEFT JOIN customer c ON l.customerId = c.id WHERE l.businessId = $1 AND l.status = $2 ORDER BY l.score DESC LIMIT 100",
            business_id,
            status
        )
    else:
        leads = await fetch(
            "SELECT l.*, c.name as customerName FROM lead l LEFT JOIN customer c ON l.customerId = c.id WHERE l.businessId = $1 ORDER BY l.score DESC LIMIT 100",
            business_id
        )

    return {"leads": [dict(lead) for lead in leads] if leads else []}

@app.get("/lead/{lead_id}")
async def get_lead_details(lead_id: str):
    """Get detailed lead information"""
    lead = await fetchrow("SELECT * FROM lead WHERE id = $1", lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="lead not found")

    return dict(lead)

@app.patch("/lead/{lead_id}")
async def update_lead(lead_id: str, updates: dict):
    """Update lead status or other fields"""
    lead = await fetchrow("SELECT id FROM lead WHERE id = $1", lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="lead not found")

    allowed_fields = {"status", "notes", "score", "serviceNeeded", "budget", "timeline"}
    update_fields = {k: v for k, v in updates.items() if k in allowed_fields}

    if not update_fields:
        return dict(lead)

    set_clause = ", ".join([f"{k} = ${i+1}" for i, k in enumerate(update_fields.keys())])
    values = list(update_fields.values()) + [lead_id]

    await execute(
        f"UPDATE lead SET {set_clause} WHERE id = ${len(values)}",
        *values
    )

    updated = await fetchrow("SELECT * FROM lead WHERE id = $1", lead_id)
    return dict(updated)
