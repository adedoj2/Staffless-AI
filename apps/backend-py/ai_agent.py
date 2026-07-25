import os
import httpx
import logging

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_API_URL = os.environ.get("GEMINI_API_URL", "https://generativelanguage.googleapis.com/v1/models/text-bison-001:generate")

logger = logging.getLogger("ai_agent")

async def call_gemini(prompt: str, temperature: float = 0.2, max_output_tokens: int = 512) -> str:
    url = GEMINI_API_URL
    if GEMINI_API_KEY:
        sep = "&" if "?" in url else "?"
        url = f"{url}{sep}key={GEMINI_API_KEY}"

    body = {
        "prompt": {"text": prompt},
        "temperature": temperature,
        "maxOutputTokens": max_output_tokens
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(url, json=body, headers={"Content-Type": "application/json"})
        if resp.status_code != 200:
            text = await resp.text()
            logger.error("Gemini request failed %s: %s", resp.status_code, text)
            raise RuntimeError(f"Gemini call failed: {resp.status_code}")
        data = resp.json()
        reply = None
        if isinstance(data, dict):
            if "candidates" in data and len(data["candidates"]) > 0:
                reply = data["candidates"][0].get("content")
            elif "output" in data and isinstance(data["output"], list) and len(data["output"]) > 0:
                reply = data["output"][0].get("content")
            else:
                reply = data.get("outputText") or data.get("reply") or str(data)
        return reply or ""

async def run_agent_turn(context: dict, message: str) -> dict:
    try:
        if GEMINI_API_KEY:
            prompt = (
                "You are an assistant for a small business. Given the conversation context and latest customer message, "
                "reply only when a customer has asked a question or provided a message. Do not initiate conversations, "
                "send unsolicited greetings, or start the conversation on your own. Provide a concise answer and, if relevant, "
                "output a JSON object on a single line with keys: "
                "'intent' (one-word intent like booking_request, faq, pricing), "
                "'reply' (plain reply text), "
                "'leadUpdate' (object or null), "
                "'action' (object describing an action like {type:'create_appointment', params:{datetime:'...',service:'...'}})'.\n\n"
                f"Context: {context}\n\nCustomer: {message}\n\nRespond first with the reply text, then on a new line output only the JSON.\n"
            )
            resp = await call_gemini(prompt)
            if resp:
                lines = [l.strip() for l in resp.strip().splitlines() if l.strip()]
                json_part = None
                if lines and lines[-1].startswith("{"):
                    json_part = lines[-1]
                    reply_text = "\n".join(lines[:-1]).strip() or None
                else:
                    reply_text = resp.strip()
                    json_part = None

                result = {"replyText": reply_text or "", "agentType": "sales", "intent": "unclear", "leadUpdate": None, "action": None}
                if json_part:
                    import json
                    try:
                        parsed = json.loads(json_part)
                        result["replyText"] = parsed.get("reply") or result["replyText"]
                        result["intent"] = parsed.get("intent") or result["intent"]
                        result["leadUpdate"] = parsed.get("leadUpdate")
                        result["action"] = parsed.get("action")
                        result["agentType"] = parsed.get("agentType", "sales")
                    except Exception as e:
                        logger.warning("Failed parse JSON output from model: %s", e)
                return result

        text = (message or "").lower()
        if any(t in text for t in ("book", "appointment", "schedule")):
            return {
                "replyText": "I can help you book that. What day/time works for you?",
                "agentType": "sales",
                "intent": "booking_request",
                "leadUpdate": {"status": "qualified"},
                "action": {"type": "create_appointment", "params": {"datetime": None, "service": "default"}}
            }
        return {"replyText": f"Thanks for asking: \"{message}\" — how can I help further?", "agentType": "sales", "intent": "unclear", "leadUpdate": None, "action": None}
    except Exception as e:
        logger.exception("run_agent_turn error")
        return {"replyText": None, "agentType": "sales", "intent": "error", "leadUpdate": None, "action": None}
