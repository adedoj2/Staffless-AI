import os
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from db import init_db, close_db, fetchrow, fetch, execute
from ai_agent import run_agent_turn

app = FastAPI(title="Staffless FastAPI")

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
    return {"status": "ok"}

@app.post("/chat/{business_id}/message")
async def chat_message(business_id: str, payload: ChatReq):
    if not payload.message:
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

    context = {"business": {"id": b["id"], "name": b["name"]}, "customer": {"id": customer_id, "name": payload.customerName}, "recentMessages": [{"sender":"customer","content":payload.message}]}

    agent_result = await run_agent_turn(context, payload.message)

    reply = None
    if agent_result and agent_result.get("replyText"):
        await execute("INSERT INTO message (conversationId, sender, content, agentType, createdAt) VALUES ($1, 'ai', $2, $3, now())", conversation_id, agent_result["replyText"], agent_result.get("agentType"))
        reply = agent_result["replyText"]

    if agent_result and agent_result.get("leadUpdate"):
        existing = await fetchrow("SELECT id FROM lead WHERE businessId=$1 AND customerId=$2 LIMIT 1", business_id, customer_id)
        if existing:
            await execute("UPDATE lead SET status=$1, notes=$2, score=$3 WHERE id=$4", agent_result["leadUpdate"].get("status", "qualified"), agent_result["leadUpdate"].get("notes"), agent_result["leadUpdate"].get("score", 0), existing["id"])
        else:
            await execute("INSERT INTO lead (businessId, customerId, score, status, serviceNeeded, budget, timeline, notes, createdAt) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,now())",
                          business_id, customer_id, agent_result["leadUpdate"].get("score", 0), agent_result["leadUpdate"].get("status", "qualified"),
                          agent_result["leadUpdate"].get("serviceNeeded"), agent_result["leadUpdate"].get("budget"), agent_result["leadUpdate"].get("timeline"), agent_result["leadUpdate"].get("notes"))

    if agent_result and agent_result.get("action"):
        act = agent_result["action"]
        if act.get("type") == "create_appointment":
            params = act.get("params", {})
            if not params.get("datetime"):
                await execute("INSERT INTO appointment (businessId, customerId, service, datetime, status, createdAt) VALUES ($1,$2,$3,now(),'pending',now())",
                              business_id, customer_id, params.get("service","service"))
            else:
                await execute("INSERT INTO appointment (businessId, customerId, service, datetime, status, createdAt) VALUES ($1,$2,$3,$4,'pending',now())",
                              business_id, customer_id, params.get("service","service"), params.get("datetime"))

    await execute("INSERT INTO \"AIAction\" (businessId, conversationId, agentType, action, result, createdAt) VALUES ($1,$2,$3,$4,$5,now())",
                  business_id, conversation_id, agent_result.get("agentType"), json.dumps(agent_result.get("action") or {}), json.dumps(agent_result.get("leadUpdate") or {}))

    return {"reply": reply, "conversationId": conversation_id, "customerId": customer_id}
