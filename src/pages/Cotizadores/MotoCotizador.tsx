import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bike, ShieldCheck, MapPin, AlertCircle, Search, Calendar, Tag, Zap, Loader2, Check, RefreshCw, ArrowLeft } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Layout } from '../../layout/Layout';
import { SEOHelmet } from '../../components/SEO/SEOHelmet';
import { MotoResultsGrid } from '../../components/MotoResultsGrid';
import { FAQAccordion } from '../../components/cotizadores/FAQAccordion';

const motoFAQ = [
  { id: 1, title: "¿Es obligatorio contratar un seguro de moto?", subtitle: "Sí, es obligatorio. En Argentina, la ley exige que todo vehículo que circule por las calles tenga un seguro de responsabilidad civil, que cubre los daños que puedas ocasionar a terceros con tu moto. Así, podés manejar con tranquilidad y seguridad, sabiendo que estás cumpliendo con la normativa vigente." },
  { id: 2, title: "¿Qué tipo de seguro de moto puedo contratar?", subtitle: "Además del seguro obligatorio de responsabilidad civil, podés contratar otros tipos de seguro que te brindan una mayor protección para tu moto. Por ejemplo, podés contratar un seguro que cubra el robo total o parcial, el incendio total o parcial, o los daños propios de tu moto. En Yuju Seguros, te ofrecemos diferentes opciones de cobertura para que elijas la que más se adapte a tus necesidades y a tu presupuesto." },
  { id: 3, title: "Trabajo con mi moto, ¿Puedo asegurarla con Yuju?", subtitle: "Sí, podés asegurar tu moto sin importar que sea para trabajar. Tenemos un seguro que se adapta a tu tipo de uso: Particular, Delivery/Mensajería o Comercial, y que te cubre tanto a vos como a tu moto. Se encuentra excluido el uso para motos de competición." },
  { id: 4, title: "¿Podemos asegurar con patente en trámite?", subtitle: "Sí, podemos asegurar con patente en trámite, tenés un año para agregarla." },
  { id: 5, title: "¿Qué documentación necesito para contratar un seguro de moto?", subtitle: "Para contratar un seguro de moto, solo necesitás presentar tu DNI, la cédula verde y/o el título de tu moto. En Yuju Seguros, te facilitamos el proceso de contratación, para que puedas asegurar tu moto de forma rápida y sencilla." },
  { id: 6, title: "¿Cuándo tengo que pagar el seguro?", subtitle: "El seguro se paga por mes adelantado y la fecha de pago empieza desde el mismo día que lo contratás. Dependiendo de las pautas de cada compañía se puede modificar la fecha a tu conveniencia." },
  { id: 7, title: "¿Qué medios de pago puedo usar?", subtitle: "Tenés la opción de abonar mediante Pagofácil, Rapipago, Cobro Express, Mercado Pago, Pago Mis Cuentas, MODO. Y también podés adherir la póliza al débito automático con CBU o tarjeta de crédito." },
  { id: 8, title: "¿Cuenta con grúa al igual que los autos?", subtitle: "Sí, las pólizas de moto tienen servicio de grúa según la cobertura que contrates." },
  { id: 9, title: "¿Desde qué momento me encuentro cubierto?", subtitle: "A partir del momento en que abonás la cuota de la póliza estás cubierto. Algunas compañías te dan la cobertura completa desde el primer día; otras te dan solo la cobertura Responsabilidad Civil hasta que aprueben la inspección de tu moto." },
  { id: 10, title: "¿Inspeccionan mi vehículo?", subtitle: "La inspección es virtual y se hace por fotos. Para emitir necesitamos fotos de cada lado, cédula, número de chasis. El vehículo debe tener todos los requisitos para circular, como luces, espejos, etc." },
  { id: 11, title: "Tuve un siniestro, ¿qué debo hacer?", subtitle: "En caso de accidente es de suma importancia obtener los datos del tercero: DNI, dirección y teléfono. Del vehículo: Patente, Marca, Modelo y compañía de seguros. Si hay lesionados, hacé la denuncia policial. No hagas acuerdos ni firmes nada con el tercero." },
  { id: 12, title: "¿Qué tipos de motos puedo asegurar?", subtitle: "En Yuju podés asegurar todo tipo de rodados: motos, motocicletas, ciclomotores, enduro, entre otras." },
  { id: 13, title: "Si alguien más maneja mi moto, ¿tengo cobertura?", subtitle: "Sí. Te cubre a vos y al conductor de tu moto al momento del siniestro, siempre que esté habilitado para manejar (carnet y tarjeta azul)." },
  { id: 14, title: "¿Si vendo la moto, puedo transferir el seguro?", subtitle: "No, el seguro es intransferible. En este caso se anula la póliza a tu nombre y el nuevo titular puede contratar una nueva." },
  { id: 15, title: "¿Qué puede ocurrir si mi moto no está asegurada?", subtitle: "Estarías incumpliendo la ley de tránsito, que exige tener un seguro obligatorio de Responsabilidad Civil. Estarías cometiendo una infracción que te puede traer multas y sanciones." },
  { id: 16, title: "¿Cómo recibo la documentación?", subtitle: "Te mandamos la documentación en PDF por mail, Whatsapp o por la App móvil de cada seguro." },
  { id: 17, title: "¿Cuál es la vigencia de la póliza?", subtitle: "La vigencia suele ser anual con refacturaciones en el medio, que son actualizaciones del valor del vehículo y del seguro. El período de cada refacturación suele ser trimestral, pero puede variar por la inflación." },
  { id: 18, title: "¿Cómo se actualiza el valor de las coberturas?", subtitle: "La inflación puede desactualizar el valor de tu moto y de tu seguro. Existen distintas formas de actualizar el valor de las coberturas: cláusula de ajuste de suma asegurada, actualizar la suma asegurada en cada renovación, o solicitar el aumento durante la vigencia mediante un endoso." },
];

