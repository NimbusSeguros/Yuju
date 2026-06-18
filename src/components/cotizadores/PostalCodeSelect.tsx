import React, { useState, useEffect, useRef } from 'react';
<<<<<<< HEAD
import { MapPin, CheckCircle2, Search } from 'lucide-react';
import { useLocalidades } from '../../hooks/useLocalidades';
import type { Localidad } from '../../types';
=======
import { MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)

interface PostalCodeSelectProps {
  value: string;
  localidad: string;
<<<<<<< HEAD
  onChange: (cp: string, localidad: string, cityCode?: string) => void;
  hasError?: boolean;
}

export const PostalCodeSelect: React.FC<PostalCodeSelectProps> = ({ value, localidad, onChange, hasError }) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [matches, setMatches] = useState<Localidad[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { loading: isLoading, buscarFull } = useLocalidades();
=======
  onChange: (cp: string, localidad: string) => void;
  hasError?: boolean;
}

interface Match {
  cp: string;
  localidad: string;
  provincia: string;
  source: string;
}

export const PostalCodeSelect: React.FC<PostalCodeSelectProps> = ({ value, localidad, onChange, hasError }) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

<<<<<<< HEAD
  // Update input when value prop changes
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);


  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").substring(0, 4);
    setInputValue(val);

    if (val.length > 0) {
      setShowDropdown(true);
      const results = await buscarFull(val);
      setMatches(results);
=======
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").substring(0, 4);
    setInputValue(val);
    
    if (val.length >= 3) {
      setIsLoading(true);
      setShowDropdown(true);
      try {
        // Unified Backend Proxy (Prioritizes RUS)
        const response = await apiClient.get(`/localidades/${val}`);
        if (response.data && response.data.ok && Array.isArray(response.data.localidades)) {
          setMatches(response.data.localidades);
        } else {
          setMatches([]);
        }
      } catch (error) {
        console.error("Error fetching localities from backend:", error);
        setMatches([]);
      } finally {
        setIsLoading(false);
      }
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)
    } else {
      setMatches([]);
      setShowDropdown(false);
    }
  };

