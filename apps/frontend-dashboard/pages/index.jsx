import React, { useState } from 'react';
import Nav from '../components/Nav';
import { useDashboardData, useConversations, useLeads } from '../hooks/useDashboardData';
import { dashboardApiClient } from '../lib/apiClient';

export default function Dashboard() {
  const businessId = process.env.NEXT_PUBLIC_BUSINESS_ID || 'demo-business';
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { conversations } = useConversations(businessId);
  const { leads } = useLeads(businessId);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardApiClient.getBusinessStats(businessId);
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [businessId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Conversations"
              value={stats?.total_conversations || 0}
              icon="💬"
            />
            <StatCard
              title="Active Leads"
              value={stats?.active_leads || 0}
              icon="🎯"
            />
            <StatCard
              title="Qualified Leads"
              value={stats?.qualified_leads || 0}
              icon="✅"
            />
            <StatCard
              title="Appointments"
              value={stats?.total_appointments || 0}
              icon="📅"
            />
          </div>
        )}

        {/* Recent Conversations */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Conversations</h2>
          {conversations.length === 0 ? (
            <p className="text-gray-500">No conversations yet</p>
          ) : (
            <div className="space-y-2">
              {conversations.slice(0, 5).map((conv) => (
                <div key={conv.id} className="p-4 border border-gray-200 rounded hover:bg-gray-50">
                  <p className="font-medium text-gray-900">{conv.customerName}</p>
                  <p className="text-sm text-gray-600">{conv.status}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Leads</h2>
          {leads.length === 0 ? (
            <p className="text-gray-500">No leads yet</p>
          ) : (
            <div className="space-y-2">
              {leads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="p-4 border border-gray-200 rounded hover:bg-gray-50">
                  <p className="font-medium text-gray-900">{lead.customerName}</p>
                  <p className="text-sm text-gray-600">Status: {lead.status}</p>
                  <p className="text-sm text-teal-600">Score: {lead.score}/100</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 border-t-4 border-teal-600">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-gray-600 text-sm">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
