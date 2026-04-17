// @ts-nocheck
import { useState } from 'react';
import { generarPropuestaATM, descargarPolizaATM } from '../../services/motoApi';

// ─── Style helpers ────────────────────────────────────────────────────────────
const inputS = {
    width: '100%', padding: '10px 14px',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px', color: '#fff',
    fontSize: '0.9rem', boxSizing: 'border-box'
};
const labelS = { display: 'block', marginBottom: '4px', fontSize: '0.8rem', color: '#aaa' };
const groupS = { marginBottom: '14px' };
const sectionS = {
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    paddingBottom: '5px', marginBottom: '14px', marginTop: '10px',
    fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', color: '#fb923c'
};

function Grid({ cols = '1fr 1fr', children }) {
    return <div className="responsive-grid" style={{ gridTemplateColumns: cols }}>{children}</div>;
}

// ─── Main Component ───────────────────────────────────────────────────────────
function ATMProposalModal({ isOpen, onClose, cobertura, atmOperacion, vehicleInfo, zipCode, payWithCard }) {
    const [loading, setLoading]   = useState(false);
    const [success, setSuccess]   = useState(null);
    const [error, setError]       = useState(null);
    const [downloading, setDownloading] = useState(false);

    // Determine if the coverage supports full online emission (RC only)
    const rcCodes = ['A0', 'A1']; // ATM RC codes
    const isFullOnline = rcCodes.includes(cobertura?.codigo);

    const descName = (cobertura?.descripcion || '').toUpperCase().trim();
    const isRC = descName.includes('RESPONSABILIDAD CIVIL') || descName.startsWith('RCM');
    const discountFactor = payWithCard ? (isRC ? 0.85 : 0.70) : 1.0;

    const originalPremio = parseFloat(cobertura?.premio || 0);
    const discountedPremio = originalPremio * discountFactor;
    
    const cuotasCount = parseInt(cobertura?.cuotas || 1);
    const originalImpcuotas = parseFloat(cobertura?.impcuotas || 0);
    const discountedImpcuotas = originalImpcuotas * discountFactor;
    
    const priceStr = cuotasCount > 1
        ? `${cuotasCount} cuotas de $${discountedImpcuotas.toLocaleString('es-AR', { minimumFractionDigits: 2 })} (Total: $${discountedPremio.toLocaleString('es-AR', { minimumFractionDigits: 2 })})`
        : `$${discountedPremio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

    const handleDownload = async (reporte = 'POL') => {
        if (!success?.npoliza) return;
        setDownloading(true);
        try {
            const result = await descargarPolizaATM({ npoliza: success.npoliza, reporte, seccion: 4 });
            if (result?.data?.archivo) {
                const link = document.createElement('a');
                link.href = `data:application/pdf;base64,${result.data.archivo}`;
                link.download = result.data.nombre || `poliza_${success.npoliza}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                alert('No se pudo descargar el documento.');
            }
        } catch (err) {
            alert(err.message || 'Error al descargar el documento.');
        } finally {
            setDownloading(false);
        }
    };

    // ── Persona type ──────────────────────────────────────────────────────────
    const [personaType, setPersonaType] = useState('F'); // 'F' | 'J'

    // ── Titular Física ────────────────────────────────────────────────────────
    const [fisica, setFisica] = useState({
        apellido: '', nombre: '', nrodoc: '', fecnac: '', sexo: 'M', estcivil: '1',
        telcel: '', mail: '', localidad: '', calle: '', altura: ''
    });
    const ff = (k, v) => setFisica(p => ({ ...p, [k]: v }));

    // ── Titular Jurídica ──────────────────────────────────────────────────────
    const [juridica, setJuridica] = useState({
        razonSocial: '', cuit: '', telpart: '', mail: '',
        localidad: '', calle: '', altura: '',
        repTipodoc: 'DNI', repNrodoc: '', repApellido: '', repNombre: ''
    });
    const fj = (k, v) => setJuridica(p => ({ ...p, [k]: v }));

    // ── Vehículo ──────────────────────────────────────────────────────────────
    const [veh, setVeh] = useState({ patente: '', chasis: '', motor: '' });
    const fv = (k, v) => setVeh(p => ({ ...p, [k]: v }));

    // ── Forma de pago ─────────────────────────────────────────────────────────
    // Payment options come from the cotización grouped by coverage code (excluding EFVO)
    const paymentOptions = cobertura?.paymentOptions || [];
    const availableMethods = paymentOptions.map(po => po.formapago).filter(m => m !== 'EFVO');
    
    // Default to CBU, or TARJETA if CBU isn't available
    const initialPago = availableMethods.includes('CBU') ? 'CBU' : (availableMethods[0] || 'EFVO');
    const [pagoTipo, setPagoTipo] = useState(initialPago); // 'CBU' | 'TARJETA'
    const [cbuNum, setCbuNum]     = useState('');
    const [tarjeta, setTarjeta]   = useState({ numero: '', vcto: '', nombre: '2' }); // nombre=2 default
    // NOTE: Based on documentation examples, '2' might be MasterCard. We will allow user to select.
    const ft = (k, v) => setTarjeta(p => ({ ...p, [k]: v }));

    const fmtDate = (iso) => {
        if (!iso) return '';
        const [y, m, d] = iso.split('-');
        return `${d}${m}${y}`;
    };

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const isJuridica = personaType === 'J';
            const localidad  = isJuridica ? juridica.localidad : fisica.localidad;

            // Build titular shape
            const titularPayload = isJuridica
                ? {
                    tipopersona: 'J',
                    tipodoc: 'CUIT',
                    nrodoc: juridica.cuit,
                    apellido: juridica.razonSocial.toUpperCase(),
                    localidad,
                    calle: juridica.calle.toUpperCase(),
                    altura: juridica.altura,
                    telpart: juridica.telpart,
                    telcel: juridica.telpart, // fallback
                    actividad: '2',
                    mail: juridica.mail,
                    repTipodoc: juridica.repTipodoc,
                    repNrodoc: juridica.repNrodoc,
                    repApellido: juridica.repApellido.toUpperCase(),
                    repNombre: juridica.repNombre.toUpperCase()
                }
                : {
                    tipopersona: 'F',
                    tipodoc: 'DNI',
                    nrodoc: fisica.nrodoc,
                    apellido: fisica.apellido.toUpperCase(),
                    nombre: fisica.nombre.toUpperCase(),
                    localidad,
                    calle: fisica.calle.toUpperCase(),
                    altura: fisica.altura,
                    telcel: fisica.telcel,
                    sexo: fisica.sexo,
                    estcivil: fisica.estcivil,
                    nacionalidad: '0',
                    actividad: '2',
                    mail: fisica.mail,
                    fecnac: fmtDate(fisica.fecnac)
                };

            if (!isFullOnline) {
                // WhatsApp Redirection Flow
                const titularName = isJuridica
                    ? juridica.razonSocial.toUpperCase()
                    : `${fisica.nombre.toUpperCase()} ${fisica.apellido.toUpperCase()}`;
                const titularPhone = isJuridica ? juridica.telpart : fisica.telcel;

                const msg = `¡Quiero contratar!
Vehículo: ${vehicleInfo?.brand} ${vehicleInfo?.model} ${vehicleInfo?.version} ${vehicleInfo?.year}
Aseguradora: ATM Seguros
Plan: ${cobertura.descripcion}
Precio: ${priceStr}
Teléfono: ${titularPhone}
Pago con: ${pagoTipo === 'EFVO' ? 'Efectivo' : pagoTipo === 'CBU' ? 'CBU' : 'Tarjeta de Crédito'}`;

                const waUrl = `https://wa.me/5491156307246?text=${encodeURIComponent(msg)}`;
                window.open(waUrl, '_blank');
                onClose();
                return;
            }

            // cond_pago MUST match the cotización's formapago value exactly.
            // pagoTipo holds the selected formapago from the cotización options.
            const condPago = pagoTipo; // e.g. "EFVO", "CBU", "TARJETA"
            let formapagoPayload;

            if (condPago === 'CBU') {
                formapagoPayload = { tipo: 'cbu', forma: '4', cbu: { numero: cbuNum } };
            } else if (condPago === 'TARJETA') {
                // Ensure vcto is exactly 6 digits (MMAAAA)
                let cleanVcto = tarjeta.vcto.replace(/\D/g, '');
                if (cleanVcto.length === 4) {
                    // Try to assume MMYY -> MM20YY
                    const mm = cleanVcto.substring(0, 2);
                    const yy = cleanVcto.substring(2, 4);
                    cleanVcto = `${mm}20${yy}`;
                }
                formapagoPayload = { tipo: 'tarjeta', forma: '2', tarjeta: { nombre: tarjeta.nombre, numero: tarjeta.numero, vcto: cleanVcto } };
            } else {
                // EFVO or any other — no payment details needed
                formapagoPayload = { tipo: 'efvo', forma: '1' };
            }

            const payload = {
                operacion: String(atmOperacion),
                codigoCobertura: cobertura.codigo,
                condPago: condPago,
                titular: titularPayload,
                vehiculo: {
                    patente: veh.patente.toUpperCase(),
                    chasis: veh.chasis.toUpperCase(),
                    motor: veh.motor.toUpperCase()
                },
                formapago: formapagoPayload,
                codpostal: zipCode
            };

            const result = await generarPropuestaATM(payload);
            // Backend returns { success: true, data: { auto: { statusSuccess, ... } } }
            const auto = result?.data?.auto ?? result?.auto ?? result;

            if (auto?.statusSuccess === 'TRUE') {
                setSuccess(auto);
            } else {
                const msg = typeof auto?.statusText === 'object' 
                    ? auto.statusText.msg 
                    : auto?.statusText;
                setError(msg || 'ATM rechazó la propuesta. Revisá los datos.');
            }
        } catch (err) {
            setError(err.message || 'Error al generar la propuesta con ATM.');
        } finally {
            setLoading(false);
        }
    };

    // ─── Tab toggle ───────────────────────────────────────────────────────────
    const tabBtn = (type, label) => (
        <button type="button" onClick={() => setPersonaType(type)} style={{
            flex: 1, padding: '8px', border: 'none', borderRadius: '6px',
            background: personaType === type ? '#fb923c' : 'rgba(255,255,255,0.07)',
            color: personaType === type ? '#fff' : '#aaa',
            cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
        }}>{label}</button>
    );

    const pagoBtn = (tipo, label) => (
        <button type="button" onClick={() => setPagoTipo(tipo)} style={{
            flex: 1, padding: '8px', border: 'none', borderRadius: '6px',
            background: pagoTipo === tipo ? '#6366f1' : 'rgba(255,255,255,0.07)',
            color: pagoTipo === tipo ? '#fff' : '#aaa',
            cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem'
        }}>{label}</button>
    );

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                background: '#1a1a1a', border: '1px solid rgba(251,146,60,0.25)',
                borderRadius: '16px', padding: '28px',
                width: '95%', maxWidth: '520px', maxHeight: '92vh',
                overflowY: 'auto', position: 'relative'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: '14px', right: '14px',
                    background: 'none', border: 'none', color: '#aaa',
                    fontSize: '1.4rem', cursor: 'pointer'
                }}>×</button>

                <h2 style={{ margin: '0 0 4px 0', color: '#fb923c' }}>Contratar con ATM</h2>

                {/* Coverage summary */}
                <div style={{
                    background: 'rgba(251,146,60,0.08)', borderRadius: '8px',
                    padding: '10px 14px', marginBottom: '18px',
                    border: '1px solid rgba(251,146,60,0.15)', fontSize: '0.85rem'
                }}>
                    <strong style={{ color: '#fff' }}>{cobertura?.descripcion}</strong>
                    <div style={{ color: '#fb923c', fontWeight: 700, fontSize: '1.1rem', marginTop: '3px' }}>
                        ${discountedPremio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        {payWithCard && (
                            <span style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 400, marginLeft: '8px' }}>
                                (con descuento)
                            </span>
                        )}
                        {cuotasCount > 1 && (
                            <span style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 400, marginLeft: '8px', display: 'block', marginTop: '4px' }}>
                                {cuotasCount} cuotas de ${discountedImpcuotas.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </span>
                        )}
                    </div>
                    <div style={{ color: '#888', fontSize: '0.75rem', marginTop: '2px' }}>
                        {cobertura?.formapago} · Op: {atmOperacion}
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="spinner" />
                        <p style={{ color: '#aaa', marginTop: '12px' }}>Procesando con ATM Seguros...</p>
                    </div>
                ) : success ? (
                    <div className="fade-in" style={{ textAlign: 'center', padding: '10px 0 20px 0' }}>
                        <div style={{ 
                            width: '64px', height: '64px', background: 'rgba(251,146,60,0.15)', 
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px auto', color: '#fb923c', border: '1px solid rgba(251,146,60,0.3)'
                        }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        
                        <h2 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '8px', letterSpacing: '1px' }}>¡EMISIÓN EXITOSA!</h2>
                        <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.5' }}>
                            Gracias por tu compra. La póliza se ha emitido correctamente y ya puedes descargar el certificado profesional.
                        </p>

                        <div style={{ 
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '12px', padding: '16px', marginBottom: '24px', textAlign: 'left'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                                <span style={{ color: '#888' }}>Póliza N°:</span>
                                <strong style={{ color: '#fff' }}>{success.npoliza || success.npropuesta}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                                <span style={{ color: '#888' }}>Estado:</span>
                                <span style={{ color: '#fb923c', fontWeight: 700 }}>
                                    {success.statusText === 'POL' ? 'EMITIDA' : success.statusText === 'PRO' ? 'ACEPTADA' : success.statusText === 'INS' ? 'PEND. INSPECCIÓN' : 'PROCESADA'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span style={{ color: '#888' }}>Titular:</span>
                                <strong style={{ color: '#fff' }}>
                                    {personaType === 'J' ? juridica.razonSocial.toUpperCase() : `${fisica.apellido.toUpperCase()}, ${fisica.nombre.toUpperCase()}`}
                                </strong>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {success.npoliza && (
                                <button 
                                    onClick={() => handleDownload('POL')} 
                                    disabled={downloading}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        padding: '14px', background: '#fb923c', color: '#fff', border: 'none',
                                        borderRadius: '10px', cursor: downloading ? 'wait' : 'pointer', fontWeight: 700,
                                        fontSize: '0.9rem', transition: 'all 0.2s', width: '100%'
                                    }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                    {downloading ? 'DESCARGANDO...' : 'DESCARGAR PÓLIZA PDF'}
                                </button>
                            )}
                            
                            {success.npoliza && (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => handleDownload('MER')} style={{ 
                                        flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', color: '#ccc', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600
                                    }}>Mercosur</button>
                                    <button onClick={() => handleDownload('TAR')} style={{ 
                                        flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', color: '#ccc', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600
                                    }}>Tarjeta Circ.</button>
                                </div>
                            )}

                            {success.InspeccionUrl && (
                                <button onClick={() => window.open(success.InspeccionUrl, '_blank')} style={{ 
                                    padding: '12px', background: '#eab308', color: '#000', border: 'none',
                                    borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem'
                                }}>
                                    REALIZAR INSPECCIÓN ONLINE
                                </button>
                            )}
                            
                            <button onClick={onClose} style={{ 
                                padding: '12px', background: 'transparent', color: '#aaa', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', marginTop: success.npoliza ? '0' : '10px'
                            }}>
                                Salir
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{
                                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: '8px', padding: '10px 14px', marginBottom: '14px',
                                color: '#fca5a5', fontSize: '0.85rem'
                            }}>{error}</div>
                        )}

                        {/* Persona type toggle */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
                            {tabBtn('F', 'Persona Física')}
                            {tabBtn('J', 'Persona Jurídica')}
                        </div>

                        {/* ── PERSONA FÍSICA ── */}
                        {personaType === 'F' && (
                            <>
                                <p style={sectionS}>DATOS DEL TITULAR</p>
                                <Grid>
                                    <div style={groupS}>
                                        <label style={labelS}>Apellido *</label>
                                        <input style={inputS} required value={fisica.apellido}
                                            onChange={e => ff('apellido', e.target.value)} placeholder="GARCÍA" />
                                    </div>
                                    <div style={groupS}>
                                        <label style={labelS}>Nombre *</label>
                                        <input style={inputS} required value={fisica.nombre}
                                            onChange={e => ff('nombre', e.target.value)} placeholder="JUAN" />
                                    </div>
                                </Grid>
                                <Grid>
                                    <div style={groupS}>
                                        <label style={labelS}>DNI *</label>
                                        <input style={inputS} required type="number" value={fisica.nrodoc}
                                            onChange={e => ff('nrodoc', e.target.value)} placeholder="30123456" />
                                    </div>
                                </Grid>
                                <Grid>
                                    <div style={groupS}>
                                        <label style={labelS}>Fecha de nacimiento *</label>
                                        <input style={inputS} required type="date" value={fisica.fecnac}
                                            onChange={e => ff('fecnac', e.target.value)} />
                                    </div>
                                    <div style={groupS}>
                                        <label style={labelS}>Sexo *</label>
                                        <select style={inputS} value={fisica.sexo} onChange={e => ff('sexo', e.target.value)}>
                                            <option value="M">Masculino</option>
                                            <option value="F">Femenino</option>
                                        </select>
                                    </div>
                                </Grid>
                                <Grid>
                                    <div style={groupS}>
                                        <label style={labelS}>Estado Civil *</label>
                                        <select style={inputS} value={fisica.estcivil} onChange={e => ff('estcivil', e.target.value)}>
                                            <option value="1">Soltero/a</option>
                                            <option value="2">Casado/a</option>
                                            <option value="3">Viudo/a</option>
                                            <option value="4">Divorciado/a</option>
                                            <option value="5">Separado/a</option>
                                        </select>
                                    </div>
                                </Grid>
                                <Grid>
                                    <div style={groupS}>
                                        <label style={labelS}>Celular *</label>
                                        <input style={inputS} required value={fisica.telcel}
                                            onChange={e => ff('telcel', e.target.value.replace(/\D/g, ''))} placeholder="1112345678" />
                                    </div>
                                    <div style={groupS}>
                                        <label style={labelS}>Email *</label>
                                        <input style={inputS} required type="email" value={fisica.mail}
                                            onChange={e => ff('mail', e.target.value)} />
                                    </div>
                                </Grid>
                                <div style={groupS}>
                                    <label style={labelS}>Localidad *</label>
                                    <input style={inputS} required value={fisica.localidad}
                                        onChange={e => ff('localidad', e.target.value)} placeholder="C.A.B.A." />
                                </div>
                                <Grid cols="2fr 1fr">
                                    <div style={groupS}>
                                        <label style={labelS}>Calle *</label>
                                        <input style={inputS} required value={fisica.calle}
                                            onChange={e => ff('calle', e.target.value)} placeholder="CORRIENTES" />
                                    </div>
                                    <div style={groupS}>
                                        <label style={labelS}>Altura *</label>
                                        <input style={inputS} required type="number" value={fisica.altura}
                                            onChange={e => ff('altura', e.target.value)} placeholder="1234" />
                                    </div>
                                </Grid>
                            </>
                        )}

                        {/* ── PERSONA JURÍDICA ── */}
                        {personaType === 'J' && (
                            <>
                                <p style={sectionS}>DATOS DEL TITULAR (EMPRESA)</p>
                                <div style={groupS}>
                                    <label style={labelS}>Razón Social *</label>
                                    <input style={inputS} required value={juridica.razonSocial}
                                        onChange={e => fj('razonSocial', e.target.value)} placeholder="ATM S.A." />
                                </div>
                                <Grid>
                                    <div style={groupS}>
                                        <label style={labelS}>CUIT *</label>
                                        <input style={inputS} required value={juridica.cuit}
                                            onChange={e => fj('cuit', e.target.value)} placeholder="30614650067" />
                                    </div>
                                    <div style={groupS}>
                                        <label style={labelS}>Teléfono *</label>
                                        <input style={inputS} required value={juridica.telpart}
                                            onChange={e => fj('telpart', e.target.value.replace(/\D/g, ''))} placeholder="1123232323" />
                                    </div>
                                </Grid>
                                <div style={groupS}>
                                    <label style={labelS}>Email *</label>
                                    <input style={inputS} required type="email" value={juridica.mail}
                                        onChange={e => fj('mail', e.target.value)} />
                                </div>
                                <div style={groupS}>
                                    <label style={labelS}>Localidad *</label>
                                    <input style={inputS} required value={juridica.localidad}
                                        onChange={e => fj('localidad', e.target.value)} placeholder="C.A.B.A." />
                                </div>
                                <Grid cols="2fr 1fr">
                                    <div style={groupS}>
                                        <label style={labelS}>Calle *</label>
                                        <input style={inputS} required value={juridica.calle}
                                            onChange={e => fj('calle', e.target.value)} />
                                    </div>
                                    <div style={groupS}>
                                        <label style={labelS}>Altura *</label>
                                        <input style={inputS} required type="number" value={juridica.altura}
                                            onChange={e => fj('altura', e.target.value)} />
                                    </div>
                                </Grid>

                                <p style={sectionS}>REPRESENTANTE LEGAL</p>
                                <Grid>
                                    <div style={groupS}>
                                        <label style={labelS}>Apellido *</label>
                                        <input style={inputS} required value={juridica.repApellido}
                                            onChange={e => fj('repApellido', e.target.value)} placeholder="ALVAREZ" />
                                    </div>
                                    <div style={groupS}>
                                        <label style={labelS}>Nombre *</label>
                                        <input style={inputS} required value={juridica.repNombre}
                                            onChange={e => fj('repNombre', e.target.value)} placeholder="JUAN" />
                                    </div>
                                </Grid>
                                <div style={groupS}>
                                    <label style={labelS}>DNI del representante *</label>
                                    <input style={inputS} required type="number" value={juridica.repNrodoc}
                                        onChange={e => fj('repNrodoc', e.target.value)} placeholder="13555666" />
                                </div>
                            </>
                        )}

                        {/* ── VEHÍCULO ── */}
                        <p style={sectionS}>DATOS DEL VEHÍCULO</p>
                        <Grid>
                            <div style={groupS}>
                                <label style={labelS}>Patente *</label>
                                <input style={inputS} required value={veh.patente}
                                    onChange={e => fv('patente', e.target.value.toUpperCase())}
                                    placeholder="ABC123" maxLength={7} />
                            </div>
                            <div style={groupS}>
                                <label style={labelS}>Nro Motor *</label>
                                <input style={inputS} required value={veh.motor}
                                    onChange={e => fv('motor', e.target.value.toUpperCase())} />
                            </div>
                        </Grid>
                        <div style={groupS}>
                            <label style={labelS}>Nro Chasis *</label>
                            <input style={inputS} required value={veh.chasis}
                                onChange={e => fv('chasis', e.target.value.toUpperCase())} />
                        </div>

                        {/* ── FORMA DE PAGO ── */}
                        <p style={sectionS}>FORMA DE PAGO</p>

                        {/* Payment method selector — only show toggle when multiple options */}
                        {availableMethods.length > 1 && (
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                                {availableMethods.includes('EFVO') && (
                                    <button type="button" onClick={() => setPagoTipo('EFVO')} style={{
                                        flex: 1, padding: '8px', border: 'none', borderRadius: '6px',
                                        background: pagoTipo === 'EFVO' ? '#fb923c' : 'rgba(255,255,255,0.07)',
                                        color: pagoTipo === 'EFVO' ? '#fff' : '#aaa',
                                        cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem'
                                    }}>Efectivo</button>
                                )}
                                {availableMethods.includes('CBU') && (
                                    <button type="button" onClick={() => setPagoTipo('CBU')} style={{
                                        flex: 1, padding: '8px', border: 'none', borderRadius: '6px',
                                        background: pagoTipo === 'CBU' ? '#6366f1' : 'rgba(255,255,255,0.07)',
                                        color: pagoTipo === 'CBU' ? '#fff' : '#aaa',
                                        cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem'
                                    }}>CBU</button>
                                )}
                                {availableMethods.includes('TARJETA') && (
                                    <button type="button" onClick={() => setPagoTipo('TARJETA')} style={{
                                        flex: 1, padding: '8px', border: 'none', borderRadius: '6px',
                                        background: pagoTipo === 'TARJETA' ? '#6366f1' : 'rgba(255,255,255,0.07)',
                                        color: pagoTipo === 'TARJETA' ? '#fff' : '#aaa',
                                        cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem'
                                    }}>Tarjeta</button>
                                )}
                            </div>
                        )}

                        {isFullOnline && (
                            <>

                                {pagoTipo === 'CBU' && (
                                    <div style={groupS}>
                                        <label style={labelS}>Número de CBU *</label>
                                        <input style={inputS} required value={cbuNum}
                                            onChange={e => setCbuNum(e.target.value.replace(/\D/g, ''))}
                                            placeholder="22 dígitos de tu CBU" maxLength={22} />
                                    </div>
                                )}

                                {pagoTipo === 'TARJETA' && (
                                    <>
                                        <div style={groupS}>
                                            <label style={labelS}>Tipo de Tarjeta *</label>
                                            <select style={inputS} value={tarjeta.nombre} onChange={e => ft('nombre', e.target.value)}>
                                                <option value="2">VISA</option>
                                                <option value="3">MASTERCARD</option>
                                                <option value="11">AMEX</option>
                                                <option value="4">CABAL</option>
                                            </select>
                                        </div>
                                        <div style={groupS}>
                                            <label style={labelS}>Número de Tarjeta *</label>
                                            <input style={inputS} required value={tarjeta.numero}
                                                onChange={e => ft('numero', e.target.value.replace(/\D/g, ''))}
                                                placeholder="XXXX XXXX XXXX XXXX" maxLength={16} />
                                        </div>
                                        <div style={groupS}>
                                            <label style={labelS}>Vencimiento (MMAAAA) *</label>
                                            <input style={inputS} required value={tarjeta.vcto}
                                                onChange={e => ft('vcto', e.target.value.replace(/\D/g, '').substring(0, 6))}
                                                placeholder="122027" maxLength={6} />
                                            <span style={{ fontSize: '0.72rem', color: '#888', marginTop: '3px', display: 'block' }}>
                                                Formato: MMAAAA (ej: 122027)
                                            </span>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                        
                        {!isFullOnline && (
                            <div style={{
                                display: 'flex', gap: '8px', alignItems: 'center',
                                background: 'rgba(59,130,246,0.1)', borderRadius: '8px',
                                padding: '12px 16px', marginBottom: '14px', borderLeft: '3px solid #3b82f6',
                                color: '#aaa', fontSize: '0.85rem'
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                <span>Los datos de pago los coordinarás vía WhatsApp con un asesor.</span>
                            </div>
                        )}


                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '14px',
                            background: loading ? '#888' : '#fb923c', border: 'none', borderRadius: '10px',
                            color: '#fff', fontWeight: 700, fontSize: '1rem',
                            cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px',
                            boxShadow: loading ? 'none' : '0 6px 20px rgba(251,146,60,0.35)',
                            opacity: loading ? 0.6 : 1
                        }}>
                            {loading ? 'PROCESANDO...' : 'CONFIRMAR CONTRATACIÓN ATM'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ATMProposalModal;
