import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ShieldCheck, MapPin, Loader2, Check, RefreshCw, ArrowLeft } from 'lucide-react';
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
import { FAQAccordion } from '../../components/cotizadores/FAQAccordion';

const autoFAQ = [
  { id: 1, title: "¿Por qué necesito un seguro de auto?", subtitle: "Un seguro de auto no solo es una obligación legal, sino también una protección para vos y para los demás. El seguro mínimo es el de responsabilidad civil, que cubre los daños que le puedas ocasionar a otras personas. Si no tenés seguro, estás infringiendo la ley de tránsito." },
  { id: 2, title: "¿Qué tipo de seguro debo contratar?", subtitle: "Depende de vos, tu auto y tus preferencias. Además del obligatorio de responsabilidad civil, podés contratar terceros completos o todo riesgo." },
  { id: 3, title: "¿Cómo se actualiza el valor de las coberturas?", subtitle: "La inflación puede desactualizar el valor de tu auto y de tu seguro. Existen distintas formas: cláusula de ajuste, actualizar la suma asegurada en cada renovación, o solicitar el aumento mediante un endoso." },
  { id: 4, title: "¿Qué cubre el seguro de responsabilidad civil, el de terceros y el de todo riesgo?", subtitle: "Responsabilidad civil cubre daños a terceros. Terceros agrega robo total, incendio total y destrucción total. Terceros completos agrega robo parcial e incendio parcial. Todo riesgo incluye daños por accidentes, vandalismo, granizo y más." },
  { id: 5, title: "¿Qué documentación debo tener para circular?", subtitle: "Necesitás llevar DNI, licencia de conducir, cédula verde o azul, comprobante de seguro vigente, VTV o RTO, impuesto automotor y kit de seguridad vial (balizas, matafuegos y chaleco)." },
  { id: 6, title: "¿Qué debo hacer en caso de siniestro?", subtitle: "Aseguráte de que todos estén bien y llamá al 911 si es necesario. Activá las balizas y usá el chaleco. Intercambiá datos, sacá fotos, completá la denuncia y comunicate con tu aseguradora." },
  { id: 7, title: "¿Cuándo tengo que pagar el seguro?", subtitle: "El seguro se paga por mes adelantado. La fecha de pago depende del día en que contrataste el seguro." },
  { id: 8, title: "¿Qué pasa si choco y mi seguro está vencido?", subtitle: "Si no pagaste a tiempo, no tenés cobertura. Un seguro es un contrato: la aseguradora se compromete a cubrirte si pagás tu cuota en el plazo acordado." },
  { id: 9, title: "Si alguien más maneja mi auto, ¿tengo cobertura?", subtitle: "Sí, siempre que el conductor esté habilitado para manejar (carnet y tarjeta azul)." },
  { id: 10, title: "¿Soy responsable de daños a terceros aunque no estuviera manejando?", subtitle: "Sí, como dueño del auto, sos responsable de los daños que cause tu vehículo." },
  { id: 11, title: "¿Qué puedo hacer si choco contra un vehículo sin seguro?", subtitle: "Hacé la denuncia policial dentro de las 48 horas. Si tenés pruebas del seguro vencido, podés usarlas para iniciar un juicio contra el conductor." },
  { id: 12, title: "¿Podemos asegurar con patente en trámite?", subtitle: "Sí, tenés hasta un año para agregar la patente." },
  { id: 13, title: "¿Inspeccionan mi vehículo?", subtitle: "La inspección es virtual y se realiza mediante fotos del vehículo y su documentación." },
  { id: 14, title: "¿Tengo cobertura fuera de Argentina?", subtitle: "Sí, para vehículos particulares en Argentina y países limítrofes. Vehículos comerciales necesitan una póliza especial (A5)." },
  { id: 15, title: "¿Se pueden asegurar autos clásicos?", subtitle: "Sí, siempre que tengan piezas originales y no tengan modificaciones no declaradas." },
  { id: 16, title: "¿Puedo asegurar autos con modificaciones?", subtitle: "Sí, siempre que las modificaciones estén homologadas y declaradas en el título o la cédula." },
  { id: 17, title: "¿Qué es CLEAS?", subtitle: "Es un sistema que simplifica los siniestros entre aseguradoras, resolviendo reclamos sin que el asegurado tenga que intervenir entre las compañías." },
  { id: 18, title: "¿Cómo recibo la documentación?", subtitle: "La documentación se envía en formato PDF por mail, WhatsApp o a través de la App móvil de cada seguro." },
  { id: 19, title: "¿Qué es la franquicia, cómo y cuándo se aplica?", subtitle: "Es el monto que paga el asegurado en un siniestro por daño parcial. Cuanto mayor sea la franquicia, menor será la cuota mensual." },
  { id: 20, title: "¿Cuál es la vigencia de la póliza?", subtitle: "Generalmente, la vigencia es anual con refacturaciones trimestrales que ajustan el valor del auto y del seguro." },
  { id: 21, title: "¿Qué vehículos se pueden asegurar?", subtitle: "Automóviles, pick-ups, motos, bicicletas con motor, casas rodantes, camiones, acoplados, máquinas viales y tractores, siempre que cumplan con los requisitos de antigüedad y buen estado." },
];

