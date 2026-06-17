import { useState, useEffect, useCallback, useRef } from 'react';

const DEFAULT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface UseLocalStorageCacheOptions<T> {
  key: string;
  fetchFn: () => Promise<T>;
  duration?: number;
  enabled?: boolean;
}

interface UseLocalStorageCacheResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isCacheValid: boolean;
}

/**
 * Hook para caching con localStorage y fallback a fetch
 * 
 * @param key - Clave para localStorage (sin prefijo)
 * @param fetchFn - Función para obtener datos frescos
 * @param duration - Duración del cache en ms (default: 24h)
 * @param enabled - Si false, siempre hace fetch directo
 */
export function useLocalStorageCache<T>({
  key,
  fetchFn,
  duration = DEFAULT_CACHE_DURATION,
  enabled = true,
}: UseLocalStorageCacheOptions<T>): UseLocalStorageCacheResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCacheValid, setIsCacheValid] = useState(false);
  const fetchingRef = useRef(false);

  const CACHE_KEY = `yuju_cache_${key}`;
  const EXPIRY_KEY = `yuju_cache_${key}_expiry`;

  // Read from cache
  const getCached = useCallback((): T | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const expiry = localStorage.getItem(EXPIRY_KEY);
      
      if (cached && expiry) {
        const expiryTime = Number.parseInt(expiry);
        if (Date.now() < expiryTime) {
          return JSON.parse(cached) as T;
        }
      }
    } catch (e) {
      console.warn(`[Cache] Error reading ${key}:`, e);
    }
    return null;
  }, [key, CACHE_KEY, EXPIRY_KEY]);

  // Write to cache
  const setCache = useCallback((data: T): void => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(EXPIRY_KEY, (Date.now() + duration).toString());
    } catch (e) {
      console.warn(`[Cache] Error writing ${key}:`, e);
    }
  }, [key, CACHE_KEY, EXPIRY_KEY, duration]);

  // Fetch data (with cache check)
  const fetchData = useCallback(async (useCache = true) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    setLoading(true);
    setError(null);

    try {
      // Try cache first
      if (useCache && enabled) {
        const cached = getCached();
        if (cached) {
          setData(cached);
          setIsCacheValid(true);
          setLoading(false);
          // Fetch in background to keep fresh
          fetchData(false).catch(console.error);
          fetchingRef.current = false;
          return;
        }
      }

      // Fetch fresh data
      const freshData = await fetchFn();
      setData(freshData);
      setCache(freshData);
      setIsCacheValid(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar datos';
      setError(message);
      // On error, try to use stale cache if available
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          setData(JSON.parse(cached) as T);
        } catch {
          // Ignore
        }
      }
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [enabled, fetchFn, getCached, setCache]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh function
  const refresh = useCallback(async () => {
    await fetchData(false);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    isCacheValid,
  };
}

/**
 * Hook para sessionStorage cache (se limpia al cerrar navegador)
 */
export function useSessionCache<T>({
  key,
  fetchFn,
  enabled = true,
}: Omit<UseLocalStorageCacheOptions<T>, 'duration'>): UseLocalStorageCacheResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCacheValid, setIsCacheValid] = useState(false);

  const CACHE_KEY = `yuju_session_${key}`;
  const fetchingRef = useRef(false);

  const getCached = useCallback((): T | null => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        return JSON.parse(cached) as T;
      }
    } catch (e) {
      console.warn(`[SessionCache] Error reading ${key}:`, e);
    }
    return null;
  }, [key, CACHE_KEY]);

  const setCache = useCallback((data: T): void => {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn(`[SessionCache] Error writing ${key}:`, e);
    }
  }, [key, CACHE_KEY]);

  const fetchData = useCallback(async (useCache = true) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    setLoading(true);
    setError(null);

    try {
      if (useCache && enabled) {
        const cached = getCached();
        if (cached) {
          setData(cached);
          setIsCacheValid(true);
          setLoading(false);
          fetchingRef.current = false;
          return;
        }
      }

      const freshData = await fetchFn();
      setData(freshData);
      setCache(freshData);
      setIsCacheValid(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [enabled, fetchFn, getCached, setCache]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(async () => {
    await fetchData(false);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    isCacheValid,
  };
}