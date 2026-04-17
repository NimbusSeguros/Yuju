import React from 'react';
import { GlassCard } from './ui/GlassCard';
import { Button } from './ui/Button';
import { getInsurerLogo } from '../utils/insurerLogos';

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

    // RUS processing
    if (!rusError && rusQuotes.length > 0) {
        rusQuotes.forEach((q: any, i: number) => {
            const planName = (q.codigoCasco || q.codigoRC || '').toUpperCase().trim();
            const isRC = planName === 'RCM' || planName.includes('RCM C/') || planName === 'RC' || planName === 'RESPONSABILIDAD CIVIL' || planName === 'RESPONSABILIDAD CIVIL SIN ASISTENCIA';
            const discount = isRC ? 0.85 : 0.70;
            const p = parseFloat(q.premio || 0);
            const price = (payWithCard ? p * discount : p) / 6;
            allCards.push({ price, el: <RusCard key={`rus-${i}`} quote={q} payWithCard={payWithCard} onContract={onContract} /> });
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
            allCards.push({ price, el: <AtmCard key={`atm-${i}`} quote={c} operacion={atmRaw?.operacion} payWithCard={payWithCard} onContract={onContract} /> });
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
            allCards.push({ price, el: <IntegrityCard key={`intg-${i}`} quote={q} payWithCard={payWithCard} onContract={onContract} /> });
        });
    }

    // San Cristobal processing
    if (!sancristobalError && sancristobalQuotes.length > 0) {
        sancristobalQuotes.forEach((q: any, i: number) => {
            const planName = (q.description || q.descripcion || '').toUpperCase();
            const isRC = planName.includes('RESPONSABILIDAD CIVIL');
            const discount = isRC ? 0.85 : 0.70;
            const price = parseFloat(q.monthlyCuota || q.premio || 0) * discount;
            allCards.push({ price, el: <SanCristobalCard key={`sanc-${i}`} quote={q} payWithCard={payWithCard} onContract={onContract} /> });
        });
    }

    // Sort by price
    allCards.sort((a, b) => a.price - b.price);

    const hasErrors = rusError || (atmError && !atmSuccess) || integrityError || sancristobalError;

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
    const planName = (quote.codigoCasco || quote.codigoRC || '').toUpperCase().trim();
    const isRC = planName === 'RCM' || planName.includes('RCM C/') || planName === 'RC' || planName === 'RESPONSABILIDAD CIVIL' || planName === 'RESPONSABILIDAD CIVIL SIN ASISTENCIA';
    const isEmissionFlow = EMISSION_PLANS.some(p => planName === p || planName.includes(p));
    
    const discount = isRC ? 0.85 : 0.70;
    const originalPremio = parseFloat(quote.premio || 0);
    const premio = payWithCard ? originalPremio * discount : originalPremio;
    const cuota = premio / 6;

    const logoUrl = getInsurerLogo('RUS');

    return (
        <GlassCard className="p-5 flex flex-col justify-between border-2 border-border-primary/50 rounded-2xl hover:border-orange-500 hover:shadow-[0_0_25px_rgba(249,115,22,0.2)] transition-all duration-500 min-h-[260px] relative overflow-hidden group/card shadow-sm">
            <div className="flex-1 space-y-3 sm:space-y-4">
                <div className="flex justify-between items-start gap-3">
                   <div className="h-12 flex items-center">
                        <h3 className="text-orange-500 font-black text-sm sm:text-base md:text-lg leading-tight line-clamp-2 uppercase font-accent">{quote.codigoCasco || quote.codigoRC}</h3>
                   </div>
                   {logoUrl ? (
                        <div className="flex items-center h-10 w-20 shrink-0">
                           <img src={logoUrl} alt="RUS" className="max-h-full max-w-full object-contain" />
                        </div>
                   ) : (
                        <span className="bg-orange-500/20 text-orange-500 text-[10px] font-black px-2 py-1 rounded">RUS</span>
                   )}
                </div>
                <div className="flex flex-col">
                    <div className="text-2xl sm:text-3xl font-black text-text-primary uppercase font-accent tracking-tighter">
                        ${cuota.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}<span className="text-[10px] text-text-secondary tracking-widest pl-1">/MES</span>
                    </div>
                    {payWithCard && <span className="text-[10px] text-orange-500/80 font-bold uppercase">Dto. Tarjeta Incluido</span>}
                </div>
                <div className="space-y-2 mt-2 pt-3 border-t border-border-primary/40">
                    <InfoItem label="Suma Asegurada" value={parseFloat(quote.sumaAsegurada || 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })} />
                    {quote.auxilioMecanico === 'SI' && <InfoItem label="Auxilio" value="Incluido" />}
                </div>
            </div>
            <div className="mt-4">
                <Button onClick={() => onContract(quote, 'RUS', isEmissionFlow)} className={`w-full text-white border-none py-3 shadow-lg text-xs font-black uppercase tracking-wider h-11 rounded-xl transition-all duration-300 active:scale-95 ${isEmissionFlow ? 'bg-gradient-to-r from-orange-600 to-orange-500 hover:shadow-orange-500/40' : 'bg-[#25D366] hover:bg-[#1DA851] hover:shadow-emerald-500/30'}`}>
                    {isEmissionFlow ? 'Contratar Online' : 'Contratar por WhatsApp'}
                </Button>
            </div>
        </GlassCard>
    );
};

