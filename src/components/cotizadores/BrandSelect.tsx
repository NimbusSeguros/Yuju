import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, Loader2 } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
<<<<<<< HEAD
import type { VehicleBrand } from '../../types';
=======

interface Brand {
  id: number;
  name: string;
}
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)

interface BrandSelectProps {
  value: string;
  onChange: (id: string, name: string) => void;
  hasError?: boolean;
}

const PRIORITY_BRANDS = [
<<<<<<< HEAD
  "TOYOTA", "VOLKSWAGEN", "FIAT", "RENAULT", "PEUGEOT", "FORD",
  "CHEVROLET", "CITROËN", "CITROEN", "JEEP", "NISSAN",
  "MERCEDES-BENZ", "MERCEDES BENZ", "HYUNDAI", "RAM", "BAIC", "HONDA"
];

const CACHE_KEY = "yuju_cache_marcas";
const CACHE_EXPIRY_KEY = "yuju_cache_marcas_expiry";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const BrandSelect: React.FC<BrandSelectProps> = ({ value, onChange, hasError }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
=======
  "TOYOTA", "VOLKSWAGEN", "FIAT", "RENAULT", "PEUGEOT", "FORD", 
  "CHEVROLET", "CITROËN", "CITROEN", "JEEP", "NISSAN", 
  "MERCEDES-BENZ", "MERCEDES BENZ", "HYUNDAI", "RAM", "BAIC", "HONDA"
];

const CACHE_KEY = "marcas_cache";
const CACHE_EXPIRY_KEY = "marcas_cache_expiry";
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export const BrandSelect: React.FC<BrandSelectProps> = ({ value, onChange, hasError }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(PRIORITY_BRANDS.length);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

<<<<<<< HEAD
  // Sort brands with priority brands first
  const sortBrands = (data: VehicleBrand[]) => {
=======
  const sortBrands = (data: Brand[]) => {
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)
    return [...data].sort((a, b) => {
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();
      const isPriorityA = PRIORITY_BRANDS.includes(nameA);
      const isPriorityB = PRIORITY_BRANDS.includes(nameB);

      if (isPriorityA && isPriorityB) {
        return PRIORITY_BRANDS.indexOf(nameA) - PRIORITY_BRANDS.indexOf(nameB);
      }
      if (isPriorityA) return -1;
      if (isPriorityB) return 1;
      return nameA.localeCompare(nameB);
    });
  };

<<<<<<< HEAD
  // Cache helpers
  const getCachedBrands = () => {
=======
const getCachedBrands = () => {
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cacheExpiry = localStorage.getItem(CACHE_EXPIRY_KEY);
      if (cachedData && cacheExpiry) {
<<<<<<< HEAD
        if (Date.now() < Number.parseInt(cacheExpiry)) {
          return JSON.parse(cachedData) as VehicleBrand[];
        }
      }
    } catch {
      // Silent fail for cache read
    }
    return null;
  };

  const setCachedBrands = (data: VehicleBrand[]) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
    } catch {
      // Silent fail for cache write
    }
  };

  // Fetch brands with caching
=======
        if (new Date().getTime() < Number.parseInt(cacheExpiry)) {
          return JSON.parse(cachedData);
        }
      }
    } catch (e) {}
    return null;
  };

  const setCachedBrands = (data: Brand[]) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_EXPIRY_KEY, (new Date().getTime() + CACHE_DURATION).toString());
    } catch (e) {}
  };

