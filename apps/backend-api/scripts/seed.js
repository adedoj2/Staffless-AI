const prisma = require('../prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

async function seed() {
  try {
    console.log('Seeding demo data...');
    // Create business
    const business = await prisma.business.create({ data: { name: 'Demo Salon', industry: 'beauty', email: 'demo@salon.com', phone: '555-0100', servicesJson: { haircut: 40 }, hoursJson: { mon: '9-5' }, faqsJson: { parking: 'Free lot behind building' } } });

    // Create user
    const passwordHash = await bcrypt.hash('password', 10);
    const user = await prisma.user.create({ data: { email: 'owner@demo.com', passwordHash, name: 'Demo Owner', businessId: business.id } });

    // Create a customer
    const customer = await prisma.customer.create({ data: { businessId: business.id, name: 'Alice', email: 'alice@example.com', channel: 'web' } });

    // Create a conversation and messages
    const conversation = await prisma.conversation.create({ data: { businessId: business.id, customerId: customer.id, channel: 'web' } });

    await prisma.message.create({ data: { conversationId: conversation.id, sender: 'customer', content: 'Hi, how much is a haircut?' } });
    await prisma.message.create({ data: { conversationId: conversation.id, sender: 'ai', content: 'A haircut is $40. Would you like to book?', agentType: 'sales' } });

    // Create a lead and appointment
    await prisma.lead.create({ data: { businessId: business.id, customerId: customer.id, score: 10, status: 'qualified', serviceNeeded: 'haircut', budget: '40' } });

    // Create an AIAction row
    await prisma.aIAction.create({ data: { businessId: business.id, conversationId: conversation.id, agentType: 'sales', action: 'propose_appointment', result: {} } });

    // Print useful info
    const token = jwt.sign({ userId: user.id, businessId: business.id }, JWT_SECRET, { expiresIn: '30d' });
    console.log('Seed complete. Demo credentials:');
    console.log('  owner email: owner@demo.com  password: password');
    console.log('  JWT token:', token);
    console.log('  businessId:', business.id);
    process.exit(0);
  } catch (err) {
    console.error('Seed error', err);
    process.exit(1);
  }
}

seed();
