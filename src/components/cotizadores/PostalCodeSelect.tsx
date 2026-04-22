import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, CheckCircle2, Search } from 'lucide-react';
import { useLocalidades } from '../../hooks/useLocalidades';
import type { Localidad } from '../../hooks/useLocalidades';

interface PostalCodeSelectProps {
  value: string;
  localidad: string;
  onChange: (cp: string, localidad: string, cityCode?: string) => void;
  hasError?: boolean;
}

export const PostalCodeSelect: React.FC<PostalCodeSelectProps> = ({ value, localidad, onChange, hasError }) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [matches, setMatches] = useState<Localidad[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { loading: isLoading, initialLoading, status, buscarFull } = useLocalidades();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    } else {
      setMatches([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (match: Localidad) => {
    const loc = `${match.admin1} - ${match.place}`;
    setInputValue(match.postalCode);
    onChange(match.postalCode, loc, match.cityCode);
    setShowDropdown(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className={`relative group`}>
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary opacity-40 transition-colors group-focus-within:text-yuju-blue group-focus-within:opacity-100`}>
          <MapPin size={12} />
        </div>
        <input
          type="text"
          placeholder="Ej. 1425 o 3260"
          className={`w-full h-[56px] bg-bg-secondary border ${hasError ? 'border-red-500' : 'border-border-primary'} rounded-2xl pl-10 pr-10 text-base font-bold text-text-primary yuju-input-blue transition-all placeholder:opacity-20`}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue.length > 0 && setShowDropdown(true)}
        />
      </div>

      {localidad && !showDropdown && (
        <div className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-yuju-blue/5 border border-yuju-blue/10 rounded-lg animate-in fade-in slide-in-from-top-1 duration-300">
          <CheckCircle2 size={14} className="text-yuju-blue" />
          <span className="text-xs font-bold text-text-secondary line-clamp-1">{localidad}</span>
        </div>
      )}

      {showDropdown && matches.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-bg-primary border border-border-primary rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-3xl animate-in zoom-in-95 duration-200">
          <div className="max-h-[300px] overflow-y-auto p-1.5 custom-scrollbar">
            <div className="px-3 py-2 text-[8px] font-black uppercase tracking-[0.2em] text-text-secondary opacity-40 border-b border-border-primary/50 mb-1">
              Seleccioná tu localidad ({inputValue.length < 4 ? 'Sugerencias' : 'Resultados exactos'})
            </div>
            {matches.map((match, idx) => (
              <button
                key={`${match.postalCode}-${match.place}-${idx}`}
                onClick={() => handleSelect(match)}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-yuju-blue hover:text-white transition-all flex items-center justify-between group"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-black tracking-tight">{match.postalCode}</span>
                  <span className="text-[9px] font-medium opacity-60 group-hover:opacity-100 uppercase">{match.admin1} - {match.place}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {!isLoading && showDropdown && matches.length === 0 && inputValue.length === 4 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-bg-primary border border-border-primary rounded-xl shadow-2xl z-50 p-6 text-center animate-in zoom-in-95 duration-200">
          <Search className="mx-auto text-text-secondary opacity-20 mb-3" size={24} />
          <p className="text-sm font-bold text-text-secondary">No encontramos esa localidad</p>
          <p className="text-[10px] text-text-secondary opacity-60">Revisá el código postal e intentá de nuevo</p>
        </div>
      )}
    </div>
  );
};
