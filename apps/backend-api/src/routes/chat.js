const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const runAgentTurn = require('../../services/ai-agents/src/index').runAgentTurn;

// POST /chat/:businessId/message
router.post('/:businessId/message', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { customerId, customerName, message } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });

    // Ensure business exists
    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'business not found' });

    // Find or create customer
    let customer = null;
    if (customerId) {
      customer = await prisma.customer.findUnique({ where: { id: customerId } });
    }
    if (!customer) {
      customer = await prisma.customer.create({ data: { businessId, name: customerName || null, channel: 'web' } });
    }

    // Find or create an open conversation
    let conversation = await prisma.conversation.findFirst({ where: { businessId, customerId: customer.id, status: 'open' } });
    if (!conversation) {
      conversation = await prisma.conversation.create({ data: { businessId, customerId: customer.id, channel: 'web' } });
    }

    // Persist inbound message
    const inbound = await prisma.message.create({ data: { conversationId: conversation.id, sender: 'customer', content: message } });

    // Build context (very small for stub)
    const context = {
      business: { id: business.id, name: business.name },
      customer: { id: customer.id, name: customer.name },
      recentMessages: [{ sender: 'customer', content: message }]
    };

    // Call agent
    const agentResult = await runAgentTurn({ context, message });

    // Persist outbound message if any
    let reply = null;
    if (agentResult && agentResult.replyText) {
      const outbound = await prisma.message.create({ data: { conversationId: conversation.id, sender: 'ai', content: agentResult.replyText, agentType: agentResult.agentType } });
      reply = agentResult.replyText;
    }

    // leadUpdate handling
    if (agentResult && agentResult.leadUpdate) {
      // Upsert a lead for this customer
      const existing = await prisma.lead.findFirst({ where: { businessId, customerId: customer.id } });
      if (existing) {
        await prisma.lead.update({ where: { id: existing.id }, data: { ...agentResult.leadUpdate } });
      } else {
        await prisma.lead.create({ data: { businessId, customerId: customer.id, ...agentResult.leadUpdate } });
      }
    }

    // action handling (only create_appointment simple case)
    if (agentResult && agentResult.action) {
      const act = agentResult.action;
      if (act.type === 'create_appointment' && act.params) {
        await prisma.appointment.create({ data: { businessId, customerId: customer.id, service: act.params.service || 'service', datetime: new Date(act.params.datetime || Date.now()) } });
      }
    }

    // Always write an AIAction row
    await prisma.aIAction.create({ data: { businessId, conversationId: conversation.id, agentType: agentResult.agentType || 'sales', action: agentResult.action ? agentResult.action.type : 'none', result: agentResult } });

    res.json({ conversationId: conversation.id, customerId: customer.id, reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
