import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

interface PostalCodeSelectProps {
  value: string;
  localidad: string;
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    } else {
      setMatches([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (match: Match) => {
    const loc = `${match.provincia} - ${match.localidad}`;
    setInputValue(match.cp);
    onChange(match.cp, loc);
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
          <span className="text-xs font-bold text-text-secondary line-clamp-1">{localidad}</span>
        </div>
      )}

      {showDropdown && matches.length > 0 && (
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
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
