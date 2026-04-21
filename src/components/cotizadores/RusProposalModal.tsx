// @ts-nocheck
import { useState, useEffect } from 'react';
import { createPropuesta, getPropuestaStatus, getPolizaPdf } from '../../services/motoApi';
import { getInsurerLogo } from '../../utils/insurerLogos';

function ProposalModal({ isOpen, onClose, quote, quotationContext, vehicleInfo, payWithCard }) {
    if (!isOpen) return null;

    const { vigencias, selectedVigencia, selectedLocality, year, selectedVersionId } = quotationContext;

    /* --- UI Step State --- */
    const [step, setStep] = useState(1); // 1: tomador, 2: vehículo + pago

    /* --- Proposal State --- */
    const [proposalLoading, setProposalLoading] = useState(false);
    const [proposalSuccess, setProposalSuccess] = useState(null);
    const [proposalError, setProposalError] = useState(null);
    const [proposalId, setProposalId] = useState(null);
    const [proposalResponse, setProposalResponse] = useState(null);
    const [pdfLoading, setPdfLoading] = useState(false);

    /* --- Payment State --- */
    const [paymentMethod, setPaymentMethod] = useState('3');
    const [cbu, setCbu] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardType, setCardType] = useState('');
    const [autoRenewal] = useState('SI');

    const cascoCode = (quote?.codigoCasco || "").toUpperCase();
    const isFullOnline = !['B-80', 'B1-80', 'C-80', 'C1-80'].some(c => cascoCode.includes(c));

    const planName = (quote?.codigoCasco || quote?.codigoRC || '').toUpperCase().trim();
    const isRC = planName === 'RCM' || planName.includes('RCM C/') || planName === 'RC' || planName === 'RESPONSABILIDAD CIVIL' || planName === 'RESPONSABILIDAD CIVIL SIN ASISTENCIA';
    const discountFactor = payWithCard ? (isRC ? 0.85 : 0.70) : 1.0;

    const originalPremio = parseFloat(quote?.premio || 0);
    const discountedPremio = originalPremio * discountFactor;
    const monthlyCuota = discountedPremio / 6;

    const [proposalData, setProposalData] = useState({
        nombre: '', apellido: '', dni: '', genero: 'MASCULINO',
        email: '', telefono: '', calle: '', numero: '',
        patente: '', chasis: '', motor: ''
    });

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setPaymentMethod('3');
            setCbu(''); setCardNumber(''); setCardType('');
            setProposalSuccess(null); setProposalError(null);
            setProposalId(null); setProposalResponse(null);
        }
    }, [isOpen]);

    const calculateDates = () => {
        const today = new Date();
        const vigenciaObj = vigencias.find(v => (v.id || v.ID) == selectedVigencia);
        let monthsToAdd = 12;
        let tipoVigenciaStr = "ANUAL";
        if (vigenciaObj) {
            const desc = (vigenciaObj.descripcion || vigenciaObj.description || "").toUpperCase();
            if (desc.includes("SEMESTRAL")) { monthsToAdd = 6; tipoVigenciaStr = "SEMESTRAL"; }
            else if (desc.includes("TRIMESTRAL")) { monthsToAdd = 3; tipoVigenciaStr = "TRIMESTRAL"; }
            else if (desc.includes("MENSUAL")) { monthsToAdd = 1; tipoVigenciaStr = "MENSUAL"; }
        }
        const nextDate = new Date(today);
        nextDate.setMonth(today.getMonth() + monthsToAdd);
        const formatDate = (d) => d.toISOString().split('T')[0];
        return { vigenciaDesde: formatDate(today), vigenciaHasta: formatDate(nextDate), tipoVigencia: tipoVigenciaStr };
    };

    // Step 1: validate tomador, advance to step 2
    const handleStep1 = (e) => {
        e.preventDefault();
        setStep(2);
    };

    const handleProposalSubmit = async (e) => {
        e.preventDefault();
        setProposalLoading(true);
        setProposalError(null);

        if (!selectedLocality) {
            setProposalError("Error: No se ha seleccionado una localidad válida.");
            setProposalLoading(false); return;
        }
        const locId = selectedLocality.id || selectedLocality.ID;
        if (!locId) {
            setProposalError("Error: La localidad seleccionada no tiene un ID válido.");
            setProposalLoading(false); return;
        }

        const formatDateDDMMYYYY = (date) => {
            const d = new Date(date);
            return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        };

        const patenteClean = proposalData.patente.replace(/[-\s]/g, '').toUpperCase();
        if (!/^([0-9]{3}[A-Z]{3}|[A-Z]{1}[0-9]{3}[A-Z]{3})$/.test(patenteClean)) {
            setProposalError("La patente no tiene formato válido (Ej: 123ABC o A123BCD).");
            setProposalLoading(false); return;
        }
        const chasisClean = proposalData.chasis.replace(/[-\s]/g, '').toUpperCase();
        if (!/^[A-Z0-9]{8,17}$/.test(chasisClean)) {
            setProposalError("El número de chasis debe tener entre 8 y 17 caracteres alfanuméricos.");
            setProposalLoading(false); return;
        }
        const motorClean = proposalData.motor.replace(/[-\s]/g, '').toUpperCase();
        if (!/^[A-Z0-9]{5,15}$/.test(motorClean)) {
            setProposalError("El número de motor debe tener entre 5 y 15 caracteres alfanuméricos.");
            setProposalLoading(false); return;
        }

        if (!isFullOnline) {
            const msg = `¡Quiero contratar!\nVehículo: ${vehicleInfo?.brand} ${vehicleInfo?.model} ${vehicleInfo?.version} (${vehicleInfo?.year})\nAseguradora: RUS Seguros\nPlan: ${quote?.codigoCasco || quote?.codigoRC}\nPrecio: $${monthlyCuota.toLocaleString('es-AR', { minimumFractionDigits: 2 })}/mes\nTeléfono: ${proposalData.telefono}\nPago con: ${paymentMethod === '3' ? 'Tarjeta de Crédito' : 'CBU'}`;
            window.open(`https://wa.me/5491156307246?text=${encodeURIComponent(msg)}`, '_blank');
            onClose(); return;
        }

        const vtvDate = new Date();
        vtvDate.setFullYear(vtvDate.getFullYear() + 1);

        const { vigenciaDesde, vigenciaHasta, tipoVigencia } = calculateDates();

        const payload = {
            cf: "CF",
            coberturaRC: quote.codigoRC,
            ...(quote.codigoCasco ? { coberturaCasco: quote.codigoCasco } : {}),
            codigoTipoInteres: "MOTOVEHICULO",
            medioCobro: parseInt(paymentMethod),
            ...(paymentMethod === '3' && { numeroTarjeta: cardNumber, tipoTarjeta: parseInt(cardType), renovacionAutomatica: autoRenewal }),
            ...(paymentMethod === '4' && { cbu, renovacionAutomatica: autoRenewal }),
            tomadores: [{
                apellidoRazonSocial: proposalData.apellido.trim().toUpperCase(),
                nombre: proposalData.nombre.trim().toUpperCase(),
                condicionFiscal: "CF",
                dni: parseInt(proposalData.dni),
                domicilio: { calle: proposalData.calle.trim().toUpperCase(), numero: parseInt(proposalData.numero), idCP: parseInt(locId) },
                ganancias: "NO_INSCRIPTO", ibb: "NO_INSCRIPTO", tipoIVA: "NO_INSCRIPTO",
                formaComunicacion: [
                    { tipo: "EMAIL", valor: proposalData.email || "rus@email.com" },
                    ...(proposalData.telefono ? [{ tipo: "CELULAR", valor: proposalData.telefono }] : [])
                ],
                tipoPersona: "FISICA"
            }],
            vehiculos: [{
                anio: parseInt(year), color: "NEGRO", controlSatelital: "NO", gnc: "NO",
                fechaVencVtv: formatDateDDMMYYYY(vtvDate),
                localidadGuarda: parseInt(locId),
                codia: selectedVersionId?.toString(),
                nroChasis: chasisClean, nroMotor: motorClean, patente: patenteClean,
                uso: "PARTICULAR"
            }],
            vigenciaDesde, vigenciaHasta, tipoVigencia,
            vigenciaPolizaId: parseInt(selectedVigencia),
            vehicleInfo
        };

        try {
            const result = await createPropuesta(payload);
            setProposalResponse(result);
            if (result.estado && result.estado.toUpperCase() === 'PROPUESTA') {
                setProposalSuccess('Su solicitud quedó en estado PENDIENTE. Un asesor la revisará en breve para finalizar la emisión.');
            } else {
                setProposalSuccess("¡Póliza generada con éxito!");
            }
            setProposalId(result.numeroPropuesta || result.numero || (result.body ? result.body.numeroPropuesta : null));
        } catch (err) {
            console.error("Proposal Error:", err);
            let errorMsg = "Hubo un error al generar la propuesta.";
            if (err.response?.status === 409) errorMsg = "Error en los datos de pago. Probá con una tarjeta distinta o cambiá el método.";
            else if (err.message) errorMsg = err.message;
            setProposalError(errorMsg);
        } finally {
            setProposalLoading(false);
        }
    };

    const handleDownloadPdf = async () => {
        if (!proposalResponse?.numero) return;
        setPdfLoading(true);
        try {
            const blob = await getPolizaPdf(proposalResponse.numeroSeccion || 20, proposalResponse.numero, proposalResponse.endoso || 0);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url; link.setAttribute('download', `Poliza_${proposalResponse.numero}.pdf`);
            document.body.appendChild(link); link.click(); link.parentNode.removeChild(link);
        } catch { alert("No se pudo descargar el PDF. Intentá más tarde."); }
        finally { setPdfLoading(false); }
    };

    const logoUrl = getInsurerLogo('RUS');

    // ───────────────────────────────────────────────
    // RENDER
    // ───────────────────────────────────────────────
    return (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/75 backdrop-blur-sm px-4">
            <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl border border-orange-500/20 shadow-[0_0_60px_rgba(249,115,22,0.15)]"
                style={{ background: 'var(--bg-primary)' }}>

                {/* Header */}
                <div className="sticky top-0 z-10 px-6 pt-6 pb-4 border-b border-border-primary/40"
                    style={{ background: 'var(--bg-primary)' }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {logoUrl ? (
                                <div className="h-14 flex items-center pr-2">
                                    <img src={logoUrl} alt="RUS" className="max-h-10 w-auto object-contain" style={{ filter: 'var(--logo-filter)' }} />
                                </div>
                            ) : (
                                <span className="text-xl font-black text-orange-500 font-accent">RUS</span>
                            )}
                            <div>
                                <p className="text-text-secondary text-xs">
                                    {quote?.codigoCasco || quote?.codigoRC}
                                    <span className="ml-2 text-orange-500 font-bold">
                                        ${monthlyCuota.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/mes
                                    </span>
                                    {payWithCard && <span className="ml-1 text-orange-400/70 text-[10px]">(c/desc.)</span>}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose}
                            className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-all">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                    </div>

                    {/* Step indicator — only if no success */}
                    {!proposalSuccess && !proposalLoading && (
                        <div className="flex items-center gap-2">
                            {[1, 2].map(s => (
                                <div key={s} className="flex items-center gap-2">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300
                                        ${step === s ? 'bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]'
                                            : step > s ? 'bg-orange-500/20 text-orange-500' : 'bg-bg-secondary text-text-secondary'}`}>
                                        {step > s ? (
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                        ) : s}
                                    </div>
                                    <span className={`text-xs font-semibold ${step === s ? 'text-text-primary' : 'text-text-secondary'}`}>
                                        {s === 1 ? 'Datos del tomador' : 'Vehículo y pago'}
                                    </span>
                                    {s < 2 && <div className={`flex-1 h-px w-8 transition-all ${step > s ? 'bg-orange-500' : 'bg-border-primary'}`} />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-6 pb-6 pt-4">
                    {/* Vehicle info badge */}
                    {vehicleInfo && !proposalSuccess && (
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-orange-500/5 border border-orange-500/15 mb-5">
                            <div className="w-8 h-8 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17.5" r="3.5" /><circle cx="18.5" cy="17.5" r="3.5" /><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm-3 11.5V14l-3-3 4-3 2 3h2" /></svg>
                            </div>
                            <p className="text-xs text-text-secondary">
                                <span className="text-text-primary font-semibold">{vehicleInfo.brand} {vehicleInfo.model}</span>
                                {vehicleInfo.version && <span> — {vehicleInfo.version}</span>}
                                <span className="text-orange-500 font-bold ml-1">({vehicleInfo.year})</span>
                            </p>
                        </div>
                    )}

                    {/* ── LOADING ── */}
                    {proposalLoading && (
                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <div className="w-14 h-14 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
                            <div className="flex items-center gap-2">
                                <p className="text-text-secondary text-sm font-medium">Validando con</p>
                                <img src={getInsurerLogo('RUS')} alt="RUS" className="h-5 w-auto object-contain" style={{ filter: 'var(--logo-filter)' }} />
                            </div>
                        </div>
                    )}

                    {/* ── SUCCESS ── */}
                    {!proposalLoading && proposalSuccess && (
                        <div className="flex flex-col items-center text-center py-6 gap-4">
                            <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-text-primary font-accent">¡Emisión exitosa!</h3>
                                <p className="text-text-secondary text-sm mt-2 leading-relaxed max-w-sm">{proposalSuccess}</p>
                            </div>
                            {proposalResponse?.numero && (
                                <div className="w-full p-4 rounded-2xl bg-bg-secondary border border-border-primary text-left space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">Póliza N°:</span>
                                        <span className="font-bold text-text-primary">{proposalResponse.numero}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">Estado:</span>
                                        <span className="font-bold text-orange-500">{proposalResponse.estado?.toUpperCase() || 'EMITIDA'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">Titular:</span>
                                        <span className="font-bold text-text-primary">{proposalData.apellido.toUpperCase()}, {proposalData.nombre.toUpperCase()}</span>
                                    </div>
                                </div>
                            )}
                            <button onClick={handleDownloadPdf} disabled={pdfLoading}
                                className="w-full h-12 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 text-white font-black text-sm tracking-wider hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all disabled:opacity-50">
                                {pdfLoading ? 'Descargando...' : 'DESCARGAR PÓLIZA PDF'}
                            </button>
                            <button onClick={onClose} className="w-full h-11 rounded-2xl border border-border-primary text-text-secondary font-semibold text-sm hover:bg-bg-secondary transition-all">
                                Cerrar
                            </button>
                        </div>
                    )}

                    {/* ── FORM ── */}
                    {!proposalLoading && !proposalSuccess && (
                        <>
                            {proposalError && (
                                <div className="flex items-start gap-2 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 mb-4">
                                    <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                    <p className="text-red-400 text-xs leading-relaxed">{proposalError}</p>
                                </div>
                            )}

                            {/* ── STEP 1: Datos del Tomador ── */}
                            {step === 1 && (
                                <form onSubmit={handleStep1} className="space-y-4">
                                    <SectionLabel>Datos del tomador</SectionLabel>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Apellido *">
                                            <input className={inputCls} required value={proposalData.apellido}
                                                onChange={e => setProposalData(p => ({ ...p, apellido: e.target.value }))} placeholder="García" />
                                        </Field>
                                        <Field label="Nombre *">
                                            <input className={inputCls} required value={proposalData.nombre}
                                                onChange={e => setProposalData(p => ({ ...p, nombre: e.target.value }))} placeholder="Juan" />
                                        </Field>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="DNI *">
                                            <input className={inputCls} required type="number" value={proposalData.dni}
                                                onChange={e => setProposalData(p => ({ ...p, dni: e.target.value }))} placeholder="30123456" />
                                        </Field>
                                        <Field label="Género *">
                                            <select className={inputCls} value={proposalData.genero}
                                                onChange={e => setProposalData(p => ({ ...p, genero: e.target.value }))}>
                                                <option value="MASCULINO">Masculino</option>
                                                <option value="FEMENINO">Femenino</option>
                                            </select>
                                        </Field>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Celular *">
                                            <input className={inputCls} required value={proposalData.telefono}
                                                onChange={e => setProposalData(p => ({ ...p, telefono: e.target.value.replace(/\D/g, '') }))} placeholder="1112345678" />
                                        </Field>
                                        <Field label="Email *">
                                            <input className={inputCls} required type="email" value={proposalData.email}
                                                onChange={e => setProposalData(p => ({ ...p, email: e.target.value }))} placeholder="juan@email.com" />
                                        </Field>
                                    </div>
                                    <SectionLabel>Domicilio</SectionLabel>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="col-span-2">
                                            <Field label="Calle *">
                                                <input className={inputCls} required value={proposalData.calle}
                                                    onChange={e => setProposalData(p => ({ ...p, calle: e.target.value }))} placeholder="Corrientes" />
                                            </Field>
                                        </div>
                                        <Field label="Altura *">
                                            <input className={inputCls} required type="number" value={proposalData.numero}
                                                onChange={e => setProposalData(p => ({ ...p, numero: e.target.value }))} placeholder="1234" />
                                        </Field>
                                    </div>
                                    <button type="submit"
                                        className="w-full h-12 mt-2 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 text-white font-black text-sm tracking-wider hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                        Continuar
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                    </button>
                                </form>
                            )}

                            {/* ── STEP 2: Vehículo + Pago ── */}
                            {step === 2 && (
                                <form onSubmit={handleProposalSubmit} className="space-y-4">
                                    <SectionLabel>Datos del vehículo</SectionLabel>
                                    <Field label="Patente *">
                                        <input className={inputCls} required value={proposalData.patente}
                                            onChange={e => setProposalData(p => ({ ...p, patente: e.target.value }))}
                                            placeholder={year >= 2023 ? "A123BCD" : "123ABC"} />
                                    </Field>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Nro. de Chasis *">
                                            <input className={inputCls} required value={proposalData.chasis}
                                                onChange={e => setProposalData(p => ({ ...p, chasis: e.target.value }))}
                                                placeholder="8 a 17 caracteres" />
                                        </Field>
                                        <Field label="Nro. de Motor *">
                                            <input className={inputCls} required value={proposalData.motor}
                                                onChange={e => setProposalData(p => ({ ...p, motor: e.target.value }))}
                                                placeholder="5 a 15 caracteres" />
                                        </Field>
                                    </div>

                                    <SectionLabel>Forma de pago</SectionLabel>

                                    {/* Payment toggle */}
                                    <div className="flex rounded-2xl border border-border-primary overflow-hidden">
                                        {[['4', 'CBU / Débito'], ['3', 'Tarjeta']].map(([val, label]) => (
                                            <button key={val} type="button"
                                                onClick={() => setPaymentMethod(val)}
                                                className={`flex-1 py-3 text-sm font-bold transition-all duration-200
                                                    ${paymentMethod === val
                                                        ? 'bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.3)]'
                                                        : 'text-text-secondary hover:text-text-primary bg-transparent'}`}>
                                                {label}
                                            </button>
                                        ))}
                                    </div>

                                    {isFullOnline ? (
                                        <>
                                            {paymentMethod === '3' && (
                                                <div className="space-y-3">
                                                    <Field label="Tipo de tarjeta *">
                                                        <select className={inputCls} value={cardType} onChange={e => setCardType(e.target.value)}>
                                                            <option value="" disabled>Seleccioná una...</option>
                                                            <option value="1">VISA</option>
                                                            <option value="3">MASTERCARD</option>
                                                            <option value="11">AMEX</option>
                                                            <option value="11">CABAL</option>
                                                        </select>
                                                    </Field>
                                                    <Field label="Número de tarjeta *">
                                                        <div className="relative">
                                                            <input className={inputCls} required type="text"
                                                                value={cardNumber}
                                                                onChange={e => {
                                                                    const val = e.target.value.replace(/\D/g, '');
                                                                    setCardNumber(val);
                                                                    let code = '';
                                                                    if (/^4/.test(val)) code = '1';
                                                                    else if (/^5[0-5]/.test(val) || /^2[2-7]/.test(val)) code = '3';
                                                                    else if (/^3[47]/.test(val)) code = '11';
                                                                    else if (/^(5896|60|63)/.test(val)) code = '11';
                                                                    if (code) setCardType(code);
                                                                }}
                                                                placeholder="XXXX XXXX XXXX XXXX" maxLength={19} />
                                                            {cardNumber && (
                                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">
                                                                    {/^4/.test(cardNumber) ? 'VISA' : /^5[0-5]/.test(cardNumber) ? 'MASTERCARD' : /^3[47]/.test(cardNumber) ? 'AMEX' : /^(5896|60|63)/.test(cardNumber) ? 'CABAL' : ''}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </Field>
                                                </div>
                                            )}
                                            {paymentMethod === '4' && (
                                                <Field label="CBU *">
                                                    <input className={inputCls} required type="text"
                                                        value={cbu} onChange={e => setCbu(e.target.value.replace(/\D/g, ''))}
                                                        placeholder="22 dígitos de tu CBU" maxLength={22} />
                                                </Field>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex items-start gap-3 p-3 rounded-2xl bg-orange-500/5 border border-orange-500/15">
                                            <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                                            <p className="text-xs text-text-secondary">Los datos de pago los coordinarás con un asesor vía WhatsApp.</p>
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-2">
                                        <button type="button" onClick={() => setStep(1)}
                                            className="h-12 px-5 rounded-2xl border border-border-primary text-text-secondary font-semibold text-sm hover:bg-bg-secondary transition-all flex items-center gap-2">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
                                            Volver
                                        </button>
                                        <button type="submit" disabled={proposalLoading}
                                            className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 text-white font-black text-sm tracking-wider hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all active:scale-[0.98] disabled:opacity-50">
                                            {isFullOnline ? 'Confirmar contratación' : 'Continuar por WhatsApp'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Shared sub-components ─────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
    <div className="flex items-center gap-3 pt-1">
        <div className="w-1 h-4 rounded-full bg-orange-500" />
        <span className="text-[11px] font-black text-text-secondary tracking-widest">{children.toUpperCase()}</span>
    </div>
);

const Field = ({ label, children }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold text-text-secondary pl-1">{label}</label>
        {children}
    </div>
);

const inputCls = [
    'w-full px-4 py-2.5 rounded-xl text-sm font-medium',
    'text-text-primary placeholder:text-text-secondary/50',
    'border border-border-primary bg-bg-secondary',
    'focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500',
    'transition-all duration-200'
].join(' ');

export default ProposalModal;
