import { useState, useCallback } from 'react';
import { apiClient } from '../services/apiClient';
import postalCodesFull from '../components/cotizadores/data/postal-codes-full.json';

export interface Localidad {
  postalCode: string;
  place: string;
  admin1: string;
  cityCode?: string;
  source: 'CABA' | 'PARSE' | 'SANCOR' | 'LOCAL';
  isSancor?: boolean;
}

export function useLocalidades() {
  const [loading, setLoading] = useState(false);

  const buscarSancor = async (codigoPostal: string): Promise<Localidad[]> => {
    try {
      const res = await apiClient.get(`/localidades/${codigoPostal}`);
      if (res.data && res.data.ok && Array.isArray(res.data.localidades)) {
        return res.data.localidades.map((loc: any) => ({
          postalCode: loc.cp || codigoPostal,
          place: loc.localidad,
          admin1: loc.provincia,
          source: 'SANCOR',
          isSancor: true
        }));
      }
    } catch (error) {
      console.error('Error fetching from Sancor:', error);
    }
    return [];
  };

  const buscarFull = useCallback(async (codigoPostal: string): Promise<Localidad[]> => {
    if (!codigoPostal) return [];

    setLoading(true);
    try {
      // 1. Search in static local data (Instant)
      // Filter the pre-loaded 20k+ records
      const localMatches = (postalCodesFull as Localidad[]).filter(item => 
        item.postalCode.startsWith(codigoPostal)
      );

      // 2. If 4 digits, try Sancor additionally for official validation
      if (codigoPostal.length === 4) {
        const sancorMatches = await buscarSancor(codigoPostal);
        
        // Combine: Sancor results first
        const combined = [...sancorMatches, ...localMatches];
        
        // Final unique filter
        const unique = combined.reduce((acc: Localidad[], current) => {
          const key = `${current.postalCode}-${current.place}-${current.admin1}`;
          if (!acc.some(item => `${item.postalCode}-${item.place}-${item.admin1}` === key)) {
            acc.push(current);
          }
          return acc;
        }, []);
        
        return unique;
      }

      return localMatches;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, buscarFull };
}
