import React, { useEffect, useState } from 'react';
import useConversationStore from '../stores/useConversationStore';
import ChatMessage from './ChatMessage';
import { FiMessageSquare } from 'react-icons/fi';
import { apiClient } from '../lib/apiClient';
import { storageManager } from '../lib/localStorage';
import { useApi } from '../hooks/useApi';

export default function ChatWidget({ businessId }) {
  const { messages, addMessage, setConversation, conversationId, customerId, setCustomer } = useConversationStore();
  const { loading, error, execute } = useApi();
  const [isOpen, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [apiError, setApiError] = useState(null);

  // Initialize customer from storage
  useEffect(() => {
    const storedCustomer = storageManager.getCustomerId();
    if (storedCustomer) {
      setCustomer(storedCustomer);
    }
  }, [setCustomer]);

  const handleSendMessage = async () => {
    if (!text.trim()) return;

    // Add customer message to UI immediately
    addMessage({ sender: 'customer', content: text });
    setApiError(null);
    const messageText = text;
    setText('');

    try {
      await execute(async () => {
        const response = await apiClient.sendMessage(businessId, {
          customerId,
          customerName: 'Visitor',
          message: messageText,
        });

        // Add AI reply to UI
        if (response.reply) {
          addMessage({ sender: 'ai', content: response.reply });
        }

        // Update stored IDs
        if (response.customerId) {
          setCustomer(response.customerId);
          storageManager.setCustomerId(response.customerId);
        }

        if (response.conversationId) {
          setConversation(response.conversationId);
          storageManager.setConversationId(response.conversationId);
        }

        return response;
      });
    } catch (err) {
      setApiError(err.message);
      addMessage({
        sender: 'ai',
        content: 'Sorry — message failed to send. Please try again.',
      });
    }
  };

  // Handle Enter key to send message
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed right-4 bottom-6 z-50">
      <div className="chat-widget bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
        {!isOpen ? (
          <button
            onClick={() => setOpen(true)}
            className="w-full p-4 flex items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <FiMessageSquare className="text-2xl text-teal-600" />
            <span className="font-medium text-gray-800">Chat with us</span>
          </button>
        ) : (
          <div className="flex flex-col h-96">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-teal-100">
              <h3 className="text-lg font-semibold text-gray-800">Chat Support</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.length === 0 && (
                <div className="text-sm text-gray-400 text-center py-8">
                  No messages yet. Start the conversation!
                </div>
              )}
              {messages.map((m, i) => (
                <ChatMessage key={i} message={m} />
              ))}
            </div>

            {/* Error Display */}
            {apiError && (
              <div className="px-4 py-2 bg-red-50 border-t border-red-200">
                <p className="text-sm text-red-600">{apiError}</p>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-white space-y-2">
              <div className="flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  disabled={loading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={loading || !text.trim()}
                  className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
                >
                  {loading ? '...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
