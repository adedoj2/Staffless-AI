import React, { useState } from 'react';

export default function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const [messages, setMessages] = useState([{ sender: 'ai', content: 'Welcome! Say hi to start.' }]);
  const [text, setText] = useState('');
  const [customerId, setCustomerId] = useState(null);
  const businessId = process.env.NEXT_PUBLIC_BUSINESS_ID || 'demo-business';

  async function send() {
    if (!text) return;
    const userMsg = { sender: 'customer', content: text };
    setMessages((m) => [...m, userMsg]);
    const res = await fetch(`${API_URL}/chat/${businessId}/message`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerId, customerName: 'Guest', message: text }) });
    const data = await res.json();
    if (data.reply) setMessages((m) => [...m, { sender: 'ai', content: data.reply }]);
    if (data.customerId) setCustomerId(data.customerId);
    setText('');
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Staffless — Chat Widget (demo)</h1>
      <div style={{ border: '1px solid #ddd', padding: 10, width: 400, minHeight: 200 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ textAlign: m.sender === 'ai' ? 'left' : 'right', margin: '6px 0' }}>
            <div style={{ display: 'inline-block', padding: '8px 12px', borderRadius: 12, background: m.sender === 'ai' ? '#f1f1f1' : '#0ea5a4', color: m.sender === 'ai' ? '#000' : '#fff' }}>{m.content}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10 }}>
        <input value={text} onChange={(e) => setText(e.target.value)} style={{ width: 300, padding: 8 }} />
        <button onClick={send} style={{ marginLeft: 8, padding: '8px 12px' }}>Send</button>
      </div>
    </div>
  );
}
