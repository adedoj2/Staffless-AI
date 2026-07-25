/**
 * API Client for frontend-dashboard communication with FastAPI backend
 * Handles authenticated requests to the admin/management endpoints
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const dashboardApiClient = {
  /**
   * Generic authenticated fetch wrapper
   */
  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('staffless_token') : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Clear token and redirect to login if needed
          if (typeof window !== 'undefined') {
            localStorage.removeItem('staffless_token');
          }
        }
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  },

  /**
   * Get conversations for a business
   */
  async getConversations(businessId, filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.request(`/business/${businessId}/conversations${query ? '?' + query : ''}`);
  },

  /**
   * Get conversation details
   */
  async getConversation(conversationId) {
    return this.request(`/conversation/${conversationId}`);
  },

  /**
   * Get leads for a business
   */
  async getLeads(businessId, filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.request(`/business/${businessId}/leads${query ? '?' + query : ''}`);
  },

  /**
   * Get lead details
   */
  async getLead(leadId) {
    return this.request(`/lead/${leadId}`);
  },

  /**
   * Update lead status
   */
  async updateLead(leadId, updates) {
    return this.request(`/lead/${leadId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Get business overview/stats
   */
  async getBusinessStats(businessId) {
    return this.request(`/business/${businessId}/stats`);
  },

  /**
   * Health check
   */
  async healthCheck() {
    return this.request('/');
  },
};
