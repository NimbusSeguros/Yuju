import React, { useState } from 'react';
import { GlassCard } from './ui/GlassCard';
import { Button } from './ui/Button';
import { getInsurerLogo } from '../utils/insurerLogos';

// Utility helper
const toArray = (v: any) => (Array.isArray(v) ? v : v ? [v] : []);

interface MotoResultsGridProps {
    results: any;
    payWithCard: boolean;
    setPayWithCard: (val: boolean) => void;
    onContract: (quote: any, source: string) => void;
}

export const MotoResultsGrid: React.FC<MotoResultsGridProps> = ({ results, payWithCard, setPayWithCard, onContract }) => {
    const [selectedCompany, setSelectedCompany] = useState<'RUS' | 'ATM' | 'INTEGRITY'>('RUS');

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

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Payment Method Switcher */}
            <div className="flex flex-col md:flex-row items-center justify-between bg-bg-secondary p-4 rounded-3xl border border-border-primary gap-4">
                <span className="text-text-secondary text-sm font-semibold uppercase tracking-widest pl-2">Descuento de Pago</span>
                <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold transition-colors ${!payWithCard ? 'text-text-primary' : 'text-text-secondary opacity-50'}`}>EFECTIVO</span>
                    <button 
                        onClick={() => setPayWithCard(!payWithCard)}
                        className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${payWithCard ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'bg-bg-primary'}`}
                    >
                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform duration-300 ${payWithCard ? 'left-[34px]' : 'left-1'}`} />
                    </button>
                    <span className={`text-sm font-bold transition-colors ${payWithCard ? 'text-orange-500' : 'text-text-secondary opacity-50'}`}>TARJETA (HASTA 30% OFF)</span>
                </div>
            </div>

            {/* Company Tabs */}
            <div className="flex justify-center gap-4 border-b border-border-primary pb-4">
                {['RUS', 'ATM', 'INTEGRITY'].map((comp) => (
                    <button
                        key={comp}
                        onClick={() => setSelectedCompany(comp as any)}
                        className={`text-sm font-black tracking-widest uppercase px-6 py-3 rounded-xl transition-all duration-300 ${selectedCompany === comp ? 'bg-orange-500/10 text-orange-500 border border-orange-500/30' : 'bg-transparent text-text-secondary hover:bg-bg-secondary'}`}
                    >
                        {comp}
                    </button>
                ))}
            </div>

            {/* Company Grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {selectedCompany === 'RUS' && (
                    rusError ? (
                        <div className="col-span-full text-center text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20">No hay cotizaciones de RUS.</div>
                    ) : rusQuotes.length === 0 ? (
                        <div className="col-span-full text-center text-text-secondary">Sin resultados de RUS.</div>
                    ) : (
                        rusQuotes.map((q: any, i: number) => <RusCard key={i} quote={q} payWithCard={payWithCard} onContract={onContract} />)
                    )
                )}

                {selectedCompany === 'ATM' && (
                    atmError && !atmSuccess ? (
                        <div className="col-span-full text-center text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20">No hay cotizaciones de ATM.</div>
                    ) : atmCoberturas.length === 0 ? (
                        <div className="col-span-full text-center text-text-secondary">Sin resultados de ATM.</div>
                    ) : (
                        atmCoberturas.map((c: any, i: number) => <AtmCard key={i} quote={c} operacion={atmRaw?.operacion} payWithCard={payWithCard} onContract={onContract} />)
                    )
                )}

                {selectedCompany === 'INTEGRITY' && (
                    integrityError ? (
                        <div className="col-span-full text-center text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20">No hay cotizaciones de Integrity.</div>
                    ) : integrityQuotes.length === 0 ? (
                        <div className="col-span-full text-center text-text-secondary">Sin resultados de Integrity.</div>
                    ) : (
                        integrityQuotes.map((q: any, i: number) => <IntegrityCard key={i} quote={q} payWithCard={payWithCard} onContract={onContract} />)
                    )
                )}

            </div>
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

const RusCard = ({ quote, payWithCard, onContract }: { quote: any, payWithCard: boolean, onContract: any }) => {
    const planName = (quote.codigoCasco || quote.codigoRC || '').toUpperCase();
    const isRC = planName === 'RCM' || planName.includes('RCM C/') || planName === 'RC';
    const discount = isRC ? 0.85 : 0.70;
    const originalPremio = parseFloat(quote.premio || 0);
    const premio = payWithCard ? originalPremio * discount : originalPremio;
    const cuota = premio / 6;

    const logoUrl = getInsurerLogo('RUS');

    return (
        <GlassCard className="p-4 flex flex-col justify-between hover:border-orange-500/50 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-500 h-[190px] sm:h-[210px] relative overflow-hidden group/card">
            <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-start gap-2">
                   <div className="h-[40px] flex items-center">
                        <h3 className="text-orange-500 font-bold text-xs sm:text-base md:text-lg leading-tight line-clamp-2">{quote.codigoCasco || quote.codigoRC}</h3>
                   </div>
                   {logoUrl ? (
                        <div className="flex items-center h-8 sm:h-10 w-16 sm:w-20 shrink-0">
                           <img src={logoUrl} alt="RUS" className="max-h-full max-w-full object-contain" />
                        </div>
                   ) : (
                        <span className="bg-orange-500/20 text-orange-500 text-[10px] font-black px-2 py-1 rounded">RUS</span>
                   )}
                </div>
                <div className="text-xl sm:text-2xl font-black text-text-primary uppercase font-accent">
                    ${cuota.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<span className="text-[9px] sm:text-[10px] text-text-secondary tracking-widest pl-1">/MES</span>
                </div>
                <div className="space-y-1 mt-2 pt-2 border-t border-border-primary">
                    <InfoItem label="Suma Asegurada" value={parseFloat(quote.sumaAsegurada || 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })} />
                    {quote.auxilioMecanico === 'SI' && <InfoItem label="Auxilio" value="Incluido" />}
                    {quote.paisesLimitrofes === 'SI' && <InfoItem label="Países" value="Incluido" />}
                </div>
            </div>
            <Button onClick={() => onContract(quote, 'RUS')} className="w-full mt-2 sm:mt-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white border-none py-2 sm:py-2.5 shadow-[0_0_15px_rgba(234,88,12,0.3)] text-[10px] sm:text-xs h-8 sm:h-9">
                Elegir Cobertura
            </Button>
        </GlassCard>
    );
};

const AtmCard = ({ quote, operacion, payWithCard, onContract }: { quote: any, operacion: any, payWithCard: boolean, onContract: any }) => {
    const isRC = (quote.descripcion || '').toUpperCase().includes('RESPONSABILIDAD CIVIL');
    const discount = isRC ? 0.85 : 0.70;
    const originalPremio = parseFloat(quote.premio || 0);
    const premio = payWithCard ? originalPremio * discount : originalPremio;
    const cuotas = parseInt(quote.cuotas || 1);
    const originalImpcuotas = parseFloat(quote.impcuotas || 0);
    const impcuotas = payWithCard ? originalImpcuotas * discount : originalImpcuotas;

    const logoUrl = getInsurerLogo('ATM');

    return (
        <GlassCard className="p-4 flex flex-col justify-between hover:border-orange-400/50 shadow-sm hover:shadow-xl hover:shadow-orange-400/10 transition-all duration-500 h-[190px] sm:h-[210px] relative overflow-hidden group/card">
            <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-start gap-2">
                   <div className="h-[40px] flex items-center">
                        <h3 className="text-orange-400 font-bold text-xs sm:text-base md:text-lg leading-tight line-clamp-2">{quote.descripcion}</h3>
                   </div>
                   {logoUrl ? (
                        <div className="flex items-center h-8 sm:h-10 w-16 sm:w-20 shrink-0">
                           <img src={logoUrl} alt="ATM" className="max-h-full max-w-full object-contain filter brightness-125 saturate-150" />
                        </div>
                   ) : (
                        <span className="bg-orange-400/20 text-orange-400 text-[10px] font-black px-2 py-1 rounded">ATM</span>
                   )}
                </div>
                <div className="text-xl sm:text-2xl font-black text-text-primary uppercase font-accent">
                    ${(cuotas > 1 ? impcuotas : premio).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<span className="text-[9px] sm:text-[10px] text-text-secondary tracking-widest pl-1">/MES</span>
                </div>
                <div className="space-y-1 mt-2 pt-2 border-t border-border-primary">
                    <InfoItem label="Suma" value={parseFloat(quote.suma_asegurada || quote.SumaAsegurada || quote.sumaAsegurada || quote.capital || quote.suma || 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })} />
                    <InfoItem label="Cuotas" value={cuotas.toString()} />
                </div>
            </div>
            <Button onClick={() => onContract({ cobertura: quote, operacion }, 'ATM')} className="w-full mt-2 sm:mt-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold border-none py-2 sm:py-2.5 shadow-[0_0_15px_rgba(249,115,22,0.3)] text-[10px] sm:text-xs h-8 sm:h-9">
                Elegir Cobertura
            </Button>
        </GlassCard>
    );
};

const IntegrityCard = ({ quote, payWithCard, onContract }: { quote: any, payWithCard: boolean, onContract: any }) => {
    const prodCode = (quote.producto || '').toString().padStart(4, '0');
    const nameStr = (quote.Nombre || quote.nombre || '').toUpperCase();
    const isRC = prodCode === '0899' || nameStr.includes(' - RC') || nameStr.includes('RESPONSABILIDAD CIVIL');
    const discount = isRC ? 0.85 : 0.70;
    const originalPremio = parseFloat(quote.Premio || 0);
    const premio = payWithCard ? originalPremio * discount : originalPremio;
    const suma = parseFloat(quote.SumaAsegurada || 0);

    const displayName = (() => {
        if (prodCode === '0049') return `Intégrity Moto - B`;
        if (prodCode === '0900') return `Intégrity Moto - B1`;
        if (prodCode === '0899') return `Intégrity Moto - RC`;
        return quote.nombre || `Plan ${prodCode}`;
    })();

    const logoUrl = getInsurerLogo('INTEGRITY');

    return (
        <GlassCard className="p-4 flex flex-col justify-between hover:border-orange-500/50 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-500 h-[190px] sm:h-[210px] relative overflow-hidden group/card">
            <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-start gap-2">
                   <div className="h-[40px] flex items-center">
                        <h3 className="text-orange-600 font-bold text-xs sm:text-base md:text-lg leading-tight line-clamp-2">{displayName}</h3>
                   </div>
                   {logoUrl ? (
                        <div className="flex items-center h-8 sm:h-10 w-20 sm:w-24 shrink-0">
                           <img src={logoUrl} alt="INTEGRITY" className="max-h-full max-w-full object-contain" />
                        </div>
                   ) : (
                        <span className="bg-orange-500/20 text-orange-600 text-[10px] font-black px-2 py-1 rounded break-words max-w-[60px] text-center">INTG</span>
                   )}
                </div>
                <div className="text-xl sm:text-2xl font-black text-text-primary uppercase font-accent">
                    ${premio.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<span className="text-[9px] sm:text-[10px] text-text-secondary tracking-widest pl-1">/MES</span>
                </div>
                <div className="space-y-1 mt-2 pt-2 border-t border-border-primary">
                    <InfoItem label="Suma" value={suma.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })} />
                </div>
            </div>
            <Button onClick={() => onContract({ ...quote, source: 'INTEGRITY' }, 'INTEGRITY')} className="w-full mt-2 sm:mt-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold border-none py-2 sm:py-2.5 shadow-[0_0_15px_rgba(249,115,22,0.3)] text-[10px] sm:text-xs h-8 sm:h-9">
                Elegir Cobertura
            </Button>
        </GlassCard>
    );
};
