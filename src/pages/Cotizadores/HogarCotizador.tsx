import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, ChevronRight, Zap, ShieldCheck, MapPin, 
  Building2, Star, CheckCircle2, User, CreditCard,
  ChevronDown, ChevronUp, Loader2, Landmark, ArrowLeft
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Layout } from '../../layout/Layout';
import { SEOHelmet } from '../../components/SEO/SEOHelmet';
import axios from 'axios';
import { FAQAccordion } from '../../components/cotizadores/FAQAccordion';

const hogarFAQ = [
  { id: 1, title: "¿Qué es el Seguro de Hogar?", subtitle: "Es una forma de cuidar lo que más querés: tu casa y todo lo que hay en ella. Con una póliza de seguro de hogar, podés proteger tu patrimonio y el de tu familia ante situaciones como robo, incendio, rotura y otros tipos de riesgos." },
  { id: 2, title: "¿Qué tipo de vivienda puedo asegurar?", subtitle: "Podés asegurar cualquier vivienda que uses para vivir con tu familia, ya sea de forma permanente o semipermanente. Lo único que no podés hacer es usarla para fines comerciales." },
  { id: 3, title: "¿Cuánto demora la emisión de mi póliza?", subtitle: "Nada, es instantánea. Solo tenés que elegir el plan que más te guste, ingresar tus datos y confirmar tu pago. Enseguida te mandamos tu póliza por mail y ya está, tu casa queda asegurada." },
  { id: 4, title: "¿Tengo cobertura si alguien se accidenta dentro de la vivienda?", subtitle: "Sí. Con la cobertura de Responsabilidad Civil, podés estar tranquilo si alguien se lastima o sufre de algún daño dentro de tu casa." },
  { id: 5, title: "¿En caso de mudanza se mantiene la cobertura?", subtitle: "Sí, por supuesto. Solo tenés que avisarnos tu nueva dirección y nosotros actualizamos tu póliza. Así, tu nueva casa queda protegida con la misma cobertura que tenías antes." },
  { id: 6, title: "¿Podemos asegurar bienes fuera de la vivienda?", subtitle: "Sí, depende de la aseguradora que elijas. Algunas te permiten asegurar bienes que llevés fuera de tu casa, como tu celular, tu notebook o tu cámara." },
  { id: 7, title: "¿Cómo calculo el valor de mi vivienda?", subtitle: "En Yuju Seguros te ayudamos a calcularlo con una herramienta llamada LEA, que estima el valor de cada vivienda según sus características y ubicación." },
  { id: 8, title: "¿Puedo contratar una póliza de hogar si soy inquilino?", subtitle: "Sí, por supuesto. No hace falta que seas el dueño de la casa para asegurarla. Podés contratar una póliza de hogar como inquilino y proteger tus bienes y tu responsabilidad civil." },
  { id: 9, title: "¿Debo declarar los electrodomésticos y bienes tecnológicos que aseguro?", subtitle: "Depende del tipo de cobertura que contrates. Si elegís una cobertura básica, no hace falta que declares nada. Si elegís una cobertura más completa, sí tenés que declarar los bienes que querés asegurar." },
  { id: 10, title: "¿Qué medidas de seguridad tiene que tener mi vivienda?", subtitle: "Las medidas básicas son: cerraduras doble paleta en puertas externas, construcción de ladrillos o materiales ignifugos. Si no tenés rejas o persianas en ventanas, necesitás sistema de alarma." },
  { id: 11, title: "¿La cobertura de incendio tiene adicionales sin cargo?", subtitle: "Sí, tanto la cobertura de incendio del edificio como la de contenido, tienen un adicional gratis por daños causados por granizo, huracán, ciclón, tornado y terremoto." },
  { id: 12, title: "¿Cómo gestiono el reintegro de beneficios adicionales?", subtitle: "Es muy fácil. Solo tenés que presentar tu factura y te hacemos el reintegro dentro de las 72 horas." },
  { id: 13, title: "¿Qué tiempo tengo para denunciar un incidente?", subtitle: "Lo ideal es que nos avises lo antes posible. Tenés hasta 72 horas después del incidente para hacer la denuncia." },
  { id: 14, title: "¿Cuándo puedo darme de baja?", subtitle: "Cuando quieras. En Yuju Seguros no te atamos con contratos ni multas. Podés dar de baja tu seguro en cualquier momento." },
  { id: 15, title: "¿A partir de cuándo tengo cobertura? ¿Cuánto dura?", subtitle: "Vos elegís desde qué momento querés que tu casa esté asegurada. La duración depende de la aseguradora (trimestral, cuatrimestral, semestral o anual) y se renueva automáticamente siempre que pagues a tiempo." },
  { id: 16, title: "Datos para emitir:", subtitle: "Para emitir tu póliza, necesitamos que nos digas: la localidad donde está tu casa, los metros cuadrados que tiene, la ubicación y el valor de la vivienda y de los bienes que querés asegurar." },
  { id: 17, title: "¿Cómo actuar en caso de siniestro?", subtitle: "Si sufés un robo, lo primero que tenés que hacer es hacer la denuncia policial. Después, comunicate con nuestro departamento de siniestros o con el 0800 de la aseguradora que hayas elegido." },
  { id: 18, title: "Medios y forma de pago:", subtitle: "Podés pagar en cuotas fijas mensuales o en una sola cuota. Y podés usar tarjeta de crédito, débito, transferencia bancaria, Mercado Pago, etc. El tiempo de contrato varía según la aseguradora." },
];

