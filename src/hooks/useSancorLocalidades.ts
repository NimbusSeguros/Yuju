import { useState, useCallback } from 'react';
import { apiClient } from "../services/apiClient";

export interface SancorLocalidad {
  codigo: string;
  descripcion: string;
  codigoPostal: string;
  provincia: string;
}

export function useSancorLocalidades() {
    const [localidades, setLocalidades] = useState<SancorLocalidad[]>([]);
    const [loading, setLoading] = useState(false);

    const buscarLocalidades = useCallback(async (codigoPostal: string) => {
        if (!codigoPostal || codigoPostal.length < 4) return;

        setLoading(true);
        try {
            const res = await apiClient.get(`/sancor/localidades/${codigoPostal}`);
            const data = res.data;
            if (data.ok && Array.isArray(data.localidades)) {
                setLocalidades(data.localidades);
                return data.localidades;
            } else {
                setLocalidades([]);
            }
        } catch (error) {
            setLocalidades([]);
        } finally {
            setLoading(false);
        }
    }, []);

    return { localidades, loading, buscarLocalidades, setLocalidades };
}
