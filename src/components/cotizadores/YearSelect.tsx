import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface YearSelectProps {
  value: string;
  onChange: (year: string) => void;
  hasError?: boolean;
}

export const YearSelect: React.FC<YearSelectProps> = ({ value, onChange, hasError }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [years, setYears] = useState<number[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const availableYears = Array.from({ length: 30 }, (_, i) => currentYear - i);
    setYears(availableYears);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (year: number) => {
    onChange(year.toString());
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-[56px] bg-bg-secondary border ${hasError ? 'border-red-500' : 'border-border-primary'} rounded-2xl px-5 flex items-center justify-between group yuju-input-blue transition-all`}
      >
        <span className={`${value ? 'text-text-primary font-bold' : 'text-text-secondary opacity-50'} text-base uppercase font-bold tracking-tight`}>
          {value || "Seleccioná el año"}
        </span>
        <ChevronDown className={`text-text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} size={16} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-bg-primary border border-border-primary rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-3xl">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-5 max-h-[300px] overflow-y-auto custom-scrollbar">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => handleSelect(year)}
                className={`py-2 rounded-lg transition-all font-bold text-xs ${
                  value === year.toString() 
                  ? 'bg-yuju-blue text-white' 
                  : 'bg-bg-secondary hover:bg-yuju-blue hover:text-white text-text-primary'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