const hogarApi = axios.create({
  baseURL: 'http://localhost:3000/api', // Apunta al backend de Hogar-Yuju
  timeout: 35000 // Agregamos un timeout más flexible por los 504 de RUS
});

// Types
interface Opcion { codigo: string; texto: string; }
interface Pregunta { codigo: string; texto: string; significado?: string; tipoRespuesta: string; opciones?: Opcion[]; }
interface Cobertura { 
  codigo: string; 
  descripcion: string; 
  informacionAdicional?: string; 
  sumaAsegurada?: { monto: number; codigoISOMoneda: string }; 
}
interface FormaPago { precioCuota: number; cantidadCuotas: number; mediosPago: string[]; }
interface Plan {
    codigo: string;
    descripcion: string;
    informacionAdicional?: string;
    linkCondiciones?: string;
    formasPagos?: FormaPago[];
    coberturas?: Cobertura[];
    beneficios?: Array<{ descripcion: string }>;
}

const steps = [
  { id: 1, title: 'Tu Hogar', desc: 'Metros cuadrados' },
  { id: 2, title: 'Planes', desc: 'Coberturas' },
  { id: 3, title: 'Datos', desc: 'Identificación' },
  { id: 4, title: 'Ubicación', desc: 'Domicilio' },
  { id: 5, title: 'Pago', desc: 'Finalizar' },
];

const INDICIO = 'CF_PACK_FREESTYLE';
const OBJECT = 'VIVIENDA';

const obfuscate = (text: string): string => {
  const key = 'YUJU_SECURE_KEY_2024';
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result);
};

