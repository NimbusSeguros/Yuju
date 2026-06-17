/**
 * Auth Service - Maneja login, logout y sesiones usando httpOnly cookies
 * 
 * IMPORTANTE: Los tokens se almacenan en httpOnly cookies (seguras contra XSS).
 * No podemos leer las cookies desde JavaScript - el navegador las envía automáticamente.
 * Para verificar si hay sesión, llamamos a /api/auth/me.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ──────────────────────────────────────────
// Configuración de Supabase
// ──────────────────────────────────────────
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not configured. Auth will not work.');
}

// Cliente Supabase (para auth local de Supabase)
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// ──────────────────────────────────────────
// URL del backend CotizadorRus
// Para Moto Cotizador usar VITE_MOTO_API_URL si está definido, si no usa proxy local
// ──────────────────────────────────────────
const API_BASE = import.meta.env.VITE_MOTO_API_URL || '';
const SYSTEM_API_SECRET = import.meta.env.VITE_SYSTEM_API_SECRET || '';

// ──────────────────────────────────────────
// HMAC Signature helper (usa Web Crypto API)
// ──────────────────────────────────────────
async function generateHmacSignature(timestamp: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(SYSTEM_API_SECRET);
    const messageData = encoder.encode(`${timestamp}:${SYSTEM_API_SECRET}`);

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// ──────────────────────────────────────────
// System Token - Auto-login para vendedores
// ──────────────────────────────────────────

/**
 * Obtiene un JWT de sistema desde nuestro backend.
 * El backend hace login a Supabase y setea una httpOnly cookie.
 * NO guarda nada en localStorage - el navegador maneja la cookie automáticamente.
 */
export const getSystemToken = async (): Promise<void> => {
    const timestamp = Date.now().toString();
    const signature = await generateHmacSignature(timestamp);

    const response = await fetch(`${API_BASE}/api/auth/system-token`, {
        method: 'GET',
        headers: {
            'X-System-Timestamp': timestamp,
            'X-System-Signature': signature
        },
        credentials: 'include'  // Importante: para enviar/recibir cookies
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(error.error || 'Error al obtener token de sistema');
    }

    // La cookie httpOnly ya fue seteada por el backend
    // No necesitamos guardar nada aquí
};

/**
 * Verifica si hay una sesión activa llamando a /api/auth/me.
 * No podemos leer la cookie httpOnly directamente desde JS.
 */
export const isAuthenticated = async (): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
            method: 'GET',
            credentials: 'include'  // Envía la cookie automáticamente
        });
        return response.ok;
    } catch {
        return false;
    }
};

/**
 * Init auth - obtiene token de sistema si no hay sesión activa.
 */
export const initAuth = async (): Promise<void> => {
    const authenticated = await isAuthenticated();
    if (authenticated) {
        return; // Ya hay sesión válida
    }

    // Obtener nuevo token de sistema (backend seteá la cookie)
    await getSystemToken();
};

// ──────────────────────────────────────────
// Auth functions (para login manual de usuarios)
// ──────────────────────────────────────────

export interface AuthUser {
    id: string;
    email: string;
    role: string;
}

/**
 * Login con email y contraseña (Supabase Auth)
 */
export const login = async (email: string, password: string): Promise<{ user: AuthUser }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('User not found');

    return {
        user: {
            id: data.user.id,
            email: data.user.email || email,
            role: (data.user as any).role || 'authenticated'
        }
    };
};

/**
 * Registro de nuevo usuario
 */
export const register = async (email: string, password: string): Promise<{ user: AuthUser } | { needsEmailConfirmation: boolean }> => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password
    });

    if (error) throw new Error(error.message);

    if (!data.session) {
        return { needsEmailConfirmation: true };
    }
    if (!data.user) throw new Error('User not found');

    return {
        user: {
            id: data.user.id,
            email: data.user.email || email,
            role: (data.user as any).role || 'authenticated'
        }
    };
};

/**
 * Logout - cierra sesión en Supabase
 */
export const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
};

/**
 * Obtener el usuario actual
 */
export const getCurrentUser = async (): Promise<AuthUser | null> => {
    try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) return null;

        const data = await response.json();
        return {
            id: data.id,
            email: data.email,
            role: data.role || 'authenticated'
        };
    } catch {
        return null;
    }
};

// ──────────────────────────────────────────
// Deprecated functions - ya no se usan
// Mantenidas por compatibilidad pero no hacen nada
// ──────────────────────────────────────────