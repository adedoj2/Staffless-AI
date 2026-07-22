import React, { useState } from 'react'
import Nav from '../components/Nav'

export default function Dashboard() {
  const [token, setToken] = useState('')
  const [summary, setSummary] = useState(null)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

  async function login() {
    const res = await fetch(`${API_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'owner@demo.com', password: 'password' }) })
    const data = await res.json()
    if (data.token) setToken(data.token)
  }

  async function loadSummary() {
    if (!token) return alert('login first')
    const res = await fetch(`${API_URL}/dashboard/summary`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setSummary(data)
  }

  return (
    <div>
      <Nav />
      <div className="container">
        <h1 className="text-2xl font-semibold my-4">Overview</h1>
        <div className="mb-4">
          <button className="bg-teal-600 text-white px-3 py-2 rounded" onClick={login}>Login demo owner</button>
          <button className="ml-2 px-3 py-2 border rounded" onClick={loadSummary}>Load summary</button>
        </div>
        {summary ? (
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border rounded">Conversations: {summary.conversations}</div>
            <div className="p-4 border rounded">New leads: {summary.newLeads}</div>
            <div className="p-4 border rounded">Qualified: {summary.qualifiedLeads}</div>
            <div className="p-4 border rounded">Appointments: {summary.appointments}</div>
            <div className="p-4 border rounded">Revenue: ${summary.revenue}</div>
            <div className="p-4 border rounded">AI actions: {summary.aiActionsExecuted}</div>
          </div>
        ) : (
          <div className="text-gray-500">No summary loaded</div>
        )}
      </div>
    </div>
  )
}
