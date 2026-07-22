import React, { useEffect, useState } from 'react';
import useConversationStore from '../stores/useConversationStore';
import ChatMessage from './ChatMessage';
import { FiMessageSquare } from 'react-icons/fi';

export default function ChatWidget({ businessId }) {
  const { messages, addMessage, setConversation, conversationId, customerId, setCustomer } = useConversationStore();
  const [isOpen, setOpen] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    // hydrate from localStorage
    const storedCustomer = localStorage.getItem('staffless_customerId');
    if (storedCustomer) setCustomer(storedCustomer);
  }, [setCustomer]);

  async function send() {
    if (!text) return;
    addMessage({ sender: 'customer', content: text });
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    try {
      const res = await fetch(`${API_URL}/chat/${businessId}/message`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerId, customerName: 'Visitor', message: text }) });
      const data = await res.json();
      if (data.reply) addMessage({ sender: 'ai', content: data.reply });
      if (data.customerId) { setCustomer(data.customerId); localStorage.setItem('staffless_customerId', data.customerId); }
      if (data.conversationId) setConversation(data.conversationId);
    } catch (err) {
      console.error('send error', err);
      addMessage({ sender: 'ai', content: 'Sorry — message failed to send. Try again.' });
    }
    setText('');
  }

  return (
    <div className="fixed right-4 bottom-6 z-50">
      <div className="chat-widget bg-white shadow-lg rounded-lg overflow-hidden">
        {!isOpen ? (
          <button onClick={() => setOpen(true)} className="p-3 flex items-center gap-2">
            <FiMessageSquare className="text-2xl text-teal-600" />
            <span className="font-medium">Chat with us</span>
          </button>
        ) : (
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Chat</h3>
              <button onClick={() => setOpen(false)} className="text-sm text-gray-500">Close</button>
            </div>
            <div className="h-64 overflow-auto space-y-2 mb-3">
              {messages.length === 0 && <div className="text-sm text-gray-400">No messages yet. Say hi!</div>}
              {messages.map((m, i) => <ChatMessage key={i} message={m} />)}
            </div>
            <div className="flex gap-2">
              <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 border p-2 rounded-md" placeholder="Type a message" />
              <button onClick={send} className="bg-teal-600 text-white px-3 py-2 rounded-md">Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
