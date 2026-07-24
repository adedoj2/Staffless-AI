import React, { useState } from 'react';
import Nav from '../components/Nav';
import { useConversations } from '../hooks/useDashboardData';
import { dashboardApiClient } from '../lib/apiClient';

export default function Conversations() {
  const businessId = process.env.NEXT_PUBLIC_BUSINESS_ID || 'demo-business';
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationDetails, setConversationDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const { conversations, loading: listLoading, error: listError } = useConversations(businessId);

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    setLoading(true);
    try {
      const details = await dashboardApiClient.getConversation(conversation.id);
      setConversationDetails(details);
    } catch (err) {
      console.error('Failed to load conversation details:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Conversations</h1>

        {listError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {listError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">All Conversations</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {listLoading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No conversations</div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === conv.id ? 'bg-teal-50 border-l-4 border-teal-600' : ''
                    }`}
                  >
                    <p className="font-medium text-gray-900 truncate">{conv.customerName}</p>
                    <p className="text-xs text-gray-500 mt-1">{conv.status}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(conv.createdAt).toLocaleDateString()}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Conversation Details */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="font-semibold text-gray-900">{selectedConversation.customerName}</h2>
                  <p className="text-sm text-gray-600 mt-1">ID: {selectedConversation.id}</p>
                </div>
                <div className="p-4">
                  {loading ? (
                    <div className="text-center text-gray-500">Loading conversation...</div>
                  ) : conversationDetails ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Status</p>
                        <p className="text-gray-900 capitalize">{conversationDetails.status}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Messages</p>
                        <div className="mt-2 space-y-2 max-h-96 overflow-y-auto">
                          {conversationDetails.messages?.map((msg, idx) => (
                            <div key={idx} className={`p-2 rounded ${msg.sender === 'ai' ? 'bg-gray-100' : 'bg-teal-50'}`}>
                              <p className="text-xs font-medium text-gray-600">{msg.sender.toUpperCase()}</p>
                              <p className="text-gray-900">{msg.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No details available</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                Select a conversation to view details
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
