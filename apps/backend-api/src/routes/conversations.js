const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const auth = require('../middleware/auth');

// GET /conversations - list conversations for the logged-in business
router.get('/', auth, async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { businessId: req.user.businessId },
      orderBy: { createdAt: 'desc' },
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });

    // Map to a smaller shape for the frontend
    const result = conversations.map((c) => ({ id: c.id, customerId: c.customerId, status: c.status, lastMessage: c.messages[0] || null, createdAt: c.createdAt }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// GET /conversations/:id/messages - full history
router.get('/:id/messages', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await prisma.conversation.findUnique({ where: { id } });
    if (!conversation || conversation.businessId !== req.user.businessId) return res.status(404).json({ error: 'not found' });

    const messages = await prisma.message.findMany({ where: { conversationId: id }, orderBy: { createdAt: 'asc' } });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
