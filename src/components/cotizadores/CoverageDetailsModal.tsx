import React from 'react';
import ReactDOM from 'react-dom';
import { getInsurerLogo } from '../../utils/insurerLogos';

// Help helper
const CheckItem = ({ text }: { text: string }) => (
    <div className="flex items-center gap-2 mb-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span className="text-sm text-text-primary">{text}</span>
    </div>
);

const CrossItem = ({ text }: { text: string }) => (
    <div className="flex items-center gap-2 mb-2 opacity-50">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        <span className="text-sm text-text-secondary line-through">{text}</span>
    </div>
);

const WarningItem = ({ text, subtext }: { text: string, subtext?: string }) => (
    <div className="flex items-start gap-2 mb-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <div className="flex flex-col">
            <span className="text-sm text-text-primary">{text}</span>
            {subtext && <span className="text-xs text-text-secondary">{subtext}</span>}
        </div>
    </div>
);

export const CoverageDetailsModal = ({ isOpen, onClose, company, quote }: { isOpen: boolean, onClose: () => void, company: string, quote: any }) => {
    if (!isOpen || !quote) return null;

    let content = null;
    let planName = '';

    if (company === 'INTEGRITY') {
        const prodCode = (quote.producto || '').toString().padStart(4, '0');
        planName = (() => {
            if (prodCode === '0049') return `Intégrity Moto - B`;
            if (prodCode === '0900') return `Intégrity Moto - B1`;
            if (prodCode === '0899') return `Intégrity Moto - RC`;
            return quote.nombre || `Plan ${prodCode}`;
        })();
        const isB = prodCode === '0049';
        const isB1 = prodCode === '0900' || isB;
        const isXT = planName.includes('XT'); // Infer XT from name if possible
        const hasRobo = isXT || isB1;

        content = (
            <div className="space-y-4 mt-2">
                <CheckItem text="Responsabilidad Civil" />
                
                {hasRobo ? <CheckItem text="Robo y/o Hurto Total" /> : <CrossItem text="Robo y/o Hurto Total" />}
                {isB1 ? <CheckItem text="Incendio Total" /> : <CrossItem text="Incendio Total" />}
                {isB ? <CheckItem text="Daño Total" /> : <CrossItem text="Daño Total" />}
                
                <CheckItem text="Mercosur y Perú" />
                
                <div className="mt-4 p-3 bg-bg-secondary rounded-xl border border-border-primary">
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Antigüedad Permitida</span>
                    <p className="text-sm font-bold text-text-primary mt-1">
                        {isB ? 'Hasta 8 años' : hasRobo ? 'Hasta 10 años' : 'Hasta 35 años'} de antigüedad
                    </p>
                </div>
            </div>
        );

    } else if (company === 'ATM') {
        planName = (quote.descripcion || '').toUpperCase().trim();
        const code = quote.codigo || '';
        
        const isBlack = planName.includes('BLACK');
        const isPremium = code === 'C' && !isBlack;
        const isClasico = code === 'B2' || code === 'B3';
        const isRC = code === 'A0' || code === 'A1';

        content = (
            <div className="space-y-4 mt-2">
                <CheckItem text="Responsabilidad Civil" />
                
                {(isClasico || isPremium || isBlack) ? (
                    <WarningItem 
                        text="Robo y/o Hurto Total" 
                        subtext={isClasico ? 'Con franquicia 3%' : 'Sin franquicia'} 
                    />
                ) : <CrossItem text="Robo y/o Hurto Total" />}
                
                {(isClasico || isPremium || isBlack) ? (
                    <WarningItem 
                        text="Incendio Total" 
                        subtext={isClasico ? 'Con franquicia 3%' : undefined} 
                    />
                ) : <CrossItem text="Incendio Total" />}
                
                {(isPremium || isBlack) ? <CheckItem text="Incendio Parcial" /> : <CrossItem text="Incendio Parcial" />}
                
                {(isClasico || isPremium || isBlack) ? (
                    <WarningItem 
                        text="Granizo" 
                        subtext={isClasico ? 'Hasta $40.000' : isPremium ? 'Hasta $60.000' : 'Hasta $150.000'} 
                    />
                ) : <CrossItem text="Granizo" />}
                
                {(isPremium || isBlack) ? (
                    <WarningItem 
                        text="Robo + Daño Parcial" 
                        subtext="por Robo Total aparecido (Hasta 10% suma asegurada)" 
                    />
                ) : <CrossItem text="Robo + Daño Parcial" />}
                
                {(isPremium || isBlack) ? <CheckItem text="Destrucción Total por Accidente" /> : <CrossItem text="Destrucción Total por Accidente" />}
            </div>
        );

    } else if (company === 'RUS') {
        planName = (quote.codigoCasco || quote.codigoRC || '').toUpperCase().trim();
        
        // La API de RUS suele enviar descripciones en quote.descripcion o quote.detalle_cobertura
        // Intentaremos armar una lista de viñetas limpia si es string, o mostrar algo genérico si no
        const rawDesc = quote.descripcion || quote.descripcionPlan || quote.detalle;
        
        if (typeof rawDesc === 'string' && rawDesc.length > 5 && !rawDesc.includes('RCM')) {
            content = (
                <div className="space-y-3 mt-2 text-sm text-text-primary leading-relaxed">
                    {/* Convert line breaks or bullet-like characters to list items */}
                    {rawDesc.split(/(?:\r\n|\r|\n|- |\* )/).filter(s => s.trim().length > 1).map((s, i) => (
                        <CheckItem key={i} text={s.trim()} />
                    ))}
                </div>
            );
        } else {
            // Generic approach based on plan name
            const isRC = planName === 'RCM' || planName.includes('RCM C/') || planName === 'RC' || planName === 'RESPONSABILIDAD CIVIL';
            const aux = quote.auxilioMecanico === 'SI';
            
            content = (
                <div className="space-y-4 mt-2">
                    <CheckItem text="Responsabilidad Civil" />
                    {!isRC ? (
                        <>
                            <CheckItem text="Robo y/o Hurto" />
                            <CheckItem text="Incendio" />
                        </>
                    ) : (
                        <CrossItem text="Robo y/o Hurto o Incendio" />
                    )}
                    {aux ? <CheckItem text="Servicio de Auxilio Mecánico" /> : <CrossItem text="Servicio de Auxilio Mecánico" />}
                    {quote.sumaAsegurada && parseFloat(quote.sumaAsegurada) > 0 && (
                        <CheckItem text={`Suma Asegurada: $${parseFloat(quote.sumaAsegurada).toLocaleString('es-AR')}`} />
                    )}
                    
                    <p className="text-xs text-text-secondary italic mt-4">
                        Consultá los límites exactos (Total/Parcial) y franquicias vigentes en el detalle de la póliza o con nuestro equipo.
                    </p>
                </div>
            );
        }

    } else {
        // Fallback for SAN_CRISTOBAL or others
        planName = quote.description || quote.descripcion || quote.nombre || 'Cobertura';
        content = (
            <div className="mt-4 p-4 text-center">
                <p className="text-sm text-text-secondary">Consultá el detalle de esta cobertura con tu asesor.</p>
            </div>
        );
    }

    const modalContent = (
        <div className="fixed inset-0 z-[1600] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 transition-all duration-300">
            <style>{`
                @keyframes scaleUpFade {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-scale-up-fade {
                    animation: scaleUpFade 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
            
            {/* Modal Container */}
            <div className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-3xl border border-orange-500/20 shadow-[0_0_50px_rgba(249,115,22,0.15)] animate-scale-up-fade"
                style={{ background: 'var(--bg-primary)' }}>
                
                <div className="sticky top-0 z-10 px-6 pt-6 pb-4 border-b border-border-primary/40 bg-bg-primary/95 backdrop-blur-md">
                    <div className="flex items-start justify-between">
                        <div className="pr-4">
                            {getInsurerLogo(company) ? (
                                <img 
                                    src={getInsurerLogo(company)} 
                                    alt={company} 
                                    className="h-6 w-auto object-contain mb-1" 
                                    style={{ filter: 'var(--logo-filter)' }} 
                                />
                            ) : (
                                <span className="text-[10px] font-black text-orange-500 tracking-widest uppercase mb-1 block">{company}</span>
                            )}
                            <h3 className="text-xl font-black text-text-primary font-accent leading-tight mt-0.5">{planName}</h3>
                        </div>
                        <button onClick={onClose}
                            className="shrink-0 w-9 h-9 rounded-full bg-border-primary/30 flex items-center justify-center text-text-secondary hover:text-orange-500 hover:bg-orange-500/10 transition-all shadow-sm">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                    </div>
                </div>

                <div className="p-6 pb-8">
                    {content}
                </div>
                
            </div>
        </div>
    );

    // Usa portal para que el fixed position se adhiera siempre al viewport absoluto y evitar 
    // conflictos con contenedores que tengan 'transform' (ej. animate-fade-in)
    if (typeof document !== 'undefined') {
        return ReactDOM.createPortal(modalContent, document.body);
    }
    
    return modalContent;
};
