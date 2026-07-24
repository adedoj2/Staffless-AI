/**
 * LocalStorage utilities for persisting user data
 */

const STORAGE_KEYS = {
  CUSTOMER_ID: 'staffless_customerId',
  CONVERSATION_ID: 'staffless_conversationId',
  BUSINESS_ID: 'staffless_businessId',
};

export const storageManager = {
  /**
   * Get stored customer ID
   */
  getCustomerId() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.CUSTOMER_ID);
  },

  /**
   * Set customer ID in storage
   */
  setCustomerId(id) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_ID, id);
  },

  /**
   * Get stored conversation ID
   */
  getConversationId() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.CONVERSATION_ID);
  },

  /**
   * Set conversation ID in storage
   */
  setConversationId(id) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.CONVERSATION_ID, id);
  },

  /**
   * Clear all stored data
   */
  clear() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.CUSTOMER_ID);
    localStorage.removeItem(STORAGE_KEYS.CONVERSATION_ID);
  },
};
