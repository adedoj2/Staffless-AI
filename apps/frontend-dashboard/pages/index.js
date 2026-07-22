import React, { useState } from 'react';

export default function Dashboard() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('owner@biz.com');
  const [password, setPassword] = useState('password');
  const [convos, setConvos] = useState([]);

  async function login() {
    const res = await fetch(`${API_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (data.token) setToken(data.token);
  }

  async function loadConvos() {
    if (!token) return alert('login first');
    const res = await fetch(`${API_URL}/conversations`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setConvos(data || []);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Staffless — Dashboard (minimal)</h1>
      <div>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
        <button onClick={login}>Login</button>
        <button onClick={loadConvos} style={{ marginLeft: 8 }}>Load Conversations</button>
      </div>
      <div style={{ marginTop: 20 }}>
        <h2>Conversations</h2>
        {convos.length === 0 ? <div>No conversations loaded</div> : (
          <ul>
            {convos.map((c) => <li key={c.id}>{c.id} — {c.status}</li>)}
          </ul>
        )}
      </div>
    </div>
  );
}
