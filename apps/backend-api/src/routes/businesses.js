const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const auth = require('../middleware/auth');

// GET /businesses/me
router.get('/me', auth, async (req, res) => {
  try {
    const business = await prisma.business.findUnique({ where: { id: req.user.businessId } });
    if (!business) return res.status(404).json({ error: 'business not found' });
    res.json(business);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// PUT /businesses/me
router.put('/me', auth, async (req, res) => {
  try {
    const allowed = {};
    // Only accept these fields for quick demo
    if (req.body.servicesJson !== undefined) allowed.servicesJson = req.body.servicesJson;
    if (req.body.hoursJson !== undefined) allowed.hoursJson = req.body.hoursJson;
    if (req.body.faqsJson !== undefined) allowed.faqsJson = req.body.faqsJson;
    if (req.body.name !== undefined) allowed.name = req.body.name;
    if (req.body.email !== undefined) allowed.email = req.body.email;
    if (req.body.phone !== undefined) allowed.phone = req.body.phone;

    const updated = await prisma.business.update({ where: { id: req.user.businessId }, data: allowed });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
