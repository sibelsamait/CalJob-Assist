import { useEffect, useMemo, useState } from 'react';

const CACHE_KEY = 'economic-data-cache';
const CACHE_TTL_MS = 1000 * 60 * 10;

export function useEconomicData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const cached = typeof window !== 'undefined' ? window.localStorage.getItem(CACHE_KEY) : null;
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
            setData(parsed.value);
            setLoading(false);
            return;
          }
        }

        const response = await fetch('/api/economic');
        if (!response.ok) throw new Error('No se pudieron cargar los indicadores');
        const payload = await response.json();
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), value: payload }));
        }
        setData(payload);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return useMemo(() => ({
    data,
    loading,
    error,
    indicators: data || {},
    hasCache: Boolean(data && error),
  }), [data, loading, error]);
}

export default useEconomicData;