export const AutoCotizador = () => {
  const [formData, setFormData] = useState({
    marcaId: '',
    marcaName: '',
    year: '',
    modeloId: '',
    modeloName: '',
    cp: '',
    localidad: '',
    codia: '',
    version: ''
  });

  const [activeStep, setActiveStep] = useState(1); // 1: Marca, 2: Año, 3: Modelo, 4: CP, 5: Results
  const [isProcessing, setIsProcessing] = useState(false);

  // Progressive unlocking logic
  useEffect(() => {
    if (formData.marcaId && activeStep === 1) setActiveStep(2);
    if (formData.year && activeStep === 2) setActiveStep(3);
    if (formData.modeloId && activeStep === 3) setActiveStep(4);
  }, [formData, activeStep]);

  const [cotizaciones, setCotizaciones] = useState<any[]>([]);

  const handleCotizar = async () => {
    setIsProcessing(true);
    setCotizaciones([]);
    setActiveStep(5);
    
    try {
      const { getAccessToken } = await import('../../services/apiClient');
      const token = await getAccessToken();
      const payload = {
        marca: formData.marcaId,
        modelo: formData.modeloId,
        version: formData.version,      
        anio: formData.year,
        codigoPostal: formData.cp,
        localidad: formData.localidad,
        tieneGNC: false,
        esOKM: false,
        esComercial: false,
        marcaNombre: formData.marcaName,
        modeloNombre: formData.modeloName,
        codia: formData.codia,
        codInfoAuto: formData.codia,
        infoauto: formData.codia,
        version_desc: formData.version
      };

      console.log("=== PAYLOAD FRONTEND ENVIADO AL BACKEND ===", payload);

      const API_URL = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'https://api-yuju.com.ar/api';

      const response = await fetch(`${API_URL}/cotizar-stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
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
          if (jsonStr === "[DONE]") break;

          try {
            const data = JSON.parse(jsonStr);
            if (data.done) break;
            if (data.error) continue;

            setCotizaciones(prev => {
              let newQuotes: any[] = [];
              
              const processItem = (item: any) => {
                if (item.planes && Array.isArray(item.planes)) {
                  item.planes.forEach((p: any) => {
                    const enriched = enrichAndValidateQuote(p, item.aseguradora, Number(formData.year), 1);
                    if (enriched) {
                      newQuotes.push({
                        aseguradora: item.aseguradora,
                        cobertura: p.nombre || p.cobertura || p.producto || 'Cobertura',
                        franquicia: p.franquicia,
                        precio: enriched.monthlyPrice,
                        sumaAsegurada: p.sumaAsegurada || 0,
                        category: enriched.finalCategory
                      });
                    }
                  });
                }
              };

              if (Array.isArray(data)) {
                data.forEach(processItem);
              } else {
                processItem(data);
              }
              
              // Filtrar cotizaciones sin precio válido y ordenar por precio ascendente
              const allQuotes = [...prev, ...newQuotes].filter(c => Number(c.precio) > 0);
              return allQuotes.sort((a, b) => Number(a.precio) - Number(b.precio));
            });
          } catch (e) {
            console.error("Error pardeando JSON de stream:", e, jsonStr);
          }
        }
      }
    } catch (error) {
      console.error("=== ERROR FETCHING QUOTES FRONTEND ===", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetAll = () => {
    setFormData({
      marcaId: '',
      marcaName: '',
      year: '',
      modeloId: '',
      modeloName: '',
      codia: '',
      version: '',
      cp: '',
      localidad: ''
    });
    setActiveStep(1);
    setCotizaciones([]);
  };

  const stepIndicators = [
    { id: 1, title: 'El Vehículo', status: activeStep < 4 ? 'active' : 'completed' },
    { id: 2, title: 'Ubicación', status: activeStep < 4 ? 'inactive' : activeStep === 4 ? 'active' : 'completed' },
    { id: 3, title: 'Cotización', status: activeStep < 5 ? 'inactive' : 'active' },
  ];

  return (
    <Layout>
      <SEOHelmet 
        title="Cotizador de Auto" 
        description="Asegurá tu auto con la tecnología más avanzada de Argentina."
      />
      
      <div className="relative pt-28 md:pt-36 lg:pt-40 pb-12 px-6 bg-bg-secondary transition-colors duration-500 overflow-visible">
        {/* Background decorative patterns */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-yuju-blue/5 blur-[150px] rounded-full -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-yuju-cyan/5 blur-[120px] rounded-full -z-10" />

        <div className={`mx-auto space-y-10 relative z-20 transition-all duration-700 ${activeStep === 5 ? 'max-w-[100%] xl:max-w-[98%] 2xl:max-w-[1800px]' : 'max-w-4xl'}`}>
          
          {/* Premium Progress Indicators (Medium Density) */}
          <div className="flex justify-between items-center px-4 md:px-8 relative mb-8">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border-primary -translate-y-1/2 z-0 mx-8 hidden md:block" />
            
            {stepIndicators.map((step) => (
              <div key={step.id} className="flex flex-col items-center gap-3 relative z-10 min-w-[5rem]">
                <motion.div 
                  initial={false}
                  animate={{ 
                    backgroundColor: step.status === 'completed' ? '#3369ff' : step.status === 'active' ? '#3369ff' : 'var(--bg-primary)',
                    boxShadow: step.status === 'active' ? '0 0 28px rgba(51, 105, 255, 0.5)' : step.status === 'completed' ? '0 0 15px rgba(51, 105, 255, 0.3)' : 'none',
                    scale: step.status === 'active' ? 1.15 : 1,
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

          {/* Mobile/Tablet Back Button - shown between stepper and card */}
          {activeStep > 1 && (
            <motion.button
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setActiveStep(prev => prev - 1)}
              className="flex lg:hidden items-center gap-3 group px-2 py-1 -mt-2 mb-2 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-yuju-blue/10 flex items-center justify-center group-hover:bg-yuju-blue/20 transition-all shadow-sm">
                <ArrowLeft size={18} className="text-yuju-blue" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-yuju-blue">Volver</span>
            </motion.button>
          )}

          <GlassCard className="p-4 md:p-8 border-border-primary bg-bg-primary/70 rounded-[28px] shadow-2xl relative !overflow-visible backdrop-blur-3xl">
            
            <div className="relative">
              {activeStep > 1 && (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setActiveStep(prev => prev - 1)}
                  className="hidden lg:flex absolute top-0 -left-20 xl:-left-52 2xl:-left-60 items-center gap-3 group z-50 px-2 py-1 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-yuju-blue/10 flex items-center justify-center group-hover:bg-yuju-blue/20 transition-all shadow-lg backdrop-blur-sm">
                    <ArrowLeft size={20} className="text-yuju-blue" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-yuju-blue drop-shadow-sm">Volver</span>
                </motion.button>
              )}
            {/* Form Section */}
            <div className={`transition-all duration-700 ${activeStep === 5 ? 'max-w-3xl mx-auto opacity-40 hover:opacity-100 mb-12 h-0 overflow-hidden py-0' : 'space-y-6'}`}>
              
              {/* Step 1: MARCA */}
              <div className="relative z-[40] space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 ${formData.marcaId ? 'bg-yuju-blue text-white' : 'bg-bg-secondary text-text-secondary opacity-40'}`}>
                    <ShieldCheck size={16} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm font-black font-accent tracking-tighter leading-none">Marca del Vehículo</h2>
                    <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest opacity-50 mt-0.5">Seleccioná la marca de tu rodado</p>
                  </div>
                </div>
                
                <BrandSelect 
                  value={formData.marcaId} 
                  onChange={(id, name) => setFormData(prev => ({ ...prev, marcaId: id, marcaName: name }))} 
                />

                {formData.marcaId && (
                   <motion.button 
                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.5 }}
                    onClick={handleResetAll}
                    title="Reiniciar cotizador"
                    className="absolute -right-2 top-0 p-2 text-yuju-blue hover:text-yuju-cyan transition-colors cursor-pointer"
                   >
                     <RefreshCw size={14} />
                   </motion.button>
                )}
              </div>

              {/* Step 2: AÑO */}
              <motion.div 
                className={`relative z-[30] pt-6 space-y-3 rounded-2xl transition-all duration-500 ${activeStep < 2 ? 'opacity-30 grayscale pointer-events-none' : 'opacity-100'}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 ${formData.year ? 'bg-yuju-blue text-white' : 'bg-bg-secondary text-text-secondary opacity-40'}`}>
                    <ShieldCheck size={16} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm font-black font-accent tracking-tighter leading-none">Año de Fabricación</h2>
                    <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest opacity-50 mt-0.5">Modelo de fabricación según cédula</p>
                  </div>
                </div>

                <YearSelect 
                  value={formData.year} 
                  onChange={(year) => setFormData(prev => ({ ...prev, year }))} 
                />
              </motion.div>

              {/* Step 3: MODELO */}
              <motion.div 
                className={`relative z-[20] pt-6 space-y-3 rounded-2xl transition-all duration-500 ${activeStep < 3 ? 'opacity-30 grayscale pointer-events-none' : 'opacity-100'}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 ${formData.modeloId ? 'bg-yuju-blue text-white' : 'bg-bg-secondary text-text-secondary opacity-40'}`}>
                    <ShieldCheck size={16} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm font-black font-accent tracking-tighter leading-none">Modelo y Versión</h2>
                    <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest opacity-50 mt-0.5">Buscá la versión específica de tu auto</p>
                  </div>
                </div>

                <ModelSelect 
                  value={formData.modeloId}
                  marcaId={formData.marcaId}
                  year={formData.year}
                  onChange={(id, name, _extra) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      modeloId: id, 
                      modeloName: name,
                      codia: id,
                      version: name
                    }));
                  }}
                />
              </motion.div>

              {/* Step 4: CP */}
              <motion.div 
                className={`relative z-[10] pt-6 space-y-3 rounded-2xl transition-all duration-500 ${activeStep < 4 ? 'opacity-30 grayscale pointer-events-none' : 'opacity-100'}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 ${formData.cp ? 'bg-yuju-blue text-white' : 'bg-bg-secondary text-text-secondary opacity-40'}`}>
                    <MapPin size={16} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm font-black font-accent tracking-tighter leading-none">Lugar de Guarda</h2>
                    <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest opacity-50 mt-0.5">Ingresá el Código Postal de residencia</p>
                  </div>
                </div>

                <PostalCodeSelect 
                  value={formData.cp}
                  localidad={formData.localidad}
                  onChange={(cp, loc) => setFormData(prev => ({ ...prev, cp, localidad: loc }))}
                />
              </motion.div>

            </div> {/* End of Form wrapper */}

            {/* Final Action Button */}
            <AnimatePresence>
              {formData.cp.length === 4 && activeStep < 5 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="pt-6 flex flex-col items-center gap-4"
                >
                  <Button 
                    onClick={handleCotizar}
                    isLoading={isProcessing}
                    className="w-full md:w-auto px-12 h-14 rounded-xl bg-gradient-to-r from-yuju-blue to-yuju-cyan border-none text-base font-black shadow-2xl shadow-yuju-blue/30 group"
                  >
                    {isProcessing ? 'Analizando Coberturas...' : 'Obtener Cotización'}
                    {!isProcessing && <Zap size={18} className="ml-3 group-hover:scale-125 transition-transform" />}
                  </Button>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary opacity-40">
                     <Zap size={14} className="text-yuju-blue" /> Tecnología Predictiva Yuju 2026
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Matrix Layout Results View */}
            {activeStep === 5 && (
               <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 w-full mt-8"
               >
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4 border-b border-border-primary pb-6">
                    <div className="text-center md:text-left">
                      <h2 className="text-4xl font-black font-accent tracking-tighter">Comparador</h2>
                      <p className="text-text-secondary font-medium">Analizando opciones para {formData.marcaName} {formData.modeloName}</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <Button variant="outline" className="border-yuju-blue text-yuju-blue">Descargar PDF</Button>
                    </div>
                  </div>

                  {isProcessing && (
                    <div className="w-full flex justify-center py-4 mb-4">
                      <div className="flex items-center gap-3 text-yuju-blue px-6 py-3 bg-yuju-blue/10 rounded-full font-bold">
                         <Loader2 size={18} className="animate-spin" />
                         Buscando en aseguradoras...
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full items-start">
                    {['Responsabilidad Civil', 'Terceros Completo', 'Terceros Completo Full', 'Todo Riesgo'].map((categoryName) => {
                      
                      const categoryQuotes = cotizaciones.filter(c => c.category === categoryName);

                      return (
                        <div key={categoryName} className="flex flex-col gap-4">
                          <h3 className="text-lg font-black tracking-tight border-b-2 border-yuju-blue/30 pb-2 mb-2 text-center text-text-primary/90">{categoryName}</h3>
                          
                          {categoryQuotes.length === 0 && !isProcessing && (
                            <div className="text-center py-8 text-text-secondary opacity-40 italic text-sm">
                              Sin resultados
                            </div>
                          )}

                          {categoryQuotes.map((cot, idx) => {
                            const logoUrl = getInsurerLogo(cot.aseguradora);
                            
                            return (
                              <div key={idx} className="bg-bg-secondary/20 backdrop-blur-sm border-2 border-border-primary/50 rounded-2xl p-3 sm:p-4 flex flex-col shadow-sm hover:shadow-[0_0_20px_rgba(51,105,255,0.25)] hover:border-yuju-blue transition-all duration-500 relative overflow-hidden group/card h-[190px] sm:h-[210px]">
                                {/* Glassmore Hover Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-yuju-blue/10 to-yuju-cyan/10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none -z-10 blur-xl" />
                                <div className="absolute inset-0 bg-bg-primary/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none -z-10 backdrop-blur-md" />
                                
                                <div className="relative z-10 flex flex-col h-full">
                                  {/* Header: Logo & Title (Enhanced Visibility) */}
                                  <div className="flex flex-col mb-3">
                                    <div className="flex items-center justify-between mb-2">
                                      {logoUrl ? (
                                        <div className="flex items-center h-8">
                                          <img src={logoUrl} alt={cot.aseguradora} className="max-h-full w-auto object-contain" />
                                        </div>
                                      ) : (
                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-60 leading-none">{cot.aseguradora}</span>
                                      )}
                                      <div className="text-[9px] font-black uppercase text-yuju-blue opacity-40 tracking-widest">Premium</div>
                                    </div>
                                    <div className="h-[36px] sm:h-[40px] flex items-center mb-1">
                                      <h4 className="text-[12px] sm:text-[14px] font-black leading-none sm:leading-tight line-clamp-2 text-text-primary tracking-tighter">{cot.cobertura}</h4>
                                    </div>
                                  </div>
                                  {/* Middle: Details (Larger Numbers) */}
                                  <div className="flex-1 border-t border-border-primary/20 pt-3 pb-1 text-xs space-y-1.5">
                                    {cot.sumaAsegurada > 0 && (
                                      <div className="flex justify-between items-center text-text-secondary">
                                        <span className="font-bold opacity-60 tracking-tighter text-[9px] sm:text-[10px]">Suma Seg.</span>
                                        <span className="font-black text-text-primary text-[11px] sm:text-[13px]">${Number(cot.sumaAsegurada).toLocaleString('es-AR')}</span>
                                      </div>
                                    )}
                                    {cot.franquicia && (
                                      <div className="flex justify-between items-center text-text-secondary">
                                        <span className="font-bold opacity-60 tracking-tighter text-[10px]">Franquicia</span>
                                        <span className="font-black text-yuju-cyan px-1.5 py-0.5 bg-yuju-cyan/5 rounded border border-yuju-cyan/10 text-[11px]">{cot.franquicia}</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Footer: Price & Btn (Tight Alignment) */}
                                  <div className="pt-2 border-t border-border-primary/40 flex items-center justify-between mt-auto">
                                    <div className="flex flex-col">
                                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-secondary opacity-40 leading-none mb-1">Cuota Final</span>
                                      <span className="text-[14px] sm:text-lg md:text-xl font-black text-yuju-blue tracking-tighter leading-none">
                                        ${Number(cot.precio || cot.premio || 0).toLocaleString('es-AR')}
                                      </span>
                                    </div>
                                    <Button 
                                      className="h-7 px-3 text-[9px] font-black bg-bg-primary border border-border-primary text-text-primary hover:bg-yuju-blue hover:text-white rounded-lg"
                                    >
                                      ELEGIR
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
            )}
          </div>
          </GlassCard>
          
        </div>
      </div>

      <div className="relative z-0">
        <FAQAccordion
          items={autoFAQ}
          accentColor="text-yuju-blue"
          borderColor="border-yuju-blue/30"
          bgColor="bg-yuju-blue/5"
        />
      </div>
    </Layout>
  );
};
