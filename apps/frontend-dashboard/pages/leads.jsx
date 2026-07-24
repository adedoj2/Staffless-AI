import React, { useState } from 'react';
import Nav from '../components/Nav';
import { useLeads } from '../hooks/useDashboardData';
import { dashboardApiClient } from '../lib/apiClient';

export default function Leads() {
  const businessId = process.env.NEXT_PUBLIC_BUSINESS_ID || 'demo-business';
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadDetails, setLeadDetails] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const { leads, loading: listLoading, error: listError } = useLeads(businessId, statusFilter !== 'all' ? { status: statusFilter } : {});

  const handleSelectLead = async (lead) => {
    setSelectedLead(lead);
    setLoading(true);
    try {
      const details = await dashboardApiClient.getLead(lead.id);
      setLeadDetails(details);
    } catch (err) {
      console.error('Failed to load lead details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await dashboardApiClient.updateLead(leadId, { status: newStatus });
      setLeadDetails({ ...leadDetails, status: newStatus });
      setSelectedLead({ ...selectedLead, status: newStatus });
    } catch (err) {
      console.error('Failed to update lead status:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Leads</h1>

        {listError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {listError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leads List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-4">All Leads</h2>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Status</option>
                <option value="qualified">Qualified</option>
                <option value="unqualified">Unqualified</option>
                <option value="contacted">Contacted</option>
              </select>
            </div>
            <div className="divide-y divide-gray-200">
              {listLoading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : leads.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No leads</div>
              ) : (
                leads.map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => handleSelectLead(lead)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      selectedLead?.id === lead.id ? 'bg-teal-50 border-l-4 border-teal-600' : ''
                    }`}
                  >
                    <p className="font-medium text-gray-900 truncate">{lead.customerName}</p>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded capitalize">{lead.status}</span>
                      <span className="text-xs text-gray-500">Score: {lead.score}/100</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Lead Details */}
          <div className="lg:col-span-2">
            {selectedLead ? (
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="font-semibold text-gray-900">{selectedLead.customerName}</h2>
                  <p className="text-sm text-gray-600 mt-1">ID: {selectedLead.id}</p>
                </div>
                <div className="p-4">
                  {loading ? (
                    <div className="text-center text-gray-500">Loading lead details...</div>
                  ) : leadDetails ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Status</label>
                        <select
                          value={leadDetails.status}
                          onChange={(e) => handleStatusChange(selectedLead.id, e.target.value)}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="qualified">Qualified</option>
                          <option value="unqualified">Unqualified</option>
                          <option value="contacted">Contacted</option>
                        </select>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Lead Score</p>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-teal-600 h-2 rounded-full"
                              style={{ width: `${leadDetails.score}%` }}
                            />
                          </div>
                          <p className="text-sm text-gray-600 mt-2">{leadDetails.score}/100</p>
                        </div>
                      </div>
                      {leadDetails.serviceNeeded && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Service Needed</p>
                          <p className="text-gray-900">{leadDetails.serviceNeeded}</p>
                        </div>
                      )}
                      {leadDetails.budget && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Budget</p>
                          <p className="text-gray-900">${leadDetails.budget}</p>
                        </div>
                      )}
                      {leadDetails.notes && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Notes</p>
                          <p className="text-gray-900 bg-gray-50 p-3 rounded mt-1">{leadDetails.notes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">No details available</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                Select a lead to view details
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
