const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

async function authMiddleware(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'missing token' });
    const token = auth.slice(7);
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'invalid token' });
    }

    // Fetch user and attach
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(401).json({ error: 'user not found' });
    req.user = { id: user.id, email: user.email, businessId: user.businessId, name: user.name };
    next();
  } catch (err) {
    console.error('auth middleware error', err);
    res.status(500).json({ error: 'server error' });
  }
}

module.exports = authMiddleware;