// API Imports
import { 
  getInfoautoAllBrands, 
  getInfoautoAllModels, 
  getLocalities, 
  getVigencias,
  cotizar,
  cotizarATM,
  cotizarIntegrity
} from '../../services/motoApi';

export const MotoCotizador = () => {
  const [activeStep, setActiveStep] = useState(1); // 1: Marca, 2: Año, 3: Modelo, 4: CP/Loc, 5: Results

  // --- API State ---
  const [brands, setBrands] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [brandSearchTerm, setBrandSearchTerm] = useState('');
  const [brandListOpen, setBrandListOpen] = useState(false);
  const [brandsLoading, setBrandsLoading] = useState(false);

  const [allModels, setAllModels] = useState<any[]>([]);
  const [allModelsLoading, setAllModelsLoading] = useState(false);

  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState('');

  const [filteredModels, setFilteredModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<any>(null);

  const [zipCode, setZipCode] = useState('');
  const [localities, setLocalities] = useState<any[]>([]);
  const [selectedLocality, setSelectedLocality] = useState<any>(null);
  const [localitiesLoading, setLocalitiesLoading] = useState(false);

  const [vigencias, setVigencias] = useState<any[]>([]);
  const [selectedVigencia, setSelectedVigencia] = useState('');
  
  const [quotationResult, setQuotationResult] = useState<any>(null);
  const [quotationLoading, setQuotationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [payWithCard, setPayWithCard] = useState(true);
  const [selectedQuoteObj, setSelectedQuoteObj] = useState<any>(null);

  useEffect(() => {
    fetchBrands();
    fetchVigencias();
  }, []);

  // Progressive unlocking logic
  useEffect(() => {
    if (selectedBrand && activeStep === 1) setActiveStep(2);
    if (selectedYear && activeStep === 2) setActiveStep(3);
    if (selectedModel && activeStep === 3) setActiveStep(4);
  }, [selectedBrand, selectedYear, selectedModel, activeStep]);

  const fetchBrands = async () => {
    setBrandsLoading(true);
    setError(null);
    try {
        const data = await getInfoautoAllBrands();
        const list = Array.isArray(data) ? data : [];
        list.sort((a: any, b: any) => a.name.localeCompare(b.name));
        setBrands(list);
    } catch (err: any) {
        setError(err.message || 'Error al cargar las marcas.');
    } finally {
        setBrandsLoading(false);
    }
  };

  const fetchVigencias = async () => {
    try {
        const data = await getVigencias(20);
        let list = Array.isArray(data) ? data : (data.dtoList || data.message || []);
        setVigencias(list);
        const semestralVig = list.find((v: any) =>
            (v.descripcion || v.description || '').toUpperCase().includes("SEMESTRAL")
        );
        if (semestralVig) {
            setSelectedVigencia(semestralVig.id || semestralVig.ID);
        } else {
            const fallback = list.find((v: any) => (v.id == 65 || v.ID == 65));
            if (fallback) setSelectedVigencia(fallback.id || fallback.ID);
        }
    } catch (err) { console.error("Error fetching vigencias:", err); }
  };

  const fetchAllModels = async (brandId: string) => {
    setAllModelsLoading(true);
    setAllModels([]);
    setAvailableYears([]);
    setSelectedYear('');
    setFilteredModels([]);
    setSelectedModel(null);
    try {
        const data = await getInfoautoAllModels(brandId);
        const list = Array.isArray(data) ? data : [];
        setAllModels(list);

        const yearsSet = new Set<number>();
        let maxYearInModels = 0;

        list.forEach((m: any) => {
            if (m.prices_from && m.prices_to) {
                for (let y = m.prices_from; y <= m.prices_to; y++) {
                    yearsSet.add(y);
                    if (y > maxYearInModels) maxYearInModels = y;
                }
            }
        });

        const currentYear = new Date().getFullYear();
        if (currentYear > maxYearInModels && maxYearInModels > 0) {
            for (let y = maxYearInModels + 1; y <= currentYear; y++) {
                yearsSet.add(y);
            }
        }
        const sortedYears = Array.from(yearsSet).sort((a: any, b: any) => b - a) as number[];
        setAvailableYears(sortedYears);
    } catch (err) {
        console.error("Error fetching models:", err);
    } finally {
        setAllModelsLoading(false);
    }
  };

  const handleBrandSelect = (brand: any) => {
    setSelectedBrand(brand);
    setBrandSearchTerm(brand.name);
    setBrandListOpen(false);
    fetchAllModels(brand.id);
  };

  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
    setSelectedModel(null);
    const targetYear = parseInt(year);

    let filtered = allModels.filter(m =>
        m.prices_from <= targetYear && m.prices_to >= targetYear
    );

    if (filtered.length === 0) {
        for (let fallbackOffsets = 1; fallbackOffsets <= 2; fallbackOffsets++) {
            const fallbackYear = targetYear - fallbackOffsets;
            filtered = allModels.filter(m =>
                m.prices_from <= fallbackYear && m.prices_to >= fallbackYear
            );
            if (filtered.length > 0) break;
        }
    }
    setFilteredModels(filtered);
  };

  const handleZipCodeSearch = async (val: string) => {
    setZipCode(val);
    if (val.length === 4) {
        setLocalitiesLoading(true);
        setLocalities([]);
        setSelectedLocality(null);
        try {
            const data = await getLocalities(val);
            let locList = Array.isArray(data) ? data : (data.dtoList || data.message || []);
            setLocalities(locList);
            if (locList.length === 1) {
                setSelectedLocality(locList[0]);
            }
        } catch (err) { console.error("Error fetching localities:", err); }
        finally { setLocalitiesLoading(false); }
    }
  };

  const calculateDatesForQuote = () => {
    const today = new Date();
    const vigenciaObj = vigencias.find(v => (v.id || v.ID) == selectedVigencia);
    let monthsToAdd = 6;
    let tipoVigenciaStr = "SEMESTRAL";

    if (vigenciaObj) {
        const desc = (vigenciaObj.descripcion || vigenciaObj.description || "").toUpperCase();
        if (desc.includes("ANUAL")) { monthsToAdd = 12; tipoVigenciaStr = "ANUAL"; }
        else if (desc.includes("TRIMESTRAL")) { monthsToAdd = 3; tipoVigenciaStr = "TRIMESTRAL"; }
        else if (desc.includes("MENSUAL")) { monthsToAdd = 1; tipoVigenciaStr = "MENSUAL"; }
    }

    const nextDate = new Date(today);
    nextDate.setMonth(today.getMonth() + monthsToAdd);
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    return { vigenciaDesde: fmt(today), vigenciaHasta: fmt(nextDate), tipoVigencia: tipoVigenciaStr };
  };

  const handleCotizar = async () => {
    if (!selectedBrand || !selectedModel || !selectedYear || !selectedVigencia || !zipCode || !selectedLocality) {
        alert("Completá todos los campos por favor.");
        return;
    }
    setActiveStep(5);
    setQuotationLoading(true);
    setQuotationResult(null);

    const { vigenciaDesde, vigenciaHasta, tipoVigencia } = calculateDatesForQuote();

    const payload = {
        codigoTipoInteres: "MOTOVEHICULO",
        condicionFiscal: "CF",
        cuotas: 3,
        numeroSolicitud: 2,
        tipoVigencia,
        vehiculos: [{
            anio: selectedYear.toString(),
            controlSatelital: "NO",
            cpLocalidadGuarda: parseInt(zipCode),
            gnc: "NO",
            localidadGuarda: selectedLocality ? (selectedLocality.id || selectedLocality.ID) : "",
            codia: selectedModel.codia.toString(),
            rastreadorSatelital: "NO",
            rastreoACargoRUS: "NO",
            uso: "PARTICULAR"
        }],
        vigenciaDesde,
        vigenciaHasta,
        vigenciaPolizaId: parseInt(selectedVigencia)
    };

    try {
        const [rusResult, atmResult, integrityResult] = await Promise.allSettled([
            cotizar(payload),
            cotizarATM({
                codia: String(selectedModel.codia),
                anio: parseInt(selectedYear),
                codpostal: parseInt(zipCode)
            }),
            cotizarIntegrity({
                codia: String(selectedModel.codia),
                brandId: String(selectedBrand.id),
                anio: parseInt(selectedYear),
                codigoPostal: zipCode,
                localidad: selectedLocality ? (selectedLocality.id || selectedLocality.ID) : ""
            })
        ]);

        const combined: any = { rus: null, atm: null, integrity: null };
        if (rusResult.status === 'fulfilled') combined.rus = rusResult.value;
        if (atmResult.status === 'fulfilled') combined.atm = atmResult.value;
        if (integrityResult.status === 'fulfilled') combined.integrity = integrityResult.value;

        setQuotationResult(combined);
    } catch (err: any) {
        if (err.response && err.response.status === 409) {
            setConflictModalOpen(true);
        } else {
            setError(err.message || "Error al realizar la cotización.");
        }
    } finally {
        setQuotationLoading(false);
    }
  };

  const handleContractClick = (quote: any, source: string) => {
      setSelectedQuoteObj({ quote, source });
      setWhatsappModalOpen(true);
  };

  const handleWhatsAppRedirect = () => {
      const { quote, source } = selectedQuoteObj;
      let text = `Hola! Quiero contratar el seguro para mi moto.\n\n`;
      text += `*Moto:* ${selectedBrand?.name} ${selectedModel?.group?.name} ${selectedModel?.description}\n`;
      text += `*Año:* ${selectedYear}\n`;
      text += `*Compañía:* ${source}\n`;
      if(source === 'RUS') {
          text += `*Cobertura:* ${quote.codigoCasco || quote.codigoRC}\n`;
      } else if(source === 'ATM') {
          text += `*Cobertura:* ${quote.cobertura?.descripcion || quote.descripcion}\n`;
      } else if (source === 'INTEGRITY') {
          text += `*Cobertura:* ${quote.Nombre || quote.nombre || quote.producto}\n`;
      }
      text += `*Forma de pago:* ${payWithCard ? 'Tarjeta' : 'Efectivo'}\n`;
      
      window.open(`https://wa.me/5491156307246?text=${encodeURIComponent(text)}`, '_blank');
      setWhatsappModalOpen(false);
  };

  const handleResetAll = () => {
    setActiveStep(1);
    setSelectedBrand(null);
    setBrandSearchTerm('');
    setSelectedYear('');
    setSelectedModel(null);
    setZipCode('');
    setSelectedLocality(null);
    setQuotationResult(null);
  };

  const filteredBrandsList = brands.filter(b => b.name.toLowerCase().includes(brandSearchTerm.toLowerCase()));

  const stepIndicators = [
    { id: 1, title: 'El Vehículo', status: activeStep < 4 ? 'active' : 'completed' },
    { id: 2, title: 'Ubicación', status: activeStep < 4 ? 'inactive' : activeStep === 4 ? 'active' : 'completed' },
    { id: 3, title: 'Cotización', status: activeStep < 5 ? 'inactive' : 'active' },
  ];

  return (
    <Layout>
      <SEOHelmet 
        title="Cotizador de Moto" 
        description="Protección premium para tu moto. Cotizá en segundos con la tecnología de Yuju."
      />
      
      <div className="relative pt-28 md:pt-36 lg:pt-40 pb-12 px-6 bg-bg-secondary transition-colors duration-500 overflow-hidden">
        {/* Background decorative patterns */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/5 blur-[150px] rounded-full -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-400/5 blur-[120px] rounded-full -z-10" />

        <div className={`mx-auto space-y-10 relative z-20 transition-all duration-700 ${activeStep === 5 ? 'max-w-[100%] xl:max-w-[98%] 2xl:max-w-[1500px]' : 'max-w-4xl'}`}>
          
          {/* Multi-step indicator */}
          <div className="flex justify-between items-center px-4 md:px-8 relative mb-8">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border-primary -translate-y-1/2 z-0 mx-8 hidden md:block" />
            
            {stepIndicators.map((step) => (
              <div key={step.id} className="flex flex-col items-center gap-3 relative z-10 min-w-[5rem]">
                <motion.div 
                  initial={false}
                  animate={{ 
                    backgroundColor: step.status === 'completed' ? '#F97316' : step.status === 'active' ? '#FB923C' : 'var(--bg-primary)',
                    boxShadow: step.status === 'active' ? '0 0 25px rgba(251, 146, 60, 0.4)' : step.status === 'completed' ? '0 0 15px rgba(249, 115, 22, 0.3)' : 'none',
                    scale: step.status === 'active' ? 1.1 : 1,
                    borderColor: step.status === 'completed' ? '#F97316' : step.status === 'active' ? '#FB923C' : 'var(--border-primary)'
                  }}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 z-10 relative"
                >
                  <span className={`text-base font-black font-accent flex items-center justify-center ${step.status === 'completed' ? 'text-white' : step.status === 'active' ? 'text-white' : 'text-text-secondary opacity-40'}`}>
                    {step.status === 'completed' ? <Check size={20} strokeWidth={4} /> : step.id}
                  </span>
                </motion.div>
                <div className="text-center hidden md:block">
                  <p className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors duration-500 whitespace-nowrap ${step.status === 'completed' ? 'text-orange-500 opacity-100' : step.status === 'active' ? 'text-orange-400 opacity-100' : 'text-text-secondary opacity-30'}`}>
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
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-all shadow-sm">
                <ArrowLeft size={18} className="text-orange-500" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-500">Volver</span>
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
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-all shadow-lg backdrop-blur-sm">
                    <ArrowLeft size={20} className="text-orange-500" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-500 drop-shadow-sm">Volver</span>
                </motion.button>
              )}
            {/* Form Section */}
            <div className={`transition-all duration-700 ${activeStep === 5 ? 'max-w-3xl mx-auto opacity-40 hover:opacity-100 mb-12 h-0 overflow-hidden py-0' : 'space-y-6'}`}>
              
              {/* Step 1: MARCA */}
              <div className="relative z-[40] space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 ${selectedBrand ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-bg-secondary text-text-secondary opacity-40'}`}>
                    <Bike size={16} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm font-black font-accent tracking-tighter uppercase leading-none">Marca de la Moto</h2>
                    <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest opacity-50 mt-0.5">Seleccioná la marca</p>
                  </div>
                </div>
                
                <div className="relative pl-10">
                    <Search className="absolute left-14 top-1/2 -translate-y-1/2 text-text-secondary/50 pointer-events-none" size={18} />
                    <input 
                        type="text"
                        value={brandSearchTerm}
                        onChange={(e) => {
                            setBrandSearchTerm(e.target.value);
                            if(!brandListOpen) setBrandListOpen(true);
                            if(selectedBrand) setSelectedBrand(null);
                        }}
                        onFocus={() => setBrandListOpen(true)}
                        placeholder="Ej. Yamaha" 
                        className="w-full bg-bg-secondary border border-border-primary rounded-2xl pl-12 pr-5 py-4 text-text-primary focus:border-orange-500 outline-none transition-all font-bold" 
                    />
                    {brandsLoading && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-orange-500 animate-pulse">Cargando...</span>}
                    {brandListOpen && (
                        <div className="absolute left-10 right-0 w-[calc(100%-2.5rem)] z-50 mt-2 bg-bg-secondary border border-border-primary rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
                            {filteredBrandsList.length > 0 ? filteredBrandsList.map(b => (
                                <div 
                                    key={b.id} 
                                    onClick={() => handleBrandSelect(b)}
                                    className="px-4 py-3 hover:bg-orange-500/10 cursor-pointer text-text-primary border-b border-border-primary/30 last:border-0 transition-colors font-semibold"
                                >
                                    {b.name}
                                </div>
                            )) : (
                                <div className="p-4 text-text-secondary text-sm">No se encontraron marcas.</div>
                            )}
                        </div>
                    )}
                </div>

                {selectedBrand && (
                   <motion.button 
                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.5 }}
                    onClick={handleResetAll}
                    title="Reiniciar cotizador"
                    className="absolute -right-2 top-0 p-2 text-orange-500 hover:text-orange-400 transition-colors"
                   >
                     <RefreshCw size={14} />
                   </motion.button>
                )}
              </div>

              {/* Step 2: AÑO */}
              <motion.div 
                animate={activeStep === 2 ? {
                  boxShadow: ["0 0 0px rgba(249, 115, 22, 0)", "0 0 20px rgba(249, 115, 22, 0.4)", "0 0 0px rgba(249, 115, 22, 0)"],
                } : {}}
                transition={{ duration: 1.5, repeat: 1 }}
                className={`relative z-[30] border-t border-border-primary pt-6 space-y-3 rounded-2xl transition-all duration-500 ${activeStep < 2 ? 'opacity-30 grayscale pointer-events-none' : 'opacity-100'}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 ${selectedYear ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-bg-secondary text-text-secondary opacity-40'}`}>
                    <Calendar size={16} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm font-black font-accent tracking-tighter uppercase leading-none">Año de Fabricación</h2>
                    <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest opacity-50 mt-0.5">Modelo según cédula</p>
                  </div>
                </div>

                <div className="relative pl-10">
                    <select 
                        value={selectedYear}
                        onChange={(e) => handleYearSelect(e.target.value)}
                        disabled={!selectedBrand || allModelsLoading}
                        className="w-full bg-bg-secondary border border-border-primary rounded-2xl px-5 py-4 text-text-primary focus:border-orange-500 outline-none transition-all disabled:opacity-50 appearance-none cursor-pointer font-bold"
                    >
                        <option value="" disabled>Seleccioná el año</option>
                        {availableYears.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
              </motion.div>

              {/* Step 3: MODELO */}
              <motion.div 
                animate={activeStep === 3 ? {
                  boxShadow: ["0 0 0px rgba(249, 115, 22, 0)", "0 0 20px rgba(249, 115, 22, 0.4)", "0 0 0px rgba(249, 115, 22, 0)"],
                } : {}}
                transition={{ duration: 1.5, repeat: 1 }}
                className={`relative z-[20] border-t border-border-primary pt-6 space-y-3 rounded-2xl transition-all duration-500 ${activeStep < 3 ? 'opacity-30 grayscale pointer-events-none' : 'opacity-100'}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 ${selectedModel ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-bg-secondary text-text-secondary opacity-40'}`}>
                    <Tag size={16} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm font-black font-accent tracking-tighter uppercase leading-none">Modelo y Versión</h2>
                    <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest opacity-50 mt-0.5">Buscá la versión específica</p>
                  </div>
                </div>

                <div className="relative pl-10">
                    <select 
                        value={selectedModel ? selectedModel.codia : ''}
                        onChange={(e) => {
                            const mod = filteredModels.find(m => m.codia == e.target.value);
                            setSelectedModel(mod);
                        }}
                        disabled={!selectedYear}
                        className="w-full bg-bg-secondary border border-border-primary rounded-2xl px-5 py-4 text-text-primary focus:border-orange-500 outline-none transition-all disabled:opacity-50 appearance-none cursor-pointer font-bold"
                    >
                        <option value="" disabled>Seleccioná la versión exacta</option>
                        {filteredModels.map(m => (
                            <option key={m.codia} value={m.codia}>
                                {m.group?.name} - {m.description}
                            </option>
                        ))}
                    </select>
                </div>
              </motion.div>

              {/* Step 4: CP */}
              <motion.div 
                animate={activeStep === 4 ? {
                  boxShadow: ["0 0 0px rgba(249, 115, 22, 0)", "0 0 20px rgba(249, 115, 22, 0.4)", "0 0 0px rgba(249, 115, 22, 0)"],
                } : {}}
                transition={{ duration: 1.5, repeat: 1 }}
                className={`relative z-[10] border-t border-border-primary pt-6 space-y-3 rounded-2xl transition-all duration-500 ${activeStep < 4 ? 'opacity-30 grayscale pointer-events-none' : 'opacity-100'}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 ${zipCode && selectedLocality ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-bg-secondary text-text-secondary opacity-40'}`}>
                    <MapPin size={16} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm font-black font-accent tracking-tighter uppercase leading-none">Lugar de Guarda</h2>
                    <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest opacity-50 mt-0.5">Código postal de residencia</p>
                  </div>
                </div>

                <div className="pl-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <input 
                            type="text" 
                            value={zipCode}
                            onChange={(e) => handleZipCodeSearch(e.target.value)}
                            placeholder="C.P. Ej. 1425" 
                            className="w-full bg-bg-secondary border border-border-primary rounded-2xl p-4 font-bold text-text-primary focus:border-orange-500 outline-none transition-all" 
                        />
                        {localitiesLoading && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-orange-500" />}
                    </div>

                    <select 
                        value={selectedLocality ? selectedLocality.id || selectedLocality.ID : ''}
                        onChange={(e) => {
                            const id = e.target.value;
                            const loc = localities.find(l => (l.id == id || l.ID == id));
                            setSelectedLocality(loc);
                        }}
                        disabled={localities.length === 0}
                        className="w-full bg-bg-secondary border border-border-primary rounded-2xl px-5 py-4 text-text-primary focus:border-orange-500 outline-none transition-all cursor-pointer disabled:opacity-50 font-bold"
                    >
                        {localities.length === 0 ? (
                            <option value="">Esperando CP...</option>
                        ) : (
                            <>
                                <option value="" disabled>Seleccioná tu localidad</option>
                                {localities.map((loc:any) => (
                                    <option key={loc.id || loc.ID} value={loc.id || loc.ID}>
                                        {loc.descripcion || loc.description}
                                    </option>
                                ))}
                            </>
                        )}
                    </select>
                </div>
              </motion.div>

            </div> {/* End of Form wrapper */}

            {/* Final Action Button */}
            <AnimatePresence>
              {zipCode.length === 4 && selectedLocality && activeStep < 5 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="pt-8 flex flex-col items-center gap-4"
                >
                  <Button 
                    onClick={handleCotizar}
                    isLoading={quotationLoading}
                    className="w-full md:w-auto px-12 h-14 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 border-none text-base font-black shadow-2xl shadow-orange-500/30 group"
                  >
                    Obtener Cotización
                    {!quotationLoading && <Zap size={18} className="ml-3 group-hover:scale-125 transition-transform" />}
                  </Button>
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
                      <h2 className="text-3xl lg:text-4xl font-black uppercase font-accent tracking-tighter text-orange-500">MotoCotizador</h2>
                      <p className="text-text-secondary font-medium">Resultados para {selectedBrand?.name} {selectedModel?.group?.name}</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                    </div>
                  </div>

                  {quotationLoading ? (
                    <div className="text-center py-16 space-y-10 w-full col-span-full">
                        <div className="w-24 h-24 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                            <div className="absolute inset-0 bg-orange-500/10 blur-xl rounded-full animate-pulse" />
                            <Zap className="text-orange-500 relative z-10 animate-float" size={48} />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-4xl font-black text-text-primary font-accent tracking-tighter uppercase whitespace-pre-wrap">Preparando tu ruta</h2>
                            <p className="text-text-secondary font-medium max-w-xs mx-auto">
                            Estamos comparando las mejores tasas de aseguradoras especializadas.
                            </p>
                        </div>
                    </div>
                  ) : (
                    <MotoResultsGrid 
                        results={quotationResult} 
                        payWithCard={payWithCard} 
                        setPayWithCard={setPayWithCard} 
                        onContract={handleContractClick} 
                    />
                  )}
               </motion.div>
             )}
           </div>
           </GlassCard>
          
        </div>
      </div>

      {/* --- MODALS --- */}
      {conflictModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-dark/80 backdrop-blur-sm">
            <GlassCard className="p-8 max-w-md w-full relative">
                <button className="absolute top-4 right-4 text-text-secondary hover:text-text-primary" onClick={() => setConflictModalOpen(false)}>✕</button>
                <div className="flex justify-center mb-4 text-red-500">
                    <AlertCircle size={48} />
                </div>
                <h3 className="text-2xl font-black font-accent text-center mb-2">Modelo No Sincronizado</h3>
                <p className="text-center text-text-secondary mb-6">
                    Lo sentimos, en este momento no contamos con información directa para cotizar tu:
                    <br/><strong className="text-text-primary mt-2 block">{selectedBrand?.name} - {selectedModel?.group?.name} ({selectedYear})</strong>
                </p>
                <Button 
                    className="w-full bg-[#25D366] hover:bg-[#1DA851] border-none text-white font-bold"
                    onClick={() => {
                        const txt = `Hola! Intenté cotizar mi moto pero el sistema me indicó hacerlo manual.\nMarca: ${selectedBrand?.name}\nModelo: ${selectedModel?.group?.name}\nAño: ${selectedYear}\nC.P: ${zipCode}`;
                        window.open(`https://wa.me/5491156307246?text=${encodeURIComponent(txt)}`, '_blank');
                        setConflictModalOpen(false);
                    }}
                >
                    Cotizar por WhatsApp Manual
                </Button>
            </GlassCard>
        </div>
      )}

      {whatsappModalOpen && selectedQuoteObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-dark/80 backdrop-blur-sm">
            <GlassCard className="p-8 max-w-md w-full relative">
                <button className="absolute top-4 right-4 text-text-secondary hover:text-text-primary" onClick={() => setWhatsappModalOpen(false)}>✕</button>
                <div className="flex justify-center mb-4 text-orange-500">
                    <ShieldCheck size={48} />
                </div>
                <h3 className="text-2xl font-black font-accent text-center mb-2">¡Casi listo!</h3>
                <p className="text-center text-text-secondary mb-6">
                    Vas a contratar la cobertura con <strong className="text-text-primary uppercase">{selectedQuoteObj.source}</strong> a través de uno de nuestros asesores oficiales mediante WhatsApp.
                </p>
                <div className="bg-bg-secondary p-4 rounded-xl border border-border-primary mb-6">
                    <p className="text-sm text-text-primary font-bold">Resumen:</p>
                    <ul className="text-sm text-text-secondary space-y-1 mt-2">
                        <li>Moto: {selectedBrand?.name} {selectedYear}</li>
                        <li>Método: {payWithCard ? 'Tarjeta' : 'Efectivo'}</li>
                    </ul>
                </div>
                <Button 
                    className="w-full bg-orange-500 hover:bg-orange-600 border-none text-white font-bold shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                    onClick={handleWhatsAppRedirect}
                >
                    Continuar a WhatsApp
                </Button>
            </GlassCard>
        </div>
      )}

      <div className="relative z-0">
        <FAQAccordion
          items={motoFAQ}
          accentColor="text-orange-500"
          borderColor="border-orange-500/30"
          bgColor="bg-orange-500/5"
        />
      </div>
    </Layout>
  );
};