const AtmCard = ({ quote, operacion, payWithCard, onContract }: { quote: any, operacion: any, payWithCard: boolean, onContract: any }) => {
    const planName = (quote.descripcion || '').toUpperCase().trim();
    const isRC = planName.includes('RESPONSABILIDAD CIVIL');
    const isEmissionFlow = EMISSION_PLANS.some(p => planName === p || planName.includes(p));

    const discount = isRC ? 0.85 : 0.70;
    const originalPremio = parseFloat(quote.premio || 0);
    const premio = payWithCard ? originalPremio * discount : originalPremio;
    const cuotas = parseInt(quote.cuotas || 1);
    const originalImpcuotas = parseFloat(quote.impcuotas || 0);
    const impcuotas = payWithCard ? originalImpcuotas * discount : originalImpcuotas;

    const logoUrl = getInsurerLogo('ATM');

    return (
        <GlassCard className="p-5 flex flex-col justify-between border-2 border-border-primary/50 rounded-2xl hover:border-orange-400 hover:shadow-[0_0_25px_rgba(251,146,60,0.15)] transition-all duration-500 min-h-[260px] relative overflow-hidden group/card shadow-sm">
            <div className="flex-1 space-y-3 sm:space-y-4">
                <div className="flex justify-between items-start gap-3">
                   <div className="h-12 flex items-center">
                        <h3 className="text-orange-400 font-black text-sm sm:text-base md:text-lg leading-tight line-clamp-2 uppercase font-accent">{quote.descripcion}</h3>
                   </div>
                   {logoUrl ? (
                        <div className="flex items-center h-10 w-20 shrink-0">
                           <img src={logoUrl} alt="ATM" className="max-h-full max-w-full object-contain filter brightness-110 saturate-125" />
                        </div>
                   ) : (
                        <span className="bg-orange-400/20 text-orange-400 text-[10px] font-black px-2 py-1 rounded">ATM</span>
                   )}
                </div>
                <div className="flex flex-col">
                    <div className="text-2xl sm:text-3xl font-black text-text-primary uppercase font-accent tracking-tighter">
                        ${(cuotas > 1 ? impcuotas : premio).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}<span className="text-[10px] text-text-secondary tracking-widest pl-1">/MES</span>
                    </div>
                    {payWithCard && <span className="text-[10px] text-orange-400/80 font-bold uppercase">Dto. Tarjeta Incluido</span>}
                </div>
                <div className="space-y-2 mt-2 pt-3 border-t border-border-primary/40">
                    <InfoItem label="Suma Asegurada" value={parseFloat(quote.suma_asegurada || quote.SumaAsegurada || quote.sumaAsegurada || quote.capital || quote.suma || 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })} />
                    <InfoItem label="Plan Cuotas" value={`${cuotas} cuotas`} />
                </div>
            </div>
            <div className="mt-4">
                <Button onClick={() => onContract({ cobertura: quote, operacion }, 'ATM', isEmissionFlow)} className={`w-full text-white font-black uppercase tracking-wider h-11 border-none py-3 shadow-lg text-xs rounded-xl transition-all duration-300 active:scale-95 ${isEmissionFlow ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-orange-400/30' : 'bg-[#25D366] hover:bg-[#1DA851] hover:shadow-emerald-500/30'}`}>
                    {isEmissionFlow ? 'Contratar Online' : 'Contratar por WhatsApp'}
                </Button>
            </div>
        </GlassCard>
    );
};

