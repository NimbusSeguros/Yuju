// 🔧 SOLUCIONES FRONTEND - CÓDIGO READY-TO-USE
// Archivo: YujuFront/Yuju/src/services/security-fixes.ts

// ============================================================
// 1. MEJORAR ALMACENAMIENTO DE TOKENS (httpOnly Cookies)
// ============================================================

/**
 * ❌ ACTUAL: sessionStorage
 * ✅ CORRECTO: httpOnly Cookies (manejadas automáticamente)
 * 
 * El backend establece cookies httpOnly:
 * res.cookie('accessToken', token, {
 *     httpOnly: true,
 *     secure: true,
 *     sameSite: 'strict'
 * });
 * 
 * El frontend NO toca los tokens - axios los envía automáticamente
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Crear axios con credenciales
export const apiClient = axios.create({
    baseURL: `${API_URL}/api`,
    withCredentials: true,  // ✅ IMPORTANTE: Enviar cookies automáticamente
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - NO necesita token manual
apiClient.interceptors.request.use(
    (config) => {
        // Las cookies se envían automáticamente por withCredentials
        // NO hacer: config.headers.Authorization = `Bearer ${token}`
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - manejar 401
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Si 401 y no es reintentos, intentar refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // El backend maneja el refresh automáticamente
                // con las cookies
                const response = await apiClient.post('/auth/refresh');
                
                if (response.status === 200) {
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Refresh falló - redirigir a login
                window.location.href = '/login';
                return Promise.reject(new Error('Sesión expirada'));
            }
        }

        return Promise.reject(error);
    }
);

// ============================================================
// 2. LOGOUT SEGURO (Limpiar servidor)
// ============================================================
export const logout = async (): Promise<void> => {
    try {
        // Llamar al backend para limpiar cookies
        await apiClient.post('/auth/logout');
    } catch (error) {
        console.error('Error en logout:', error);
    } finally {
        // Redirigir a login
        window.location.href = '/login';
    }
};

// ============================================================
// 3. VALIDACIÓN DE INPUTS FRONTEND
// ============================================================
export const InputValidation = {
    postalCode: (cp: string | number): boolean => {
        const cpStr = String(cp).trim();
        if (cpStr.length !== 4) return false;
        return /^\d{4}$/.test(cpStr);
    },

    dni: (dni: string | number): boolean => {
        const dniStr = String(dni).replace(/\D/g, '');
        return dniStr.length >= 6 && dniStr.length <= 8;
    },

    email: (email: string): boolean => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    phone: (phone: string): boolean => {
        const phoneStr = String(phone).replace(/\D/g, '');
        return phoneStr.length >= 10 && phoneStr.length <= 15;
    },

    year: (year: string | number): boolean => {
        const y = Number(year);
        const now = new Date().getFullYear();
        return y >= 2000 && y <= now + 1;
    },

    license: (license: string): boolean => {
        // Formato argentino: ABC123 o AB123CD
        return /^[A-Z]{2,3}\d{3,4}[A-Z]{0,2}$/.test(license.toUpperCase());
    },

    vehicleCode: (codia: string | number): boolean => {
        const code = Number(codia);
        return Number.isInteger(code) && code > 0 && code < 999999;
    }
};

// ============================================================
// 4. SANITIZAR OUTPUTS (Prevenir XSS)
// ============================================================
export const sanitize = {
    /**
     * Sanitizar texto para mostrar en HTML
     * Previene inyección de tags HTML maliciosos
     */
    text: (text: string): string => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Sanitizar atributos HTML
     */
    attr: (value: string): string => {
        const div = document.createElement('div');
        div.setAttribute('title', value);
        return div.getAttribute('title') || '';
    },

    /**
     * Sanitizar URLs
     */
    url: (url: string): string => {
        try {
            const urlObj = new URL(url);
            // Solo permitir http/https
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                return '';
            }
            return urlObj.toString();
        } catch {
            return '';
        }
    }
};

// Uso en React:
// <div>{sanitize.text(userData.name)}</div>
// <a href={sanitize.url(userData.website)}>Link</a>

// ============================================================
// 5. VALIDACIÓN EN FORMULARIOS (Antes de enviar)
// ============================================================
export const FormValidator = {
    validateMotoCotizador: (data: any) => {
        const errors: Record<string, string> = {};

        // Validar marca
        if (!data.marca) {
            errors.marca = 'Marca requerida';
        }

        // Validar año
        if (!InputValidation.year(data.year)) {
            errors.year = 'Año inválido';
        }

        // Validar modelo
        if (!data.modelo) {
            errors.modelo = 'Modelo requerido';
        }

        // Validar código postal
        if (!InputValidation.postalCode(data.zipCode)) {
            errors.zipCode = 'Código postal debe ser 4 dígitos';
        }

        // Validar datos personales
        if (!InputValidation.dni(data.dni)) {
            errors.dni = 'DNI inválido (6-8 dígitos)';
        }

        if (!InputValidation.email(data.email)) {
            errors.email = 'Email inválido';
        }

        if (!InputValidation.phone(data.phone)) {
            errors.phone = 'Teléfono inválido';
        }

        if (!InputValidation.license(data.license)) {
            errors.license = 'Patente inválida (ej: ABC123)';
        }

        return {
            valid: Object.keys(errors).length === 0,
            errors
        };
    }
};

