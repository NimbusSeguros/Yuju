import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, Loader2 } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

interface Model {
  id: number;
  name: string;
  years: number[];
  codiaByYear: Record<string, any>;
  photo_url?: string;
}

interface ModelSelectProps {
  value: string;
  marcaId: string;
  year: string;
  onChange: (id: string, name: string, extra?: any) => void;
  hasError?: boolean;
}

const cache = new Map<string, Model[]>();

export const ModelSelect: React.FC<ModelSelectProps> = ({ value, marcaId, year, onChange, hasError }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!marcaId || !year) {
      setModels([]);
      return;
    }

    const cacheKey = `${marcaId}|${year}`;
    if (cache.has(cacheKey)) {
      setModels(cache.get(cacheKey) || []);
      return;
    }

    const fetchModels = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get(`/infoauto/modelos/${encodeURIComponent(marcaId)}?price_at=${encodeURIComponent(year)}`);
        if (response.data && Array.isArray(response.data)) {
          const sorted = [...response.data].sort((a, b) => a.name.localeCompare(b.name));
          setModels(sorted);
          cache.set(cacheKey, sorted);
        }
      } catch (error) {
        console.error("Error fetching models", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchModels();
  }, [marcaId, year]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (model: Model) => {
    onChange(model.id.toString(), model.name, { 
      years: model.years, 
      codiaByYear: model.codiaByYear,
      photoUrl: model.photo_url 
    });
    setIsOpen(false);
    setSearchTerm("");
  };

  const filteredModels = models.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedModel = models.find(m => m.id.toString() === value);
  const isDisabled = !marcaId || !year;

  return (
    <div className={`relative w-full ${isDisabled ? 'opacity-50 grayscale pointer-events-none' : ''}`} ref={dropdownRef}>
      <button
        disabled={isDisabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-[56px] bg-bg-secondary border ${hasError ? 'border-red-500' : 'border-border-primary'} rounded-2xl px-5 flex items-center justify-between group yuju-input-blue transition-all`}
      >
        <span className={`${value ? 'text-text-primary font-bold' : 'text-text-secondary opacity-50'} text-base font-bold tracking-tight truncate`}>
          {selectedModel ? selectedModel.name : "Seleccioná el modelo"}
        </span>
        <ChevronDown className={`text-text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} size={16} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-bg-primary border border-border-primary rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-3xl">
          <div className="p-5 border-b border-border-primary bg-bg-secondary/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary opacity-40" size={14} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar modelo..."
                className="w-full h-8 bg-bg-primary border border-border-primary rounded-md pl-8 pr-3 text-[11px] text-text-primary yuju-input-blue transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="max-h-[350px] overflow-y-auto p-3 custom-scrollbar">
            {isLoading ? (
              <div className="p-16 flex flex-col items-center justify-center gap-4 text-text-secondary">
                <Loader2 className="animate-spin text-yuju-blue" size={32} />
                <span className="text-sm font-medium animate-pulse">Cargando modelos...</span>
              </div>
            ) : filteredModels.length === 0 ? (
              <div className="p-16 text-center text-text-secondary opacity-50">
                {searchTerm ? "No se encontraron modelos" : "No hay modelos disponibles"}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-1">
                {filteredModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleSelect(model)}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-yuju-blue hover:text-white transition-all font-medium text-xs leading-tight"
                  >
                    {model.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
