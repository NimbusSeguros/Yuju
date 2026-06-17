import axios from 'axios';
import { initAuth } from './auth';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api'; // Si no hay base URL, usa /api (será proxiado por Nginx)

// 1. Create Axios instance with credentials (para enviar cookies)
export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// 2. Response Interceptor: Handle 401 (token expirado/inválido)
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Si得到 401, intentar obtener nuevo token y reintentar
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Obtener nuevo token (backend setea nueva cookie)
                await initAuth();
                // Reintentar el request original
                return apiClient(originalRequest);
            } catch (authError) {
                // Auth falló → redirigir a login
                window.location.href = '/login';
                return Promise.reject(new Error('Sesión expirada'));
            }
        }

        // Rate limit handling
        if (error.response?.status === 429 && !originalRequest._retry429) {
            originalRequest._retry429 = true;
            const retryAfter = error.response.headers['retry-after'];
            const delay = retryAfter ? parseInt(retryAfter) * 1000 : 1000;

            return new Promise(resolve => {
                setTimeout(() => resolve(apiClient(originalRequest)), delay);
            });
        }

        return Promise.reject(error);
    }
);

// Re-export para compatibilidad (deprecated)
export const getAccessToken = () => null;
export const clearSession = () => console.warn('clearSession deprecated');
export const isSessionExpired = () => true;