>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)
  useEffect(() => {
    const fetchBrands = async () => {
      const cached = getCachedBrands();
      if (cached) {
        setBrands(cached);
<<<<<<< HEAD
=======
        // We still fetch to update cache in background
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)
      }

      setIsLoading(!cached);
      try {
        const response = await apiClient.get('/infoauto/marcas');
        if (response.data && Array.isArray(response.data)) {
          const sorted = sortBrands(response.data);
          setBrands(sorted);
          setCachedBrands(sorted);
        }
      } catch (error) {
        console.error("Error fetching brands", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBrands();
  }, []);

<<<<<<< HEAD
  // Close dropdown on outside click
=======
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

<<<<<<< HEAD
  // Focus search input when dropdown opens
=======
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

<<<<<<< HEAD
  const handleSelect = (brand: VehicleBrand) => {
=======
  const handleSelect = (brand: Brand) => {
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)
    onChange(brand.id.toString(), brand.name);
    setIsOpen(false);
    setSearchTerm("");
  };

<<<<<<< HEAD
  const filteredBrands = brands.filter(b =>
=======
  const filteredBrands = brands.filter(b => 
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayBrands = searchTerm ? filteredBrands : filteredBrands.slice(0, visibleCount);
  const selectedBrand = brands.find(b => b.id.toString() === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
<<<<<<< HEAD
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Seleccionar marca de vehículo"
        className={`w-full h-[56px] bg-bg-secondary border ${hasError ? 'border-red-500' : 'border-border-primary'} rounded-2xl px-5 flex items-center justify-between group yuju-input-blue transition-all`}
      >
        <span className={`${value ? 'text-text-primary font-bold' : 'text-text-secondary opacity-50'} text-base font-bold tracking-tight`}>
          {selectedBrand ? selectedBrand.name : "Seleccioná la marca"}
=======
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-[56px] bg-bg-secondary border ${hasError ? 'border-red-500' : 'border-border-primary'} rounded-2xl px-5 flex items-center justify-between group hover:border-yuju-blue transition-all outline-none focus:outline-none focus:ring-2 focus:ring-yuju-blue/20`}
      >
        <span className={`${value ? 'text-text-primary font-bold' : 'text-text-secondary opacity-50'} text-base uppercase font-bold tracking-tight`}>
          {selectedBrand ? selectedBrand.name.toUpperCase() : "Seleccioná la marca"}
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)
        </span>
        <ChevronDown className={`text-text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} size={16} />
      </button>

      {isOpen && (
<<<<<<< HEAD
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-bg-primary border border-border-primary rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-3xl"
          role="listbox"
        >
          <div className="p-3 border-b border-border-primary bg-bg-secondary/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary opacity-40" size={14} aria-hidden="true" />
=======
        <div className="absolute top-full left-0 right-0 mt-2 bg-bg-primary border border-border-primary rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-3xl">
          <div className="p-3 border-b border-border-primary bg-bg-secondary/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary opacity-40" size={14} />
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar marca..."
<<<<<<< HEAD
                aria-label="Buscar marca"
                className="w-full h-8 bg-bg-primary border border-border-primary rounded-md pl-8 pr-3 text-[11px] text-text-primary yuju-input-blue transition-all"
=======
                className="w-full h-8 bg-bg-primary border border-border-primary rounded-md pl-8 pr-3 text-[11px] text-text-primary outline-none focus:border-yuju-blue transition-all"
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="max-h-[350px] overflow-y-auto p-3 custom-scrollbar">
            {isLoading ? (
              <div className="p-16 flex flex-col items-center justify-center gap-4 text-text-secondary">
<<<<<<< HEAD
                <Loader2 className="animate-spin text-yuju-blue" size={32} aria-hidden="true" />
=======
                <Loader2 className="animate-spin text-yuju-blue" size={32} />
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)
                <span className="text-sm font-medium animate-pulse">Cargando marcas...</span>
              </div>
            ) : displayBrands.length === 0 ? (
              <div className="p-16 text-center text-text-secondary opacity-50">
                No se encontraron resultados
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-1">
                {displayBrands.map((brand) => (
                  <button
                    key={brand.id}
<<<<<<< HEAD
                    type="button"
                    onClick={() => handleSelect(brand)}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-yuju-blue hover:text-white transition-all font-medium flex items-center justify-between group text-sm"
                    role="option"
                    aria-selected={value === brand.id.toString()}
                  >
                    <span>{brand.name}</span>
                    {PRIORITY_BRANDS.includes(brand.name.toUpperCase()) && (
                      <span className="text-[8px] font-black tracking-widest opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 px-2 py-1 rounded-md">Popular</span>
=======
                    onClick={() => handleSelect(brand)}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-yuju-blue hover:text-white transition-all font-medium flex items-center justify-between group text-sm"
                  >
                    <span>{brand.name}</span>
                    {PRIORITY_BRANDS.includes(brand.name.toUpperCase()) && (
                      <span className="text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 px-2 py-1 rounded-md">Popular</span>
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)
                    )}
                  </button>
                ))}
                {!searchTerm && visibleCount < brands.length && (
                  <button
<<<<<<< HEAD
                    type="button"
=======
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)
                    onClick={(e) => { e.stopPropagation(); setVisibleCount(v => v + 50); }}
                    className="w-full p-4 text-yuju-blue font-bold text-sm hover:underline"
                  >
                    Ver más marcas
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
