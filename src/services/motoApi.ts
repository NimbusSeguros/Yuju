import axios from 'axios';

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
    } catch (error) {
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
        const response = await api.get(`polizas/${ramo}/${poliza}/${endoso}/pdf`, {
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
    const response = await axios.post('/api/integrity/cotizar', {
        codia,
        brandId,
        anio,
        codigoPostal,
        localidad,
        sumaAsegurada
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
}) => {
    const response = await axios.post('/api/leads', payload);
    return response.data;
};

// --- San Cristobal Seguros ---
export const cotizarSanCristobal = async ({ codia, anio, localidad, sumaAsegurada }: any) => {
    const response = await axios.post('/api/sancristobal/cotizar', {
        codia,
        anio,
        localidad,
        sumaAsegurada
    });
    return response.data;
};

export default api;
