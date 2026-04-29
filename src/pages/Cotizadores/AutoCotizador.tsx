import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, MapPin, Check, ArrowLeft, Info, Smartphone } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Layout } from '../../layout/Layout';
import { SEOHelmet } from '../../components/SEO/SEOHelmet';

// Modular Selector Components
import { BrandSelect } from '../../components/cotizadores/BrandSelect';
import { FAQAccordion } from '../../components/cotizadores/FAQAccordion';
import { YearSelect } from '../../components/cotizadores/YearSelect';
import { ModelSelect } from '../../components/cotizadores/ModelSelect';
import { PostalCodeSelect } from '../../components/cotizadores/PostalCodeSelect';
import { enrichAndValidateQuote } from '../../utils/cotizadorUtils';
import { getInsurerLogo } from '../../utils/insurerLogos';
import { AutoCoverageDetailsModal } from '../../components/cotizadores/AutoCoverageDetailsModal';
import { SuccessStep } from '../../components/cotizadores/SuccessStep';
import { apiClient } from '../../services/apiClient';

export const AutoCotizador = () => {
  const [formData, setFormData] = useState({
    marcaId: '', marcaName: '', year: '', modeloId: '', modeloName: '', cp: '', localidad: '', codia: '', version: '', photoUrl: '' as string | undefined, sancorCityCode: null as string | null
  });

  const [activeStep, setActiveStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cotizaciones, setCotizaciones] = useState<any[]>([]);
  const [selectedQuoteForModal, setSelectedQuoteForModal] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isCreditCard, setIsCreditCard] = useState<boolean>(true); // Por defecto Tarjeta
  const [selectedCategory, setSelectedCategory] = useState<string>('Terceros Completo'); // Por defecto

  // Lead Modal States
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [selectedQuoteForLead, setSelectedQuoteForLead] = useState<any>(null);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [showCardTooltip, setShowCardTooltip] = useState(false);

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
                    const enriched = enrichAndValidateQuote(p, item.aseguradora, Number(formData.year));
                    if (enriched) {
                      const rawAseguradora = item.aseguradora || '';
                      const displayAseguradora = rawAseguradora.toLowerCase().includes('meridional') ? 'Meridional' : rawAseguradora;

                      newQuotes.push({
                        aseguradora: displayAseguradora,
                        cobertura: p.nombre || p.cobertura || p.producto || 'Cobertura',
                        precio: enriched.monthlyPrice,
                        originalPrice: enriched.originalPrice,
                        discountPercent: enriched.discountPercent,
                        sumaAsegurada: p.sumaAsegurada || 0,
                        category: enriched.finalCategory,
                        plan_name: p.nombre || p.cobertura || p.producto,
                        codigoCasco: p.codigo || p.producto || p.codigoCasco,
                        franchise: p.franquicia || 'Sin franquicia'
                      });
                    }
                  });
                }
              };
              if (Array.isArray(data)) data.forEach(processItem); else processItem(data);
              return [...prev, ...newQuotes].sort((a, b) => a.precio - b.precio);
            });
          } catch (e) { }
        }
      }
    } catch (e) { setIsProcessing(false); }
  };

  const handleSubmitLead = async () => {
    if (!whatsappNumber || isCreditCard === null) return;
    setIsSubmittingLead(true);
    try {
      const payload = {
        marca: formData.marcaName,
        modelo_version: `${formData.modeloName}${formData.version ? " " + formData.version : ""}`,
        cp: formData.cp,
        anio: Number(formData.year),
        aseguradora: selectedQuoteForLead.aseguradora,
        plan: selectedQuoteForLead.cobertura || "Plan no especificado",
        telefono: whatsappNumber,
      };

      await apiClient.post('/cotizaciones', payload);

      const message = `Hola! Vengo de Yuju. Quiero contratar el seguro de ${selectedQuoteForLead.aseguradora} (${selectedQuoteForLead.cobertura}) para mi ${formData.marcaName} ${formData.modeloName} (${formData.year}). Mi teléfono es ${whatsappNumber}.`;
      window.open(`https://wa.me/5491156307246?text=${encodeURIComponent(message)}`, '_blank');
      setLeadModalOpen(false);
      setActiveStep(6);
    } catch (error) {
      alert("Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.");
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const handleReset = () => {
    setFormData({
      marcaId: '', marcaName: '', year: '', modeloId: '', modeloName: '', cp: '', localidad: '', codia: '', version: '', photoUrl: '', sancorCityCode: null as string | null
    });
    setCotizaciones([]);
    setActiveStep(1);
    setLeadModalOpen(false);
  };

  const stepIndicators = [
    { id: 1, title: 'El Vehículo', status: activeStep < 4 ? 'active' : 'completed' },
    { id: 2, title: 'Ubicación', status: activeStep < 4 ? 'inactive' : activeStep === 4 ? 'active' : 'completed' },
    { id: 3, title: 'Cotización', status: activeStep === 5 ? 'active' : activeStep > 5 ? 'completed' : 'inactive' },
    { id: 4, title: 'Finalizado', status: activeStep === 6 ? 'active' : 'inactive' },
  ];

  return (
    <Layout>
      <SEOHelmet title="Cotizador de Auto" description="Asegurá tu auto con Yuju." />

      <div className="relative pt-32 pb-12 px-6 bg-bg-secondary min-h-screen transition-colors duration-500">
        <div className={`mx-auto space-y-10 relative z-20 ${activeStep === 5 ? 'max-w-[100%] xl:max-w-[98%] 2xl:max-w-[1800px]' : 'max-w-4xl'}`}>

          {/* Premium Header Section */}
          <AnimatePresence>
            {activeStep < 5 && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-6 mb-16"
              >
                <div className="px-4 py-2 bg-yuju-blue/10 backdrop-blur-md border border-yuju-blue/20 rounded-full inline-flex items-center gap-3 shadow-xl shadow-yuju-blue/5">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </div>
                  <span className="text-yuju-blue text-[11px] font-bold uppercase tracking-wider">Cotización instantánea</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black font-accent text-text-primary tracking-tighter leading-none">
                  Seguro de auto
                </h1>
                
                <p className="text-text-secondary font-medium text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                  Comparás los precios de las mejores compañías y elegís la cobertura que más te sirve.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

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
                  <p className={`text-[9px] font-black tracking-[0.2em] transition-colors duration-500 whitespace-nowrap ${step.status === 'completed' ? 'text-yuju-blue opacity-100' : step.status === 'active' ? 'text-yuju-blue opacity-100' : 'text-text-secondary opacity-30'}`}>
                    {step.title}
                  </p>
                </div>
              </div>
            ))}
          </div>


          <GlassCard className="p-6 md:p-10 rounded-[32px] border-border-primary shadow-xl bg-bg-primary/70 relative overflow-visible backdrop-blur-xl">
            {activeStep < 5 && (
              <div className="space-y-8 py-2 relative">
                <div className="space-y-3"><div className="flex items-center gap-2"><div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 ${formData.marcaId ? 'bg-yuju-blue text-white' : 'bg-bg-secondary text-text-secondary opacity-40'}`}><ShieldCheck size={16} /></div><div className="flex-1"><h2 className="text-sm font-black font-accent uppercase tracking-tighter leading-none">Marca del Vehículo</h2><p className="text-[10px] text-text-secondary opacity-60 font-bold tracking-widest">Seleccioná la marca de tu rodado</p></div></div><BrandSelect value={formData.marcaId} onChange={(id, name) => setFormData(p => ({ ...p, marcaId: id, marcaName: name }))} /></div>
                <div className={`space-y-3 transition-opacity duration-500 ${activeStep < 2 ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}><div className="flex items-center gap-2"><div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 ${formData.year ? 'bg-yuju-blue text-white' : 'bg-bg-secondary text-text-secondary opacity-40'}`}><ShieldCheck size={16} /></div><div className="flex-1"><h2 className="text-sm font-black font-accent uppercase tracking-tighter leading-none">Año de Fabricación</h2><p className="text-[10px] text-text-secondary opacity-60 font-bold tracking-widest">Modelo según cédula</p></div></div><YearSelect value={formData.year} onChange={(y) => setFormData(p => ({ ...p, year: y }))} /></div>
                <div className={`space-y-3 transition-opacity duration-500 ${activeStep < 3 ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}><div className="flex items-center gap-2"><div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 ${formData.modeloId ? 'bg-yuju-blue text-white' : 'bg-bg-secondary text-text-secondary opacity-40'}`}><ShieldCheck size={16} /></div><div className="flex-1"><h2 className="text-sm font-black font-accent uppercase tracking-tighter leading-none">Modelo y Versión</h2><p className="text-[10px] text-text-secondary opacity-60 font-bold tracking-widest">Buscá la versión específica de tu auto</p></div></div><ModelSelect value={formData.modeloId} marcaId={formData.marcaId} year={formData.year} onChange={(id, name, extra) => setFormData(p => ({ ...p, modeloId: id, modeloName: name, codia: id, version: name, photoUrl: extra?.photoUrl }))} /></div>
                <div className={`space-y-3 transition-opacity duration-500 ${activeStep < 4 ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}><div className="flex items-center gap-2"><div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 ${formData.cp ? 'bg-yuju-blue text-white' : 'bg-bg-secondary text-text-secondary opacity-40'}`}><MapPin size={16} /></div><div className="flex-1"><h2 className="text-sm font-black font-accent uppercase tracking-tighter leading-none">Lugar de Guarda</h2><p className="text-[10px] text-text-secondary opacity-60 font-bold tracking-widest">Código Postal de residencia</p></div></div><PostalCodeSelect value={formData.cp} localidad={formData.localidad} onChange={(cp, loc, cityCode) => setFormData(p => ({ ...p, cp, localidad: loc, sancorCityCode: cityCode || null }))} /></div>
                {formData.cp.length === 4 && activeStep === 4 && (
                  <div className="flex justify-center pt-6"><Button onClick={handleCotizar} isLoading={isProcessing} className="w-full md:w-auto px-12 h-14 bg-yuju-blue text-white font-black tracking-widest shadow-xl shadow-yuju-blue/20">Obtener Cotización</Button></div>
                )}
              </div>
            )}

            {activeStep === 5 && (
              <div className="space-y-10">
                {/* Atrás button top edge */}
                <div className="-mt-6 md:-mt-10 -mx-6 md:-mx-10 px-6 md:px-10 pt-4 md:pt-5 pb-5 mb-4 border-b border-border-primary/40">
                  <button onClick={() => setActiveStep(4)} className="flex items-center gap-2.5 group cursor-pointer">
                    <div className="p-2 bg-yuju-blue/10 group-hover:bg-yuju-blue/20 text-yuju-blue rounded-xl transition-all">
                      <ArrowLeft size={20} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-yuju-blue">Atrás</span>
                  </button>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-border-primary pb-8">
                  <div className="text-left">
                    <p className="text-[10px] font-black text-text-secondary opacity-60 tracking-widest">Resultados para tu</p>
                    <h2 className="text-xl md:text-3xl font-black font-accent text-yuju-blue leading-none">{formData.marcaName} {formData.modeloName}</h2>
                  </div>

                  {/* Selector de Medio de Pago */}
                  <div className="flex items-center gap-4 bg-bg-secondary px-5 py-3 rounded-full border border-border-primary shadow-sm">
                    <span className="text-[11px] font-black text-text-secondary tracking-widest">¿PAGÁS CON TARJETA?</span>
                    <button
                      onClick={() => setIsCreditCard(!isCreditCard)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${isCreditCard ? 'bg-yuju-blue' : 'bg-text-secondary/20'}`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${isCreditCard ? 'translate-x-6' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>
                </div>

                {/* Filtro de Categoría para Mobile */}
                <div className="md:hidden space-y-2">
                  <p className="text-[11px] font-black text-text-secondary opacity-60 tracking-widest uppercase px-1">¿Qué plan te interesa ver?</p>
                  <div className="relative group">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full h-14 bg-bg-secondary border-2 border-border-primary rounded-2xl px-6 outline-none font-bold text-text-primary appearance-none focus:border-yuju-blue/30 transition-all cursor-pointer shadow-sm"
                    >
                      {['Responsabilidad Civil', 'Terceros Completo', 'Terceros Completo Full', 'Todo Riesgo'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary opacity-40">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </div>
                  </div>
                </div>

                {isProcessing && cotizaciones.length === 0 ? (
                  <div className="text-center py-16 space-y-10 w-full col-span-full">
                    <div className="w-24 h-24 bg-yuju-blue/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                      <div className="absolute inset-0 bg-yuju-blue/10 blur-xl rounded-full animate-pulse" />
                      <div
                        className="w-16 h-16 relative z-10 animate-float"
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
                      />
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-4xl font-black text-text-primary font-accent tracking-tighter whitespace-pre-wrap">Buscando la mejor cotización</h2>
                      <p className="text-text-secondary font-medium max-w-xs mx-auto">
                        Estamos comparando las mejores tasas de aseguradoras especializadas.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
                    {['Responsabilidad Civil', 'Terceros Completo', 'Terceros Completo Full', 'Todo Riesgo'].map((category) => {
                      const categoryQuotes = cotizaciones.filter(c => c.category === category);
                      const isHiddenOnMobile = selectedCategory !== category;

                      return (
                        <div key={category} className={`space-y-4 ${isHiddenOnMobile ? 'hidden md:block' : 'block'}`}>
                          <h3 className="text-sm font-black text-center tracking-widest text-text-secondary opacity-60 py-2 border-b border-border-primary mb-2">{category}</h3>
                          {categoryQuotes.map((cot, idx) => {
                            const logoUrl = getInsurerLogo(cot.aseguradora);
                            return (
                              <div key={idx} className="bg-bg-primary border-2 border-border-primary/50 rounded-3xl p-5 hover:border-yuju-blue hover:shadow-[0_0_25px_rgba(51,105,255,0.2)] transition-all duration-500 relative flex flex-col min-h-[240px] group/card">
                                <div className="flex justify-between items-start mb-4">
                                  <h4 className="text-[11px] font-black text-text-primary leading-tight pr-6">{cot.cobertura}</h4>
                                  <div className="h-6 shrink-0"><img src={logoUrl ?? undefined} alt={cot.aseguradora} className="h-full object-contain" style={{ filter: 'var(--logo-filter)' }} /></div>
                                </div>
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2 mb-1 min-h-[16px]">
                                      {(isCreditCard && cot.discountPercent > 0) && (
                                        <>
                                          <span className="text-xs font-bold text-text-secondary line-through opacity-40">
                                            ${Math.round(cot.originalPrice).toLocaleString('es-AR')}
                                          </span>
                                          <span className="text-[11px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-md">
                                            -{cot.discountPercent}% Off
                                          </span>
                                        </>
                                      )}
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                      <span className="text-3xl font-black text-text-primary tracking-tighter">
                                        ${Math.round(isCreditCard ? cot.precio : cot.originalPrice).toLocaleString('es-AR')}
                                      </span>
                                      <span className="text-[10px] font-bold text-text-secondary opacity-60">/mes</span>
                                    </div>

                                  </div>
                                  <div className="relative group/tooltip">
                                    <button onClick={() => {
                                      const finalQuote = {
                                        ...cot,
                                        precio: isCreditCard ? cot.precio : cot.originalPrice
                                      };
                                      setSelectedQuoteForModal(finalQuote);
                                      setModalOpen(true);
                                    }} className="p-1.5 rounded-full bg-bg-secondary text-text-secondary group-hover/card:text-yuju-blue group-hover/card:bg-yuju-blue/5 border border-border-primary transition-all shadow-sm shrink-0">
                                      <Info size={16} />
                                    </button>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-0.5 bg-text-primary text-bg-primary text-[8px] font-medium rounded-md opacity-0 group-hover/card:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-10">
                                      Ver detalle de cobertura
                                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-text-primary"></div>
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-2 mb-6 pt-2">
                                  <div className="flex justify-between items-center text-[11px]"><span className="font-bold text-text-secondary opacity-60">Suma Asegurada</span><span className="font-black text-text-primary">${Math.round(cot.sumaAsegurada).toLocaleString('es-AR')}</span></div>
                                </div>
                                <div className="mt-auto">
                                  <Button className="w-full h-11 rounded-xl font-black text-[10px] tracking-widest bg-yuju-blue hover:bg-blue-700 border-none flex items-center justify-center gap-2 shadow-lg shadow-yuju-blue/10" onClick={() => { setSelectedQuoteForLead(cot); setLeadModalOpen(true); }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366" stroke="none"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
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
                )
                }
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {activeStep === 6 && (
        <SuccessStep
          onReset={handleReset}
          brand={formData.marcaName}
          model={formData.modeloName}
          insurer={selectedQuoteForLead?.aseguradora || 'la aseguradora elegida'}
        />
      )}

      <AnimatePresence>
        {leadModalOpen && selectedQuoteForLead && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLeadModalOpen(false)} className="absolute inset-0 bg-bg-dark/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-bg-primary rounded-[32px] w-full max-w-md p-8 shadow-2xl overflow-hidden border border-border-primary">
              <div className="space-y-6">
                <div className="h-10"><img src={getInsurerLogo(selectedQuoteForLead.aseguradora) ?? undefined} alt="Logo" className="h-full object-contain" style={{ filter: 'var(--logo-filter)' }} /></div>

                <div>
                  <h3 className="text-xl font-black text-yuju-blue leading-tight mb-1">{selectedQuoteForLead.cobertura}</h3>
                  <p className="text-sm font-black text-text-primary tracking-tighter">{formData.marcaName} - {formData.modeloName} ({formData.year})</p>
                  <p className="text-[10px] font-bold text-text-secondary opacity-40 mt-1">{formatTodayDDMMYYYY().replace(/-/g, '/')}</p>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1 min-h-[16px]">
                    {(isCreditCard && selectedQuoteForLead.discountPercent > 0) && (
                      <>
                        <span className="text-xs font-bold text-text-secondary opacity-40 line-through">
                          ${Math.round(selectedQuoteForLead.originalPrice).toLocaleString('es-AR')}
                        </span>
                        <span className="text-[11px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-md">
                          -{selectedQuoteForLead.discountPercent}% Off
                        </span>
                      </>
                    )}
                  </div>
                  <span className="text-3xl font-black text-yuju-blue tracking-tighter">
                    ${Math.round(isCreditCard ? selectedQuoteForLead.precio : selectedQuoteForLead.originalPrice).toLocaleString('es-AR')}/mes
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 relative">
                    <p className="text-sm font-black text-text-secondary opacity-60">¿Pagás con tarjeta de crédito?</p>
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowCardTooltip(!showCardTooltip); }}
                        className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-yuju-blue/5 transition-colors cursor-pointer"
                      >
                        <Info size={16} className="text-yuju-blue/40" />
                      </button>

                      <AnimatePresence>
                        {showCardTooltip && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 bg-white border-2 border-yuju-blue rounded-2xl shadow-2xl z-[120]"
                          >
                            <button
                              onClick={() => setShowCardTooltip(false)}
                              className="absolute top-2 right-2 text-yuju-blue/40 hover:text-yuju-blue p-1"
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                            <p className="text-[11px] font-bold text-yuju-blue leading-relaxed">
                              Estás seleccionando el pago con tarjeta de crédito. Se aplicará el descuento especial a tu cotización.
                            </p>
                            {/* Tooltip Tail */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[2px]">
                              <div className="w-4 h-4 bg-white border-b-2 border-r-2 border-yuju-blue rotate-45 transform origin-top-left"></div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
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
                  className="w-full h-14 bg-yuju-blue hover:bg-blue-700 text-white font-black tracking-widest rounded-2xl shadow-xl shadow-yuju-blue/20"
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
          vehicleInfo={{ brand: formData.marcaName, model: formData.modeloName, version: formData.version, year: formData.year, codia: formData.codia, photoUrl: formData.photoUrl }}
          price={Number(selectedQuoteForModal.precio)}
          isCreditCard={isCreditCard}
        />
      )}

      <FAQAccordion
        items={autoFAQ}
        accentColor="text-yuju-blue"
        borderColor="border-yuju-blue/30"
        bgColor="bg-yuju-blue/5"
      />
    </Layout>
  );
};

const autoFAQ = [
  {
    id: 1,
    title: "¿Por qué necesito un seguro de auto?",
    subtitle: "Un seguro de auto no solo es una obligación legal, sino también una protección para vos y para los demás. El seguro de auto que tenés que tener como mínimo es el de responsabilidad civil, que te cubre los daños que le puedas ocasionar a otras personas con tu auto. Si no tenés un seguro de auto, estás infringiendo la ley de tránsito y te exponés a multas, sanciones o incluso la retención de tu vehículo."
  },
  {
    id: 2,
    title: "¿Qué tipo de seguro debo contratar?",
    subtitle: "Eso depende de vos, de tu auto y de tus preferencias. Además del seguro de responsabilidad civil, que es el obligatorio, podés contratar otros seguros que te protegen más, como el de terceros completos o el de todo riesgo."
  },
  {
    id: 3,
    title: "¿Cómo se actualiza el valor de las coberturas en la póliza de seguro? ¿Cuenta con cláusula de ajuste?",
    subtitle: "La inflación puede desactualizar el valor de tu auto y de tu seguro. Por eso, existen distintas formas de actualizar el valor de las coberturas, para que puedas reponer tu auto si te pasa algo. Esto depende de la compañía de seguros que elijas. Algunas formas son: cláusula de ajuste de suma asegurada, actualizar la suma asegurada en cada renovación de la póliza, o solicitar el aumento durante la vigencia mediante un endoso."
  },
  {
    id: 4,
    title: "¿Qué cubre el seguro de responsabilidad civil, el de terceros y el de todo riesgo?",
    subtitle: "El seguro de responsabilidad civil cubre daños físicos y materiales a terceros. El seguro de terceros incluye además robo total, incendio total y destrucción total. Terceros completos agrega robo parcial e incendio parcial. Todo riesgo incluye estas coberturas y también daños totales o parciales por accidentes, vandalismo, granizo, y más."
  },
  {
    id: 5,
    title: "¿Qué documentación debo tener para circular con mi auto?",
    subtitle: "Necesitás llevar DNI, licencia de conducir, cédula verde o azul, comprobante de seguro vigente, certificado de VTV o RTO, comprobante de pago del impuesto automotor y un kit de seguridad vial (balizas, matafuegos y chaleco reflectivo)."
  },
  {
    id: 6,
    title: "¿Qué debo hacer en caso de tener un siniestro con mi auto?",
    subtitle: "Primero, asegurate de que todos estén bien y llamá al 911 si es necesario. Activá las balizas y usá el chaleco reflectivo. Intercambiá datos con los involucrados, sacá fotos del siniestro, completá la denuncia y comunicate con tu aseguradora para informar el incidente."
  },
  {
    id: 7,
    title: "¿Cuándo tengo que pagar el seguro?",
    subtitle: "El seguro se paga por mes adelantado. La fecha de pago depende del día en que contrataste el seguro."
  },
  {
    id: 8,
    title: "¿Qué pasa si choco y mi seguro está vencido?",
    subtitle: "Si no pagaste a tiempo, no tenés cobertura. Un seguro es un contrato: la aseguradora se compromete a cubrirte si pagás tu cuota en el plazo acordado."
  },
  {
    id: 9,
    title: "Si alguien más maneja mi auto, ¿tengo cobertura?",
    subtitle: "Sí, siempre que el conductor esté habilitado para manejar (carnet y tarjeta azul)."
  },
  {
    id: 10,
    title: "¿Soy responsable de daños a terceros aunque no estuviera manejando?",
    subtitle: "Sí, como dueño del auto, sos responsable de los daños que cause tu vehículo."
  },
  {
    id: 11,
    title: "¿Qué puedo hacer si choco contra un vehículo que no tenía seguro?",
    subtitle: "Hacé la denuncia policial dentro de las 48 horas, y si tenés pruebas del seguro vencido, podés usarlas para iniciar un juicio contra el conductor."
  },
  {
    id: 12,
    title: "¿Podemos asegurar con patente en trámite?",
    subtitle: "Sí, tenés hasta un año para agregar la patente."
  },
  {
    id: 13,
    title: "¿Inspeccionan mi vehículo?",
    subtitle: "La inspección es virtual y se realiza mediante fotos del vehículo y su documentación."
  },
  {
    id: 14,
    title: "¿Tengo cobertura fuera de Argentina?",
    subtitle: "Sí, para vehículos particulares en Argentina y países limítrofes. Vehículos comerciales necesitan una póliza especial (A5)."
  },
  {
    id: 15,
    title: "¿Se pueden asegurar autos clásicos?",
    subtitle: "Sí, siempre que tengan piezas originales y no tengan modificaciones."
  },
  {
    id: 16,
    title: "¿Puedo asegurar autos con modificaciones?",
    subtitle: "Sí, siempre que las modificaciones estén homologadas y declaradas en el título o la cédula."
  },
  {
    id: 17,
    title: "¿Qué es CLEAS?",
    subtitle: "Es un sistema que simplifica los siniestros entre aseguradoras, resolviendo reclamos sin que el asegurado tenga que intervenir entre las compañías."
  },
  {
    id: 18,
    title: "¿Cómo recibo la documentación?",
    subtitle: "La documentación se envía en formato PDF por mail, WhatsApp o a través de la App móvil."
  },
  {
    id: 19,
    title: "¿Qué es la franquicia, cómo y cuándo se aplica?",
    subtitle: "Es el monto que paga el asegurado en un siniestro por daño parcial. Cuanto mayor sea la franquicia, menor será la cuota mensual."
  },
  {
    id: 20,
    title: "¿Cuál es la vigencia de la póliza?",
    subtitle: "Generalmente, la vigencia es anual con refacturaciones trimestrales que ajustan el valor del auto y del seguro."
  },
  {
    id: 21,
    title: "¿Qué vehículos se pueden asegurar?",
    subtitle: "Se pueden asegurar automóviles, pick-ups, motos, bicicletas con motor, casas rodantes, camiones, acoplados, máquinas viales y tractores, siempre que cumplan con los requisitos de antigüedad y buen estado."
  }
];
