const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const prisma = require('../prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

// register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, businessName, industry } = req.body;
    if (!email || !password || !businessName) return res.status(400).json({ error: 'missing fields' });

    // create business
    const business = await prisma.business.create({ data: { name: businessName, industry: industry || '', email: email, phone: '', servicesJson: {}, hoursJson: {}, faqsJson: {} } });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash, name: name || '', businessId: business.id } });

    const token = jwt.sign({ userId: user.id, businessId: business.id }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({ token, user: { id: user.id, email: user.email, businessId: business.id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'missing fields' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    const token = require('jsonwebtoken').sign({ userId: user.id, businessId: user.businessId }, JWT_SECRET, { expiresIn: '30d' });

    res.json({ token, user: { id: user.id, email: user.email, businessId: user.businessId } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
