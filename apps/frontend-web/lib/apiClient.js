/**
 * API Client for frontend-web communication with FastAPI backend
 * Handles all HTTP requests, error handling, and response parsing
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const apiClient = {
  /**
   * Generic fetch wrapper with error handling
   */
  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
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
   * Send a chat message to the AI agent
   */
  async sendMessage(businessId, { customerId, customerName, message }) {
    return this.request(`/chat/${businessId}/message`, {
      method: 'POST',
      body: JSON.stringify({
        customerId,
        customerName: customerName || 'Visitor',
        message,
      }),
    });
  },

  /**
   * Health check endpoint
   */
  async healthCheck() {
    return this.request('/');
  },

  /**
   * Get conversation history (if backend supports it)
   */
  async getConversation(conversationId) {
    return this.request(`/conversation/${conversationId}`);
  },

  /**
   * Get customer info (if backend supports it)
   */
  async getCustomer(customerId) {
    return this.request(`/customer/${customerId}`);
  },

  /**
   * Create or update a lead (if backend supports it)
   */
  async updateLead(businessId, customerId, leadData) {
    return this.request(`/lead/${businessId}/${customerId}`, {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  },
};
