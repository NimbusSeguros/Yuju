import axios from 'axios';
<<<<<<< HEAD
import { initAuth } from './auth';

// API instances configured to use the production URL or proxy
// IMPORTANTE: withCredentials: true para enviar cookies httpOnly automáticamente
// Si no se define VITE_MOTO_API_URL, usa el mismo origen (Vite proxy redirige /api → localhost:3000)
const MOTO_API_BASE = import.meta.env.VITE_MOTO_API_URL || '';

const api = axios.create({
    baseURL: `${MOTO_API_BASE}/api/rus/`,
    withCredentials: true
});

const infoautoApi = axios.create({
    baseURL: `${MOTO_API_BASE}/api/infoauto/`,
    withCredentials: true
});

const atmApi = axios.create({
    baseURL: `${MOTO_API_BASE}/api/atm/`,
    withCredentials: true
});

const sancristobalApi = axios.create({
    baseURL: `${MOTO_API_BASE}/api/sancristobal/`,
    withCredentials: true
});

const integrityApi = axios.create({
    baseURL: `${MOTO_API_BASE}/api/integrity/`,
    withCredentials: true
});

const localidadesApi = axios.create({
    baseURL: `${MOTO_API_BASE}/api/localidades/`,
    withCredentials: true
});

const leadsApi = axios.create({
    baseURL: `${MOTO_API_BASE}/api/leads`,
    withCredentials: true
});

// Helper to add 401 handler (reintentar con nuevo token)
const add401Interceptor = (instance: any) => {
    instance.interceptors.response.use(
        (response: any) => response,
        async (error: any) => {
            const originalRequest = error.config;

            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    // Obtener nuevo token (backend seteá nueva cookie)
                    await initAuth();
                    // Reintentar el request original - la cookie se envía automáticamente
                    return instance(originalRequest);
                } catch (authError) {
                    return Promise.reject(authError);
                }
            }
            return Promise.reject(error);
        }
    );
};

// Apply 401 handler to all instances
add401Interceptor(api);
add401Interceptor(infoautoApi);
add401Interceptor(atmApi);
add401Interceptor(sancristobalApi);
add401Interceptor(integrityApi);
add401Interceptor(localidadesApi);
add401Interceptor(leadsApi);

// Global Error Interceptor for api (409 handling)
=======

// API instances configured to use the proxy defined in vite.config.ts

const api = axios.create({
    baseURL: '/api/rus/',
});

const infoautoApi = axios.create({
    baseURL: '/api/infoauto/',
});

const atmApi = axios.create({
    baseURL: '/api/atm/',
});

// Global Error Interceptor
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 409) {
            return Promise.reject(error);
        }

        const customMessage = error.response?.data?.error || error.response?.data?.message || 'Ocurrió un error inesperado al contactar con el servidor.';
        return Promise.reject(new Error(customMessage));
    }
);

