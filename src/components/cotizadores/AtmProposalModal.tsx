// @ts-nocheck
import { useState } from 'react';
import { generarPropuestaATM, descargarPolizaATM } from '../../services/motoApi';
import { getInsurerLogo } from '../../utils/insurerLogos';

function ATMProposalModal({ isOpen, onClose, cobertura, atmOperacion, vehicleInfo, zipCode, payWithCard }) {
    if (!isOpen) return null;

    /* --- UI Step State --- */
    const [step, setStep] = useState(1);

    const [loading, setLoading]     = useState(false);
    const [success, setSuccess]     = useState(null);
    const [error, setError]         = useState(null);
    const [downloading, setDownloading] = useState(false);

    const rcCodes = ['A0', 'A1'];
    const isFullOnline = rcCodes.includes(cobertura?.codigo);

    const descName = (cobertura?.descripcion || '').toUpperCase().trim();
    const isRC = descName.includes('RESPONSABILIDAD CIVIL') || descName.startsWith('RCM');
    const discountFactor = payWithCard ? (isRC ? 0.85 : 0.70) : 1.0;

    const originalPremio = parseFloat(cobertura?.premio || 0);
    const discountedPremio = originalPremio * discountFactor;
    const cuotasCount = parseInt(cobertura?.cuotas || 1);
    const originalImpcuotas = parseFloat(cobertura?.impcuotas || 0);
    const discountedImpcuotas = originalImpcuotas * discountFactor;

    const handleDownload = async (reporte = 'POL') => {
        if (!success?.npoliza) return;
        setDownloading(true);
        try {
            const result = await descargarPolizaATM({ npoliza: success.npoliza, reporte, seccion: 4 });
            if (result?.data?.archivo) {
                const link = document.createElement('a');
                link.href = `data:application/pdf;base64,${result.data.archivo}`;
                link.download = result.data.nombre || `poliza_${success.npoliza}.pdf`;
                document.body.appendChild(link); link.click(); document.body.removeChild(link);
            } else { alert('No se pudo descargar el documento.'); }
        } catch (err) { alert(err.message || 'Error al descargar el documento.'); }
        finally { setDownloading(false); }
    };

    /* --- Persona type --- */
    const [personaType, setPersonaType] = useState('F');

    /* --- Titular Física --- */
    const [fisica, setFisica] = useState({
        apellido: '', nombre: '', nrodoc: '', fecnac: '', sexo: 'M', estcivil: '1',
        telcel: '', mail: '', localidad: '', calle: '', altura: ''
    });
    const ff = (k, v) => setFisica(p => ({ ...p, [k]: v }));

    /* --- Titular Jurídica --- */
    const [juridica, setJuridica] = useState({
        razonSocial: '', cuit: '', telpart: '', mail: '',
        localidad: '', calle: '', altura: '',
        repTipodoc: 'DNI', repNrodoc: '', repApellido: '', repNombre: ''
    });
    const fj = (k, v) => setJuridica(p => ({ ...p, [k]: v }));

    /* --- Vehículo --- */
    const [veh, setVeh] = useState({ patente: '', chasis: '', motor: '' });
    const fv = (k, v) => setVeh(p => ({ ...p, [k]: v }));

    /* --- Forma de pago --- */
    const paymentOptions = cobertura?.paymentOptions || [];
    const availableMethods = paymentOptions.map(po => po.formapago).filter(m => m !== 'EFVO');
    const initialPago = availableMethods.includes('CBU') ? 'CBU' : (availableMethods[0] || 'EFVO');
    const [pagoTipo, setPagoTipo] = useState(initialPago);
    const [cbuNum, setCbuNum] = useState('');
    const [tarjeta, setTarjeta] = useState({ numero: '', vcto: '', nombre: '2' });
    const ft = (k, v) => setTarjeta(p => ({ ...p, [k]: v }));

    const fmtDate = (iso) => {
        if (!iso) return '';
        const [y, m, d] = iso.split('-');
        return `${d}${m}${y}`;
    };

    /* --- Step 1 submit --- */
    const handleStep1 = (e) => {
        e.preventDefault();
        setStep(2);
    };

    /* --- Final submit --- */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const isJuridica = personaType === 'J';
            const localidad = isJuridica ? juridica.localidad : fisica.localidad;

            const titularPayload = isJuridica
                ? {
                    tipopersona: 'J', tipodoc: 'CUIT', nrodoc: juridica.cuit,
                    apellido: juridica.razonSocial.toUpperCase(), localidad,
                    calle: juridica.calle.toUpperCase(), altura: juridica.altura,
                    telpart: juridica.telpart, telcel: juridica.telpart,
                    actividad: '2', mail: juridica.mail,
                    repTipodoc: juridica.repTipodoc, repNrodoc: juridica.repNrodoc,
                    repApellido: juridica.repApellido.toUpperCase(), repNombre: juridica.repNombre.toUpperCase()
                }
                : {
                    tipopersona: 'F', tipodoc: 'DNI', nrodoc: fisica.nrodoc,
                    apellido: fisica.apellido.toUpperCase(), nombre: fisica.nombre.toUpperCase(),
                    localidad, calle: fisica.calle.toUpperCase(), altura: fisica.altura,
                    telcel: fisica.telcel, sexo: fisica.sexo, estcivil: fisica.estcivil,
                    nacionalidad: '0', actividad: '2', mail: fisica.mail,
                    fecnac: fmtDate(fisica.fecnac)
                };

            if (!isFullOnline) {
                const titularName = isJuridica ? juridica.razonSocial.toUpperCase() : `${fisica.nombre.toUpperCase()} ${fisica.apellido.toUpperCase()}`;
                const titularPhone = isJuridica ? juridica.telpart : fisica.telcel;
                const msg = `¡Quiero contratar!\nVehículo: ${vehicleInfo?.brand} ${vehicleInfo?.model} ${vehicleInfo?.version} ${vehicleInfo?.year}\nAseguradora: ATM Seguros\nPlan: ${cobertura.descripcion}\nPrecio: $${discountedPremio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}\nTeléfono: ${titularPhone}\nPago con: ${pagoTipo === 'EFVO' ? 'Efectivo' : pagoTipo === 'CBU' ? 'CBU' : 'Tarjeta de Crédito'}`;
                window.open(`https://wa.me/5491156307246?text=${encodeURIComponent(msg)}`, '_blank');
                onClose(); return;
            }

            const condPago = pagoTipo;
            let formapagoPayload;
            if (condPago === 'CBU') {
                formapagoPayload = { tipo: 'cbu', forma: '4', cbu: { numero: cbuNum } };
            } else if (condPago === 'TARJETA') {
                let cleanVcto = tarjeta.vcto.replace(/\D/g, '');
                if (cleanVcto.length === 4) {
                    const mm = cleanVcto.substring(0, 2), yy = cleanVcto.substring(2, 4);
                    cleanVcto = `${mm}20${yy}`;
                }
                formapagoPayload = { tipo: 'tarjeta', forma: '2', tarjeta: { nombre: tarjeta.nombre, numero: tarjeta.numero, vcto: cleanVcto } };
            } else {
                formapagoPayload = { tipo: 'efvo', forma: '1' };
            }

            const payload = {
                operacion: String(atmOperacion),
                codigoCobertura: cobertura.codigo,
                condPago,
                titular: titularPayload,
                vehiculo: { patente: veh.patente.toUpperCase(), chasis: veh.chasis.toUpperCase(), motor: veh.motor.toUpperCase() },
                formapago: formapagoPayload,
                codpostal: zipCode
            };

            const result = await generarPropuestaATM(payload);
            const auto = result?.data?.auto ?? result?.auto ?? result;

            if (auto?.statusSuccess === 'TRUE') {
                setSuccess(auto);
            } else {
                const msg = typeof auto?.statusText === 'object' ? auto.statusText.msg : auto?.statusText;
                setError(msg || 'ATM rechazó la propuesta. Revisá los datos.');
            }
        } catch (err) {
            setError(err.message || 'Error al generar la propuesta con ATM.');
        } finally {
            setLoading(false);
        }
    };

    const titularName = personaType === 'J'
        ? juridica.razonSocial
        : `${fisica.nombre} ${fisica.apellido}`;

    const logoUrl = getInsurerLogo('ATM');

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
                                    <img src={logoUrl} alt="ATM" className="max-h-10 w-auto object-contain" style={{ filter: 'var(--logo-filter)' }} />
                                </div>
                            ) : (
                                <span className="text-xl font-black text-orange-500 font-accent">ATM</span>
                            )}
                            <div>
                                <p className="text-text-secondary text-xs">
                                    {cobertura?.descripcion}
                                    <span className="ml-2 text-orange-500 font-bold">
                                        ${discountedPremio.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                        {cuotasCount > 1 && <span className="text-text-secondary font-normal"> ({cuotasCount} cuotas)</span>}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose}
                            className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-all">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                    </div>

                    {/* Step indicator */}
                    {!success && !loading && (
                        <div className="flex items-center gap-2">
                            {[1, 2].map(s => (
                                <div key={s} className="flex items-center gap-2">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300
                                        ${step === s ? 'bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]'
                                        : step > s ? 'bg-orange-500/20 text-orange-500' : 'bg-bg-secondary text-text-secondary'}`}>
                                        {step > s ? (
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                        ) : s}
                                    </div>
                                    <span className={`text-xs font-semibold ${step === s ? 'text-text-primary' : 'text-text-secondary'}`}>
                                        {s === 1 ? 'Datos del titular' : 'Vehículo y pago'}
                                    </span>
                                    {s < 2 && <div className={`h-px w-8 transition-all ${step > s ? 'bg-orange-500' : 'bg-border-primary'}`} />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-6 pb-6 pt-4">
                    {/* Vehicle info badge */}
                    {vehicleInfo && !success && (
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-orange-500/5 border border-orange-500/15 mb-5">
                            <div className="w-8 h-8 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm-3 11.5V14l-3-3 4-3 2 3h2"/></svg>
                            </div>
                            <p className="text-xs text-text-secondary">
                                <span className="text-text-primary font-semibold">{vehicleInfo.brand} {vehicleInfo.model}</span>
                                {vehicleInfo.version && <span> — {vehicleInfo.version}</span>}
                                <span className="text-orange-500 font-bold ml-1">({vehicleInfo.year})</span>
                            </p>
                        </div>
                    )}

                    {/* ── LOADING ── */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <div className="w-14 h-14 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
                            <div className="flex items-center gap-2">
                                <p className="text-text-secondary text-sm font-medium">Procesando con</p>
                                <img src={getInsurerLogo('ATM')} alt="ATM" className="h-5 w-auto object-contain" style={{ filter: 'var(--logo-filter)' }} />
                            </div>
                        </div>
                    )}

                    {/* ── SUCCESS ── */}
                    {!loading && success && (
                        <div className="flex flex-col items-center text-center py-6 gap-4">
                            <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-text-primary font-accent">¡Emisión exitosa!</h3>
                                <p className="text-text-secondary text-sm mt-2 max-w-sm">Gracias por tu compra. La póliza se ha emitido correctamente.</p>
                            </div>
                            <div className="w-full p-4 rounded-2xl bg-bg-secondary border border-border-primary text-left space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-secondary">Póliza N°:</span>
                                    <span className="font-bold text-text-primary">{success.npoliza || success.npropuesta}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-secondary">Estado:</span>
                                    <span className="font-bold text-orange-500">
                                        {success.statusText === 'POL' ? 'EMITIDA' : success.statusText === 'PRO' ? 'ACEPTADA' : success.statusText === 'INS' ? 'PEND. INSPECCIÓN' : 'PROCESADA'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-secondary">Titular:</span>
                                    <span className="font-bold text-text-primary">{titularName.toUpperCase()}</span>
                                </div>
                            </div>
                            <div className="w-full space-y-2">
                                {success.npoliza && (
                                    <button onClick={() => handleDownload('POL')} disabled={downloading}
                                        className="w-full h-12 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 text-white font-black text-sm tracking-wider hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all disabled:opacity-50">
                                        {downloading ? 'Descargando...' : 'DESCARGAR PÓLIZA PDF'}
                                    </button>
                                )}
                                {success.npoliza && (
                                    <div className="flex gap-2">
                                        <button onClick={() => handleDownload('MER')} className="flex-1 h-10 rounded-xl border border-border-primary text-text-secondary font-semibold text-xs hover:bg-bg-secondary transition-all">Mercosur</button>
                                        <button onClick={() => handleDownload('TAR')} className="flex-1 h-10 rounded-xl border border-border-primary text-text-secondary font-semibold text-xs hover:bg-bg-secondary transition-all">Tarjeta Circ.</button>
                                    </div>
                                )}
                                {success.InspeccionUrl && (
                                    <button onClick={() => window.open(success.InspeccionUrl, '_blank')}
                                        className="w-full h-11 rounded-2xl bg-yellow-500 text-black font-black text-sm hover:bg-yellow-400 transition-all">
                                        REALIZAR INSPECCIÓN ONLINE
                                    </button>
                                )}
                                <button onClick={onClose} className="w-full h-11 rounded-2xl border border-border-primary text-text-secondary font-semibold text-sm hover:bg-bg-secondary transition-all">
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── FORM ── */}
                    {!loading && !success && (
                        <>
                            {error && (
                                <div className="flex items-start gap-2 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 mb-4">
                                    <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                    <p className="text-red-400 text-xs leading-relaxed">{error}</p>
                                </div>
                            )}

                            {/* ── STEP 1: Datos del titular ── */}
                            {step === 1 && (
                                <form onSubmit={handleStep1} className="space-y-4">
                                    {/* Persona type toggle */}
                                    <div className="flex rounded-2xl border border-border-primary overflow-hidden">
                                        {[['F', 'Persona Física'], ['J', 'Persona Jurídica']].map(([val, label]) => (
                                            <button key={val} type="button" onClick={() => setPersonaType(val)}
                                                className={`flex-1 py-3 text-sm font-bold transition-all duration-200
                                                    ${personaType === val ? 'bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.3)]' : 'text-text-secondary hover:text-text-primary bg-transparent'}`}>
                                                {label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Persona Física */}
                                    {personaType === 'F' && (
                                        <>
                                            <SectionLabel>Datos del titular</SectionLabel>
                                            <div className="grid grid-cols-2 gap-3">
                                                <Field label="Apellido *">
                                                    <input className={inputCls} required value={fisica.apellido} onChange={e => ff('apellido', e.target.value)} placeholder="García" />
                                                </Field>
                                                <Field label="Nombre *">
                                                    <input className={inputCls} required value={fisica.nombre} onChange={e => ff('nombre', e.target.value)} placeholder="Juan" />
                                                </Field>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <Field label="DNI *">
                                                    <input className={inputCls} required type="number" value={fisica.nrodoc} onChange={e => ff('nrodoc', e.target.value)} placeholder="30123456" />
                                                </Field>
                                                <Field label="Fecha de nacimiento *">
                                                    <input className={inputCls} required type="date" value={fisica.fecnac} onChange={e => ff('fecnac', e.target.value)} />
                                                </Field>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <Field label="Sexo *">
                                                    <select className={inputCls} value={fisica.sexo} onChange={e => ff('sexo', e.target.value)}>
                                                        <option value="M">Masculino</option>
                                                        <option value="F">Femenino</option>
                                                    </select>
                                                </Field>
                                                <Field label="Estado Civil *">
                                                    <select className={inputCls} value={fisica.estcivil} onChange={e => ff('estcivil', e.target.value)}>
                                                        <option value="1">Soltero/a</option>
                                                        <option value="2">Casado/a</option>
                                                        <option value="3">Viudo/a</option>
                                                        <option value="4">Divorciado/a</option>
                                                        <option value="5">Separado/a</option>
                                                    </select>
                                                </Field>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <Field label="Celular *">
                                                    <input className={inputCls} required value={fisica.telcel} onChange={e => ff('telcel', e.target.value.replace(/\D/g, ''))} placeholder="1112345678" />
                                                </Field>
                                                <Field label="Email *">
                                                    <input className={inputCls} required type="email" value={fisica.mail} onChange={e => ff('mail', e.target.value)} placeholder="juan@email.com" />
                                                </Field>
                                            </div>
                                            <SectionLabel>Domicilio</SectionLabel>
                                            <Field label="Localidad *">
                                                <input className={inputCls} required value={fisica.localidad} onChange={e => ff('localidad', e.target.value)} placeholder="C.A.B.A." />
                                            </Field>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="col-span-2">
                                                    <Field label="Calle *">
                                                        <input className={inputCls} required value={fisica.calle} onChange={e => ff('calle', e.target.value)} placeholder="Corrientes" />
                                                    </Field>
                                                </div>
                                                <Field label="Altura *">
                                                    <input className={inputCls} required type="number" value={fisica.altura} onChange={e => ff('altura', e.target.value)} placeholder="1234" />
                                                </Field>
                                            </div>
                                        </>
                                    )}

                                    {/* Persona Jurídica */}
                                    {personaType === 'J' && (
                                        <>
                                            <SectionLabel>Datos de la empresa</SectionLabel>
                                            <Field label="Razón Social *">
                                                <input className={inputCls} required value={juridica.razonSocial} onChange={e => fj('razonSocial', e.target.value)} placeholder="ATM S.A." />
                                            </Field>
                                            <div className="grid grid-cols-2 gap-3">
                                                <Field label="CUIT *">
                                                    <input className={inputCls} required value={juridica.cuit} onChange={e => fj('cuit', e.target.value)} placeholder="30614650067" />
                                                </Field>
                                                <Field label="Teléfono *">
                                                    <input className={inputCls} required value={juridica.telpart} onChange={e => fj('telpart', e.target.value.replace(/\D/g, ''))} placeholder="1123232323" />
                                                </Field>
                                            </div>
                                            <Field label="Email *">
                                                <input className={inputCls} required type="email" value={juridica.mail} onChange={e => fj('mail', e.target.value)} />
                                            </Field>
                                            <Field label="Localidad *">
                                                <input className={inputCls} required value={juridica.localidad} onChange={e => fj('localidad', e.target.value)} placeholder="C.A.B.A." />
                                            </Field>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="col-span-2">
                                                    <Field label="Calle *">
                                                        <input className={inputCls} required value={juridica.calle} onChange={e => fj('calle', e.target.value)} />
                                                    </Field>
                                                </div>
                                                <Field label="Altura *">
                                                    <input className={inputCls} required type="number" value={juridica.altura} onChange={e => fj('altura', e.target.value)} />
                                                </Field>
                                            </div>
                                            <SectionLabel>Representante Legal</SectionLabel>
                                            <div className="grid grid-cols-2 gap-3">
                                                <Field label="Apellido *">
                                                    <input className={inputCls} required value={juridica.repApellido} onChange={e => fj('repApellido', e.target.value)} placeholder="Alvarez" />
                                                </Field>
                                                <Field label="Nombre *">
                                                    <input className={inputCls} required value={juridica.repNombre} onChange={e => fj('repNombre', e.target.value)} placeholder="Juan" />
                                                </Field>
                                            </div>
                                            <Field label="DNI del representante *">
                                                <input className={inputCls} required type="number" value={juridica.repNrodoc} onChange={e => fj('repNrodoc', e.target.value)} placeholder="13555666" />
                                            </Field>
                                        </>
                                    )}

                                    <button type="submit"
                                        className="w-full h-12 mt-2 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 text-white font-black text-sm tracking-wider hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                        Continuar
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                    </button>
                                </form>
                            )}

                            {/* ── STEP 2: Vehículo + Pago ── */}
                            {step === 2 && (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <SectionLabel>Datos del vehículo</SectionLabel>
                                    <Field label="Patente *">
                                        <input className={inputCls} required value={veh.patente} onChange={e => fv('patente', e.target.value.toUpperCase())} placeholder="ABC123" maxLength={7} />
                                    </Field>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Nro. de Chasis *">
                                            <input className={inputCls} required value={veh.chasis} onChange={e => fv('chasis', e.target.value.toUpperCase())} placeholder="8-17 car." />
                                        </Field>
                                        <Field label="Nro. de Motor *">
                                            <input className={inputCls} required value={veh.motor} onChange={e => fv('motor', e.target.value.toUpperCase())} placeholder="5-15 car." />
                                        </Field>
                                    </div>

                                    <SectionLabel>Forma de pago</SectionLabel>

                                    {availableMethods.length > 1 ? (
                                        <div className="flex rounded-2xl border border-border-primary overflow-hidden">
                                            {availableMethods.map(tipo => (
                                                <button key={tipo} type="button" onClick={() => setPagoTipo(tipo)}
                                                    className={`flex-1 py-3 text-sm font-bold transition-all duration-200
                                                        ${pagoTipo === tipo ? 'bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.3)]' : 'text-text-secondary hover:text-text-primary bg-transparent'}`}>
                                                    {tipo === 'EFVO' ? 'Efectivo' : tipo === 'CBU' ? 'CBU / Débito' : 'Tarjeta'}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="px-3 py-2 rounded-xl bg-bg-secondary border border-border-primary text-text-secondary text-sm font-semibold">
                                            {pagoTipo === 'EFVO' ? 'Efectivo' : pagoTipo === 'CBU' ? 'CBU / Débito automático' : 'Tarjeta de crédito'}
                                        </div>
                                    )}

                                    {isFullOnline ? (
                                        <>
                                            {pagoTipo === 'CBU' && (
                                                <Field label="Número de CBU *">
                                                    <input className={inputCls} required value={cbuNum} onChange={e => setCbuNum(e.target.value.replace(/\D/g, ''))} placeholder="22 dígitos de tu CBU" maxLength={22} />
                                                </Field>
                                            )}
                                            {pagoTipo === 'TARJETA' && (
                                                <div className="space-y-3">
                                                    <Field label="Tipo de tarjeta *">
                                                        <select className={inputCls} value={tarjeta.nombre} onChange={e => ft('nombre', e.target.value)}>
                                                            <option value="2">VISA</option>
                                                            <option value="3">MASTERCARD</option>
                                                            <option value="11">AMEX</option>
                                                            <option value="4">CABAL</option>
                                                        </select>
                                                    </Field>
                                                    <Field label="Número de tarjeta *">
                                                        <input className={inputCls} required value={tarjeta.numero} onChange={e => ft('numero', e.target.value.replace(/\D/g, ''))} placeholder="XXXX XXXX XXXX XXXX" maxLength={16} />
                                                    </Field>
                                                    <Field label="Vencimiento (MMAAAA) *">
                                                        <input className={inputCls} required value={tarjeta.vcto} onChange={e => ft('vcto', e.target.value.replace(/\D/g, '').substring(0, 6))} placeholder="122027" maxLength={6} />
                                                        <span className="text-[10px] text-text-secondary pl-1">Formato: MMAAAA (ej: 122027)</span>
                                                    </Field>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex items-start gap-3 p-3 rounded-2xl bg-orange-500/5 border border-orange-500/15">
                                            <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                                            <p className="text-xs text-text-secondary">Los datos de pago los coordinarás con un asesor vía WhatsApp.</p>
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-2">
                                        <button type="button" onClick={() => setStep(1)}
                                            className="h-12 px-5 rounded-2xl border border-border-primary text-text-secondary font-semibold text-sm hover:bg-bg-secondary transition-all flex items-center gap-2">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                                            Volver
                                        </button>
                                        <button type="submit" disabled={loading}
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

// ── Sub-components ─────────────────────────────────────────────────────────────
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

export default ATMProposalModal;
