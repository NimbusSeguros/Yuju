import axios from 'axios';
<<<<<<< HEAD
import { initAuth } from './auth';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api'; // Si no hay base URL, usa /api (será proxiado por Nginx)

// 1. Create Axios instance with credentials (para enviar cookies)
=======

const API_URL = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'https://api-yuju.com.ar/api';
const API_KEY = import.meta.env.VITE_API_KEY;

// 1. Create Axios instance
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)
export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
<<<<<<< HEAD
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
=======
    }
});

let token: string | null = localStorage.getItem('auth_token');

// 2. Function to get backend token
export const getAccessToken = async () => {
    if (token) return token;
    return await fetchToken();
};

const fetchToken = async () => {
    try {
        const response = await axios.post(`${API_URL}/auth/token`, {}, {
            headers: {
                'x-api-key': API_KEY 
            }
        });
        token = response.data.token;
        if (token) {
            localStorage.setItem('auth_token', token);
        }
        return token;
    } catch (error) {
        console.error('Error fetching token:', error);
        throw error;
    }
};

// 3. Request Interceptor: Inject Token
apiClient.interceptors.request.use(async (config) => {
    if (!token && !config.url?.includes('/auth/token')) {
        await fetchToken();
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// 4. Response Interceptor: Handle 401/403/429
apiClient.interceptors.response.use((response) => {
    return response;
}, async (error) => {
    const originalRequest = error.config;

    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
            await fetchToken();
            if (token) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
        } catch (authError) {
            console.error('Token renewal failed');
        }
    }

    if (error.response?.status === 429 && !originalRequest._retry429) {
        originalRequest._retry429 = true;
        const retryAfter = error.response.headers['retry-after'];
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : 1000;

        return new Promise(resolve => {
            setTimeout(() => resolve(apiClient(originalRequest)), delay);
        });
    }

    return Promise.reject(error);
});
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)
