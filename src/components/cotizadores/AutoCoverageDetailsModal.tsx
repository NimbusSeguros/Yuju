import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, Shield, Check, Zap, Image as ImageIcon } from 'lucide-react';

// Import coverages data from the new location
import rusCoverages from './data/rus-coverages.json';
import maCoverages from './data/ma-coverages.json';
import scCoverages from './data/sc-coverages.json';
import integCoverages from './data/integ-coverages.json';
import expertaCoverages from './data/experta-coverages.json';
import atmCoverages from './data/atm-coverages.json';
import meridionalCoverages from './data/meridional-coverages.json';
import sancordCoverages from './data/sancord-coverages.json';

const coverageDataMap: Record<string, any> = {
  'RUS': rusCoverages,
  'MERCANTIL ANDINA': maCoverages,
  'SAN CRISTOBAL': scCoverages,
  'SAN CRISTÓBAL': scCoverages,
  'INTEGRITY': integCoverages,
  'EXPERTA': expertaCoverages,
  'ATM': atmCoverages,
  'MERIDIONAL': meridionalCoverages,
  'LA MERIDIONAL': meridionalCoverages,
  'SANCOR': sancordCoverages
};

interface AutoCoverageDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: any;
  vehicleInfo: {
    brand: string;
    model: string;
    version: string;
    year: string;
    codia?: string | number;
    photoUrl?: string;
  };
  price: number;
  isCreditCard?: boolean;
}

