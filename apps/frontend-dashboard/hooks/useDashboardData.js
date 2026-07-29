import { useState, useCallback, useEffect } from 'react';
import { dashboardApiClient } from '../lib/apiClient';

/**
 * Custom hook for managing dashboard data fetching
 */
export const useDashboardData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      const errorMessage = err.message || 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, execute };
};

/**
 * Hook to fetch conversations
 */
export const useConversations = (businessId, filters = {}) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Serialize filters so a new {} literal on every render doesn't retrigger the effect.
  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    if (!businessId) return;

    const fetchConversations = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await dashboardApiClient.getConversations(businessId, JSON.parse(filtersKey));
        setConversations(data.conversations || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [businessId, filtersKey]);

  return { conversations, loading, error };
};

/**
 * Hook to fetch leads
 */
export const useLeads = (businessId, filters = {}) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Serialize filters so a new {} literal on every render doesn't retrigger the effect.
  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    if (!businessId) return;

    const fetchLeads = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await dashboardApiClient.getLeads(businessId, JSON.parse(filtersKey));
        setLeads(data.leads || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [businessId, filtersKey]);

  return { leads, loading, error };
};
