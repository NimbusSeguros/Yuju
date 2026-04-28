import React, { useState } from 'react';
import { Button } from './ui/Button';
import { getInsurerLogo } from '../utils/insurerLogos';
import { CoverageDetailsModal } from './cotizadores/CoverageDetailsModal';

// Utility helper
const toArray = (v: any) => (Array.isArray(v) ? v : v ? [v] : []);

interface MotoResultsGridProps {
    results: any;
    payWithCard: boolean;
    setPayWithCard: (val: boolean) => void;
    onContract: (quote: any, source: string, isEmissionFlow: boolean) => void;
    vehicleInfo?: any;
    zipCode?: string;
}

const EMISSION_PLANS = ['RCM C/GRUA', 'RCM', 'RESPONSABILIDAD CIVIL SIN ASISTENCIA', 'RESPONSABILIDAD CIVIL'];


export const MotoResultsGrid: React.FC<MotoResultsGridProps> = ({ results, payWithCard, setPayWithCard, onContract }) => {
    const [infoModalConfig, setInfoModalConfig] = useState<{ quote: any, company: string } | null>(null);

    // 1. Process RUS
    const rusQuotes = results?.rus?.dtoList || results?.dtoList || [];
    const rusError = results?.rusError;

    // 2. Process ATM
    const atmData = results?.atm?.data ?? results?.atm;
    const atmRaw = atmData?.auto ?? atmData?.AUTOS_Cotizar_PHPResult?.auto ?? atmData;
    let atmCoberturas: any[] = [];
    const atmSuccess = atmRaw?.statusSuccess === 'TRUE';
    if (atmSuccess) {
        const cobList = toArray(atmRaw?.cotizacion?.cobertura);
        const grouped: any = {};
        cobList.forEach((c: any) => {
            if (c.formapago === 'EFVO') return;
            const key = c.codigo;
            if (!grouped[key]) grouped[key] = { ...c, paymentOptions: [] };
            grouped[key].paymentOptions.push(c);
        });
        atmCoberturas = Object.values(grouped);
    }
    const atmError = results?.atmError || (atmRaw?.statusText?.msg);

    // 3. Process Integrity
    const integrityData = results?.integrity?.data || results?.integrity || [];
    const integrityQuotes = Array.isArray(integrityData) ? integrityData.filter((q: any) => q.ok) : [];
    const integrityError = results?.integrityError;

    // 4. Process San Cristobal
    const sancristobalQuotes = Array.isArray(results?.sancristobal) ? results.sancristobal : results?.sancristobal?.data || [];
    const sancristobalError = results?.sancristobalError;

    // 5. Gather and Sort all valid cards
    const allCards: Array<{ price: number, el: React.ReactElement }> = [];

    // Extract a common Suma Asegurada from any provider that has it to use as global fallback
    const commonSuma = parseFloat(
        rusQuotes[0]?.sumaAsegurada || 
        integrityQuotes[0]?.SumaAsegurada || 
        integrityQuotes[0]?.sumaAsegurada ||
        sancristobalQuotes[0]?.sumaAsegurada || 
        0
    );

    // RUS processing
    if (!rusError && rusQuotes.length > 0) {
        rusQuotes.forEach((q: any, i: number) => {
            const planName = (q.codigoCasco || q.codigoRC || '').toUpperCase().trim();
            const isRC = planName === 'RCM' || planName.includes('RCM C/') || planName === 'RC' || planName === 'RESPONSABILIDAD CIVIL' || planName === 'RESPONSABILIDAD CIVIL SIN ASISTENCIA';
            const discount = isRC ? 0.85 : 0.70;
            const p = parseFloat(q.premio || 0);
            const price = (payWithCard ? p * discount : p) / 6;
            allCards.push({ price, el: <RusCard key={`rus-${i}`} quote={q} payWithCard={payWithCard} onContract={onContract} onInfo={() => setInfoModalConfig({ quote: q, company: 'RUS' })} /> });
        });
    }

    // ATM processing
    if (!atmError && atmSuccess && atmCoberturas.length > 0) {
        atmCoberturas.forEach((c: any, i: number) => {
            const planName = (c.descripcion || '').toUpperCase().trim();
            const isRC = planName.includes('RESPONSABILIDAD CIVIL');
            const discount = isRC ? 0.85 : 0.70;
            const originalPremio = parseFloat(c.premio || 0);
            const premio = payWithCard ? originalPremio * discount : originalPremio;
            const cuotas = parseInt(c.cuotas || 1);
            const originalImpcuotas = parseFloat(c.impcuotas || 0);
            const impcuotas = payWithCard ? originalImpcuotas * discount : originalImpcuotas;
            const price = cuotas > 1 ? impcuotas : premio;
            allCards.push({ price, el: <AtmCard key={`atm-${i}`} quote={c} operacion={atmRaw?.operacion} payWithCard={payWithCard} onContract={onContract} commonSuma={commonSuma} onInfo={() => setInfoModalConfig({ quote: c, company: 'ATM' })} /> });
        });
    }

    // Integrity processing
    if (!integrityError && integrityQuotes.length > 0) {
        integrityQuotes.forEach((q: any, i: number) => {
            const prodCode = (q.producto || '').toString().padStart(4, '0');
            const nameStr = (q.Nombre || q.nombre || '').toUpperCase();
            const isRC = prodCode === '0899' || nameStr.includes(' - RC') || nameStr.includes('RESPONSABILIDAD CIVIL');
            const discount = isRC ? 0.85 : 0.70;
            const p = parseFloat(q.Premio || 0);
            const price = payWithCard ? p * discount : p;
            allCards.push({ price, el: <IntegrityCard key={`intg-${i}`} quote={q} payWithCard={payWithCard} onContract={onContract} commonSuma={commonSuma} onInfo={() => setInfoModalConfig({ quote: q, company: 'INTEGRITY' })} /> });
        });
    }

    // San Cristobal processing
    if (!sancristobalError && sancristobalQuotes.length > 0) {
        sancristobalQuotes.forEach((q: any, i: number) => {
            const planName = (q.description || q.descripcion || '').toUpperCase();
            const isRC = planName.includes('RESPONSABILIDAD CIVIL');
            const discount = isRC ? 0.85 : 0.70;
            const originalPrice = parseFloat(q.monthlyCuota || q.premio || 0);
            const price = payWithCard ? originalPrice * discount : originalPrice;
            allCards.push({ price, el: <SanCristobalCard key={`sanc-${i}`} quote={q} payWithCard={payWithCard} onContract={onContract} onInfo={() => setInfoModalConfig({ quote: q, company: 'SAN_CRISTOBAL' })} /> });
        });
    }

    // Sort by price
    allCards.sort((a, b) => a.price - b.price);

    const hasErrors = rusError || (atmError && !atmSuccess) || integrityError || sancristobalError;

    return (
        <div className="space-y-8 animate-fade-in">


            {/* Error notifications if any */}
            {hasErrors && (
               <div className="flex flex-col gap-2">
                   {rusError && <div className="text-center text-xs text-red-400 bg-red-500/10 p-2 rounded-xl border border-red-500/20">No pudimos obtener información de RUS.</div>}
                   {atmError && !atmSuccess && <div className="text-center text-xs text-red-400 bg-red-500/10 p-2 rounded-xl border border-red-500/20">No pudimos obtener información de ATM.</div>}
                   {integrityError && <div className="text-center text-xs text-red-400 bg-red-500/10 p-2 rounded-xl border border-red-500/20">No pudimos obtener información de Integrity.</div>}
                   {sancristobalError && <div className="text-center text-xs text-red-400 bg-red-500/10 p-2 rounded-xl border border-red-500/20">No pudimos obtener información de San Cristóbal.</div>}
               </div>
            )}

            {/* Unified Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allCards.length === 0 ? (
                    <div className="col-span-full text-center text-text-secondary py-10">No encontramos resultados para esta búsqueda.</div>
                ) : (
                    allCards.map(c => c.el)
                )}
            </div>

            <CoverageDetailsModal 
                isOpen={!!infoModalConfig} 
                onClose={() => setInfoModalConfig(null)} 
                company={infoModalConfig?.company || ''} 
                quote={infoModalConfig?.quote} 
            />
        </div>
    );
};

// --- CARDS ---

const InfoItem = ({ label, value }: { label: string, value: string }) => (
    <div className="flex justify-between items-center text-[11px] sm:text-sm border-b border-border-primary/50 pb-1.5 last:border-0 leading-tight">
        <span className="text-text-secondary truncate pr-2">{label}</span>
        <span className="text-text-primary font-bold whitespace-nowrap">{value}</span>
    </div>
);

const PriceDisplay = ({ originalPrice, finalPrice, discountPercent, payWithCard }: { originalPrice: number, finalPrice: number, discountPercent: number, payWithCard: boolean }) => {
    return (
        <div className="flex flex-col mb-3">
            <div className="flex items-center gap-2 mb-1 h-6">
                {payWithCard && originalPrice > finalPrice && (
                    <>
                        <span className="text-xs text-text-secondary line-through opacity-60">
                            ${Math.round(originalPrice).toLocaleString('es-AR')}
                        </span>
                        <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                            -{discountPercent}% OFF
                        </span>
                    </>
                )}
            </div>
            <div className="text-3xl sm:text-4xl font-black text-text-primary font-accent tracking-tighter leading-none">
                ${Math.round(finalPrice).toLocaleString('es-AR')}<span className="text-[10px] text-text-secondary tracking-widest pl-1 font-normal">/MES</span>
            </div>
        </div>
    );
};

const formatPlanName = (str: string) => {
    if (!str) return '';
    // Extra handling for common insurance acronyms
    return str.toLowerCase().replace(/\b(\w+)\b/g, (word) => {
        if (/^(rc|rcm|atm|rus)$/i.test(word)) return word.toUpperCase();
        return word.charAt(0).toUpperCase() + word.slice(1);
    });
};

const ActionButton = ({ isEmissionFlow, onClick }: { isEmissionFlow: boolean, onClick: () => void }) => {
    return (
        <Button onClick={onClick} className="w-full text-white font-black uppercase tracking-wider h-11 border-none py-3 shadow-lg text-xs rounded-xl transition-all duration-300 active:scale-95 bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-orange-400/30 flex items-center justify-center gap-2">
            {isEmissionFlow ? (
                <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    Contratar Online
                </>
            ) : (
                <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366" stroke="none"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                    Contratar
                </>
            )}
        </Button>
    );
};

const RusCard = ({ quote, payWithCard, onContract, onInfo }: { quote: any, payWithCard: boolean, onContract: any, onInfo: () => void }) => {
    const planName = (quote.codigoCasco || quote.codigoRC || '').toUpperCase().trim();
    const isRC = planName === 'RCM' || planName.includes('RCM C/') || planName === 'RC' || planName === 'RESPONSABILIDAD CIVIL' || planName === 'RESPONSABILIDAD CIVIL SIN ASISTENCIA';
    const isEmissionFlow = EMISSION_PLANS.some(p => planName === p || planName.includes(p));
    
    const discount = isRC ? 0.85 : 0.70;
    const discountPercent = isRC ? 15 : 30;
    const originalPremio = parseFloat(quote.premio || 0) / 6;
    const premio = payWithCard ? originalPremio * discount : originalPremio;

    const logoUrl = getInsurerLogo('RUS');

    return (
        <div className="glass-card p-5 border-2 border-border-primary/50 rounded-2xl hover:border-orange-500 hover:shadow-[0_0_25px_rgba(249,115,22,0.2)] transition-all duration-500 h-[310px] relative group/card shadow-sm">
            <div className="pb-16">
                <div className="flex justify-between items-start gap-3 mb-4">
                    <div className="h-12 flex items-center">
                        <h3 className="text-text-primary font-black text-sm sm:text-base md:text-lg leading-tight line-clamp-2 font-accent">{formatPlanName(quote.codigoCasco || quote.codigoRC || '')}</h3>
                    </div>
                    {logoUrl ? (
                        <div className="flex items-center h-10 w-24 shrink-0">
                            <img src={logoUrl} alt="RUS" className="max-h-full max-w-full object-contain" style={{ filter: 'var(--logo-filter)' }} />
                        </div>
                    ) : (
                        <span className="bg-orange-500/20 text-orange-500 text-[10px] font-black px-2 py-1 rounded">RUS</span>
                    )}
                </div>
                
                <div className="flex justify-between items-end mb-4">
                    <PriceDisplay originalPrice={originalPremio} finalPrice={premio} discountPercent={discountPercent} payWithCard={payWithCard} />
                    <div className="relative group/tooltip mb-2">
                        <button onClick={onInfo} className="w-8 h-8 rounded-full border border-border-primary/50 bg-bg-secondary flex items-center justify-center text-text-secondary group-hover/card:text-orange-500 group-hover/card:border-orange-500/50 group-hover/card:bg-orange-500/10 transition-all shadow-sm shrink-0" title="Ver detalles de cobertura">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-0.5 bg-text-primary text-bg-primary text-[8px] font-medium rounded-md opacity-0 group-hover/card:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-10">
                            Ver detalle de cobertura
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-text-primary"></div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2 pt-1 border-t border-border-primary/30 mt-2">
                    {parseFloat(quote.sumaAsegurada || 0) > 0 && <InfoItem label="Suma Asegurada" value={parseFloat(quote.sumaAsegurada || 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })} />}
                </div>
            </div>
            <div className="absolute bottom-5 left-5 right-5">
                <ActionButton isEmissionFlow={isEmissionFlow} onClick={() => onContract(quote, 'RUS', isEmissionFlow)} />
            </div>
        </div>
    );
};

const AtmCard = ({ quote, operacion, payWithCard, onContract, commonSuma, onInfo }: { quote: any, operacion: any, payWithCard: boolean, onContract: any, commonSuma: number, onInfo: () => void }) => {
    const planName = (quote.descripcion || '').toUpperCase().trim();
    const isRC = planName.includes('RESPONSABILIDAD CIVIL');
    const isEmissionFlow = EMISSION_PLANS.some(p => planName === p || planName.includes(p));

    const discount = isRC ? 0.85 : 0.70;
    const discountPercent = isRC ? 15 : 30;
    const cuotas = parseInt(quote.cuotas || 1);
    const originalImpcuotas = parseFloat(quote.impcuotas || 0);
    const originalPremio = parseFloat(quote.premio || 0);
    
    const originalPrice = cuotas > 1 ? originalImpcuotas : originalPremio;
    const finalPrice = payWithCard ? originalPrice * discount : originalPrice;

    const logoUrl = getInsurerLogo('ATM');

    return (
        <div className="glass-card p-5 border-2 border-border-primary/50 rounded-2xl hover:border-orange-400 hover:shadow-[0_0_25px_rgba(251,146,60,0.15)] transition-all duration-500 h-[310px] relative group/card shadow-sm">
            <div className="pb-16">
                <div className="flex justify-between items-start gap-3 mb-4">
                    <div className="h-12 flex items-center">
                        <h3 className="text-text-primary font-black text-sm sm:text-base md:text-lg leading-tight line-clamp-2 font-accent">{formatPlanName(quote.descripcion)}</h3>
                    </div>
                    {logoUrl ? (
                        <div className="flex items-center h-10 w-24 shrink-0">
                            <img src={logoUrl} alt="ATM" className="max-h-full max-w-full object-contain" style={{ filter: 'var(--logo-filter)' }} />
                        </div>
                    ) : (
                        <span className="bg-orange-400/20 text-orange-400 text-[10px] font-black px-2 py-1 rounded">ATM</span>
                    )}
                </div>

                <div className="flex justify-between items-end mb-4">
                    <PriceDisplay originalPrice={originalPrice} finalPrice={finalPrice} discountPercent={discountPercent} payWithCard={payWithCard} />
                    <div className="relative group/tooltip mb-2">
                        <button onClick={onInfo} className="w-8 h-8 rounded-full border border-border-primary/50 bg-bg-secondary flex items-center justify-center text-text-secondary group-hover/card:text-orange-500 group-hover/card:border-orange-500/50 group-hover/card:bg-orange-500/10 transition-all shadow-sm shrink-0" title="Ver detalles de cobertura">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-0.5 bg-text-primary text-bg-primary text-[8px] font-medium rounded-md opacity-0 group-hover/card:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-10">
                            Ver detalle de cobertura
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-text-primary"></div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2 pt-1 border-t border-border-primary/30 mt-2">
                    <InfoItem 
                        label="Suma Asegurada" 
                        value={(() => {
                            const val = parseFloat(quote.suma_asegurada || quote.SumaAsegurada || quote.sumaAsegurada || quote.capital || quote.suma || quote.Suma || quote.valor_vehiculo || quote.valorVehiculo || quote.monto || quote.montoAsegurado || operacion?.valor_vehiculo || operacion?.capital || 0);
                            const finalSuma = val > 0 ? val : commonSuma;
                            if (finalSuma > 0) return finalSuma.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
                            return "$ 0 (Consultar)";
                        })()} 
                    />
                </div>
            </div>
            <div className="absolute bottom-5 left-5 right-5">
                <ActionButton isEmissionFlow={isEmissionFlow} onClick={() => onContract({ cobertura: quote, operacion }, 'ATM', isEmissionFlow)} />
            </div>
        </div>
    );
};

const IntegrityCard = ({ quote, payWithCard, onContract, commonSuma, onInfo }: { quote: any, payWithCard: boolean, onContract: any, commonSuma: number, onInfo: () => void }) => {
    const prodCode = (quote.producto || '').toString().padStart(4, '0');
    const nameStr = (quote.Nombre || quote.nombre || '').toUpperCase();
    const isRC = prodCode === '0899' || nameStr.includes(' - RC') || nameStr.includes('RESPONSABILIDAD CIVIL');
    const isEmissionFlow = false;

    const discount = isRC ? 0.85 : 0.70;
    const discountPercent = isRC ? 15 : 30;
    const originalPrice = parseFloat(quote.Premio || 0);
    const finalPrice = payWithCard ? originalPrice * discount : originalPrice;
    const val = parseFloat(quote.SumaAsegurada || quote.sumaAsegurada || quote.capital || quote.suma || 0);
    const suma = val > 0 ? val : commonSuma;

    const displayName = (() => {
        if (prodCode === '0049') return `Plan B`;
        if (prodCode === '0900') return `Plan B1`;
        if (prodCode === '0899') return `Plan RC`;
        return quote.nombre || `Plan ${prodCode}`;
    })();

    const logoUrl = getInsurerLogo('INTEGRITY');

    return (
        <div className="glass-card p-5 border-2 border-border-primary/50 rounded-2xl hover:border-orange-500 hover:shadow-[0_0_25px_rgba(249,115,22,0.2)] transition-all duration-500 h-[310px] relative group/card shadow-sm">
            <div className="pb-16">
                <div className="flex justify-between items-start gap-3 mb-4">
                    <div className="h-12 flex items-center">
                        <h3 className="text-text-primary font-black text-sm sm:text-base md:text-lg leading-tight line-clamp-2 font-accent">{formatPlanName(displayName)}</h3>
                    </div>
                    {logoUrl ? (
                        <div className="flex items-center h-10 w-24 shrink-0">
                            <img src={logoUrl} alt="INTEGRITY" className="max-h-full max-w-full object-contain" style={{ filter: 'var(--logo-filter)' }} />
                        </div>
                    ) : (
                        <span className="bg-orange-500/20 text-orange-600 text-[10px] font-black px-2 py-1 rounded break-words max-w-[60px] text-center uppercase">INTEGRITY</span>
                    )}
                </div>

                <div className="flex justify-between items-end mb-4">
                    <PriceDisplay originalPrice={originalPrice} finalPrice={finalPrice} discountPercent={discountPercent} payWithCard={payWithCard} />
                    <div className="relative group/tooltip mb-2">
                        <button onClick={onInfo} className="w-8 h-8 rounded-full border border-border-primary/50 bg-bg-secondary flex items-center justify-center text-text-secondary group-hover/card:text-orange-500 group-hover/card:border-orange-500/50 group-hover/card:bg-orange-500/10 transition-all shadow-sm shrink-0" title="Ver detalles de cobertura">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-0.5 bg-text-primary text-bg-primary text-[8px] font-medium rounded-md opacity-0 group-hover/card:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-10">
                            Ver detalle de cobertura
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-text-primary"></div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2 pt-1 border-t border-border-primary/30 mt-2">
                    {suma > 0 && <InfoItem label="Suma Asegurada" value={suma.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })} />}
                </div>
            </div>
            <div className="absolute bottom-5 left-5 right-5">
                <ActionButton isEmissionFlow={isEmissionFlow} onClick={() => onContract({ ...quote, source: 'INTEGRITY' }, 'INTEGRITY', isEmissionFlow)} />
            </div>
        </div>
    );
};

const SanCristobalCard = ({ quote, payWithCard, onContract, onInfo }: { quote: any, payWithCard: boolean, onContract: any, onInfo: () => void }) => {
    const planName = quote.description || quote.descripcion || '';
    const isRC = planName.includes('RESPONSABILIDAD CIVIL');
    const isEmissionFlow = false;
    
    const discount = isRC ? 0.85 : 0.70;
    const discountPercent = isRC ? 15 : 30;
    const originalPrice = parseFloat(quote.monthlyCuota || quote.premio || 0);
    const finalPrice = originalPrice * (payWithCard ? discount : 1);

    const logoUrl = getInsurerLogo('SAN_CRISTOBAL');

    return (
        <div className="glass-card p-5 border-2 border-border-primary/50 rounded-2xl hover:border-orange-500 hover:shadow-[0_0_25px_rgba(249,115,22,0.2)] transition-all duration-500 h-[310px] relative group/card shadow-sm">
            <div className="pb-16">
                <div className="flex justify-between items-start gap-3 mb-4">
                    <div className="h-12 flex items-center">
                        <h3 className="text-text-primary font-black text-sm sm:text-base md:text-lg leading-tight line-clamp-2 font-accent">{formatPlanName(planName)}</h3>
                    </div>
                    {logoUrl ? (
                        <div className="flex items-center h-10 w-24 shrink-0 bg-white/10 rounded-lg px-2 py-1">
                            <img src={logoUrl} alt="San Cristobal" className="max-h-full max-w-full object-contain" style={{ filter: 'var(--logo-filter)' }} />
                        </div>
                    ) : (
                        <span className="bg-orange-500/20 text-orange-500 text-[10px] font-black px-2 py-1 rounded">S.C.</span>
                    )}
                </div>

                <div className="flex justify-between items-end mb-4">
                    <PriceDisplay originalPrice={originalPrice} finalPrice={finalPrice} discountPercent={discountPercent} payWithCard={payWithCard} />
                    <div className="relative group/tooltip mb-2">
                        <button onClick={onInfo} className="w-8 h-8 rounded-full border border-border-primary/50 bg-bg-secondary flex items-center justify-center text-text-secondary group-hover/card:text-orange-500 group-hover/card:border-orange-500/50 group-hover/card:bg-orange-500/10 transition-all shadow-sm shrink-0" title="Ver detalles de cobertura">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-0.5 bg-text-primary text-bg-primary text-[8px] font-medium rounded-md opacity-0 group-hover/card:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-10">
                            Ver detalle de cobertura
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-text-primary"></div>
                        </div>
                    </div>
                </div>

                <div className="pt-1 border-t border-border-primary/30 mt-2">
                    <p className="text-[10px] text-text-secondary font-medium italic">Consultá coberturas disponibles con tu asesor.</p>
                </div>
            </div>
            <div className="absolute bottom-5 left-5 right-5">
                <ActionButton isEmissionFlow={isEmissionFlow} onClick={() => onContract(quote, 'SAN_CRISTOBAL', isEmissionFlow)} />
            </div>
        </div>
    );
};
