import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/api`
    : '/api'; // En dev, Vite proxy redirige /api → localhost:3000
const API_KEY = import.meta.env.VITE_API_KEY;

// 1. Create Axios instance
export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// ⚠️ SECURITY: Usar sessionStorage en vez de localStorage para reducir impacto de XSS
let token: string | null = sessionStorage.getItem('auth_token');

// 2. Function to get backend token
export const getAccessToken = async () => {
    if (token) return token;
    return await fetchToken();
};

// Helper: limpia el token cacheado y del sessionStorage
const clearToken = () => {
    token = null;
    sessionStorage.removeItem('auth_token');
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
            // ⚠️ SECURITY: Usar sessionStorage en vez de localStorage
            // sessionStorage se limpia al cerrar el navegador
            // Para mayor seguridad, usar httpOnly cookies del backend
            sessionStorage.setItem('auth_token', token);
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
            // Limpiamos el token viejo (puede ser de producción o expirado)
            clearToken();
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
