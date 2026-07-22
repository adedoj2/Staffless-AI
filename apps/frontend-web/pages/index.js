import React from 'react'
import ChatWidget from '../components/ChatWidget'

export default function Home() {
  const businessId = process.env.NEXT_PUBLIC_BUSINESS_ID || 'demo-business';
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl font-bold mb-4">Staffless — AI receptionist for small businesses</h1>
        <p className="text-gray-600 mb-6">Quickly add a chat widget to your landing page that can answer questions and book appointments for customers.</p>
        <div className="inline-block">
          <button className="bg-teal-600 text-white px-6 py-3 rounded-md">Get started</button>
        </div>
      </div>
      <ChatWidget businessId={businessId} />
    </div>
  )
}