<<<<<<< HEAD
  const handleSelect = (match: Localidad) => {
    const loc = `${match.admin1} - ${match.place}`;
    setInputValue(match.postalCode);
    onChange(match.postalCode, loc, match.cityCode);
    setShowDropdown(false);
    inputRef.current?.focus();
=======
  const handleSelect = (match: Match) => {
    const loc = `${match.provincia} - ${match.localidad}`;
    setInputValue(match.cp);
    onChange(match.cp, loc);
    setShowDropdown(false);
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className={`relative group`}>
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary opacity-40 transition-colors group-focus-within:text-yuju-blue group-focus-within:opacity-100`}>
<<<<<<< HEAD
          <MapPin size={12} aria-hidden="true" />
        </div>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          placeholder="Ej. 1425 o 3260"
          aria-label="Código postal de Argentina"
          aria-describedby={hasError ? 'postal-code-error' : undefined}
          aria-invalid={hasError}
          aria-autocomplete="list"
          aria-controls="postal-code-listbox"
          aria-expanded={showDropdown && matches.length > 0}
          className={`w-full h-[56px] bg-bg-secondary border ${hasError ? 'border-red-500' : 'border-border-primary'} rounded-2xl pl-10 pr-10 text-base font-bold text-text-primary yuju-input-blue transition-all placeholder:opacity-20`}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue.length > 0 && setShowDropdown(true)}
        />
      </div>

      {hasError && (
        <p id="postal-code-error" className="mt-1 text-xs text-red-500" role="alert">
          Por favor, ingresá un código postal válido (4 dígitos)
        </p>
      )}

      {localidad && !showDropdown && (
        <div
          className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-yuju-blue/5 border border-yuju-blue/10 rounded-lg animate-in fade-in slide-in-from-top-1 duration-300"
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 size={14} className="text-yuju-blue" aria-hidden="true" />
=======
          <MapPin size={12} />
        </div>
        <input
          type="text"
          placeholder="Ej. 1425 o 3260"
          className={`w-full h-[56px] bg-bg-secondary border ${hasError ? 'border-red-500' : 'border-border-primary'} rounded-2xl pl-10 pr-10 text-base font-bold text-text-primary focus:border-yuju-blue focus:outline-none focus:ring-2 focus:ring-yuju-blue/20 outline-none transition-all placeholder:opacity-20`}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue.length >= 3 && setShowDropdown(true)}
        />
        {isLoading && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2">
            <Loader2 className="animate-spin text-yuju-blue" size={18} />
          </div>
        )}
      </div>

      {localidad && !showDropdown && (
        <div className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-yuju-blue/5 border border-yuju-blue/10 rounded-lg animate-in fade-in slide-in-from-top-1 duration-300">
          <CheckCircle2 size={14} className="text-yuju-blue" />
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)
          <span className="text-xs font-bold text-text-secondary line-clamp-1">{localidad}</span>
        </div>
      )}

      {showDropdown && matches.length > 0 && (
<<<<<<< HEAD
        <div
          id="postal-code-listbox"
          className="absolute top-full left-0 right-0 mt-2 bg-bg-primary border border-border-primary rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-3xl animate-in zoom-in-95 duration-200"
          role="listbox"
          aria-label="Sugerencias de localidades"
        >
          <div className="max-h-[300px] overflow-y-auto p-1.5 custom-scrollbar">
            <div className="px-3 py-2 text-[8px] font-black tracking-[0.2em] text-text-secondary opacity-40 border-b border-border-primary/50 mb-1">
              Seleccioná tu localidad ({inputValue.length < 4 ? 'Sugerencias' : 'Resultados exactos'})
            </div>
            {matches.map((match, idx) => (
              <button
                key={`${match.postalCode}-${match.place}-${idx}`}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(match); }}
                onTouchStart={(e) => { e.preventDefault(); handleSelect(match); }}
                onClick={(e) => { e.preventDefault(); handleSelect(match); }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-yuju-blue hover:text-white transition-all flex items-center justify-between group cursor-pointer"
                role="option"
                aria-selected={inputValue === match.postalCode}
              >
                <div className="flex flex-col pointer-events-none">
                  <span className="text-sm font-black tracking-tight pointer-events-none">{match.postalCode}</span>
                  <span className="text-[9px] font-medium opacity-60 group-hover:opacity-100 pointer-events-none">{match.admin1} - {match.place}</span>
                </div>
=======
        <div className="absolute top-full left-0 right-0 mt-2 bg-bg-primary border border-border-primary rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-3xl animate-in zoom-in-95 duration-200">
          <div className="max-h-[250px] overflow-y-auto p-1.5 custom-scrollbar">
            <div className="px-3 py-2 text-[8px] font-black uppercase tracking-[0.2em] text-text-secondary opacity-40 border-b border-border-primary/50 mb-1">
              Seleccioná tu localidad ({matches[0].source})
            </div>
            {matches.map((match, idx) => (
              <button
                key={`${match.cp}-${match.localidad}-${idx}`}
                onClick={() => handleSelect(match)}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-yuju-blue hover:text-white transition-all flex items-center justify-between group"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-black tracking-tight">{match.cp}</span>
                  <span className="text-[9px] font-medium opacity-60 group-hover:opacity-100">{match.provincia} - {match.localidad}</span>
                </div>
                {match.source === 'rus' && (
                  <span className="text-[7px] font-black uppercase tracking-widest bg-yuju-blue/10 text-yuju-blue px-2 py-1 rounded group-hover:bg-white/20 group-hover:text-white">Oficial RUS</span>
                )}
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)
              </button>
            ))}
          </div>
        </div>
      )}
<<<<<<< HEAD

      {!isLoading && showDropdown && matches.length === 0 && inputValue.length === 4 && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-bg-primary border border-border-primary rounded-xl shadow-2xl z-50 p-6 text-center animate-in zoom-in-95 duration-200"
          role="alert"
          aria-live="assertive"
        >
          <Search className="mx-auto text-text-secondary opacity-20 mb-3" size={24} aria-hidden="true" />
          <p className="text-sm font-bold text-text-secondary">No encontramos esa localidad</p>
          <p className="text-[10px] text-text-secondary opacity-60">Revisá el código postal e intentá de nuevo</p>
        </div>
      )}
=======
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)
    </div>
  );
};
