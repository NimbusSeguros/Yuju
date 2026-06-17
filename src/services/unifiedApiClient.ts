import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// ============================================================================
// UNIFIED API CLIENT FACTORY
// Reemplaza los múltiples API clients dispersos en el proyecto
// ============================================================================

export interface UnifiedApiClientOptions {
  baseURL: string;
  tokenKey?: string;
  clientSecret?: string;
  clientSecretHeader?: string;
  apiKeyHeader?: string;
  apiKey?: string;
  defaultTimeout?: number;
}

export interface TokenManager {
  getToken: () => string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}

/**
 * Crea un cliente Axios con interceptores de autenticación unificados
 * 
 * @example
 * const api = createApiClient({
 *   baseURL: '/api',
 *   tokenKey: 'auth_token',
 * });
 */
export function createApiClient(options: UnifiedApiClientOptions): AxiosInstance {
  const {
    baseURL,
    tokenKey = 'auth_token',
    clientSecret,
    apiKeyHeader,
    apiKey,
    defaultTimeout = 30000,
  } = options;

  // Create axios instance
  const client = axios.create({
    baseURL,
    timeout: defaultTimeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // In-memory token (faster than localStorage for each request)
  // Validate: reject null string or invalid tokens
  const storedToken = sessionStorage.getItem(tokenKey);
  let token: string | null =
    storedToken && storedToken !== 'null' && storedToken !== 'undefined' && storedToken.length > 10
      ? storedToken
      : null;

  // Token manager functions
  const tokenManager: TokenManager = {
    getToken: () => token,
    setToken: (newToken: string) => {
      if (!newToken || newToken === 'null' || newToken === 'undefined') {
        tokenManager.clearToken();
        return;
      }
      token = newToken;
      sessionStorage.setItem(tokenKey, newToken);
    },
    clearToken: () => {
      token = null;
      sessionStorage.removeItem(tokenKey);
    },
  };

  // Request interceptor
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // Skip auth for token endpoint (no agrega Authorization header)
      if (config.url?.includes('/auth/token')) {
        return config;
      }

      // Add API key if configured
      if (apiKey && apiKeyHeader) {
        config.headers.set(apiKeyHeader, apiKey);
      }

      // Only set Authorization header if token is valid
      if (token && token !== 'null' && token !== 'undefined' && token.length > 10) {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        // Remove any invalid Authorization header
        config.headers.delete('Authorization');
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle 401/403 and retry
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; _retry429?: boolean };

      // Handle 401/403 - retry with new token
      if (
        (error.response?.status === 401 || error.response?.status === 403) &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        try {
          tokenManager.clearToken();
          
          // Fetch new token enviando clientSecret en el body (como espera el backend)
          if (clientSecret) {
            const tokenResponse = await axios.post(`${baseURL}/auth/token`, { clientSecret });
            
            if (tokenResponse.data?.token) {
              tokenManager.setToken(tokenResponse.data.token);
              originalRequest.headers.set('Authorization', `Bearer ${tokenResponse.data.token}`);
              return client(originalRequest);
            }
          }
        } catch (tokenError) {
          console.error('[API] Token refresh failed:', tokenError);
        }
      }

      // Handle rate limiting (429)
      if (error.response?.status === 429 && !originalRequest._retry429) {
        originalRequest._retry429 = true;
        const retryAfter = error.response.headers['retry-after'];
        const delay = retryAfter ? Number.parseInt(retryAfter) * 1000 : 1000;

        return new Promise((resolve) => {
          setTimeout(() => resolve(client(originalRequest)), delay);
        });
      }

      // Extract user-friendly error message
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Ocurrió un error inesperado';

      return Promise.reject(new Error(message));
    }
  );

  return client;
}

// ============================================================================
// PRESET CLIENTS
// ============================================================================

// Auto/Moto API Client (usa x-api-key)
export const autoApiClient = createApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL 
    ? `${import.meta.env.VITE_API_BASE_URL}/api` 
    : '/api',
  tokenKey: 'auth_token',
  apiKeyHeader: 'x-api-key',
  apiKey: import.meta.env.VITE_API_KEY,
});

// Hogar API Client (usa client secret)
export const hogarApiClient = createApiClient({
  baseURL: `${import.meta.env.VITE_HOGAR_API_URL || 'http://localhost:3000'}/api`,
  tokenKey: 'hogar_auth_token',
  clientSecret: import.meta.env.VITE_HOGAR_API_CLIENT_SECRET,
  clientSecretHeader: 'x-client-secret',
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Helper para hacer requests con retry automático
 */
export async function fetchWithRetry<T>(
  client: AxiosInstance,
  config: AxiosRequestConfig,
  maxRetries = 3
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await client.request<T>(config);
      return response.data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on client errors (4xx except 429)
      if (axios.isAxiosError(error) && error.response?.status && error.response.status >= 400 && error.response.status < 500 && error.response.status !== 429) {
        throw lastError;
      }
    }
  }

  throw lastError!;
}

/**
 * Helper para hacer requests paralelos con manejo de errores individual
 */
export async function parallelRequests<T>(
  requests: Array<() => Promise<T>>,
  onError?: (error: Error, index: number) => void
): Promise<{ results: (T | null)[]; errors: (Error | null)[] }> {
  const results: (T | null)[] = new Array(requests.length).fill(null);
  const errors: (Error | null)[] = new Array(requests.length).fill(null);

  await Promise.allSettled(
    requests.map((request, index) =>
      request().then(
        (data) => {
          results[index] = data;
          return data;
        },
        (error) => {
          const err = error instanceof Error ? error : new Error(String(error));
          errors[index] = err;
          onError?.(err, index);
          return null;
        }
      )
    )
  );

  return { results, errors };
}