const IntegrityCard = ({ quote, payWithCard, onContract }: { quote: any, payWithCard: boolean, onContract: any }) => {
    const prodCode = (quote.producto || '').toString().padStart(4, '0');
    const nameStr = (quote.Nombre || quote.nombre || '').toUpperCase();
    const isRC = prodCode === '0899' || nameStr.includes(' - RC') || nameStr.includes('RESPONSABILIDAD CIVIL');
    const isEmissionFlow = false; // Integrity uses WhatsApp flow for now since we don't have its Form Modal

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
        <GlassCard className="p-5 flex flex-col justify-between border-2 border-border-primary/50 rounded-2xl hover:border-orange-500 hover:shadow-[0_0_25px_rgba(249,115,22,0.2)] transition-all duration-500 min-h-[260px] relative overflow-hidden group/card shadow-sm">
            <div className="flex-1 space-y-3 sm:space-y-4">
                <div className="flex justify-between items-start gap-3">
                   <div className="h-12 flex items-center">
                        <h3 className="text-orange-600 font-black text-sm sm:text-base md:text-lg leading-tight line-clamp-2 uppercase font-accent">{displayName}</h3>
                   </div>
                   {logoUrl ? (
                        <div className="flex items-center h-10 w-24 shrink-0">
                           <img src={logoUrl} alt="INTEGRITY" className="max-h-full max-w-full object-contain" />
                        </div>
                   ) : (
                        <span className="bg-orange-500/20 text-orange-600 text-[10px] font-black px-2 py-1 rounded break-words max-w-[60px] text-center uppercase">INTEGRITY</span>
                   )}
                </div>
                <div className="flex flex-col">
                    <div className="text-2xl sm:text-3xl font-black text-text-primary uppercase font-accent tracking-tighter">
                        ${premio.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}<span className="text-[10px] text-text-secondary tracking-widest pl-1">/MES</span>
                    </div>
                    {payWithCard && <span className="text-[10px] text-orange-500/80 font-bold uppercase">Dto. Tarjeta Incluido</span>}
                </div>
                <div className="space-y-2 mt-2 pt-3 border-t border-border-primary/40">
                    <InfoItem label="Suma Asegurada" value={suma.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })} />
                </div>
            </div>
            <div className="mt-4">
                <Button onClick={() => onContract({ ...quote, source: 'INTEGRITY' }, 'INTEGRITY', isEmissionFlow)} className={`w-full text-white font-black uppercase tracking-wider h-11 border-none py-3 shadow-lg text-xs rounded-xl transition-all duration-300 active:scale-95 ${isEmissionFlow ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:shadow-orange-500/30' : 'bg-[#25D366] hover:bg-[#1DA851] hover:shadow-emerald-500/30'}`}>
                    {isEmissionFlow ? 'Contratar Online' : 'Contratar por WhatsApp'}
                </Button>
            </div>
        </GlassCard>
    );
};

const SanCristobalCard = ({ quote, onContract }: { quote: any, payWithCard: boolean, onContract: any }) => {
    const planName = (quote.description || quote.descripcion || '').toUpperCase();
    const isRC = planName.includes('RESPONSABILIDAD CIVIL');
    const isEmissionFlow = false; // All San Cristobal currently WhatsApp
    
    const discount = isRC ? 0.85 : 0.70;
    const cuota = parseFloat(quote.monthlyCuota || quote.premio || 0) * discount;

    const logoUrl = getInsurerLogo('SAN_CRISTOBAL');

    return (
        <GlassCard className="p-5 flex flex-col justify-between border-2 border-border-primary/50 rounded-2xl hover:border-orange-500 hover:shadow-[0_0_25px_rgba(249,115,22,0.2)] transition-all duration-500 min-h-[260px] relative overflow-hidden group/card shadow-sm">
            <div className="flex-1 space-y-3 sm:space-y-4">
                <div className="flex justify-between items-start gap-3">
                   <div className="h-12 flex items-center">
                        <h3 className="text-orange-500 font-black text-sm sm:text-base md:text-lg leading-tight line-clamp-2 uppercase font-accent">{planName}</h3>
                   </div>
                   {logoUrl ? (
                        <div className="flex items-center h-10 w-24 shrink-0 bg-white/10 rounded-lg px-2 py-1">
                           <img src={logoUrl} alt="San Cristobal" className="max-h-full max-w-full object-contain brightness-110" />
                        </div>
                   ) : (
                        <span className="bg-orange-500/20 text-orange-500 text-[10px] font-black px-2 py-1 rounded">S.C.</span>
                   )}
                </div>
                <div className="flex flex-col">
                    <div className="text-2xl sm:text-3xl font-black text-text-primary uppercase font-accent tracking-tighter">
                        ${cuota.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}<span className="text-[10px] text-text-secondary tracking-widest pl-1">/MES</span>
                    </div>
                </div>
                <div className="border-t border-border-primary/40 pt-3">
                   <p className="text-[10px] text-text-secondary font-medium italic">Consultá coberturas disponibles con tu asesor.</p>
                </div>
            </div>
            <div className="mt-4">
                <Button onClick={() => onContract(quote, 'SAN CRISTOBAL', isEmissionFlow)} className={`w-full text-white font-black uppercase tracking-wider h-11 border-none py-3 shadow-lg text-xs rounded-xl transition-all duration-300 active:scale-95 bg-[#25D366] hover:bg-[#1DA851] hover:shadow-emerald-500/30`}>
                    Contratar por WhatsApp
                </Button>
            </div>
        </GlassCard>
    );
};