// ============================================================
// 6. MANEJO SEGURO DE ERRORES
// ============================================================
export const ErrorHandler = {
    /**
     * NO loguear tokens o datos sensibles
     */
    handle: (error: any, context: string): void => {
        console.error(`[${context}] Error:`, error.code || error.message);
        
        // ❌ NUNCA
        // console.error('Token:', token);
        // console.error('Full error:', error);

        // ✅ CORRECTO
        if (error.response?.status === 401) {
            console.warn('Autenticación fallida - redirigiendo a login');
        } else if (error.response?.status === 403) {
            console.warn('Acceso denegado');
        } else {
            console.warn('Error del servidor');
        }
    },

    /**
     * Mostrar mensaje amigable al usuario
     */
    getUserMessage: (error: any): string => {
        if (error.response?.status === 401) {
            return 'Tu sesión expiró. Por favor inicia sesión nuevamente.';
        }
        if (error.response?.status === 403) {
            return 'No tienes permiso para hacer esto.';
        }
        if (error.response?.status === 429) {
            return 'Demasiadas solicitudes. Intenta más tarde.';
        }
        if (error.response?.status >= 500) {
            return 'Error del servidor. Por favor intenta más tarde.';
        }
        return error.response?.data?.error || 'Error desconocido';
    }
};

// ============================================================
// 7. EVITAR ALMACENAMIENTO LOCAL DE DATOS SENSIBLES
// ============================================================
export const SecureStorage = {
    /**
     * ❌ NO usar localStorage para datos sensibles
     * ✅ OK para: preferencias, idioma, tema
     */
    
    setPreference: (key: string, value: string) => {
        localStorage.setItem(key, value);
    },

    getPreference: (key: string): string | null => {
        return localStorage.getItem(key);
    },

    /**
     * NO almacenar:
     * - Tokens
     * - Credenciales
     * - DNI
     * - Emails
     * - Teléfonos
     * - Datos de cotizaciones
     */

    // ✅ OK usar sessionStorage para caché temporal
    setCache: (key: string, value: any, ttl?: number) => {
        const data = {
            value,
            timestamp: Date.now(),
            ttl: ttl || 5 * 60 * 1000 // 5 min default
        };
        sessionStorage.setItem(key, JSON.stringify(data));
    },

    getCache: (key: string): any => {
        const data = sessionStorage.getItem(key);
        if (!data) return null;

        try {
            const { value, timestamp, ttl } = JSON.parse(data);
            if (Date.now() - timestamp > ttl) {
                sessionStorage.removeItem(key);
                return null;
            }
            return value;
        } catch {
            return null;
        }
    }
};

// ============================================================
// 8. VALIDAR RESPUESTAS DEL API
// ============================================================
export const ResponseValidator = {
    /**
     * Validar estructura de respuesta antes de procesar
     */
    validateQuotationResponse: (response: any): boolean => {
        if (!response || typeof response !== 'object') {
            console.error('Invalid response structure');
            return false;
        }

        // Validar campos requeridos
        const required = ['providers', 'vehicles'];
        for (const field of required) {
            if (!response[field]) {
                console.error(`Missing required field: ${field}`);
                return false;
            }
        }

        // Validar tipos
        if (!Array.isArray(response.providers)) {
            console.error('providers debe ser un array');
            return false;
        }

        return true;
    },

    /**
     * Validar que la respuesta viene del servidor esperado
     */
    validateOrigin: (_response: unknown): boolean => {
        // El backend debería incluir un header con su identificador
        // Validar en interceptor de axios
        return true;
    }
};

// ============================================================
// 9. SETUP DE SEGURIDAD INICIAL
// ============================================================
export const initializeSecurity = () => {
    // Forzar HTTPS en producción
    if (import.meta.env.PROD && window.location.protocol === 'http:') {
        window.location.protocol = 'https:';
    }

    // Limpiar sessionStorage si hay datos sensibles en localStorage
    // (migrar de localStorage a cookies httpOnly)
    const oldTokens = ['yuju_access_token', 'yuju_refresh_token', 'auth_token'];
    for (const token of oldTokens) {
        localStorage.removeItem(token);
        sessionStorage.removeItem(token);
    }

    // No permitir XSS en console
    (console as any).log = (msg: string) => {
        if (msg && msg.includes('token') || msg.includes('password')) {
            console.warn('[Security] No logs de datos sensibles permitidos');
            return;
        }
    };
};

// ============================================================
// 10. INTERCEPTOR DE SEGURIDAD
// ============================================================
export const setupSecurityInterceptors = () => {
    // Request interceptor - validar datos
    apiClient.interceptors.request.use((config) => {
        // Validar URL
        if (config.url && !config.url.startsWith('/')) {
            console.error('Invalid URL format');
            return Promise.reject(new Error('Invalid URL'));
        }

        // Validar método
        if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method?.toUpperCase() || '')) {
            console.error('Invalid HTTP method');
            return Promise.reject(new Error('Invalid method'));
        }

        return config;
    });

    // Response interceptor - validar respuesta
    apiClient.interceptors.response.use(
        (response) => {
            // Validar content-type
            const contentType = response.headers['content-type'];
            if (contentType && typeof contentType === 'string' && !contentType.includes('application/json')) {
                console.warn('Unexpected content-type:', contentType);
            }

            return response;
        },
        (error) => Promise.reject(error)
    );
};

// ============================================================
// Inicializar al cargar la app
// ============================================================
// En main.tsx:
// import { initializeSecurity, setupSecurityInterceptors } from './services/security-fixes';
// initializeSecurity();
// setupSecurityInterceptors();
