// Lightweight stub of runAgentTurn used by backend-api during development.
// It echoes back a reply and demonstrates agent result shape.

async function runAgentTurn({ context, message }) {
  // Simple heuristic stub: if message includes "book" or "appointment" propose appointment
  const text = (message || '').toLowerCase();
  if (text.includes('book') || text.includes('appointment') || text.includes('schedule')) {
    return {
      replyText: `I can help you book that. What day/time works for you?`,
      agentType: 'sales',
      intent: 'booking_request',
      leadUpdate: { status: 'qualified' },
      action: { type: 'create_appointment', params: { datetime: new Date().toISOString(), service: 'default' } }
    };
  }

  // Default echo/fallback
  return {
    replyText: `Thanks for asking: "${message}" — how can I help further?`,
    agentType: 'sales',
    intent: 'unclear',
    leadUpdate: null,
    action: null
  };
}

module.exports = { runAgentTurn };