export const AutoCoverageDetailsModal: React.FC<AutoCoverageDetailsModalProps> = ({
  isOpen,
  onClose,
  quote,
  vehicleInfo,
  price,
  isCreditCard
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'features'>('details');
  const [imageError, setImageError] = useState(false);

  // Determine insurer key for the map
  const rawInsurer = (quote.aseguradora || quote.source || quote.insurer || '').toUpperCase();
  const insurerKey = Object.keys(coverageDataMap).find(key => rawInsurer.includes(key)) || rawInsurer;
  const coverages = coverageDataMap[insurerKey] || coverageDataMap[rawInsurer] || [];
  
  // Find specific coverage details
  const planName = String(quote.cobertura || quote.plan_name || '').toUpperCase();
  const planCode = String(quote.codigoCasco || quote.plan_code || '').toUpperCase();
  
  // Lookup in Map structure
  let selectedPlan = coverages[planName] || coverages[planCode] || null;

  // Intelligent Fuzzy Matching Fallback
  if (!selectedPlan && Object.keys(coverages).length > 0) {
    const normalizedPlanName = planName.replace(/[^A-Z0-9]/g, '');
    const normalizedPlanCode = planCode.replace(/[^A-Z0-9]/g, '');

    const matchedKey = Object.keys(coverages).find(key => {
      const normKey = key.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (!normKey || !normalizedPlanName) return false;
      
      return (
        normKey === normalizedPlanName || 
        normKey === normalizedPlanCode ||
        (normKey.length >= 2 && normalizedPlanName.startsWith(normKey)) ||
        (normKey.length > 4 && normalizedPlanName.includes(normKey)) ||
        (normalizedPlanName.length > 4 && normKey.includes(normalizedPlanName))
      );
    });

    if (matchedKey) {
      selectedPlan = coverages[matchedKey];
    }
  }

  // Common Abbreviation Fallbacks (e.g., RC -> Responsabilidad Civil)
  if (!selectedPlan) {
    const isRC = planName.includes('RESPONSABILIDAD CIVIL') || planCode === 'RC';
    if (isRC && coverages['RC']) {
      selectedPlan = coverages['RC'];
    }
  }

  // Meridional-specific fallback: plan codes may arrive as "3", "03", "MERIDIONAL_3", etc.
  if (!selectedPlan && insurerKey.includes('MERIDIONAL') && planCode) {
    // Strip any existing MERIDIONAL_ prefix to get the raw numeric part
    const numericCode = planCode.replace(/^MERIDIONAL_?0*/i, '').replace(/^0+/, '') || planCode;
    selectedPlan = coverages[`MERIDIONAL_${numericCode}`]
      || coverages[planCode]
      || null;
  }

  // InfoAuto Image URL
  const imageUrl = vehicleInfo.photoUrl || null;

  // Franchise Formatting Logic
  let displayFranchise = String(quote.franchise || 'Sin franquicia');
  const rawTitle = selectedPlan?.titulo || quote.cobertura || quote.plan_name || quote.codigoCasco || '';
  
  if (displayFranchise !== 'Sin franquicia') {
    // Normalizar comas por puntos para el test numérico
    const normalized = displayFranchise.trim().replace(',', '.');
    const isPureNumber = /^\d+(\.\d+)?$/.test(normalized);

    if (isPureNumber) {
      const num = Number(normalized);
      // Si el número es pequeño (ej: 7.5, 10), asumimos que es un porcentaje de la Suma Asegurada
      if (num < 100 && quote.sumaAsegurada && Number(quote.sumaAsegurada) > 0) {
        const calculatedFranchise = (num / 100) * Number(quote.sumaAsegurada);
        displayFranchise = `${normalized.replace('.', ',')}% ($ ${Math.round(calculatedFranchise).toLocaleString('es-AR')})`;
      } else {
        displayFranchise = `$ ${Math.round(num).toLocaleString('es-AR')}`;
      }
    } else if (displayFranchise.includes('%') && quote.sumaAsegurada && Number(quote.sumaAsegurada) > 0) {
      const percentMatch = displayFranchise.match(/(\d+([,.]\d+)?)%/);
      if (percentMatch) {
        const percentage = Number(percentMatch[1].replace(',', '.'));
        const calculatedFranchise = (percentage / 100) * Number(quote.sumaAsegurada);
        displayFranchise = `${percentMatch[1]}% ($ ${Math.round(calculatedFranchise).toLocaleString('es-AR')})`;
      }
    }
  } else {
    // Intentar extraer de los títulos (común en RUS y otros que no mandan el campo limpio)
    const franchiseMatch = rawTitle.match(/(?:franquicia|sa)\s*(\d+[,.]?\d*%|\$\s*[\d,.]+)/i) || rawTitle.match(/(\d+[,.]?\d*)%\s*SA/i);
    if (franchiseMatch) {
      const match = franchiseMatch[1] || franchiseMatch[0];
      const extracted = match.toUpperCase().includes('SA') ? match.split('%')[0] + '%' : match;
      
      if (extracted.includes('%') && quote.sumaAsegurada && Number(quote.sumaAsegurada) > 0) {
        const percentage = Number(extracted.replace('%', '').replace(',', '.').replace(/[^\d.]/g, ''));
        const calculatedFranchise = (percentage / 100) * Number(quote.sumaAsegurada);
        displayFranchise = `${percentage.toString().replace('.', ',')}% ($ ${Math.round(calculatedFranchise).toLocaleString('es-AR')})`;
      } else if (extracted.includes('$')) {
        displayFranchise = extracted;
      }
    }
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-bg-dark/80 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] flex flex-col"
        >
          <div className="glass-card bg-bg-primary/95 backdrop-blur-3xl rounded-[40px] flex flex-col flex-1 min-h-0 overflow-hidden border-yuju-blue/20 shadow-[0_0_50px_rgba(51,105,255,0.15)]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-yuju-blue/10 flex items-center justify-center text-yuju-blue">
                  <Shield size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black font-accent text-text-primary tracking-tighter">
                    {selectedPlan?.titulo || `Detalles del Plan ${quote.cobertura || quote.plan_name || quote.codigoCasco}`}
                  </h2>
                  <p className="text-xs text-text-secondary font-bold tracking-widest opacity-60">
                    {selectedPlan?.subtitulo || `${quote.aseguradora || quote.source || quote.insurer} • ${vehicleInfo.brand} ${vehicleInfo.year}`}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-text-secondary hover:text-text-primary transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar min-h-0">
              
              {/* Top Section: Photo and Basic Info */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Vehicle Photo from InfoAuto */}
                <div className="lg:col-span-2">
                  <div className="aspect-video rounded-3xl bg-bg-secondary border border-white/5 overflow-hidden relative group">
                    {!imageError && imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={`${vehicleInfo.brand} ${vehicleInfo.model}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3 opacity-30">
                        <ImageIcon size={48} />
                        <span className="text-[10px] font-black tracking-widest">Imagen no disponible</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/60 to-transparent pointer-events-none" />
                  </div>
                </div>

                {/* Price and Action */}
                <div className="lg:col-span-3 flex flex-col justify-center space-y-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black tracking-[0.2em] text-yuju-blue opacity-80">Inversión mensual</span>
                    
                    {(isCreditCard && quote.discountPercent > 0) ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-text-secondary line-through opacity-50">
                            ${Math.round(quote.originalPrice).toLocaleString('es-AR')}
                          </span>
                          <span className="text-[10px] font-black bg-green-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                            -{quote.discountPercent}% OFF
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-black font-accent text-text-primary tracking-tighter">
                            ${Math.round(price).toLocaleString('es-AR')}
                          </span>
                          <span className="text-lg font-bold text-text-secondary opacity-50">/mes</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black font-accent text-text-primary tracking-tighter">
                          ${Math.round(price).toLocaleString('es-AR')}
                        </span>
                        <span className="text-lg font-bold text-text-secondary opacity-50">/mes</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[10px] text-text-secondary font-black tracking-widest mb-1">Franquicia</p>
                      <p className="text-sm font-bold text-text-primary">{displayFranchise}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[10px] text-text-secondary font-black tracking-widest mb-1">Tipo de Uso</p>
                      <p className="text-sm font-bold text-text-primary">Particular</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs for details */}
              <div className="space-y-6">
                <div className="flex gap-2 p-1 bg-bg-secondary rounded-2xl w-fit">
                  <button 
                    onClick={() => setActiveTab('details')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all ${activeTab === 'details' ? 'bg-yuju-blue text-white shadow-lg shadow-yuju-blue/20' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                    Detalles
                  </button>
                  <button 
                    onClick={() => setActiveTab('features')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all ${activeTab === 'features' ? 'bg-yuju-blue text-white shadow-lg shadow-yuju-blue/20' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                    Características
                  </button>
                </div>

                {activeTab === 'details' ? (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {(selectedPlan?.coberturas || selectedPlan?.items) ? (
                      (selectedPlan.coberturas || selectedPlan.items).map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-yuju-blue/30 transition-all group">
                          <div className="w-10 h-10 rounded-xl bg-yuju-blue/10 flex items-center justify-center text-yuju-blue shrink-0 group-hover:scale-110 transition-transform">
                            {item.included !== false ? <Check size={18} /> : <Zap size={18} />}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-text-primary flex items-center gap-2">
                               {item.nombre || item.name}
                               {item.limite && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-yuju-blue/10 text-yuju-blue border border-yuju-blue/20">
                                     {item.limite}
                                  </span>
                               )}
                            </p>
                            <p className="text-xs text-text-secondary leading-relaxed">{item.descripcion || item.description}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-12 flex flex-col items-center justify-center opacity-40 italic">
                        <Info size={32} className="mb-3" />
                        <p>No se encontraron detalles específicos para este plan.</p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                     <div className="p-6 rounded-3xl bg-yuju-blue/5 border border-yuju-blue/10">
                        <h4 className="text-sm font-bold text-yuju-blue mb-4 flex items-center gap-2">
                           <div 
                              className="w-4 h-4 shrink-0" 
                              style={{ 
                                 backgroundColor: '#3369ff',
                                 maskImage: 'url("https://res.cloudinary.com/dewcgbpvp/image/upload/v1735836811/Yuju_Web_nfwvce.svg")',
                                 maskRepeat: 'no-repeat',
                                 maskPosition: 'center',
                                 maskSize: 'contain',
                                 WebkitMaskImage: 'url("https://res.cloudinary.com/dewcgbpvp/image/upload/v1735836811/Yuju_Web_nfwvce.svg")',
                                 WebkitMaskRepeat: 'no-repeat',
                                 WebkitMaskPosition: 'center',
                                 WebkitMaskSize: 'contain',
                              }}
                           /> Beneficios Adicionales
                        </h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                           {['Auxilio mecánico y remolque', 'Cobertura en países limítrofes', 'Descuentos exclusivos Yuju'].map((benefit, i) => (
                              <li key={i} className="flex items-center gap-3 text-xs text-text-secondary font-medium">
                                 <div className="w-1.5 h-1.5 rounded-full bg-yuju-blue" />
                                 {benefit}
                              </li>
                           ))}
                        </ul>
                     </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-6 border-t border-white/10 shrink-0 bg-bg-primary/50">
              <button 
                onClick={onClose}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-700 to-yuju-blue text-white font-black text-sm tracking-[0.2em] shadow-xl shadow-yuju-blue/20 hover:shadow-yuju-blue/40 hover:-translate-y-0.5 transition-all active:translate-y-0"
              >
                Cerrar Detalles
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
