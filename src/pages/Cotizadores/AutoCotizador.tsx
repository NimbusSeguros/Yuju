import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ShieldCheck, MapPin, Check, ArrowLeft, Info, MessageCircle, Smartphone } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Layout } from '../../layout/Layout';
import { SEOHelmet } from '../../components/SEO/SEOHelmet';

// Modular Selector Components
import { BrandSelect } from '../../components/cotizadores/BrandSelect';
import { YearSelect } from '../../components/cotizadores/YearSelect';
import { ModelSelect } from '../../components/cotizadores/ModelSelect';
import { PostalCodeSelect } from '../../components/cotizadores/PostalCodeSelect';
import { enrichAndValidateQuote } from '../../utils/cotizadorUtils';
import { getInsurerLogo } from '../../utils/insurerLogos';
import { AutoCoverageDetailsModal } from '../../components/cotizadores/AutoCoverageDetailsModal';
import { createLead } from '../../services/motoApi'; // Reutilizamos lógica de leads

export const AutoCotizador = () => {
  const [formData, setFormData] = useState({
    marcaId: '', marcaName: '', year: '', modeloId: '', modeloName: '', cp: '', localidad: '', codia: '', version: '', sancorCityCode: null as string | null
  });

  const [activeStep, setActiveStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cotizaciones, setCotizaciones] = useState<any[]>([]);
  const [selectedQuoteForModal, setSelectedQuoteForModal] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Lead Modal States
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [selectedQuoteForLead, setSelectedQuoteForLead] = useState<any>(null);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isCreditCard, setIsCreditCard] = useState<boolean | null>(null);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  useEffect(() => {
    if (formData.marcaId && activeStep === 1) setActiveStep(2);
    if (formData.year && activeStep === 2) setActiveStep(3);
    if (formData.modeloId && activeStep === 3) setActiveStep(4);
  }, [formData, activeStep]);

  const formatTodayDDMMYYYY = () => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  };

  const handleCotizar = async () => {
    setIsProcessing(true);
    setCotizaciones([]);
    setActiveStep(5);
    try {
      const { getAccessToken } = await import('../../services/apiClient');
      const token = await getAccessToken();
      const payload = {
        marca: formData.marcaId, modelo: formData.modeloId, version: formData.version, anio: Number(formData.year),
        codigoPostal: formData.cp, localidad: formData.localidad, tieneGNC: false, esOKM: false, esComercial: false,
        marcaNombre: formData.marcaName, modeloNombre: formData.modeloName, codia: formData.codia,
        codInfoAuto: formData.codia, infoauto: formData.codia, version_desc: formData.version,
        fechaVigencia: formatTodayDDMMYYYY(), cityCode: formData.sancorCityCode
      };

      const API_URL = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'https://api-yuju.com.ar/api';
      const response = await fetch(`${API_URL}/cotizar-stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const reader = response.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";
        for (const part of parts) {
          const trimmedPart = part.trim();
          if (!trimmedPart.startsWith("data: ")) continue;
          const jsonStr = trimmedPart.replace("data: ", "");
          if (jsonStr === "[DONE]") { setIsProcessing(false); break; }
          try {
            const data = JSON.parse(jsonStr);
            if (data.done) { setIsProcessing(false); break; }
            setCotizaciones(prev => {
              let newQuotes: any[] = [];
              const processItem = (item: any) => {
                if (item.planes && Array.isArray(item.planes)) {
                  item.planes.forEach((p: any) => {
                    const enriched = enrichAndValidateQuote(p, item.aseguradora, Number(formData.year), 1);
                    if (enriched) {
                      newQuotes.push({
                        aseguradora: item.aseguradora, cobertura: p.nombre || p.cobertura || p.producto || 'Cobertura',
                        precio: enriched.monthlyPrice, sumaAsegurada: p.sumaAsegurada || 0, category: enriched.finalCategory
                      });
                    }
                  });
                }
              };
              if (Array.isArray(data)) data.forEach(processItem); else processItem(data);
              return [...prev, ...newQuotes].sort((a,b) => a.precio - b.precio);
            });
          } catch (e) {}
        }
      }
    } catch (e) { setIsProcessing(false); }
  };

  const handleSubmitLead = async () => {
    if (!whatsappNumber || isCreditCard === null) return;
    setIsSubmittingLead(true);
    try {
      await createLead({
        vehicleInfo: {
          brand: formData.marcaName,
          model: formData.modeloName,
          version: formData.version,
          year: formData.year,
          codia: formData.codia
        },
        provider: selectedQuoteForLead.aseguradora,
        planName: selectedQuoteForLead.cobertura,
        precio: selectedQuoteForLead.precio,
        sumaAsegurada: selectedQuoteForLead.sumaAsegurada,
        phone: whatsappNumber,
        zipCode: formData.cp,
        wspText: `Hola! Vengo de Yuju. Quiero contratar el seguro de ${selectedQuoteForLead.aseguradora} (${selectedQuoteForLead.cobertura}) para mi ${formData.marcaName} ${formData.modeloName} (${formData.year}). Mi teléfono es ${whatsappNumber}.`,
        isMoto: false
      });
      
      const message = `Hola! Vengo de Yuju. Quiero contratar el seguro de ${selectedQuoteForLead.aseguradora} (${selectedQuoteForLead.cobertura}) para mi ${formData.marcaName} ${formData.modeloName} (${formData.year}). Mi teléfono es ${whatsappNumber}.`;
      window.open(`https://wa.me/5491156307246?text=${encodeURIComponent(message)}`, '_blank');
      setLeadModalOpen(false);
    } catch (error) {
      alert("Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.");
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const stepIndicators = [
    { id: 1, title: 'El Vehículo', status: activeStep < 4 ? 'active' : 'completed' },
    { id: 2, title: 'Ubicación', status: activeStep < 4 ? 'inactive' : activeStep === 4 ? 'active' : 'completed' },
    { id: 3, title: 'Cotización', status: activeStep < 5 ? 'inactive' : 'active' },
  ];

  return (
    <Layout>
      <SEOHelmet title="Cotizador de Auto" description="Asegurá tu auto con Yuju." />
      
      {/* 🚀 PANTALLA DE CARGA PREMIUM */}
      <AnimatePresence>
        {isProcessing && cotizaciones.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-bg-primary/90 backdrop-blur-md flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-yuju-blue/10 border-t-yuju-blue rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center"><Zap className="text-yuju-blue animate-pulse" size={32} /></div>
            </div>
            <h2 className="mt-8 text-2xl font-black font-accent text-yuju-blue uppercase tracking-tighter">Buscando el mejor precio</h2>
            <p className="text-text-secondary opacity-60 font-bold text-xs uppercase tracking-[0.3em] mt-2">Analizando +15 aseguradoras en tiempo real</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative pt-32 pb-12 px-6 bg-bg-secondary min-h-screen transition-colors duration-500">
        <div className={`mx-auto space-y-10 relative z-20 ${activeStep === 5 ? 'max-w-[100%] xl:max-w-[98%] 2xl:max-w-[1800px]' : 'max-w-4xl'}`}>
          
          <div className="flex justify-between items-center px-4 md:px-8 relative mb-12">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border-primary -translate-y-1/2 z-0 mx-8 hidden md:block" />
            {stepIndicators.map((step) => (
                <div key={step.id} className="flex flex-col items-center gap-3 relative z-10 min-w-[5rem]">
                <motion.div 
                  initial={false}
                  animate={{ 
                    backgroundColor: step.status === 'completed' ? '#3369ff' : step.status === 'active' ? '#3369ff' : 'var(--bg-primary)',
                    boxShadow: step.status === 'active' ? '0 0 25px rgba(51, 105, 255, 0.4)' : step.status === 'completed' ? '0 0 15px rgba(51, 105, 255, 0.3)' : 'none',
                    scale: step.status === 'active' ? 1.1 : 1,
                    borderColor: step.status === 'completed' ? '#3369ff' : step.status === 'active' ? '#3369ff' : 'var(--border-primary)'
                  }}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 z-10 relative"
                >
                  <span className={`text-base font-black font-accent flex items-center justify-center ${step.status === 'completed' ? 'text-white' : step.status === 'active' ? 'text-white' : 'text-text-secondary opacity-40'}`}>
                    {step.status === 'completed' ? <Check size={20} strokeWidth={4} /> : step.id}
                  </span>
                </motion.div>
                <div className="text-center hidden md:block">
                  <p className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors duration-500 whitespace-nowrap ${step.status === 'completed' ? 'text-yuju-blue opacity-100' : step.status === 'active' ? 'text-yuju-blue opacity-100' : 'text-text-secondary opacity-30'}`}>
                    {step.title}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <GlassCard className="p-6 md:p-10 rounded-[32px] border-border-primary shadow-xl bg-bg-primary/70 relative overflow-visible backdrop-blur-xl">
            {activeStep < 5 && (
              <div className="space-y-8 py-2 relative">
                <div className="space-y-3"><div className="flex items-center gap-2"><div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 ${formData.marcaId ? 'bg-yuju-blue text-white' : 'bg-bg-secondary text-text-secondary opacity-40'}`}><ShieldCheck size={16} /></div><div className="flex-1"><h2 className="text-sm font-black font-accent uppercase tracking-tighter leading-none">Marca del Vehículo</h2><p className="text-[10px] text-text-secondary opacity-60 font-bold uppercase tracking-widest">Seleccioná la marca de tu rodado</p></div></div><BrandSelect value={formData.marcaId} onChange={(id, name) => setFormData(p => ({ ...p, marcaId: id, marcaName: name }))} /></div>
                <div className={`space-y-3 transition-opacity duration-500 ${activeStep < 2 ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}><div className="flex items-center gap-2"><div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 ${formData.year ? 'bg-yuju-blue text-white' : 'bg-bg-secondary text-text-secondary opacity-40'}`}><ShieldCheck size={16} /></div><div className="flex-1"><h2 className="text-sm font-black font-accent uppercase tracking-tighter leading-none">Año de Fabricación</h2><p className="text-[10px] text-text-secondary opacity-60 font-bold uppercase tracking-widest">Modelo según cédula</p></div></div><YearSelect value={formData.year} onChange={(y) => setFormData(p => ({ ...p, year: y }))} /></div>
                <div className={`space-y-3 transition-opacity duration-500 ${activeStep < 3 ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}><div className="flex items-center gap-2"><div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 ${formData.modeloId ? 'bg-yuju-blue text-white' : 'bg-bg-secondary text-text-secondary opacity-40'}`}><ShieldCheck size={16} /></div><div className="flex-1"><h2 className="text-sm font-black font-accent uppercase tracking-tighter leading-none">Modelo y Versión</h2><p className="text-[10px] text-text-secondary opacity-60 font-bold uppercase tracking-widest">Buscá la versión específica de tu auto</p></div></div><ModelSelect value={formData.modeloId} marcaId={formData.marcaId} year={formData.year} onChange={(id, name) => setFormData(p => ({ ...p, modeloId: id, modeloName: name, codia: id, version: name }))} /></div>
                <div className={`space-y-3 transition-opacity duration-500 ${activeStep < 4 ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}><div className="flex items-center gap-2"><div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 ${formData.cp ? 'bg-yuju-blue text-white' : 'bg-bg-secondary text-text-secondary opacity-40'}`}><MapPin size={16} /></div><div className="flex-1"><h2 className="text-sm font-black font-accent uppercase tracking-tighter leading-none">Lugar de Guarda</h2><p className="text-[10px] text-text-secondary opacity-60 font-bold uppercase tracking-widest">Código Postal de residencia</p></div></div><PostalCodeSelect value={formData.cp} localidad={formData.localidad} onChange={(cp, loc, cityCode) => setFormData(p => ({ ...p, cp, localidad: loc, sancorCityCode: cityCode || null }))} /></div>
                {formData.cp.length === 4 && activeStep === 4 && (
                  <div className="flex justify-center pt-6"><Button onClick={handleCotizar} isLoading={isProcessing} className="w-full md:w-auto px-12 h-14 bg-yuju-blue text-white font-black uppercase tracking-widest shadow-xl shadow-yuju-blue/20">Obtener Cotización</Button></div>
                )}
              </div>
            )}

            {activeStep === 5 && (
               <div className="space-y-10">
                   <div className="flex items-center gap-4 border-b border-border-primary pb-8">
                    <button onClick={() => setActiveStep(4)} className="w-12 h-12 flex items-center justify-center bg-yuju-blue/10 text-yuju-blue rounded-full hover:bg-yuju-blue/20 transition-all"><ArrowLeft size={24}/></button>
                    <div><p className="text-[10px] font-black uppercase text-text-secondary opacity-60 tracking-widest">Resultados para tu</p><h2 className="text-3xl font-black font-accent text-yuju-blue uppercase leading-none">{formData.marcaName} {formData.modeloName}</h2></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
                    {['Responsabilidad Civil', 'Terceros Completo', 'Terceros Completo Full', 'Todo Riesgo'].map((category) => {
                      const categoryQuotes = cotizaciones.filter(c => c.category === category);
                      return (
                         <div key={category} className="space-y-4">
                           <h3 className="text-sm font-black text-center uppercase tracking-widest text-text-secondary opacity-60 py-2 border-b border-border-primary mb-2">{category}</h3>
                           {categoryQuotes.map((cot, idx) => {
                              const logoUrl = getInsurerLogo(cot.aseguradora);
                              return (
                                 <div key={idx} className="bg-bg-primary border border-border-primary rounded-3xl p-5 shadow-sm hover:shadow-md transition-all relative flex flex-col min-h-[220px]">
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="text-[11px] font-black text-text-primary leading-tight pr-6">{cot.cobertura}</h4>
                                        <div className="h-6 shrink-0"><img src={logoUrl} alt={cot.aseguradora} className="h-full object-contain" style={{ filter: 'var(--logo-filter)' }} /></div>
                                    </div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex flex-col">
                                            <div className="flex items-baseline gap-1"><span className="text-2xl font-black text-text-primary tracking-tighter">${Math.round(cot.precio).toLocaleString('es-AR')}</span><span className="text-[10px] font-bold text-text-secondary opacity-60 uppercase">/mes</span></div>
                                            <span className="text-[9px] font-bold text-yuju-blue uppercase tracking-tighter">Dto. Tarjeta Incluido</span>
                                        </div>
                                        <button onClick={() => { setSelectedQuoteForModal(cot); setModalOpen(true); }} className="p-1.5 rounded-full bg-bg-secondary text-text-secondary opacity-60 hover:text-yuju-blue hover:bg-yuju-blue/5 border border-border-primary"><Info size={16} /></button>
                                    </div>
                                    <div className="space-y-2 mb-6 pt-4 border-t border-border-primary">
                                        <div className="flex justify-between items-center text-[11px]"><span className="font-bold text-text-secondary opacity-60">Suma Asegurada</span><span className="font-black text-text-primary">${Math.round(cot.sumaAsegurada).toLocaleString('es-AR')}</span></div>
                                        <div className="flex justify-between items-center text-[11px]"><span className="font-bold text-text-secondary opacity-60">Auxilio</span><span className="font-black text-text-primary">Incluido</span></div>
                                    </div>
                                    <div className="mt-auto">
                                        <Button className="w-full h-11 rounded-xl font-black text-[10px] uppercase tracking-widest bg-yuju-blue hover:bg-blue-700 border-none flex items-center justify-center gap-2 shadow-lg shadow-yuju-blue/10" onClick={() => { setSelectedQuoteForLead(cot); setLeadModalOpen(true); }}>
                                            <MessageCircle size={16} className="text-[#25D366] fill-[#25D366]" />
                                            <span>Contratar</span>
                                        </Button>
                                    </div>
                                </div>
                              );
                           })}
                        </div>
                      )
                    })}
                  </div>
               </div>
            )}
          </GlassCard>
        </div>
      </div>

      <AnimatePresence>
        {leadModalOpen && selectedQuoteForLead && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLeadModalOpen(false)} className="absolute inset-0 bg-bg-dark/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-bg-primary rounded-[32px] w-full max-w-md p-8 shadow-2xl overflow-hidden border border-border-primary">
               <div className="space-y-6">
                  <div className="h-10"><img src={getInsurerLogo(selectedQuoteForLead.aseguradora)} alt="Logo" className="h-full object-contain" style={{ filter: 'var(--logo-filter)' }} /></div>
                  
                  <div>
                    <h3 className="text-xl font-black text-yuju-blue leading-tight mb-1">{selectedQuoteForLead.cobertura}</h3>
                    <p className="text-sm font-black text-text-primary uppercase tracking-tighter">{formData.marcaName} - {formData.modeloName} ({formData.year})</p>
                    <p className="text-[10px] font-bold text-text-secondary opacity-40 mt-1">{formatTodayDDMMYYYY().replace(/-/g, '/')}</p>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-text-secondary opacity-40 line-through">${(selectedQuoteForLead.precio * 1.3).toLocaleString('es-AR')}/mes</span>
                    <span className="text-3xl font-black text-yuju-blue tracking-tighter">${Math.round(selectedQuoteForLead.precio).toLocaleString('es-AR')}/mes</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-text-secondary opacity-60">¿Pagás con tarjeta de crédito?</p>
                        <Info size={16} className="text-yuju-blue/40" />
                    </div>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer group">
                             <div onClick={() => setIsCreditCard(true)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isCreditCard === true ? 'border-yuju-blue' : 'border-border-primary'}`}>
                                {isCreditCard === true && <div className="w-2.5 h-2.5 bg-yuju-blue rounded-full" />}
                             </div>
                             <span className="text-sm font-black text-text-secondary opacity-60">Sí</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                             <div onClick={() => setIsCreditCard(false)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isCreditCard === false ? 'border-yuju-blue' : 'border-border-primary'}`}>
                                {isCreditCard === false && <div className="w-2.5 h-2.5 bg-yuju-blue rounded-full" />}
                             </div>
                             <span className="text-sm font-black text-text-secondary opacity-60">No</span>
                        </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black text-text-secondary opacity-40">Número de WhatsApp</label>
                    <div className="relative group">
                        <input 
                            type="text" placeholder="Ej: 11 5644 5278" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)}
                            className="w-full h-14 bg-bg-secondary border-2 border-transparent focus:border-yuju-blue/30 focus:bg-bg-primary rounded-2xl px-6 outline-none font-bold text-text-primary transition-all"
                        />
                        <Smartphone className="absolute right-5 top-1/2 -translate-y-1/2 text-text-secondary opacity-40 group-focus-within:text-yuju-blue transition-colors" size={20} />
                    </div>
                  </div>

                  <Button 
                    isLoading={isSubmittingLead} disabled={!whatsappNumber || isCreditCard === null} onClick={handleSubmitLead}
                    className="w-full h-14 bg-yuju-blue hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-yuju-blue/20"
                  >
                    ¡Seguir por WhatsApp!
                  </Button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {selectedQuoteForModal && (
        <AutoCoverageDetailsModal
          isOpen={modalOpen} onClose={() => setModalOpen(false)} quote={selectedQuoteForModal}
          vehicleInfo={{ brand: formData.marcaName, model: formData.modeloName, version: formData.version, year: formData.year, codia: formData.codia }}
          price={Number(selectedQuoteForModal.precio)}
        />
      )}
    </Layout>
  );
};