export const getBrands = async () => {
    try {
        const response = await api.get('vehiculos/marcas', {
            params: { TipoUnidad: 8 }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching brands:", error);
        throw error;
    }
};

export const getModels = async (brandId: string | number, year: string | number) => {
    try {
        const response = await api.get('vehiculos/gruposModelo', {
            params: { Marca: brandId, 'Año': year }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching models:", error);
        throw error;
    }
};

export const getVersions = async (modelGroupId: string | number, year: string | number) => {
    try {
        const response = await api.get('vehiculos/modelos', {
            params: { IdGrupoModelo: modelGroupId, 'Año': year }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching versions:", error);
        throw error;
    }
};

export const getLocalities = async (zipCode: string | number) => {
    try {
        const response = await api.get(`localidades/${zipCode}`);
        return response.data;
<<<<<<< HEAD
    } catch (error: any) {
        // RUS returns 409 when its internal SIS system is down - fallback to local endpoint
        if (error?.response?.status === 409 || error?.response?.data?.error?.httpStatusCode === 'CONFLICT') {
            console.warn('RUS localidades unavailable (SIS down), falling back to local endpoint...');
            const fallback = await localidadesApi.get(`${zipCode}`);
            return fallback.data;
        }
=======
    } catch (error) {
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)
        console.error("Error fetching localities:", error);
        throw error;
    }
};

export const getVigencias = async (ramo = 20) => {
    try {
        const response = await api.get(`ramos/${ramo}/vigencias`);
        return response.data;
    } catch (error) {
        console.error("Error fetching vigencias:", error);
        throw error;
    }
};

export const cotizar = async (quoteData: any) => {
    try {
        const response = await api.put('cotizaciones/motos', quoteData);
        return response.data;
    } catch (error) {
        console.error("Error fetching quotation:", error);
        throw error;
    }
};

export const createPropuesta = async (proposalData: any) => {
    try {
        const response = await api.post('propuesta', proposalData);
        return response.data;
    } catch (error) {
        console.error("Error creating proposal:", error);
        throw error;
    }
};

export const getPropuestaStatus = async (proposalNumber: string | number) => {
    try {
        const response = await api.get(`propuestas`, {
            params: { id: proposalNumber }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching proposal status:", error);
        throw error;
    }
};

export const getPolizaPdf = async (ramo: string | number, poliza: string | number, endoso: string | number) => {
    try {
<<<<<<< HEAD
        const response = await api.post('descargar-poliza', {
            ramo,
            poliza,
            endoso
        }, {
=======
        const response = await api.get(`polizas/${ramo}/${poliza}/${endoso}/pdf`, {
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)
            responseType: 'blob'
        });
        return response.data;
    } catch (error) {
        console.error("Error downloading PDF:", error);
        throw error;
    }
};

// --- InfoAuto Catalog ---

export const getInfoautoBrands = async () => {
    const response = await infoautoApi.get('brands');
    return response.data;
};

export const getInfoautoAllBrands = async () => {
    const response = await infoautoApi.get('brands/all');
    return response.data;
};

export const getInfoautoGroups = async (brandId: string | number) => {
    const response = await infoautoApi.get(`brands/${brandId}/groups`);
    return response.data;
};

export const getInfoautoModels = async (brandId: string | number, groupId: string | number) => {
    const response = await infoautoApi.get(`brands/${brandId}/groups/${groupId}/models`);
    return response.data;
};

export const getInfoautoAllModels = async (brandId: string | number) => {
    const response = await infoautoApi.get(`brands/${brandId}/models`);
    return response.data;
};

// --- ATM Seguros ---

export const cotizarATM = async ({ codia, anio, codpostal }: any) => {
    const response = await atmApi.post('cotizar', { codia, anio, codpostal });
    return response.data;
};

export const generarPropuestaATM = async (payload: any) => {
    const response = await atmApi.post('propuesta', payload);
    return response.data;
};

export const descargarPolizaATM = async ({ npoliza, reporte = 'POL', seccion = 4 }: any) => {
    const response = await atmApi.post('reporte', { npoliza, reporte, seccion });
    return response.data;
};

// --- Integrity Seguros ---
export const cotizarIntegrity = async ({ codia, brandId, anio, codigoPostal, localidad, sumaAsegurada }: any) => {
<<<<<<< HEAD
    const response = await integrityApi.post('cotizar', {
=======
    const response = await axios.post('/api/integrity/cotizar', {
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)
        codia,
        brandId,
        anio,
        codigoPostal,
        localidad,
        sumaAsegurada
    });
    return response.data;
};

<<<<<<< HEAD
// --- San Cristobal Seguros ---
export const cotizarSanCristobal = async ({ codia, anio, localidad, numeroDocumento, sexo, es0Km, sumaAsegurada }: any) => {
    const response = await sancristobalApi.post(`cotizaciones/motos`, {
        codia,
        anio,
        localidad,
        numeroDocumento,
        sexo,
        es0Km,
        sumaAsegurada
    });
    return response.data;
};

export const getMotoValueSanCristobal = async (codigoInfomoto: string | number, anio: string | number) => {
    const response = await sancristobalApi.get(`moto-value`, {
        params: { codigoInfomoto, anio }
    });
    return response.data;
};

// --- Leads / Supabase ---
export const createLead = async (payload: {
    vehicleInfo: any;
    provider: string;
    planName: string;
    precio: number;
    sumaAsegurada?: number;
    phone: string;
    zipCode: string;
    wspText: string;
    isMoto?: boolean;
}) => {
    const body = {
        leadData: {
            nombre: "Cliente Moto",
            telefono: payload.phone,
            plan: payload.planName,
            provider: payload.provider,
            precio: payload.precio,
            localidad: payload.zipCode
        },
        vehicleInfo: {
            brand: payload.vehicleInfo?.brand,
            model: payload.vehicleInfo?.model,
            version: payload.vehicleInfo?.version,
            year: Number(payload.vehicleInfo?.year)
        }
    };
    
    // Use leadsApi with withCredentials: true (cookie will be sent automatically)
    const response = await leadsApi.post('/', body);
    return response.data;
};

=======
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)
export default api;
