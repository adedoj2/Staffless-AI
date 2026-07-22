import React from 'react';

export default function ChatMessage({ message }) {
  const isAI = message.sender === 'ai';
  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-xs p-2 rounded-lg ${isAI ? 'bg-gray-100 text-gray-900' : 'bg-teal-600 text-white'}`}>
        {message.content}
      </div>
    </div>
  );
}