export const HogarCotizador = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Data & API IDs
  const [questions, setQuestions] = useState<Pregunta[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [plans, setPlans] = useState<Plan[]>([]);
  const [consultaId, setConsultaId] = useState<string | null>(null);
  const [selectedPlanCode, setSelectedPlanCode] = useState<string | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [orderVentaId, setOrderVentaId] = useState<string | null>(null);

  // User Forms Modificados según el backend Hogar-Yuju
  const [personalData, setPersonalData] = useState({
    nombre: '', apellido: '', email: '', 
    tipoDocumento: 'DNI', dni: '', nacionalidad: 'ARG',
    codArea: '', telefono: '',
    fechaNacimientoDia: '', fechaNacimientoMes: '', fechaNacimientoAno: ''
  });
  const [addressData, setAddressData] = useState({
    calle: '', numero: '', piso: '', departamento: '', localidad: '', codigoPostal: '',
    tipoVivienda: 'casss', muros: 'trad', caracter: 'VIVIENDA_COMBINADOFAMILIAR_CARACTER1'
  });
  const [paymentData, setPaymentData] = useState({
    method: 'TARJETA_CREDITO' as 'TARJETA_CREDITO' | 'DEBITO_AUTOMATICO',
    marcaTarjeta: 'VISA',
    numeroTarjeta: '',
    cbu: ''
  });

  useEffect(() => {
    fetchInitialForm();
  }, []);

  const fetchInitialForm = async () => {
    try {
      setLoading(true);
      const res = await hogarApi.get(`/insurance/home/objects/${OBJECT}/indicios/${INDICIO}/form`);
      setQuestions(res.data.preguntas || []);
    } catch (err: any) {
      setError("Error al cargar el formulario inicial. Verificá tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  const handlePackSubmit = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await hogarApi.post(`/insurance/home/objects/${OBJECT}/indicios/${INDICIO}/form/submit`, { answers });
      const cId = res.data?.consultaId;
      if (!cId) throw new Error("No se recibió consultaId");
      setConsultaId(cId);
      
      const plansRes = await hogarApi.get(`/insurance/home/consultas/${cId}/planes`);
      setPlans(plansRes.data);
      if (plansRes.data.length > 0) setSelectedPlanCode(plansRes.data[0].codigo);
      setCurrentStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al obtener planes o comunicarnos con RUS.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePersonalSubmit = async () => {
    if (!personalData.nombre || !personalData.apellido || !personalData.dni || !personalData.email || !personalData.fechaNacimientoDia || !personalData.codArea || !personalData.telefono) {
      setError("Por favor completa los campos principales");
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      const planObj = plans.find(p => p.codigo === selectedPlanCode);
      const res = await hogarApi.post('/insurance/home/orders/create', {
        idConsulta: consultaId,
        plan: planObj,
        formaPago: planObj?.formasPagos?.[0],
        personalData: {
          nombre: personalData.nombre,
          apellido: personalData.apellido,
          email: personalData.email,
          numeroDocumento: personalData.dni
        }
      });
      setOrderVentaId(res.data.rusOrder.ordenVentaID);
      setCurrentStep(4);
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al procesar datos personales. Verificá si la plataforma de RUS responde.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddressSubmit = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const answersList = [
        { codigoPregunta: 'CALLE_CF', valores: [addressData.calle || 'SN'] },
        { codigoPregunta: 'ALT_CF', valores: [addressData.numero || '0'] },
        { codigoPregunta: 'CPPPP', valores: [addressData.codigoPostal || '0000'] },
        { codigoPregunta: 'tipoo', valores: [addressData.tipoVivienda] },
        { codigoPregunta: 'matconst', valores: [addressData.muros] },
        { codigoPregunta: 'VIVIENDA_COMBINADOFAMILIAR_CARACTER', valores: [addressData.caracter] },
        { codigoPregunta: 'VIVIENDA_COMBINADOFAMILIAR_PREGUNTATIPOVIVIENDA_PACK', valores: ['VIVIENDA_COMBINADOFAMILIAR_PREGUNTATIPOVIVIENDA_PACK1'] }
      ];
      
      if (addressData.tipoVivienda === 'dptoopo') {
          if (addressData.piso) answersList.push({ codigoPregunta: 'PISO_CF', valores: [addressData.piso] });
          if (addressData.departamento) answersList.push({ codigoPregunta: 'DPTO_CF', valores: [addressData.departamento] });
      }

      const addressPayload = { ...addressData, dpto: addressData.departamento };
      const personalPayload = { 
        ...personalData, 
        telefono_codigo_area: personalData.codArea, 
        telefono_numero: personalData.telefono, 
        numeroDocumento: personalData.dni 
      };

      await hogarApi.post(`/insurance/home/orders/${orderVentaId}/form/submit`, {
        answers: answersList,
        addressData: addressPayload,
        personalData: personalPayload
      });
      setCurrentStep(5);
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al guardar domicilio. Verificá los campos o estado de red.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSubmit = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const paymentInfo: any = { medioPago: paymentData.method };
      if (paymentData.method === 'TARJETA_CREDITO') {
        const rawNum = paymentData.numeroTarjeta.replace(/\s/g, '');
        paymentInfo.numeroTarjeta = obfuscate(rawNum);
        paymentInfo.marcaTarjeta = paymentData.marcaTarjeta;
      } else {
        const rawCbu = paymentData.cbu.replace(/\s/g, '');
        paymentInfo.CBU = obfuscate(rawCbu);
      }

      await hogarApi.post(`/insurance/home/orders/${orderVentaId}/infopago`, { paymentInfo, _enc: true });
      await hogarApi.post(`/insurance/home/orders/${orderVentaId}/confirm`);
      setCurrentStep(6);
    } catch (err: any) {
      // Manejo específico del Gateway Timeout 504 u otros errores
      let msg = err.response?.data?.error || err.message;
      if (err.response?.status === 504 || msg.includes('504')) {
         msg = "El servidor de la aseguradora está demorando en responder (Timeout). Por favor, aguardá unos minutos y volvé a intentarlo.";
      }
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatMoney = (monto: number) => `$ ${monto.toLocaleString('es-AR')}`;

  return (
    <Layout>
      <SEOHelmet 
        title="Cotizador de Hogar" 
        description="Asegurá tu casa con la tecnología más avanzada de Argentina. Trámites simples, protección real."
      />
      
      <div className="relative pt-28 md:pt-36 pb-12 px-4 bg-bg-secondary transition-colors duration-500 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[150px] rounded-full -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-yuju-blue/5 blur-[120px] rounded-full -z-10" />

        <div className="max-w-4xl mx-auto space-y-8 relative z-20">
          
          {/* Progress Stepper */}
          <div className="flex justify-between items-center px-4 md:px-10 relative mb-8">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-border-primary z-0 mx-14 hidden md:block" />
            
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center gap-2 relative z-10">
                <motion.div 
                  initial={false}
                  animate={{ 
                    backgroundColor: currentStep >= step.id ? '#10B981' : 'var(--bg-primary)',
                    boxShadow: currentStep === step.id ? '0 0 20px rgba(16, 185, 129, 0.3)' : 'none',
                    scale: currentStep === step.id ? 1.15 : 1
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center border-[1.5px] border-border-primary shadow-sm"
                >
                  {currentStep > step.id ? (
                    <CheckCircle2 size={16} className="text-white" />
                  ) : (
                    <span className={`text-[10px] font-black font-accent ${currentStep >= step.id ? 'text-white' : 'text-text-secondary opacity-50'}`}>
                      {step.id}
                    </span>
                  )}
                </motion.div>
                <div className="text-center hidden md:block">
                  <p className={`text-[8px] font-black uppercase tracking-widest mt-1 ${currentStep >= step.id ? 'text-emerald-500' : 'text-text-secondary opacity-40'}`}>
                    {step.title}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile/Tablet Back Button - shown between stepper and card */}
          {currentStep > 1 && currentStep < 6 && (
            <motion.button
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="flex lg:hidden items-center gap-3 group px-2 py-1 -mt-2 mb-2 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all shadow-sm">
                <ArrowLeft size={18} className="text-emerald-500" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-500">Volver</span>
            </motion.button>
          )}

          <GlassCard className="p-6 md:p-10 border-border-primary bg-bg-primary/70 rounded-[28px] shadow-2xl relative !overflow-visible backdrop-blur-3xl">
            {loading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="animate-spin text-emerald-500" size={40} />
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest animate-pulse">Iniciando Cotizador...</p>
                </div>
            ) : (
            <div className="relative">
              {currentStep > 1 && currentStep < 6 && (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="hidden lg:flex absolute top-0 -left-20 xl:-left-52 2xl:-left-60 items-center gap-3 group z-50 px-2 py-1 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all shadow-lg backdrop-blur-sm">
                    <ArrowLeft size={20} className="text-emerald-500" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-500 drop-shadow-sm">Volver</span>
                </motion.button>
              )}
            <AnimatePresence mode="wait">
              {/* STEP 1: PREGUNTAS (METROS) */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-emerald-500">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <Building2 size={24} />
                      </div>
                      <h2 className="text-2xl font-black font-accent tracking-tighter">Tu Vivienda</h2>
                    </div>
                    <p className="text-sm text-text-secondary font-medium">Contanos qué tipo de hogar querés proteger hoy.</p>
                  </div>

                  {questions.map((q) => (
                    <div key={q.codigo} className="space-y-3">
                      <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest pl-2">
                        {q.texto}
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.opciones?.map((opt) => (
                          <button
                            key={opt.codigo}
                            onClick={() => setAnswers({ [q.codigo]: opt.codigo })}
                            className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 text-left group
                              ${answers[q.codigo] === opt.codigo 
                                ? 'border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/10 ring-4 ring-emerald-500/10' 
                                : 'border-border-primary bg-bg-secondary hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300'}`}
                          >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors flex-shrink-0
                              ${answers[q.codigo] === opt.codigo ? 'bg-emerald-500 text-white' : 'bg-bg-primary text-text-secondary group-hover:bg-emerald-500/10'}`}>
                              <Home size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-text-primary text-xs">{opt.texto}</h3>
                                {q.significado && <p className="text-[9px] text-text-secondary font-medium mt-1 leading-tight">{q.significado}</p>}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end pt-6">
                    <Button 
                        disabled={!Object.keys(answers).length || isProcessing}
                        onClick={handlePackSubmit} 
                        className="bg-emerald-500 hover:bg-emerald-600 px-10 h-12 rounded-xl text-sm border-none font-black shadow-lg shadow-emerald-500/20"
                    >
                      {isProcessing ? 'Analizando...' : 'Ver Planes'} 
                      {!isProcessing && <ChevronRight size={18} className="ml-2" />}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: PLANES */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between pointer-events-none">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black font-accent tracking-tighter">{plans.length > 1 ? 'Planes Recomendados' : 'Plan Recomendado'}</h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {plans.map((plan) => (
                      <div 
                        key={plan.codigo}
                        className={`group relative rounded-3xl border-2 transition-all overflow-hidden cursor-pointer shadow-sm hover:border-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]
                          ${selectedPlanCode === plan.codigo ? 'border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/10' : 'border-border-primary bg-bg-secondary/30'}`}
                        onClick={() => setSelectedPlanCode(plan.codigo)}
                      >
                         <div className="p-3 sm:p-5 flex flex-col md:flex-row md:items-start justify-between gap-3 sm:gap-4">
                             <div className="space-y-1 sm:space-y-2 flex-1">
                                 <div className="flex items-center gap-2">
                                     {selectedPlanCode === plan.codigo && <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 sm:size-[18px]" />}
                                     <h3 className="text-sm sm:text-lg font-black font-accent tracking-tight line-clamp-1">{plan.descripcion}</h3>
                                     {plan.codigo.includes('GOLD') && <Star size={12} className="text-amber-400 fill-amber-400 sm:size-[14px]" />}
                                 </div>
                                 <p className="text-[10px] sm:text-xs text-text-secondary leading-relaxed max-w-sm line-clamp-2 sm:line-clamp-none">{plan.informacionAdicional}</p>
                             </div>
                             
                             <div className="flex items-center justify-between md:justify-end gap-4 flex-shrink-0 border-t md:border-t-0 border-border-primary/20 pt-3 md:pt-0">
                                 <div className="text-left md:text-right">
                                     <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-text-secondary opacity-60 mb-0.5 sm:mb-1">Costo Mensual</p>
                                     <h4 className="text-xl sm:text-3xl font-black text-emerald-500">{formatMoney(plan.formasPagos?.[0]?.precioCuota || 0)}</h4>
                                 </div>
                                 <button 
                                     onClick={(e) => { e.stopPropagation(); setExpandedPlan(expandedPlan === plan.codigo ? null : plan.codigo); }}
                                     className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-bg-primary border border-border-primary flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm flex-shrink-0"
                                 >
                                     {expandedPlan === plan.codigo ? <ChevronUp size={16} className="sm:size-[18px]" /> : <ChevronDown size={16} className="sm:size-[18px]" />}
                                 </button>
                             </div>
                          </div>

                         <AnimatePresence>
                            {expandedPlan === plan.codigo && (
                                <motion.div 
                                    initial={{ height: 0 }} 
                                    animate={{ height: 'auto' }} 
                                    exit={{ height: 0 }}
                                    className="overflow-hidden bg-bg-primary/50 border-t border-emerald-500/10"
                                >
                                    <div className="p-5 md:p-6">
                                        <h4 className="text-[10px] font-black tracking-widest text-text-secondary opacity-60 mb-4">Coberturas incluidas</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {plan.coberturas?.map((c, i) => (
                                                <div key={i} className="flex justify-between items-start p-3 bg-bg-secondary/50 rounded-xl border border-border-primary/50 gap-3">
                                                    <div className="space-y-1 flex-1">
                                                        <p className="text-xs font-bold text-text-primary">{c.descripcion}</p>
                                                        {c.informacionAdicional && <p className="text-[10px] text-text-secondary leading-relaxed">{c.informacionAdicional}</p>}
                                                    </div>
                                                    {c.sumaAsegurada && (
                                                        <span className="text-xs font-black text-emerald-500 flex-shrink-0 whitespace-nowrap pt-0.5">
                                                            {formatMoney(c.sumaAsegurada.monto)}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                         </AnimatePresence>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                     <Button 
                        onClick={() => setCurrentStep(3)}
                        className="w-full h-14 rounded-xl bg-emerald-500 font-black text-base shadow-xl shadow-emerald-500/20 group border-none cursor-pointer"
                     >
                        Continuar con este plan
                        <Zap size={18} className="ml-2 group-hover:scale-110 transition-transform" />
                     </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: DATOS PERSONALES */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="max-w-2xl mx-auto space-y-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                          <User size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black font-accent tracking-tighter">Tus Datos</h2>
                        <p className="text-xs text-text-secondary font-medium">Necesitamos identificarte para generar la póliza.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div 
                      animate={{
                        boxShadow: ["0 0 0px rgba(16, 185, 129, 0)", "0 0 20px rgba(16, 185, 129, 0.4)", "0 0 0px rgba(16, 185, 129, 0)"],
                      }}
                      transition={{ duration: 1.5, delay: 0.5, repeat: 1 }}
                      className="space-y-1.5 p-1 rounded-xl"
                    >
                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Nombre</label>
                        <input 
                            type="text" 
                            className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold yuju-input-emerald"
                            value={personalData.nombre}
                            onChange={(e) => setPersonalData({...personalData, nombre: e.target.value})}
                        />
                    </motion.div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Apellido</label>
                        <input 
                            type="text" 
                            className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold yuju-input-emerald"
                            value={personalData.apellido}
                            onChange={(e) => setPersonalData({...personalData, apellido: e.target.value})}
                        />
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Email</label>
                        <input 
                            type="email" 
                            className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold yuju-input-emerald"
                            value={personalData.email}
                            onChange={(e) => setPersonalData({...personalData, email: e.target.value})}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Fin de Nacimiento (<span className="opacity-70 lowercase">dd/mm/aaaa</span>)</label>
                        <div className="flex gap-2">
                          <input type="text" placeholder="DD" className="w-1/3 h-12 bg-bg-secondary border border-border-primary rounded-xl px-2 text-center text-sm font-semibold yuju-input-emerald" value={personalData.fechaNacimientoDia} onChange={(e) => setPersonalData({...personalData, fechaNacimientoDia: e.target.value})}/>
                          <input type="text" placeholder="MM" className="w-1/3 h-12 bg-bg-secondary border border-border-primary rounded-xl px-2 text-center text-sm font-semibold yuju-input-emerald" value={personalData.fechaNacimientoMes} onChange={(e) => setPersonalData({...personalData, fechaNacimientoMes: e.target.value})}/>
                          <input type="text" placeholder="AAAA" className="w-1/3 h-12 bg-bg-secondary border border-border-primary rounded-xl px-2 text-center text-sm font-semibold yuju-input-emerald" value={personalData.fechaNacimientoAno} onChange={(e) => setPersonalData({...personalData, fechaNacimientoAno: e.target.value})}/>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Tipo Doc.</label>
                        <select 
                            className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold yuju-input-emerald appearance-none"
                            value={personalData.tipoDocumento}
                            onChange={(e) => setPersonalData({...personalData, tipoDocumento: e.target.value})}
                        >
                            <option value="DNI">DNI</option>
                            <option value="CUIT">CUIT</option>
                            <option value="CUIL">CUIL</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Nro. Documento</label>
                        <input 
                            type="text" 
                            className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold yuju-input-emerald"
                            value={personalData.dni}
                            onChange={(e) => setPersonalData({...personalData, dni: e.target.value})}
                        />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Teléfono Móvil</label>
                        <div className="flex gap-3">
                           <div className="flex w-1/3 bg-bg-secondary border border-border-primary rounded-xl overflow-hidden yuju-container-emerald h-12">
                              <span className="h-full flex items-center justify-center bg-bg-primary/50 px-3 text-text-secondary text-xs font-bold border-r border-border-primary">0</span>
                              <input type="text" placeholder="Cód. área" className="w-full bg-transparent px-3 text-sm font-semibold outline-none" value={personalData.codArea} onChange={(e) => setPersonalData({...personalData, codArea: e.target.value})} />
                           </div>
                           <div className="flex w-2/3 bg-bg-secondary border border-border-primary rounded-xl overflow-hidden yuju-container-emerald h-12">
                              <span className="h-full flex items-center justify-center bg-bg-primary/50 px-3 text-text-secondary text-xs font-bold border-r border-border-primary">15</span>
                              <input type="text" placeholder="Número" className="w-full bg-transparent px-3 text-sm font-semibold outline-none" value={personalData.telefono} onChange={(e) => setPersonalData({...personalData, telefono: e.target.value})} />
                           </div>
                        </div>
                    </div>
                  </div>

                  {error && <p className="text-xs text-red-500 font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}

                  <div className="pt-2">
                     <Button 
                       onClick={handlePersonalSubmit}
                       isLoading={isProcessing}
                       className="w-full h-14 rounded-xl bg-emerald-500 font-black text-base border-none shadow-lg shadow-emerald-500/20 cursor-pointer"
                     >
                       Confirmar Identidad
                     </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: UBICACION */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="max-w-xl mx-auto space-y-6"
                >
                  <div className="text-center space-y-2 mb-2">
                    <div className="w-14 h-14 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3">
                        <MapPin size={28} />
                    </div>
                    <h2 className="text-2xl font-black font-accent tracking-tighter">Domicilio</h2>
                    <p className="text-xs text-text-secondary font-medium">¿Dónde está ubicada la propiedad?</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <motion.div 
                          animate={{
                            boxShadow: ["0 0 0px rgba(16, 185, 129, 0)", "0 0 20px rgba(16, 185, 129, 0.4)", "0 0 0px rgba(16, 185, 129, 0)"],
                          }}
                          transition={{ duration: 1.5, delay: 0.5, repeat: 1 }}
                          className="md:col-span-3 space-y-1.5 p-1 rounded-xl"
                        >
                            <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Calle</label>
                            <input 
                                type="text" 
                                className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold yuju-input-emerald"
                                value={addressData.calle}
                                onChange={(e) => setAddressData({...addressData, calle: e.target.value})}
                            />
                        </motion.div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Nro</label>
                            <input 
                                type="text" 
                                className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold yuju-input-emerald"
                                value={addressData.numero}
                                onChange={(e) => setAddressData({...addressData, numero: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Localidad</label>
                            <input 
                                type="text" 
                                className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold yuju-input-emerald"
                                value={addressData.localidad}
                                onChange={(e) => setAddressData({...addressData, localidad: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Código Postal</label>
                            <input 
                                type="text" 
                                className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold yuju-input-emerald"
                                value={addressData.codigoPostal}
                                onChange={(e) => setAddressData({...addressData, codigoPostal: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 pt-3 border-t border-border-primary/50 mt-1">
                       <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Su vivienda es</label>
                            <select 
                                className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold yuju-input-emerald appearance-none"
                                value={addressData.tipoVivienda}
                                onChange={(e) => setAddressData({...addressData, tipoVivienda: e.target.value})}
                            >
                                <option value="casss">Casa</option>
                                <option value="dptoopo">Departamento</option>
                            </select>
                        </div>
                        {addressData.tipoVivienda === 'dptoopo' && (
                           <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                  <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Piso</label>
                                  <input type="text" className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold outline-none focus:border-emerald-500 transition-all" value={addressData.piso} onChange={(e) => setAddressData({...addressData, piso: e.target.value})}/>
                              </div>
                              <div className="space-y-1.5">
                                  <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Depto</label>
                                  <input type="text" className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold outline-none focus:border-emerald-500 transition-all" value={addressData.departamento} onChange={(e) => setAddressData({...addressData, departamento: e.target.value})}/>
                              </div>
                           </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                           <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Muros</label>
                                <select 
                                    className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold yuju-input-emerald appearance-none"
                                    value={addressData.muros}
                                    onChange={(e) => setAddressData({...addressData, muros: e.target.value})}
                                >
                                    <option value="trad">Ladrillo / Hormigón</option>
                                    <option value="mad">Madera / Otros</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Carácter</label>
                                <select 
                                    className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold yuju-input-emerald appearance-none"
                                    value={addressData.caracter}
                                    onChange={(e) => setAddressData({...addressData, caracter: e.target.value})}
                                >
                                    <option value="VIVIENDA_COMBINADOFAMILIAR_CARACTER1">Propietario</option>
                                    <option value="VIVIENDA_COMBINADOFAMILIAR_CARACTER2">Inquilino</option>
                                </select>
                            </div>
                        </div>
                    </div>
                  </div>
                  
                  {error && <p className="text-xs text-red-500 font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}

                  <div className="pt-2">
                     <Button 
                       onClick={handleAddressSubmit}
                       isLoading={isProcessing}
                       className="w-full h-14 rounded-xl bg-emerald-500 font-black text-base border-none shadow-lg shadow-emerald-500/20"
                     >
                       Validar Ubicación
                     </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: PAGO */}
              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-lg mx-auto space-y-6"
                >
                  <div className="text-center space-y-2 mb-2">
                    <div className="w-14 h-14 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3">
                        <CreditCard size={28} />
                    </div>
                    <h2 className="text-2xl font-black font-accent tracking-tighter">Método de Pago</h2>
                    <p className="text-xs text-text-secondary font-medium">Último paso para estar protegido.</p>
                  </div>

                  <div className="space-y-3">
                    <button 
                        onClick={() => setPaymentData({...paymentData, method: 'TARJETA_CREDITO'})}
                        className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 text-left
                            ${paymentData.method === 'TARJETA_CREDITO' ? 'border-emerald-500 bg-emerald-500/5' : 'border-border-primary bg-bg-secondary'}`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-colors flex-shrink-0
                            ${paymentData.method === 'TARJETA_CREDITO' ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-bg-primary border-border-primary text-text-secondary opacity-40'}`}>
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <h3 className="font-black tracking-tight text-sm md:text-base leading-tight">Tarjeta de Crédito</h3>
                            <p className="text-[10px] text-text-secondary font-medium mt-0.5">VISA, MasterCard, AMEX, CABAL</p>
                        </div>
                    </button>

                    <AnimatePresence>
                        {paymentData.method === 'TARJETA_CREDITO' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Marca de Tarjeta</label>
                                    <select 
                                        className="w-full h-12 bg-bg-primary border border-border-primary rounded-xl px-4 text-sm font-semibold yuju-input-emerald appearance-none shadow-sm"
                                        value={paymentData.marcaTarjeta}
                                        onChange={(e) => setPaymentData({...paymentData, marcaTarjeta: e.target.value})}
                                    >
                                        <option value="VISA">VISA</option>
                                        <option value="MASTERCARD">MASTERCARD</option>
                                        <option value="AMERICAN_EXPRESS">AMERICAN EXPRESS</option>
                                        <option value="CABAL">CABAL</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Número de Tarjeta</label>
                                    <input 
                                        type="text" 
                                        placeholder="0000 0000 0000 0000"
                                        className="w-full h-12 bg-bg-primary border border-border-primary rounded-xl px-4 text-sm font-semibold outline-none focus:border-emerald-500"
                                        value={paymentData.numeroTarjeta}
                                        onChange={(e) => setPaymentData({...paymentData, numeroTarjeta: e.target.value})}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button 
                        onClick={() => setPaymentData({...paymentData, method: 'DEBITO_AUTOMATICO'})}
                        className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 text-left
                            ${paymentData.method === 'DEBITO_AUTOMATICO' ? 'border-emerald-500 bg-emerald-500/5' : 'border-border-primary bg-bg-secondary'}`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-colors flex-shrink-0
                            ${paymentData.method === 'DEBITO_AUTOMATICO' ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-bg-primary border-border-primary text-text-secondary opacity-40'}`}>
                            <Landmark size={24} />
                        </div>
                        <div>
                            <h3 className="font-black tracking-tight text-sm md:text-base leading-tight">CBU / Débito Bancario</h3>
                            <p className="text-[10px] text-text-secondary font-medium mt-0.5">Bancos oficiales de Argentina</p>
                        </div>
                    </button>
                    
                    <AnimatePresence>
                        {paymentData.method === 'DEBITO_AUTOMATICO' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">CBU (22 Dígitos)</label>
                                    <input 
                                        type="text" 
                                        placeholder="0000000000000000000000"
                                        className="w-full h-12 bg-bg-primary border border-border-primary rounded-xl px-4 text-sm font-semibold outline-none focus:border-emerald-500"
                                        value={paymentData.cbu}
                                        onChange={(e) => setPaymentData({...paymentData, cbu: e.target.value})}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                  </div>

                  {error && <p className="text-xs text-red-500 font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}

                  <div className="pt-4">
                     <Button 
                       onClick={handlePaymentSubmit}
                       isLoading={isProcessing}
                       className="w-full h-14 rounded-xl bg-emerald-500 font-black text-base shadow-lg shadow-emerald-500/30 border-none"
                     >
                       Contratar Seguro Ahora
                     </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 6: SUCCESS */}
              {currentStep === 6 && (
                <motion.div
                  key="step6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 space-y-6"
                >
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto relative mb-4">
                     <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-full animate-pulse" />
                     <ShieldCheck className="text-emerald-500 relative z-10 animate-float" size={48} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-emerald-500 mb-1">
                       <CheckCircle2 size={20} />
                       <span className="text-[10px] font-black uppercase tracking-[0.3em]">Emisión Exitosa</span>
                    </div>
                    <h2 className="text-4xl font-black text-text-primary font-accent tracking-tighter whitespace-pre-wrap">¡Ya estás protegido!</h2>
                    <p className="text-xs text-text-secondary font-medium max-w-sm mx-auto">
                        Hemos enviado el certificado de cobertura y la póliza digital a tu casilla de correo. 
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 max-w-xs mx-auto pt-4">
                    <Button className="bg-bg-secondary text-text-primary font-black uppercase h-12 rounded-xl border-border-primary hover:border-emerald-500 transition-all text-xs">
                        Descargar Póliza
                    </Button>
                    <Button variant="ghost" className="font-black uppercase text-[10px] tracking-widest text-text-secondary" onClick={() => window.location.href = '/'}>
                        Volver al inicio
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
            )}
          </GlassCard>
        </div>
      </div>

      <div className="relative z-0">
        <FAQAccordion
          items={hogarFAQ}
          accentColor="text-emerald-500"
          borderColor="border-emerald-500/30"
          bgColor="bg-emerald-500/5"
        />
      </div>
    </Layout>
  );
};
