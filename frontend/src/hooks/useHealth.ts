import { useState, useEffect } from 'react';
import { fetchHealthStatus, HealthResponse } from '../api/healthApi';

export const useHealth = () => {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchHealthStatus();
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to Spring Boot backend API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return { data, loading, error, refetch };
};
