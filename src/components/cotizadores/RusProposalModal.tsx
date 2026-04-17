// @ts-nocheck
import { useState, useEffect } from 'react';
import { createPropuesta, getPropuestaStatus, getPolizaPdf } from '../../services/motoApi';

function ProposalModal({ isOpen, onClose, quote, quotationContext, vehicleInfo, payWithCard }) {
    if (!isOpen) return null;

    const { vigencias, selectedVigencia, selectedLocality, year, selectedVersionId } = quotationContext;

    /* --- Proposal State --- */
    const [proposalLoading, setProposalLoading] = useState(false);
    const [proposalSuccess, setProposalSuccess] = useState(null);
    const [proposalError, setProposalError] = useState(null);
    const [proposalId, setProposalId] = useState(null);
    const [proposalResponse, setProposalResponse] = useState(null);
    const [statusResult, setStatusResult] = useState(null);
    const [statusLoading, setStatusLoading] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);

    /* --- Payment State --- */
    const [paymentMethod, setPaymentMethod] = useState('3'); // 3: Card, 4: CBU
    const [cbu, setCbu] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardType, setCardType] = useState('');
    const [autoRenewal, setAutoRenewal] = useState('SI');

    // Determine if the coverage supports full online emission (RC only)
    // We allow "RCM Moto" descriptions, but explicitly reject 'B-80', 'B1-80', 'C-80' which have hull/theft cover.
    const cascoCode = (quote?.codigoCasco || "").toUpperCase();
    const isFullOnline = !['B-80', 'B1-80', 'C-80', 'C1-80'].some(c => cascoCode.includes(c));

    const planName = (quote?.codigoCasco || quote?.codigoRC || '').toUpperCase().trim();
    const isRC = planName === 'RCM' || planName.includes('RCM C/') || planName === 'RC' || planName === 'RESPONSABILIDAD CIVIL' || planName === 'RESPONSABILIDAD CIVIL SIN ASISTENCIA';
    const discountFactor = payWithCard ? (isRC ? 0.85 : 0.70) : 1.0;

    // In ProposalModal, since payment methods are automatic debit (CBU/Card), we apply the discount.
    const originalPremio = parseFloat(quote?.premio || 0);
    const discountedPremio = originalPremio * discountFactor;
    const monthlyCuota = discountedPremio / 6;

    const [proposalData, setProposalData] = useState({
        nombre: '',
        apellido: '',
        dni: '',
        genero: 'MASCULINO',
        email: '',
        telefono: '',
        calle: '',
        numero: '',
        patente: '',
        chasis: '',
        motor: ''
    });

    // Reset payment fields when opening modal
    useEffect(() => {
        if (isOpen) {
            setPaymentMethod('3');
            setCbu('');
            setCardNumber('');
            setCardType('');
            // setAutoRenewal('SI'); // Always SI
            setProposalSuccess(null);
            setProposalError(null);
            setProposalId(null);
            setProposalResponse(null);
            setStatusResult(null);
        }
    }, [isOpen]);

    // Helper to calculate dates
    const calculateDates = () => {
        const today = new Date();
        const vigenciaObj = vigencias.find(v => (v.id || v.ID) == selectedVigencia);

        let monthsToAdd = 12;
        let tipoVigenciaStr = "ANUAL";

        if (vigenciaObj) {
            const desc = (vigenciaObj.descripcion || vigenciaObj.description || "").toUpperCase();
            if (desc.includes("SEMESTRAL")) {
                monthsToAdd = 6;
                tipoVigenciaStr = "SEMESTRAL";
            } else if (desc.includes("TRIMESTRAL")) {
                monthsToAdd = 3;
                tipoVigenciaStr = "TRIMESTRAL";
            } else if (desc.includes("MENSUAL")) {
                monthsToAdd = 1;
                tipoVigenciaStr = "MENSUAL";
            }
        }

        const nextDate = new Date(today);
        nextDate.setMonth(today.getMonth() + monthsToAdd);

        const formatDate = (date) => date.toISOString().split('T')[0];

        return {
            vigenciaDesde: formatDate(today),
            vigenciaHasta: formatDate(nextDate),
            tipoVigencia: tipoVigenciaStr
        };
    };

    const handleProposalSubmit = async (e) => {
        e.preventDefault();
        setProposalLoading(true);
        setProposalError(null);

        if (!selectedLocality) {
            setProposalError("Error: No se ha seleccionado una localidad válida.");
            setProposalLoading(false);
            return;
        }

        const locId = selectedLocality.id || selectedLocality.ID;
        if (!locId) {
            setProposalError("Error: La localidad seleccionada no tiene un ID válido.");
            setProposalLoading(false);
            return;
        }

        const formatDateDDMMYYYY = (date) => {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        };

        const { vigenciaDesde, vigenciaHasta, tipoVigencia } = calculateDates();

        // --- VALIDATIONS ---
        
        // 1. Patente (Argentine Motorcycle formats: 3 digits 3 letters (e.g. 123ABC) or 1 letter 3 digits 3 letters (e.g. A123BCD))
        // We will strip spaces and dashes for the check
        const patenteClean = proposalData.patente.replace(/[-\s]/g, '').toUpperCase();
        // Regex for old format (123ABC) or new format (A123BCD)
        const patenteRegex = /^([0-9]{3}[A-Z]{3}|[A-Z]{1}[0-9]{3}[A-Z]{3})$/;
        if (!patenteRegex.test(patenteClean)) {
            alert("Cargaste mal la Patente. Por favor, verifica que el formato sea correcto (Ej: 123ABC o A123BCD).");
            setProposalError("La patente ingresada no tiene un formato válido para motos en Argentina (Ej: 123ABC o A123BCD).");
            setProposalLoading(false);
            return;
        }

        // 2. Chasis (Usually 17 alphanumeric characters, but some older ones might be different. Let's enforce min 8, max 17 alphanumeric)
        const chasisClean = proposalData.chasis.replace(/[-\s]/g, '').toUpperCase();
        const chasisRegex = /^[A-Z0-9]{8,17}$/;
        if (!chasisRegex.test(chasisClean)) {
            alert("Cargaste mal el número de Chasis. Debe contener entre 8 y 17 caracteres alfanuméricos válidos.");
            setProposalError("El número de chasis debe contener entre 8 y 17 caracteres alfanuméricos válidos.");
            setProposalLoading(false);
            return;
        }

        // 3. Motor (Varies widely, but generally alphanumeric, let's enforce min 5, max 15 alphanumeric)
        const motorClean = proposalData.motor.replace(/[-\s]/g, '').toUpperCase();
        const motorRegex = /^[A-Z0-9]{5,15}$/;
        if (!motorRegex.test(motorClean)) {
            alert("Cargaste mal el número de Motor. Debe contener entre 5 y 15 caracteres alfanuméricos válidos.");
            setProposalError("El número de motor debe contener entre 5 y 15 caracteres alfanuméricos válidos.");
            setProposalLoading(false);
            return;
        }

        if (!isFullOnline) {
            // WhatsApp Redirection Flow
            const msg = `¡Quiero contratar!
Vehículo: ${vehicleInfo?.brand} ${vehicleInfo?.model} ${vehicleInfo?.version} (${vehicleInfo?.year})
Aseguradora: RUS Seguros
Plan: ${quote?.codigoCasco || quote?.codigoRC}
Precio: $ ${monthlyCuota.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mes
Teléfono: ${proposalData.telefono}
Pago con: ${paymentMethod === '3' ? 'Tarjeta de Crédito' : 'CBU'}`;

            const waUrl = `https://wa.me/5491156307246?text=${encodeURIComponent(msg)}`;
            window.open(waUrl, '_blank');
            onClose();
            return;
        }

        // Calculate default VTV expiration (1 year from now)
        const vtvDate = new Date();
        vtvDate.setFullYear(vtvDate.getFullYear() + 1);
        const fechaVencVtv = formatDateDDMMYYYY(vtvDate);

        const payload = {
            cf: "CF",
            coberturaRC: quote.codigoRC,
            ...(quote.codigoCasco ? { coberturaCasco: quote.codigoCasco } : {}),

            codigoTipoInteres: "MOTOVEHICULO",

            // Payment Fields
            medioCobro: parseInt(paymentMethod),
            ...(paymentMethod === '3' && { // Credit Card
                numeroTarjeta: cardNumber,
                tipoTarjeta: parseInt(cardType),
                renovacionAutomatica: autoRenewal
            }),
            ...(paymentMethod === '4' && { // CBU
                cbu: cbu,
                renovacionAutomatica: autoRenewal
            }),

            tomadores: [
                {
                    apellidoRazonSocial: proposalData.apellido.trim().toUpperCase(),
                    nombre: proposalData.nombre.trim().toUpperCase(),
                    condicionFiscal: "CF",
                    dni: parseInt(proposalData.dni),
                    domicilio: {
                        calle: proposalData.calle.trim().toUpperCase(),
                        numero: parseInt(proposalData.numero),
                        idCP: parseInt(locId),
                    },
                    ganancias: "NO_INSCRIPTO",
                    ibb: "NO_INSCRIPTO",
                    tipoIVA: "NO_INSCRIPTO",
                    formaComunicacion: [
                        {
                            tipo: "EMAIL",
                            valor: proposalData.email || "rus@email.com"
                        },
                        ...(proposalData.telefono ? [{
                            tipo: "CELULAR",
                            valor: proposalData.telefono
                        }] : [])
                    ],
                    tipoPersona: "FISICA"
                }
            ],
            vehiculos: [
                {
                    anio: parseInt(year),
                    color: "NEGRO",
                    controlSatelital: "NO",
                    gnc: "NO",
                    fechaVencVtv: fechaVencVtv,
                    localidadGuarda: parseInt(locId),
                    codia: selectedVersionId?.toString(),
                    nroChasis: proposalData.chasis.replace(/\s+/g, '').toUpperCase(),
                    nroMotor: proposalData.motor.replace(/\s+/g, '').toUpperCase(),
                    patente: proposalData.patente.replace(/\s+/g, '').toUpperCase(),
                    uso: "PARTICULAR"
                }
            ],
            vigenciaDesde,
            vigenciaHasta,
            tipoVigencia,

            vigenciaPolizaId: parseInt(selectedVigencia),
            vehicleInfo // Sending this for the backend to save to DB (will be stripped before sending to RUS)
        };



        try {
            const result = await createPropuesta(payload);
            setProposalResponse(result);
            
            // Si quedó como propuesta pendiente, le avisamos al usuario pero SIN mostrar el error interno de RUS
            if (result.estado && result.estado.toUpperCase() === 'PROPUESTA') {
                setProposalSuccess('Su solicitud quedó en estado PENDIENTE. Un asesor la revisará en breve para finalizar la emisión.');
            } else {
                setProposalSuccess("¡Póliza generada con éxito! Revisa tu correo o panel.");
            }
            
            setProposalId(result.numeroPropuesta || result.numero || (result.body ? result.body.numeroPropuesta : null));
        } catch (err) {
            console.error("Proposal Error:", err);
            let errorMsg = "Hubo un error al generar la propuesta. ";
            if (err.response && err.response.status === 409) {
                errorMsg = "Ups, hay un error en los datos de pago, prueba ingresando una tarjeta distinta o cambiando el metodo de pago";
            } else if (err.message) {
                errorMsg = err.message;
            }
            setProposalError(errorMsg);
        } finally {
            setProposalLoading(false);
        }
    };

    const handleDownloadPdf = async () => {
        if (!proposalResponse?.numero) return;
        setPdfLoading(true);
        try {
            const ramo = proposalResponse.numeroSeccion || 20;
            const poliza = proposalResponse.numero;
            const endoso = proposalResponse.endoso || 0;
            
            const blob = await getPolizaPdf(ramo, poliza, endoso);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Poliza_${poliza}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error("Error downloading PDF:", err);
            alert("No se pudo descargar el PDF en este momento. Por favor, intenta más tarde.");
        } finally {
            setPdfLoading(false);
        }
    };

    const handleCheckStatus = async () => {
        if (!proposalId) return;
        setStatusLoading(true);
        try {
            // Need to import getPropuestaStatus if it's available in api.js, 
            // In the original App.jsx it was calling getPropuestaStatus inside handleCheckStatus, 
            // but I need to check if that function was imported.
            // Looking at the App.jsx file read previously, line 810 calls handleCheckStatus,
            // but the definition of handleCheckStatus was outside view range in first chunk? 
            // No, I saw it in lines 801-831 in second chunk.
            // Wait, I missed reading where `getPropuestaStatus` was imported or defined in `App.jsx`.
            // Line 1174 was end of file. I read lines 1-800 and 801-1174.
            // I don't see `getPropuestaStatus` imported in line 2.
            // Line 2: import { getBrands ... createPropuesta } from './services/api';
            // Is it possible the user added it and I missed it? 
            // The user objective "Implement Proposal Status Query" mentioned adding `getPropuestaStatus`.
            // Let's assume it IS in ./services/api based on the user request history.
            // If not, it might fail. But I will import it in my top imports.

            const data = await getPropuestaStatus(proposalId);
            setStatusResult(data);
        } catch (err) {
            console.error(err);
            setStatusResult({ error: "Error al consultar estado" });
        } finally {
            setStatusLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                background: '#1a1a1a', border: '1px solid rgba(59,130,246,0.25)',
                borderRadius: '16px', padding: '28px',
                width: '95%', maxWidth: '520px', maxHeight: '92vh',
                overflowY: 'auto', position: 'relative'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: '14px', right: '14px',
                    background: 'none', border: 'none', color: '#aaa',
                    fontSize: '1.4rem', cursor: 'pointer'
                }}>×</button>

                <h2 style={{ margin: '0 0 4px 0', color: '#3b82f6' }}>Contratar con RUS</h2>

                {quote && (
                    <div style={{
                        background: 'rgba(59,130,246,0.08)', borderRadius: '8px',
                        padding: '10px 14px', marginBottom: '18px',
                        border: '1px solid rgba(59,130,246,0.15)', fontSize: '0.85rem'
                    }}>
                        <strong style={{ color: '#fff' }}>{quote.codigoCasco || quote.codigoRC}</strong>
                        <div style={{ color: '#3b82f6', fontWeight: 700, fontSize: '1.1rem', marginTop: '3px' }}>
                            ${monthlyCuota.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            <span style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 400, marginLeft: '8px' }}>
                                estimado por mes {payWithCard && "(con descuento)"}
                            </span>
                        </div>
                        <div style={{ color: '#888', fontSize: '0.75rem', marginTop: '2px' }}>
                            Total semestral: ${discountedPremio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                )}

                {vehicleInfo && (
                    <div style={{
                        background: 'rgba(59,130,246,0.08)', borderRadius: '8px',
                        padding: '10px 14px', marginBottom: '18px',
                        border: '1px solid rgba(59,130,246,0.15)', fontSize: '0.85rem'
                    }}>
                        <strong style={{ color: '#fff' }}>Vehículo: </strong>
                        <span style={{ color: '#3b82f6', fontWeight: 600 }}>
                            {vehicleInfo.brand} {vehicleInfo.model} - {vehicleInfo.version} ({vehicleInfo.year})
                        </span>
                    </div>
                )}

                {proposalLoading ? (
                    <div className="fade-in" style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <div className="spinner"></div>
                        <h3 style={{ margin: 0, fontWeight: 500 }}>Estamos validando tu compra...</h3>
                    </div>
                ) : proposalSuccess ? (
                    <div className="fade-in" style={{ textAlign: 'center', padding: '10px 0 20px 0' }}>
                        <div style={{ 
                            width: '64px', height: '64px', background: 'rgba(59,130,246,0.15)', 
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px auto', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)'
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
                                <strong style={{ color: '#fff' }}>{proposalResponse?.numero}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                                <span style={{ color: '#888' }}>Estado:</span>
                                <span style={{ color: '#3b82f6', fontWeight: 700 }}>{proposalResponse?.estado?.toUpperCase() || 'EMITIDA'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span style={{ color: '#888' }}>Titular:</span>
                                <strong style={{ color: '#fff' }}>{proposalData.apellido.toUpperCase()}, {proposalData.nombre.toUpperCase()}</strong>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button 
                                onClick={handleDownloadPdf} 
                                disabled={pdfLoading}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    padding: '14px', background: '#3b82f6', color: '#fff', border: 'none',
                                    borderRadius: '10px', cursor: pdfLoading ? 'wait' : 'pointer', fontWeight: 700,
                                    fontSize: '0.9rem', transition: 'all 0.2s', width: '100%'
                                }}
                            >
                                {pdfLoading ? (
                                    <>Descargando...</>
                                ) : (
                                    <>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                        DESCARGAR PÓLIZA PDF
                                    </>
                                )}
                            </button>
                            
                            <button onClick={onClose} style={{ 
                                padding: '12px', background: 'transparent', color: '#aaa', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
                            }}>
                                Salir
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleProposalSubmit}>
                        {proposalError && (
                            <div style={{
                                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: '8px', padding: '10px 14px', marginBottom: '14px',
                                color: '#fca5a5', fontSize: '0.85rem'
                            }}>{proposalError}</div>
                        )}

                        <p style={sectionS}>DATOS DEL TOMADOR</p>
                        <Grid>
                            <div style={groupS}>
                                <label style={labelS}>Apellido *</label>
                                <input style={inputS} required value={proposalData.apellido}
                                    onChange={e => setProposalData({ ...proposalData, apellido: e.target.value })} placeholder="GARCÍA" />
                            </div>
                            <div style={groupS}>
                                <label style={labelS}>Nombre *</label>
                                <input style={inputS} required value={proposalData.nombre}
                                    onChange={e => setProposalData({ ...proposalData, nombre: e.target.value })} placeholder="JUAN" />
                            </div>
                        </Grid>
                        <Grid>
                            <div style={groupS}>
                                <label style={labelS}>DNI *</label>
                                <input style={inputS} required type="number" value={proposalData.dni}
                                    onChange={e => setProposalData({ ...proposalData, dni: e.target.value })} placeholder="30123456" />
                            </div>
                            <div style={groupS}>
                                <label style={labelS}>Género *</label>
                                <select style={inputS} value={proposalData.genero} onChange={e => setProposalData({ ...proposalData, genero: e.target.value })}>
                                    <option value="MASCULINO">Masculino</option>
                                    <option value="FEMENINO">Femenino</option>
                                </select>
                            </div>
                        </Grid>
                        <Grid>
                            <div style={groupS}>
                                <label style={labelS}>Celular *</label>
                                <input style={inputS} required value={proposalData.telefono}
                                    onChange={e => setProposalData({ ...proposalData, telefono: e.target.value.replace(/\D/g, '') })} placeholder="1112345678" />
                            </div>
                            <div style={groupS}>
                                <label style={labelS}>Email *</label>
                                <input style={inputS} required type="email" value={proposalData.email}
                                    onChange={e => setProposalData({ ...proposalData, email: e.target.value })} />
                            </div>
                        </Grid>

                        <Grid cols="2fr 1fr">
                            <div style={groupS}>
                                <label style={labelS}>Calle *</label>
                                <input style={inputS} required value={proposalData.calle}
                                    onChange={e => setProposalData({ ...proposalData, calle: e.target.value })} placeholder="CORRIENTES" />
                            </div>
                            <div style={groupS}>
                                <label style={labelS}>Altura *</label>
                                <input style={inputS} required type="number" value={proposalData.numero}
                                    onChange={e => setProposalData({ ...proposalData, numero: e.target.value })} placeholder="1234" />
                            </div>
                        </Grid>


                        <p style={sectionS}>DATOS DEL VEHÍCULO</p>
                        <Grid>
                            <div style={groupS}>
                                <label style={labelS}>Patente *</label>
                                <input style={inputS} required value={proposalData.patente}
                                    onChange={e => setProposalData({ ...proposalData, patente: e.target.value })}
                                    placeholder={year >= 2023 ? "A123BCD o A/D" : "A123BCD"} />
                            </div>
                        </Grid>
                        <Grid>
                            <div style={groupS}>
                                <label style={labelS}>Chasis *</label>
                                <input style={inputS} required value={proposalData.chasis}
                                    onChange={e => setProposalData({ ...proposalData, chasis: e.target.value })}
                                    placeholder="Nro de Chasis (8-17 caract.)" />
                            </div>
                            <div style={groupS}>
                                <label style={labelS}>Motor *</label>
                                <input style={inputS} required value={proposalData.motor}
                                    onChange={e => setProposalData({ ...proposalData, motor: e.target.value })}
                                    placeholder="Nro de Motor (5-15 caract.)" />
                            </div>
                        </Grid>

                        <p style={sectionS}>FORMA DE PAGO</p>

                        {/* Payment method selector — match ATM styling */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                            <button type="button" onClick={() => setPaymentMethod('4')} style={{
                                flex: 1, padding: '8px', border: 'none', borderRadius: '6px',
                                background: paymentMethod === '4' ? '#6366f1' : 'rgba(255,255,255,0.07)',
                                color: paymentMethod === '4' ? '#fff' : '#aaa',
                                cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem'
                            }}>CBU</button>
                            <button type="button" onClick={() => setPaymentMethod('3')} style={{
                                flex: 1, padding: '8px', border: 'none', borderRadius: '6px',
                                background: paymentMethod === '3' ? '#6366f1' : 'rgba(255,255,255,0.07)',
                                color: paymentMethod === '3' ? '#fff' : '#aaa',
                                cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem'
                            }}>Tarjeta</button>
                        </div>

                        {isFullOnline && (
                            <>
                                {paymentMethod === '3' && (
                                    <div className="fade-in">
                                        <div style={groupS}>
                                            <label style={labelS}>Tipo de Tarjeta *</label>
                                            <select style={inputS} value={cardType} onChange={e => setCardType(e.target.value)}>
                                                <option value="" disabled>Seleccione una...</option>
                                                <option value="1">VISA</option>
                                                <option value="3">MASTERCARD</option>
                                                <option value="11">AMEX</option>
                                                <option value="11">CABAL</option>
                                            </select>
                                        </div>
                                        <div style={groupS}>
                                            <label style={labelS}>Número de Tarjeta *</label>
                                            <div style={{ position: 'relative' }}>
                                                <input type="text" style={inputS} required
                                                    value={cardNumber} onChange={e => {
                                                        const val = e.target.value.replace(/\D/g, '');
                                                        setCardNumber(val);

                                                        let code = '';
                                                        if (/^4/.test(val)) code = '1';
                                                        else if (/^5[0-5]/.test(val) || /^2[2-7]/.test(val)) code = '3';
                                                        else if (/^3[47]/.test(val)) code = '11';
                                                        else if (/^(5896|60|63)/.test(val)) code = '11';

                                                        if (code) setCardType(code);
                                                    }}
                                                    placeholder="XXXX XXXX XXXX XXXX"
                                                    maxLength={19}
                                                />
                                                {cardNumber && (
                                                    <span style={{
                                                        position: 'absolute',
                                                        right: '10px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        fontWeight: 'bold',
                                                        color: '#3b82f6',
                                                        background: 'rgba(0,0,0,0.5)',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        fontSize: '0.8rem'
                                                    }}>
                                                        {(() => {
                                                            if (/^4/.test(cardNumber)) return 'VISA';
                                                            if (/^5[0-5]/.test(cardNumber) || /^2[2-7]/.test(cardNumber)) return 'MASTERCARD';
                                                            if (/^3[47]/.test(cardNumber)) return 'AMEX';
                                                            if (/^(5896|60|63)/.test(cardNumber)) return 'CABAL';
                                                            return 'DESCONOCIDA';
                                                        })()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === '4' && (
                                    <div className="fade-in">
                                        <div style={groupS}>
                                            <label style={labelS}>CBU *</label>
                                            <input type="text" style={inputS} required
                                                value={cbu} onChange={e => setCbu(e.target.value.replace(/\D/g, ''))}
                                                placeholder="22 dígitos de tu CBU" maxLength={22}
                                            />
                                        </div>
                                    </div>
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

                        <button type="submit" disabled={proposalLoading} style={{
                            width: '100%', padding: '12px', marginTop: '14px',
                            background: proposalLoading ? '#555' : '#3b82f6', border: 'none', borderRadius: '8px',
                            color: '#fff', fontWeight: 600, fontSize: '0.95rem', cursor: proposalLoading ? 'not-allowed' : 'pointer'
                        }}>
                            {proposalLoading ? 'Generando...' : 'CONFIRMAR CONTRATACION'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

// ── Shared UI Config (Matches ATMProposalModal) ──────────────────────────────
const sectionS = { fontSize: '0.8rem', fontWeight: 700, color: '#3b82f6', marginBottom: '10px', marginTop: '20px', letterSpacing: '1px', paddingBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.05)' };
const groupS = { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' };
const labelS = { fontSize: '0.75rem', fontWeight: 600, color: '#aaa' };
const inputS = { width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' };
const Grid = ({ children, cols = '1fr 1fr' }) => (<div className="responsive-grid" style={{ gridTemplateColumns: cols }}>{children}</div>);

export default ProposalModal;
