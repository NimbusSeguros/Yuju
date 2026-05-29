import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, ChevronRight, Zap, ShieldCheck,
  Building2, Star, CheckCircle2, User,
  ChevronDown, ChevronUp, Loader2, ArrowLeft,
  Check, MapPin, CreditCard, Laptop, Camera, Upload, Trash2, Bike
} from 'lucide-react';
import { MonopatinIcon } from '../../components/icons/MonopatinIcon';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Layout } from '../../layout/Layout';
import { SEOHelmet } from '../SEO/SEOHelmet';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { FAQAccordion } from './FAQAccordion';

const hogarFAQ = [
  { id: 1, title: "¿Qué es el Seguro de Hogar?", subtitle: "Es una forma de cuidar lo que más querés: tu casa y todo lo que hay en ella. Con una póliza de seguro de hogar, podés proteger tu patrimonio y el de tu familia ante situaciones como robo, incendio, rotura y otros tipos de riesgos." },
  { id: 2, title: "¿Qué tipo de vivienda puedo asegurar?", subtitle: "Podés asegurar cualquier vivienda que uses para vivir con tu familia, ya sea de forma permanente o semipermanente. Lo único que no podés hacer es usarla para fines comerciales." },
  { id: 3, title: "¿Cuánto demora la emisión de mi póliza?", subtitle: "Nada, es instantánea. Sólo tenés que elegir el plan que más te guste, ingresar tus datos y confirmar tu pago. Enseguida te mandamos tu póliza por mail y ya está, tu casa queda asegurada." },
  { id: 4, title: "¿Tengo cobertura si alguien se accidenta dentro de la vivienda?", subtitle: "Sí, claro. Con la cobertura de Responsabilidad Civil, podés estar tranquilo si alguien se lastima o sufre de algún daño dentro de tu casa." },
  { id: 5, title: "¿En caso de mudanza se mantiene la cobertura?", subtitle: "Sí, por supuesto. Solo tenés que avisarnos tu nueva dirección y nosotros actualizamos tu póliza. Así, tu nueva casa queda protegida con la misma cobertura que tenías antes." },
  { id: 6, title: "¿Podemos asegurar bienes fuera de la vivienda?", subtitle: "Sí, depende de la aseguradora que elijas. Algunas te permiten asegurar bienes que lleves fuera de tu casa, como tu celular, tu notebook o tu cámara. Así, podés estar tranquilo si te los roban o se te rompen en cualquier parte del mundo." },
  { id: 7, title: "¿Cómo calculo el valor de mi vivienda?", subtitle: "Si no sabés cuánto vale tu casa, no te preocupes. En Yuju Seguros te ayudamos a calcularlo con una herramienta llamada LEA, que estima el valor de cada vivienda según sus características y ubicación." },
  { id: 8, title: "¿Puedo contratar una póliza de hogar si soy inquilino?", subtitle: "Sí, por supuesto. No hace falta que seas el dueño de la casa para asegurarla. Podés contratar una póliza de hogar como inquilino y proteger tus bienes y tu responsabilidad civil." },
  { id: 9, title: "¿Debo declarar los electrodomésticos de mi vivienda y los bienes tecnológicos que aseguro?", subtitle: "Eso depende del tipo de cobertura que contrates. Si elegís una cobertura básica, no hace falta que declares nada. Sí, elegís una cobertura más completa, sí tenés que declarar los bienes que quieras asegurar, como tu televisor, tu heladera o tu computadora." },
  { id: 10, title: "¿Qué medidas de seguridad tiene que tener mi vivienda?", subtitle: "Las medidas de seguridad básicas que tiene que tener tu casa son: cerraduras tipo doble paleta en las puertas que dan al exterior, construcción de ladrillos o materiales que no se prendan fuego. Además, si no tenés rejas, persianas, postigones o vidrios blindados en las ventanas, tenés que tener un sistema de alarma. Si tu casa está al lado de un terreno baldío, de una construcción abandonada o no está pegada a las otras casas, los muros tienen que medir al menos 1,80 metros. Si vivís en un barrio privado con cerco y vigilancia las 24 horas o en un departamento desde el tercer piso en adelante, solo necesitás las medidas básicas." },
  { id: 11, title: "¿La cobertura de incendio del edificio y contenido, tiene adicionales sin cargo?", subtitle: "Si, tanto la cobertura de incendio del edificio como la de contenido, tienen un adicional gratis por daños causados por granizo, huracán, ciclón, tornado y terremoto. Eso sí, si querés agregar esta cobertura, tenés que pagar un poco más en la mayoría de los casos." },
  { id: 12, title: "¿Cómo gestiono el reintegro de Beneficios adicionales?", subtitle: "Es muy fácil. Solo tenés que presentar tu factura y te hacemos el reintegro dentro de las 72 horas." },
  { id: 13, title: "¿Qué tiempo tengo para denunciar un incidente?", subtitle: "Lo ideal es que nos avises lo antes posible, así podemos ayudarte mejor y darte una mano desde el primer momento. Pero no te preocupes, tenés hasta 72 horas después del incidente para hacer la denuncia. *Chequear lo de las 72 hs*" },
  { id: 14, title: "¿Cuándo puedo darme de baja?", subtitle: "Cuando quieras. En Yuju Seguros no te atamos con contratos ni multas. Podés dar de baja tu seguro en cualquier momento, sin explicaciones ni complicaciones." },
  { id: 15, title: "¿A partir de cuándo tengo cobertura? ¿Cuánto dura?", subtitle: "Vos elegís desde qué momento querés que tu casa esté asegurada. Puede ser desde el mismo día que contratas el seguro o desde una fecha posterior. La duración del seguro depende de la aseguradora que elijas. Puede ser trimestral, cuatrimestral, semestral o anual. Y se renueva automáticamente cada vez que vence, siempre que pagues a tiempo." },
  { id: 16, title: "Datos para emitir:", subtitle: "Para emitir tu póliza, necesitamos que nos digas: la localidad donde está tu casa, los metros cuadrados que tiene, la ubicación y el valor de la vivienda y de los bienes que querés asegurar (cristales, electrodomésticos, mobiliario, electrónica)." },
  { id: 17, title: "¿Cómo actuar en caso de siniestro?", subtitle: "Si sufrís un robo, lo primero que tenés que hacer es hacer la denuncia policial correspondiente. Después, tenés que comunicarte con nuestro departamento de siniestros o con el 0800 de la aseguradora que hayas elegido. Nosotros te vamos a indicar los pasos a seguir y te vamos a acompañar en todo el proceso." },
  { id: 18, title: "Medios y forma de pago?", subtitle: "Podés pagar tu seguro de la forma que más te convenga. Podés elegir entre pagar en cuotas fijas mensuales o pagar el contrato completo en una sola cuota. Y podés usar el medio de pago que prefieras: tarjeta de crédito, débito, transferencia bancaria, Mercado Pago, etc. Recordá que el tiempo de contrato varía según la aseguradora (trimestral, cuatrimestral, semestral o anual)." }
];

const notebookFAQ = [
  { id: 1, title: "¿Puedo contratar el seguro de notebook si soy menor de edad?", subtitle: "Las pólizas son solo para mayores de 18 años. Si sos menor de edad, pedile a tus padres o a tu tutor que te ayuden con la contratación." },
  { id: 2, title: "¿Qué cosas no me cubre el seguro de notebook?", subtitle: "No te cubre si te roban la notebook sin que te des cuenta o si te roban solo una parte de la notebook. Eso se llama hurto o robo parcial. Tampoco te cubre si perdés o te olvidás la notebook." },
  { id: 3, title: "¿El seguro cubre la pérdida de datos como música, películas y juegos?", subtitle: "No, el seguro solo cubre los daños físicos al equipo. Pero no te desanimes, podés respaldar tus datos en la nube o en un disco externo para tenerlos siempre disponibles." },
  { id: 4, title: "¿Cuál es la antigüedad máxima que puede tener mi notebook?", subtitle: "Podés asegurar tu notebook sin importar su antigüedad, lo único que importa es que funcione bien." },
  { id: 5, title: "¿Puedo asegurar más de una notebook?", subtitle: "¡Claro que sí! Podés asegurar todas las notebooks que quieras. Solo tenés que hacer el trámite por cada una que quieras asegurar." },
  { id: 6, title: "¿Qué pasa si me llevo la notebook a otro lado y le pasa algo?", subtitle: "¡No te preocupes! Tu notebook está segura donde sea que la lleves." },
  { id: 7, title: "¿Puedo asegurar la notebook si la uso para trabajar?", subtitle: "Sí, podés asegurar tu notebook sin problemas. Tu equipo tiene cobertura sin importar el uso que le des." }
];

const bicicletaFAQ = [
  { id: 1, title: "¿En qué consiste el seguro de bici de Yuju Seguros?", subtitle: "Este seguro te cubre en el caso de robo, incendio o destrucción total de la bicicleta, brindándote una indemnización para que puedas comprar otra bici o reparar la tuya. También te cubre los gastos médicos, farmacéuticos y de traslado en caso de que sufras un accidente mientras usás tu bici. Además, te brinda asistencia las 24 horas si tenés algún problema con tu bici. Contactanos para conocer la amplia oferta de sumas aseguradas y otros detalles de la protección." },
  { id: 2, title: "¿Se pueden asegurar bicicletas para delivery?", subtitle: "¡Sí! Se pueden asegurar sin problema bicicletas de “uso comercial”. Destinadas a repartos de comida, paquetería y comisiones en general." },
  { id: 3, title: "¿Cuál es la documentación necesaria para realizar un seguro de Bicicleta?", subtitle: "La documentación obligatoria a presentar es:\n- Datos del tomador\n- Medio de pago\n- Datos de la bici (marca, modelo, rodado, número de cuadro)\n- Foto de la bicicleta\n- Foto de la factura de compra o bien un presupuesto de una bicicletería amiga. En ambos casos debe estar bien legible la fecha, marca, modelo, número de cuadro y valor de la bicicleta. En caso de ser un presupuesto el valor que figure debe ser el mismo valor que declaraste para asegurarla." },
  { id: 4, title: "¿Qué tipos de bici podemos asegurar?", subtitle: "¡Sí! Sea nueva y brillante, o la bici de tu infancia, va a estar cubierta igual. Podemos asegurar los siguientes tipos de bici:\n- Bicicletas comunes\n- Bicicletas de ruta\n- Bicicletas para descenso (DH)\n- Bicicletas cross country (XC)\n- Bicicletas eléctricas y E-Bike\n- Todo tipo de bicicletas que no sean impulsadas por combustible." },
  { id: 5, title: "¿Cuál es la franquicia del seguro de bici de Yuju Seguros?", subtitle: "La franquicia es el 10% calculado sobre la suma asegurada. Es decir, es el monto que tenés que pagar en caso de que se produzca un siniestro. Por ejemplo, si tu bici está asegurada por $100.000 y sufre un robo, la franquicia será de $10.000 y la indemnización será de $90.000." },
  { id: 6, title: "¿Cuál es el ámbito de la cobertura del seguro de bici de Yuju Seguros?", subtitle: "La cobertura es en República Argentina. En caso de que necesites cobertura fuera de dicho territorio, por favor aclaralo y haremos lo posible para dar cobertura." },
  { id: 7, title: "¿Qué exclusiones de cobertura tiene el seguro de bici de Yuju Seguros?", subtitle: "El seguro de bici de Yuju Seguros no cubre el hurto de la bicicleta. Es decir, si te la llevan sin que te des cuenta o sin ejercer violencia. Tampoco cubre los daños parciales de la bicicleta, salvo que sean consecuencia de un incendio o de un accidente personal. Además, no cubre los daños causados por el uso indebido, el desgaste, la falta de mantenimiento o la modificación de la bicicleta. Para conocer todas las exclusiones de cobertura, te recomendamos leer las condiciones generales y particulares de la póliza." }
];

const monopatinFAQ = [
  { id: 1, title: "¿En qué consiste el seguro de monopatín eléctrico de Yuju Seguros?", subtitle: "Este seguro te cubre en caso de robo, incendio o destrucción total de tu monopatín eléctrico. Además, te protege ante accidentes personales y Responsabilidad Civil por posibles daños a terceros que puedas ocasionar mientras circulas." },
  { id: 2, title: "¿Se pueden asegurar monopatines usados para delivery?", subtitle: "¡Sí! Podés asegurar tu monopatín aunque lo uses para trabajar en aplicaciones de reparto o mensajería." },
  { id: 3, title: "¿Cuál es la documentación necesaria para emitir el seguro?", subtitle: "Para emitir necesitamos los datos del tomador, medio de pago, y los datos específicos del monopatín (marca, modelo y número de serie). Tené a mano tu factura de compra o un comprobante que acredite su valor comercial." },
  { id: 4, title: "¿Qué antigüedad puede tener mi monopatín?", subtitle: "Aseguramos monopatines eléctricos de cualquier marca o modelo. Solo tenés que declarar el año de fabricación, y si es un modelo muy antiguo lo evaluamos de manera particular." },
  { id: 5, title: "¿Cuál es la franquicia del seguro de monopatín?", subtitle: "La franquicia es un monto a cargo tuyo en caso de siniestro (generalmente un 10% de la suma asegurada). Significa que si tu monopatín se daña o es robado, te descontamos ese pequeño porcentaje y nosotros cubrimos el resto de la indemnización." },
  { id: 6, title: "¿Dónde tiene validez mi seguro?", subtitle: "La cobertura tiene validez en todo el territorio de la República Argentina." },
  { id: 7, title: "¿Qué no me cubre el seguro?", subtitle: "El seguro no cubre hurtos (es decir, robos sin violencia ni intimidación, por ejemplo si lo dejas apoyado sin candado y te lo llevan). Tampoco cubre desgastes normales por el uso o daños por falta de mantenimiento." }
];

// Axios client with localized auth token handling
const hogarApi = axios.create({
  baseURL: `${import.meta.env.VITE_HOGAR_API_URL || 'http://localhost:3000'}/api`,
  timeout: 35000
});

// ⚠️ SECURITY: Usar sessionStorage en vez de localStorage para reducir impacto de XSS
let cachedHogarToken: string | null = sessionStorage.getItem('hogar_auth_token');

const getHogarToken = async () => {
  if (cachedHogarToken) return cachedHogarToken;
  const clientSecret = import.meta.env.VITE_HOGAR_API_CLIENT_SECRET;
  if (!clientSecret) {
    throw new Error('VITE_HOGAR_API_CLIENT_SECRET no está configurado');
  }
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_HOGAR_API_URL || 'http://localhost:3000'}/api/auth/token`,
      { clientSecret },
      { headers: { 'Content-Type': 'application/json' } }
    );
    cachedHogarToken = response.data.token;
    if (cachedHogarToken) {
      // ⚠️ SECURITY: sessionStorage se limpia al cerrar el navegador
      sessionStorage.setItem('hogar_auth_token', cachedHogarToken);
    }
    return cachedHogarToken;
  } catch (error) {
    console.error('[HogarCotizador] Error requesting Hogar API token:', error);
    throw error;
  }
};

hogarApi.interceptors.request.use(async (config) => {
  try {
    if (config.url?.includes('/auth/token')) return config;
    const token = await getHogarToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.warn('[HogarCotizador] Proceeding without token due to retrieval error:', error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

hogarApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/token')
    ) {
      originalRequest._retry = true;
      try {
        cachedHogarToken = null;
        sessionStorage.removeItem('hogar_auth_token');
        const token = await getHogarToken();
        if (token && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return hogarApi(originalRequest);
      } catch (authError) {
        console.error('[HogarCotizador] Token renewal failed during automatic retry:', authError);
      }
    }
    return Promise.reject(error);
  }
);

// Security utility: AES-256-CBC encryption for sensitive payment data
// Key must match VITE_SECURE_ENCRYPTION_KEY in .env (same as backend ENCRYPTION_KEY)
const ENCRYPTION_KEY = import.meta.env.VITE_SECURE_ENCRYPTION_KEY;
const secureEncrypt = (text: string): string => {
  if (!text) return text;
  if (!ENCRYPTION_KEY) {
    console.warn('[Security] VITE_SECURE_ENCRYPTION_KEY not set — sending unencrypted (dev only)');
    return text;
  }
  const iv = CryptoJS.lib.WordArray.random(16);
  const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);
  const encrypted = CryptoJS.AES.encrypt(text, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return iv.toString() + ':' + encrypted.ciphertext.toString();
};

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

interface ProductConfig {
  type: 'hogar' | 'monopatin' | 'bicicleta' | 'notebook';
  title: string;
  subtitle: string;
  description: string;
  objectCode: string;
  indicioCode: string;
  themeColor: 'emerald' | 'cyan' | 'blue' | 'indigo';
  themeColorHex: string;
  themeBg: string;
  themeBorder: string;
  themeText: string;
  themeBtn: string;
  themeGlow: string;
  icon: any;
  initialFormTitle: string;
  initialFormDesc: string;
  addressFieldsTitle: string;
  addressFieldsDesc: string;
  hasPhotosStep: boolean;
  photoRequirements?: { key: string; label: string; placeholder: string }[];
}

const PRODUCT_CONFIGS: Record<'hogar' | 'monopatin' | 'bicicleta' | 'notebook', ProductConfig> = {
  hogar: {
    type: 'hogar',
    title: 'Seguro de Hogar',
    subtitle: 'Protección Inmediata',
    description: 'Podés elegir un plan para cuidar tu casa y contratarlo ahora mismo de forma digital.',
    objectCode: 'VIVIENDA',
    indicioCode: 'CF_PACK_FREESTYLE',
    themeColor: 'emerald',
    themeColorHex: '#10B981',
    themeBg: 'bg-emerald-500/10',
    themeBorder: 'border-emerald-500/20',
    themeText: 'text-emerald-500',
    themeBtn: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20',
    themeGlow: 'bg-emerald-500/5',
    icon: Home,
    initialFormTitle: 'Tu Vivienda',
    initialFormDesc: 'Contanos qué tipo de hogar querés proteger hoy.',
    addressFieldsTitle: 'Domicilio de Cobertura',
    addressFieldsDesc: '¿Dónde está ubicada la propiedad a asegurar?',
    hasPhotosStep: false
  },
  monopatin: {
    type: 'monopatin',
    title: 'Seguro de Monopatín',
    subtitle: 'Protección para tu movilidad',
    description: 'Cotizá y contratá la mejor cobertura para tu monopatín eléctrico contra robos y accidentes.',
    objectCode: 'MONOPATIN',
    indicioCode: 'ROBO_MONOPATIN_FREESTYLE',
    themeColor: 'cyan',
    themeColorHex: '#06B6D4',
    themeBg: 'bg-cyan-500/10',
    themeBorder: 'border-cyan-500/20',
    themeText: 'text-cyan-500',
    themeBtn: 'bg-cyan-500 hover:bg-cyan-600 shadow-cyan-500/20',
    themeGlow: 'bg-cyan-500/5',
    icon: MonopatinIcon,
    initialFormTitle: 'Tu Monopatín',
    initialFormDesc: 'Contanos los detalles de tu monopatín eléctrico.',
    addressFieldsTitle: 'Datos de la Unidad & Domicilio',
    addressFieldsDesc: 'Ingresá los datos del monopatín y el domicilio de resguardo.',
    hasPhotosStep: false
  },
  bicicleta: {
    type: 'bicicleta',
    title: 'Seguro de Bicicleta',
    subtitle: 'Pedaleá con tranquilidad',
    description: 'Protegé tu bicicleta contra robos en la vía pública y accidentes personales con contratación 100% digital.',
    objectCode: 'BICICLETA',
    indicioCode: 'ROBO_BICICLETA_FREESTYLE',
    themeColor: 'blue',
    themeColorHex: 'oklch(85.2% 0.199 91.936)',
    themeBg: 'rgba(255, 211, 51, 0.1)',
    themeBorder: 'rgba(255, 211, 51, 0.2)',
    themeText: 'text-amber-500',
    themeBtn: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20',
    themeGlow: 'bg-amber-500/5',
    icon: Bike,
    initialFormTitle: 'Tu Bicicleta',
    initialFormDesc: 'Contanos el valor estimado y características generales de tu bici.',
    addressFieldsTitle: 'Datos de la Bici & Domicilio',
    addressFieldsDesc: 'Ingresá el número de cuadro, rodado, marca y tu dirección.',
    hasPhotosStep: true,
    photoRequirements: [
      { key: 'foto_cuadro', label: 'Foto del Nro. de Cuadro', placeholder: 'Etiqueta o grabado del número de cuadro' },
      { key: 'foto_bici_entera', label: 'Foto de la Bici Completa', placeholder: 'Vista lateral de la bicicleta armada' },
      { key: 'foto_factura', label: 'Foto de Factura o Boleto', placeholder: 'Comprobante de compra o documento (Opcional)' }
    ]
  },
  notebook: {
    type: 'notebook',
    title: 'Seguro de Notebook',
    subtitle: 'Trabajá donde quieras',
    description: 'Llevá tu computadora portátil a cualquier lado con la tranquilidad de estar protegido contra robos y daños.',
    objectCode: 'NOTEBOOK',
    indicioCode: 'FREESTYLE_ROBO_NOTEBOOK',
    themeColor: 'indigo',
    themeColorHex: '#6366F1',
    themeBg: 'bg-indigo-500/10',
    themeBorder: 'border-indigo-500/20',
    themeText: 'text-indigo-500',
    themeBtn: 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20',
    themeGlow: 'bg-indigo-500/5',
    icon: Laptop,
    initialFormTitle: 'Tu Notebook',
    initialFormDesc: 'Ingresá el valor aproximado de tu computadora para calcular el plan.',
    addressFieldsTitle: 'Datos de la Notebook & Domicilio',
    addressFieldsDesc: 'Completá marca, modelo, número de serie y tus datos de domicilio.',
    hasPhotosStep: true,
    photoRequirements: [
      { key: 'foto_serie', label: 'Foto del Nro. de Serie', placeholder: 'Etiqueta con el número de serie' },
      { key: 'foto_pantalla_encendida', label: 'Foto con Pantalla Encendida', placeholder: 'Notebook prendida mostrando funcionamiento' },
      { key: 'foto_notebook_cerrada', label: 'Foto de la Notebook Cerrada', placeholder: 'Vista superior/exterior de la computadora' }
    ]
  }
};

interface Props {
  type: 'hogar' | 'monopatin' | 'bicicleta' | 'notebook';
}

export const GenericTechHomeCotizador = ({ type }: Props) => {
  const config = PRODUCT_CONFIGS[type];
  const MainIcon = config.icon;

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [questions, setQuestions] = useState<Pregunta[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanCode, setSelectedPlanCode] = useState<string | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [useType, setUseType] = useState<'particular' | 'comercial'>('particular');

  const isBici = config.type === 'bicicleta';
  const getThemeBg = () => isBici ? { backgroundColor: 'oklch(85.2% 0.199 91.936 / 0.1)' } : {};
  const getThemeText = () => isBici ? { color: 'oklch(85.2% 0.199 91.936)' } : {};
  const getThemeBtn = () => isBici ? { backgroundColor: 'oklch(85.2% 0.199 91.936)', color: '#fff' } : {};

  const isCommercialOption = (opt: any) => {
    const code = opt.codigo.toUpperCase();
    const text = opt.texto.toUpperCase();
    return code.includes('COMERCIAL') || code.includes('RC') || text.includes('COMERCIAL') || text.includes('RC');
  };

  // Keep bicycle selected value in sync with the useType toggle
  useEffect(() => {
    if (isBici && questions.length > 0) {
      const q = questions[0];
      if (q && q.opciones) {
        const sorted = [...q.opciones].sort((a, b) => {
          const valA = parseInt(a.texto.replace(/[^0-9]/g, ''), 10) || 0;
          const valB = parseInt(b.texto.replace(/[^0-9]/g, ''), 10) || 0;
          return valA - valB;
        }).filter(opt => {
          const code = opt.codigo;
          if (["BICICLETA_ROBO__FREESTYLE_VALORa", "BICICLETA_ROBO__FREESTYLE_VALORh", "BICICLETA_ROBO__FREESTYLE_VALORb", "BICICLETA_ROBO__FREESTYLE_VALORI", "675c"].includes(code)) {
            return false;
          }
          const isComm = isCommercialOption(opt);
          return useType === 'comercial' ? isComm : !isComm;
        });

        if (sorted.length > 0) {
          const currentVal = answers[q.codigo] ? parseInt(q.opciones.find(o => o.codigo === answers[q.codigo])?.texto.replace(/[^0-9]/g, '') || '0', 10) : 250000;
          
          let closest = sorted[0];
          let minDiff = Math.abs(parseInt(closest.texto.replace(/[^0-9]/g, ''), 10) - currentVal);
          
          sorted.forEach(opt => {
            const val = parseInt(opt.texto.replace(/[^0-9]/g, ''), 10);
            const diff = Math.abs(val - currentVal);
            if (diff < minDiff) {
              minDiff = diff;
              closest = opt;
            }
          });

          setAnswers(prev => ({ ...prev, [q.codigo]: closest.codigo }));
        }
      }
    }
  }, [useType, questions, type]);

  const [personalData, setPersonalData] = useState({
    nombre: '', apellido: '', email: '', 
    tipoDocumento: 'DNI', dni: '', nacionalidad: 'ARG',
    codArea: '', telefono: '',
    fechaNacimientoDia: '', fechaNacimientoMes: '', fechaNacimientoAno: ''
  });

  const [addressData, setAddressData] = useState({
    calle: '', numero: '', piso: '', dpto: '', localidad: '', codigoPostal: '',
    tipoVivienda: 'tipooo1', // tipooo1 = Casa, tipooo2 = Depto (Hogar)
    muros: 'matconst1', // matconst1 = Ladrillo/Hormigon (Hogar)
    caracter: 'VIVIENDA_COMBINADOFAMILIAR_CARACTER1', // 1=Propietario, 2=Inquilino (Hogar)
    marca: '', // Monopatin / Bici / Notebook
    modelo: '', // Monopatin / Notebook
    serie: '', // Monopatin / Notebook
    anio: '2025', // Monopatin
    tipoBici: 'MOUNTAIN', // Bici
    rodado: 'rodado8', // Bici
    numeroCuadro: '', // Bici
    tieneFactura: 'SI' // Bici
  });

  // Photo Inspection Upload State
  const [uploadedPhotos, setUploadedPhotos] = useState<Record<string, { file: File; preview: string; progress: number }>>({});

  const [consultaId, setConsultaId] = useState<string | null>(null);

  const steps = [
    { id: 1, title: config.initialFormTitle, desc: 'Riesgo' },
    { id: 2, title: 'Planes', desc: 'Coberturas' },
    { id: 3, title: 'Datos', desc: 'Identidad' },
    { id: 4, title: 'Ubicación', desc: 'Propiedad' },
    ...(config.hasPhotosStep ? [{ id: 5, title: 'Fotos', desc: 'Inspección' }] : []),
    { id: config.hasPhotosStep ? 6 : 5, title: 'Pago', desc: 'Financiero' },
  ];

  useEffect(() => {
    fetchInitialForm();
  }, [type]);

  const fetchInitialForm = async () => {
    try {
      setLoading(true);
      setError(null);
      setAnswers({});
      setPlans([]);
      setSelectedPlanCode(null);
      setUploadedPhotos({});
      setCurrentStep(1);

      const res = await hogarApi.get(`/insurance/home/objects/${config.objectCode}/indicios/${config.indicioCode}/form`);
      const questionsData = res.data.preguntas || [];
      setQuestions(questionsData);

      // Pre-select the lowest sorted numeric option for each question so state is initialized
      const initialAnswers: Record<string, string> = {};
      questionsData.forEach((q: Pregunta) => {
        if (q.opciones && q.opciones.length > 0) {
          const sorted = [...q.opciones].sort((a, b) => {
            const valA = parseInt(a.texto.replace(/[^0-9]/g, ''), 10) || 0;
            const valB = parseInt(b.texto.replace(/[^0-9]/g, ''), 10) || 0;
            return valA - valB;
          });
          initialAnswers[q.codigo] = sorted[0].codigo;
        }
      });
      setAnswers(initialAnswers);
    } catch (err: any) {
      console.error('[GenericCotizador] Error loading initial form:', err);
      setError("Error al cargar el formulario inicial. Verificá tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  const handlePackSubmit = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await hogarApi.post(`/insurance/home/objects/${config.objectCode}/indicios/${config.indicioCode}/form/submit`, { answers });
      const cId = res.data?.consultaId;
      if (!cId) throw new Error("No se recibió consultaId");
      
      setConsultaId(cId);
      const plansRes = await hogarApi.get(`/insurance/home/consultas/${cId}/planes`);
      setPlans(plansRes.data);
      if (plansRes.data.length > 0) setSelectedPlanCode(plansRes.data[0].codigo);
      setCurrentStep(2);
    } catch (err: any) {
        console.error('Pack Submit Error:', err.response?.data || err.message);
        let errMsg = "Ocurrió un error al obtener las cotizaciones. Por favor, intentá nuevamente.";
        if (err.response?.data?.details?.errores && Array.isArray(err.response.data.details.errores)) {
          const msgs = err.response.data.details.errores.map((e: any) => e.mensaje);
          errMsg = "Verificá los siguientes datos: " + msgs.join(" | ");
        } else if (err.response?.data?.message) {
          errMsg = err.response.data.message;
        }
        setError(errMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handles simulated premium photo upload
  const handlePhotoChange = (key: string, file: File) => {
    if (!file) return;
    
    const previewUrl = URL.createObjectURL(file);
    setUploadedPhotos(prev => ({
      ...prev,
      [key]: { file, preview: previewUrl, progress: 0 }
    }));

    // Simulate upload progress bar (0% -> 100%)
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setUploadedPhotos(prev => {
        if (!prev[key]) return prev;
        return {
          ...prev,
          [key]: { ...prev[key], progress: Math.min(currentProgress, 100) }
        };
      });
      if (currentProgress >= 100) {
        clearInterval(interval);
      }
    }, 150);
  };

  const removePhoto = (key: string) => {
    setUploadedPhotos(prev => {
      const copy = { ...prev };
      if (copy[key]) {
        URL.revokeObjectURL(copy[key].preview);
        delete copy[key];
      }
      return copy;
    });
  };

  const handleStep4Submit = () => {
    if (!addressData.calle || !addressData.numero || !addressData.codigoPostal) {
      setError("Completá los datos obligatorios de domicilio.");
      return;
    }
    if (config.objectCode === 'MONOPATIN' && (!addressData.marca || !addressData.modelo || !addressData.serie)) {
      setError("Completá marca, modelo y número de serie del monopatín.");
      return;
    }
    if (config.objectCode === 'BICICLETA' && (!addressData.marca || !addressData.numeroCuadro)) {
      setError("Completá marca y número de cuadro de la bicicleta.");
      return;
    }
    if (config.objectCode === 'NOTEBOOK' && (!addressData.marca || !addressData.modelo || !addressData.serie)) {
      setError("Completá marca, modelo y número de serie de la notebook.");
      return;
    }
    setError(null);
    setCurrentStep(5);
  };

  const handlePhotosSubmit = () => {
    const requiredKeys = (config.photoRequirements?.filter(req =>
      !(req.key === 'foto_factura' && addressData.tieneFactura === 'NO')
    ) ?? []).map(req => req.key);
    const allUploaded = requiredKeys.every(k => uploadedPhotos[k] && uploadedPhotos[k].progress === 100);
    
    if (!allUploaded) {
      setError("Tenés que cargar todas las fotos requeridas de inspección para continuar.");
      return;
    }
    setError(null);
    setCurrentStep(6);
  };

  const handleFinalEmissionSubmit = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const planObj = plans.find(p => p.codigo === selectedPlanCode);
      const isCard = paymentData.metodo === 'TARJETA_CREDITO';
      const selectedMedio = isCard ? 'TARJETA_CREDITO' : 'DEBITO_AUTOMATICO';
      
      // 1. Create Order in backend (which calls RUS and registers initial db row)
      const orderRes = await hogarApi.post('/insurance/home/orders/create', {
        idConsulta: consultaId,
        plan: planObj,
        formaPago: {
            ...planObj?.formasPagos?.[0],
            medioPago: selectedMedio
        },
        personalData: {
          ...personalData,
          numeroDocumento: personalData.dni,
        },
        objectCode: config.objectCode
      });

      const ordenVentaId = orderRes.data.rusOrder?.ordenVentaID || orderRes.data.rusOrder?.ordenVentaId;
      if (!ordenVentaId) throw new Error("No se pudo obtener el ID de la orden de venta.");

      // 2. Submit Risk details & underwrite questions
      const answersArray: any[] = [];
      if (config.objectCode === 'VIVIENDA') {
        answersArray.push({ codigoPregunta: 'VIVIENDA_COMBINADOFAMILIAR_CARACTER', valores: [addressData.caracter] });
      } else {
        // For BICICLETA, NOTEBOOK, MONOPATIN: pass the step-1 form answers (suma asegurada)
        // so the backend can filter against the real emission form questions
        Object.entries(answers).forEach(([codigoPregunta, valor]) => {
          answersArray.push({ codigoPregunta, valores: [valor] });
        });

        const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (e) => {
            const img = new Image();
            img.src = e.target?.result as string;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 1200;
              const MAX_HEIGHT = 1200;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.6)); // Compress to 60% JPEG
            };
            img.onerror = (err) => reject(err);
          };
          reader.onerror = error => reject(error);
        });

        if (config.objectCode === 'BICICLETA') {
            answersArray.push({ codigoPregunta: 'MARCA', valores: [addressData.marca] });
            answersArray.push({ codigoPregunta: 'TIPO_BICI', valores: [addressData.tipoBici] });
            answersArray.push({ codigoPregunta: 'NCUADRO', valores: [addressData.rodado] });
            answersArray.push({ codigoPregunta: 'CUADRO', valores: [Number(addressData.numeroCuadro) || 0] });
            
            if (addressData.tieneFactura === 'SI') {
                answersArray.push({ codigoPregunta: 'FACTURA_PREGUNTA', valores: ['FACTURA_SI'] });
                if (uploadedPhotos['foto_factura']?.file) {
                    const b64 = await fileToBase64(uploadedPhotos['foto_factura'].file);
                    answersArray.push({ codigoPregunta: 'FACTURA_ADJUNTAR', valores: [b64] });
                }
            } else {
                answersArray.push({ codigoPregunta: 'FACTURA_PREGUNTA', valores: ['FACTURA_NO'] });
            }

            if (uploadedPhotos['foto_bici_entera']?.file) {
                const b64 = await fileToBase64(uploadedPhotos['foto_bici_entera'].file);
                answersArray.push({ codigoPregunta: 'BICICLETA_FOTO_LATERAL', valores: [b64] });
            }
            if (uploadedPhotos['foto_cuadro']?.file) {
                const b64 = await fileToBase64(uploadedPhotos['foto_cuadro'].file);
                answersArray.push({ codigoPregunta: 'BICICLETA_FOTO_CUADRO', valores: [b64] });
            }
        } else if (config.objectCode === 'NOTEBOOK') {
            answersArray.push({ codigoPregunta: 'MARCA', valores: [addressData.marca] });
            answersArray.push({ codigoPregunta: 'MODELO', valores: [addressData.modelo] });
            answersArray.push({ codigoPregunta: 'SERIE', valores: [addressData.serie] });
            
            if (uploadedPhotos['foto_pantalla_encendida']?.file) {
                const b64 = await fileToBase64(uploadedPhotos['foto_pantalla_encendida'].file);
                answersArray.push({ codigoPregunta: 'EQUIPO_ELECTRONICO_FOTO', valores: [b64] });
            }
            if (uploadedPhotos['foto_serie']?.file) {
                const b64 = await fileToBase64(uploadedPhotos['foto_serie'].file);
                answersArray.push({ codigoPregunta: 'EQUIPO_ELECTRONICO_FOTOdorso', valores: [b64] });
            }
        } else if (config.objectCode === 'MONOPATIN') {
            answersArray.push({ codigoPregunta: 'MARCA', valores: [addressData.marca] });
            answersArray.push({ codigoPregunta: 'MODELO', valores: [addressData.modelo] });
            answersArray.push({ codigoPregunta: 'SERIE1', valores: [addressData.serie] });
            answersArray.push({ codigoPregunta: 'MONOPATIN_AÑO', valores: [Number(addressData.anio) || 0] });
        }
      }

      await hogarApi.post(`/insurance/home/orders/${ordenVentaId}/form/submit`, {
        personalData: {
            ...personalData,
            numeroDocumento: personalData.dni,
            telefono_codigo_area: personalData.codArea,
            telefono_numero: personalData.telefono.replace(/\D/g, ''),
            fechaNacimientoAno: personalData.fechaNacimientoAno,
            fechaNacimientoMes: personalData.fechaNacimientoMes,
            fechaNacimientoDia: personalData.fechaNacimientoDia
        },
        addressData: addressData,
        answers: answersArray,
        objectCode: config.objectCode
      });

      // 3. Submit Payment Info (sensitive fields encrypted with AES-256-CBC)
      const paymentPayload: any = {
          medioPago: isCard ? 'TARJETA_CREDITO' : 'DEBITO_AUTOMATICO'
      };

      if (isCard) {
          const rawNum = paymentData.numero.replace(/\s/g, '');
          paymentPayload.marcaTarjeta = paymentData.marca;
          paymentPayload.numeroTarjeta = secureEncrypt(rawNum); // AES-256-CBC encrypted
          paymentPayload.vencimiento = "12/29";
          paymentPayload.titular = `${personalData.nombre} ${personalData.apellido}`;
      } else {
          const rawCbu = paymentData.cbu.replace(/\s/g, '');
          paymentPayload.CBU = secureEncrypt(rawCbu); // AES-256-CBC encrypted
      }
      
      await hogarApi.post(`/insurance/home/orders/${ordenVentaId}/infopago`, {
        paymentInfo: paymentPayload,
        _enc: true // Flag to tell backend to decrypt payment data
      });

      // 4. Confirm Order (Triggers emission)
      await hogarApi.post(`/insurance/home/orders/${ordenVentaId}/confirm`);

      // Final step transition (6 for Hogar/Mono, 7 for Bici/Notebook)
      setCurrentStep(config.hasPhotosStep ? 7 : 6); 
    } catch (err: any) {
        console.error('Emission Error:', err.response?.data || err.message);
        let errMsg = "Ocurrió un error al procesar la emisión. Verificá los datos ingresados e intentalo nuevamente.";
        
        const data = err.response?.data;
        if (data?.details?.errores && Array.isArray(data.details.errores)) {
          const msgs = data.details.errores.map((e: any) => e.mensaje);
          errMsg = "Atención: " + msgs.join(" | ");
        } else if (data?.error && typeof data.error === 'string') {
          errMsg = data.error;
        } else if (data?.message) {
          errMsg = data.message;
        }

        // Traducimos errores comunes a lenguaje de usuario
        const lowerErr = errMsg.toLowerCase();
        if (lowerErr.includes('tarjeta') || lowerErr.includes('pago') || lowerErr.includes('rechazad')) {
          errMsg = "El pago no pudo procesarse. Verificá los números de la tarjeta, fondos disponibles o probá con otra.";
        } else if (lowerErr.includes('documento') || lowerErr.includes('identidad')) {
          errMsg = "El DNI ingresado es inválido o no coincide con los registros.";
        } else if (lowerErr.includes('domicilio') || lowerErr.includes('dirección') || lowerErr.includes('código postal') || lowerErr.includes('cp')) {
          errMsg = "El código postal o la dirección ingresada no son válidos para la cobertura.";
        } else if (lowerErr.includes('opciones inválidas') || lowerErr.includes('no cumple las cotas')) {
          errMsg = "Revisá los datos de tu bien (rodado, modelo, cuadro). Ingresaste un valor no admitido o fuera de rango.";
        }

        setError(errMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const [paymentData, setPaymentData] = useState({
    metodo: 'TARJETA_CREDITO',
    marca: 'VISA',
    numero: '',
    vencimiento: '',
    titular: '',
    cbu: ''
  });

  const formatMoney = (monto: number) => `$ ${monto.toLocaleString('es-AR')}`;

  const isSuccessStep = currentStep === (config.hasPhotosStep ? 7 : 6);

  return (
    <Layout>
      <SEOHelmet 
        title={config.title} 
        description={config.description}
      />
      
      <div className="relative pt-28 md:pt-36 pb-12 px-4 bg-bg-secondary transition-colors duration-500 overflow-hidden">
        {/* Dynamic Glow Sphere according to selected product color theme */}
        <div style={isBici ? { backgroundColor: 'oklch(85.2% 0.199 91.936)', opacity: 0.05 } : {}} className={isBici ? "absolute top-0 right-0 w-[500px] h-[500px] blur-[150px] rounded-full -z-10" : `absolute top-0 right-0 w-[500px] h-[500px] blur-[150px] rounded-full -z-10 bg-${config.themeColor}-500/5`} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-yuju-blue/5 blur-[120px] rounded-full -z-10" />

        <div className="max-w-4xl mx-auto space-y-8 relative z-20">
          
          {/* Premium Header Section */}
          <AnimatePresence>
            {!isSuccessStep && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-6 mb-16"
              >
                <div style={isBici ? { borderColor: 'oklch(85.2% 0.199 91.936 / 0.2)', backgroundColor: 'oklch(85.2% 0.199 91.936 / 0.1)' } : {}} className={`px-4 py-2 backdrop-blur-md border ${isBici ? '' : config.themeBorder} ${isBici ? '' : config.themeBg} rounded-full inline-flex items-center gap-3 shadow-xl`}>
                  <div className="relative flex h-2 w-2">
                    <span style={isBici ? { backgroundColor: 'oklch(85.2% 0.199 91.936)' } : {}} className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isBici ? '' : `bg-${config.themeColor}-400`}`}></span>
                    <span style={isBici ? { backgroundColor: 'oklch(85.2% 0.199 91.936)' } : {}} className={`relative inline-flex rounded-full h-2 w-2 ${isBici ? '' : `bg-${config.themeColor}-500`}`}></span>
                  </div>
                  <span style={getThemeText()} className={`${isBici ? '' : config.themeText} text-[11px] font-bold uppercase tracking-wider`}>{config.subtitle}</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black font-accent text-text-primary tracking-tighter leading-none">
                  {config.title}
                </h1>
                
                <p className="text-text-secondary font-medium text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                  {config.description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Progress Stepper */}
          {!isSuccessStep && (
            <div className="flex justify-between items-center px-4 md:px-8 relative mb-12">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border-primary -translate-y-1/2 z-0 mx-8 hidden md:block" />
              
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center gap-2 md:gap-3 relative z-10 min-w-[3.2rem] md:min-w-[5rem] flex-1">
                  <motion.div 
                    initial={false}
                    animate={{ 
                      backgroundColor: currentStep >= step.id ? config.themeColorHex : 'var(--bg-primary)',
                      boxShadow: currentStep === step.id ? (isBici ? '0 0 20px oklch(85.2% 0.199 91.936 / 0.4)' : `0 0 20px rgba(${config.themeColor === 'emerald' ? '16, 185, 129' : config.themeColor === 'cyan' ? '6, 182, 212' : config.themeColor === 'blue' ? '59, 130, 246' : '99, 102, 241'}, 0.4)`) : 'none',
                      scale: currentStep === step.id ? 1.05 : 1,
                      borderColor: currentStep >= step.id ? config.themeColorHex : 'var(--border-primary)'
                    }}
                    className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center border-2 transition-all duration-500 z-10 relative"
                  >
                    <span className={`text-xs md:text-base font-black font-accent flex items-center justify-center ${currentStep >= step.id ? 'text-white' : 'text-text-secondary opacity-40'}`}>
                      {currentStep > step.id ? <Check size={14} className="md:w-5 md:h-5" strokeWidth={4} /> : step.id}
                    </span>
                  </motion.div>
                  <div className="text-center hidden md:block">
                    <p style={currentStep >= step.id ? getThemeText() : {}} className={`text-[9px] font-black tracking-[0.2em] transition-colors duration-500 whitespace-nowrap ${currentStep >= step.id ? (isBici ? 'opacity-100' : config.themeText + ' opacity-100') : 'text-text-secondary opacity-30'}`}>
                      {step.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <GlassCard className="p-6 md:p-10 border-border-primary bg-bg-primary/70 rounded-[28px] shadow-2xl relative !overflow-visible backdrop-blur-3xl">
            {loading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3">
                    <Loader2 className={`animate-spin ${config.themeText}`} size={40} />
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest animate-pulse">Iniciando Cotizador...</p>
                </div>
            ) : (
            <div className="relative">
              {/* Horizontal Back Navigation Bar */}
              {currentStep > 1 && !isSuccessStep && (
                <div className="-mt-6 md:-mt-10 -mx-6 md:-mx-10 px-6 md:px-10 pt-4 md:pt-5 pb-5 mb-4 border-b border-border-primary/40">
                  <button onClick={() => setCurrentStep(prev => prev - 1)} className="flex items-center gap-2.5 group cursor-pointer bg-transparent border-none">
                    <div className={`p-2 ${config.themeBg} group-hover:bg-opacity-20 ${config.themeText} rounded-xl transition-all`}>
                      <ArrowLeft size={20} />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${config.themeText}`}>Volver</span>
                  </button>
                </div>
              )}
            <AnimatePresence mode="wait">
              
              {/* STEP 1: PREGUNTAS INICIALES (RIESGO) */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="space-y-3">
                    <div style={getThemeText()} className="flex items-center gap-3">
                      <div style={getThemeBg()} className="w-10 h-10 rounded-xl flex items-center justify-center">
                        <MainIcon size={24} />
                      </div>
                      <h2 className="text-2xl font-black font-accent tracking-tighter">{config.initialFormTitle}</h2>
                    </div>
                    <p className="text-sm text-text-secondary font-medium">{config.initialFormDesc}</p>
                  </div>

                  {/* Segmented Control for Bicycle Use Type */}
                  {isBici && (
                    <div className="flex bg-bg-secondary border border-border-primary/60 p-1.5 rounded-[20px] max-w-md mx-auto mb-8 relative z-30 shadow-sm">
                      <button
                        onClick={() => setUseType('particular')}
                        className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer bg-transparent border-none
                          ${useType === 'particular' 
                            ? 'text-white' 
                            : 'text-text-secondary opacity-60 hover:opacity-100'}`}
                        style={useType === 'particular' ? { backgroundColor: 'oklch(85.2% 0.199 91.936)' } : {}}
                      >
                        <Bike size={16} />
                        Uso Particular
                      </button>
                      <button
                        onClick={() => setUseType('comercial')}
                        className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer bg-transparent border-none
                          ${useType === 'comercial' 
                            ? 'text-white' 
                            : 'text-text-secondary opacity-60 hover:opacity-100'}`}
                        style={useType === 'comercial' ? { backgroundColor: 'oklch(85.2% 0.199 91.936)' } : {}}
                      >
                        <Star size={16} className={useType === 'comercial' ? 'fill-white text-white' : ''} />
                        Uso Comercial
                      </button>
                    </div>
                  )}

                  {questions.map((q) => {
                    const isMonetary = q.opciones?.some(opt => opt.texto.includes('$') || parseInt(opt.texto.replace(/[^0-9]/g, ''), 10) > 0);

                    return (
                      <div key={q.codigo} className="space-y-4">
                        <label className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] pl-2 block">
                          {q.texto}
                        </label>

                        {isMonetary && q.opciones && q.opciones.length > 0 ? (
                          (() => {
                            const rawSortedOpciones = [...q.opciones].sort((a, b) => {
                              const valA = parseInt(a.texto.replace(/[^0-9]/g, ''), 10) || 0;
                              const valB = parseInt(b.texto.replace(/[^0-9]/g, ''), 10) || 0;
                              return valA - valB;
                            });

                            // Filter out known 0-plan codes and filter by useType if bicycle
                            const sortedOpciones = rawSortedOpciones.filter(opt => {
                              if (isBici) {
                                const code = opt.codigo;
                                if (["BICICLETA_ROBO__FREESTSTE_VALORa", "BICICLETA_ROBO__FREESTYLE_VALORa", "BICICLETA_ROBO__FREESTYLE_VALORh", "BICICLETA_ROBO__FREESTYLE_VALORb", "BICICLETA_ROBO__FREESTYLE_VALORI", "675c"].includes(code)) {
                                  return false;
                                }
                                const isComm = isCommercialOption(opt);
                                return useType === 'comercial' ? isComm : !isComm;
                              }
                              return true;
                            });

                            const activeCode = answers[q.codigo];
                            let activeIndex = sortedOpciones.findIndex(opt => opt.codigo === activeCode);
                            if (activeIndex === -1) activeIndex = 0;

                            const activeOption = sortedOpciones[activeIndex] || sortedOpciones[0];
                            const hasRC = activeOption?.texto.toUpperCase().includes('RC') || activeOption?.codigo.toUpperCase().includes('COMERCIAL') || activeOption?.codigo.toLowerCase().includes('rc');
                            const isComercial = activeOption?.codigo.toUpperCase().includes('COMERCIAL') || activeOption?.texto.toUpperCase().includes('COMERCIAL');

                            return (
                              <div className="space-y-8 p-6 md:p-8 bg-bg-secondary/40 border border-border-primary/80 rounded-[24px] relative overflow-hidden backdrop-blur-md">
                                {/* Ambient backglow themed dynamically */}
                                <div style={isBici ? { backgroundColor: 'oklch(85.2% 0.199 91.936)', opacity: 0.05 } : {}} className={isBici ? "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] -z-10" : `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] -z-10 ${config.themeGlow}`} />

                                <div className="text-center space-y-3">
                                  <span className="text-[9px] font-black text-text-secondary uppercase tracking-[0.25em]">Suma Asegurada Seleccionada</span>
                                  <h3 style={getThemeText()} className="text-4xl md:text-5xl font-black font-accent tracking-tighter drop-shadow-sm">
                                    {activeOption?.texto.replace('RC', '').replace('COMERCIAL', '').trim()}
                                  </h3>
                                  <div className="flex flex-wrap justify-center gap-2">
                                    {hasRC && (
                                      <motion.div 
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-full border ${isBici ? '' : config.themeBorder} ${isBici ? '' : config.themeBg} ${isBici ? '' : config.themeText}`}
                                        style={isBici ? { borderColor: 'oklch(85.2% 0.199 91.936 / 0.2)', backgroundColor: 'oklch(85.2% 0.199 91.936 / 0.1)', color: 'oklch(85.2% 0.199 91.936)' } : {}}
                                      >
                                        <ShieldCheck size={12} strokeWidth={3} />
                                        Con Responsabilidad Civil
                                      </motion.div>
                                    )}
                                    {isComercial && (
                                      <motion.div 
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-500"
                                        style={isBici ? { borderColor: 'oklch(85.2% 0.199 91.936 / 0.3)', backgroundColor: 'oklch(85.2% 0.199 91.936 / 0.1)', color: 'oklch(85.2% 0.199 91.936)' } : {}}
                                      >
                                        <Star size={12} strokeWidth={3} className={isBici ? "fill-current text-current" : "fill-amber-500"} />
                                        Uso Comercial
                                      </motion.div>
                                    )}
                                  </div>
                                </div>

                                {/* Custom Styled Range Input Slider */}
                                <div className="space-y-4 px-2 md:px-8 relative">
                                  <input 
                                    type="range" 
                                    min={0} 
                                    max={sortedOpciones.length - 1} 
                                    value={activeIndex} 
                                    onChange={(e) => {
                                      const idx = parseInt(e.target.value, 10);
                                      const selectedOpt = sortedOpciones[idx];
                                      if (selectedOpt) {
                                        setAnswers({ [q.codigo]: selectedOpt.codigo });
                                      }
                                    }}
                                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-border-primary outline-none transition-all"
                                    style={{
                                      background: `linear-gradient(to right, ${config.themeColorHex} 0%, ${config.themeColorHex} ${(activeIndex / (sortedOpciones.length - 1)) * 100}%, var(--border-primary) ${(activeIndex / (sortedOpciones.length - 1)) * 100}%, var(--border-primary) 100%)`
                                    }}
                                  />
                                  
                                  <div className="flex justify-between items-center text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em] px-1">
                                    <span>Min: {sortedOpciones[0]?.texto.replace('RC', '').replace('COMERCIAL', '').trim()}</span>
                                    <span>Max: {sortedOpciones[sortedOpciones.length - 1]?.texto.replace('RC', '').replace('COMERCIAL', '').trim()}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {q.opciones?.map((opt) => (
                              <button
                                key={opt.codigo}
                                onClick={() => setAnswers({ [q.codigo]: opt.codigo })}
                                className={`p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 text-left group cursor-pointer bg-transparent
                                  ${answers[q.codigo] === opt.codigo 
                                    ? `${config.themeBg} shadow-md` 
                                    : 'border-border-primary bg-bg-secondary hover:bg-bg-secondary/70 hover:shadow-md'}`}
                                style={{
                                  borderColor: answers[q.codigo] === opt.codigo ? config.themeColorHex : 'var(--border-primary)'
                                }}
                              >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors flex-shrink-0`}
                                  style={{
                                    backgroundColor: answers[q.codigo] === opt.codigo ? config.themeColorHex : 'var(--bg-primary)',
                                    color: answers[q.codigo] === opt.codigo ? '#fff' : 'var(--text-secondary)'
                                  }}
                                >
                                  <MainIcon size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-text-primary text-xs">{opt.texto}</h3>
                                    {q.significado && <p className="text-[9px] text-text-secondary font-medium mt-1 leading-tight">{q.significado}</p>}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="flex justify-end pt-6">
                    <Button 
                        disabled={!Object.keys(answers).length || isProcessing}
                        onClick={handlePackSubmit} 
                        className={`${isBici ? '' : config.themeBtn} px-10 h-12 rounded-xl text-sm border-none font-black shadow-lg text-white`}
                        style={getThemeBtn()}
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
                        className={`group relative rounded-3xl border transition-all duration-300 overflow-hidden cursor-pointer shadow-sm
                          ${selectedPlanCode === plan.codigo ? (isBici ? '' : config.themeBg) + ' shadow-lg' : 'bg-bg-secondary/30 hover:bg-bg-secondary/60 hover:shadow-md'}`}
                        style={{
                          borderColor: selectedPlanCode === plan.codigo ? config.themeColorHex : 'var(--border-primary)',
                          backgroundColor: (selectedPlanCode === plan.codigo && isBici) ? 'oklch(85.2% 0.199 91.936 / 0.1)' : undefined
                        }}
                        onClick={() => setSelectedPlanCode(plan.codigo)}
                      >
                         <div className="p-3 sm:p-5 flex flex-col md:flex-row md:items-start justify-between gap-3 sm:gap-4">
                             <div className="space-y-1 sm:space-y-2 flex-1">
                                 <div className="flex items-center gap-2">
                                     {selectedPlanCode === plan.codigo && <CheckCircle2 size={16} className={`${isBici ? '' : config.themeText} flex-shrink-0 sm:size-[18px]`} style={getThemeText()} />}
                                     <h3 className="text-sm sm:text-lg font-black font-accent tracking-tight line-clamp-1">{plan.descripcion}</h3>
                                     {plan.codigo.includes('GOLD') && <Star size={12} className="text-amber-400 fill-amber-400 sm:size-[14px]" />}
                                 </div>
                                 <p className="text-[10px] sm:text-xs text-text-secondary leading-relaxed max-w-sm line-clamp-2 sm:line-clamp-none">{plan.informacionAdicional}</p>
                             </div>
                             
                             <div className="flex items-center justify-between md:justify-end gap-4 flex-shrink-0 border-t md:border-t-0 border-border-primary/20 pt-3 md:pt-0">
                                 <div className="text-left md:text-right">
                                     <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-text-secondary opacity-60 mb-0.5 sm:mb-1">Costo Mensual</p>
                                     <h4 className={`text-xl sm:text-3xl font-black ${isBici ? '' : config.themeText}`} style={getThemeText()}>{formatMoney(plan.formasPagos?.[0]?.precioCuota || 0)}</h4>
                                 </div>
                                 <button 
                                     onClick={(e) => { e.stopPropagation(); setExpandedPlan(expandedPlan === plan.codigo ? null : plan.codigo); }}
                                     className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-bg-primary border border-border-primary flex items-center justify-center transition-all shadow-sm flex-shrink-0 cursor-pointer"
                                     style={expandedPlan === plan.codigo && isBici ? { backgroundColor: 'oklch(85.2% 0.199 91.936)', color: '#000' } : {}}
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
                                    className="overflow-hidden bg-bg-primary/50 border-t border-border-primary/10"
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
                                                        <span className={`text-xs font-black ${config.themeText} flex-shrink-0 whitespace-nowrap pt-0.5`}>
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
                        className={`w-full h-14 rounded-xl ${config.themeBtn} font-black text-base shadow-xl text-white group border-none cursor-pointer`}
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
                  className="max-w-3xl mx-auto space-y-8"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl ${config.themeBg} ${config.themeText} flex items-center justify-center`}>
                          <User size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black font-accent tracking-tighter">Tus Datos</h2>
                        <p className="text-xs text-text-secondary font-medium">Necesitamos identificarte para generar la póliza oficial.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Nombre</label>
                          <input type="text" className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold outline-none" value={personalData.nombre} onChange={(e) => setPersonalData({...personalData, nombre: e.target.value})}/>
                      </div>
                      <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Apellido</label>
                          <input type="text" className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold outline-none" value={personalData.apellido} onChange={(e) => setPersonalData({...personalData, apellido: e.target.value})}/>
                      </div>
                      <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Email</label>
                          <input type="email" className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold outline-none" value={personalData.email} onChange={(e) => setPersonalData({...personalData, email: e.target.value})}/>
                      </div>
                      <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1 text-center w-full">Fecha de nacimiento (dd/mm/aaaa)</label>
                          <div className="grid grid-cols-3 gap-2">
                              <input type="text" placeholder="DD" maxLength={2} className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-2 text-center text-sm font-semibold outline-none" value={personalData.fechaNacimientoDia} onChange={(e) => setPersonalData({...personalData, fechaNacimientoDia: e.target.value.replace(/\D/g, '')})} />
                              <input type="text" placeholder="MM" maxLength={2} className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-2 text-center text-sm font-semibold outline-none" value={personalData.fechaNacimientoMes} onChange={(e) => setPersonalData({...personalData, fechaNacimientoMes: e.target.value.replace(/\D/g, '')})} />
                              <input type="text" placeholder="AAAA" maxLength={4} className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-1 text-center text-sm font-semibold outline-none" value={personalData.fechaNacimientoAno} onChange={(e) => setPersonalData({...personalData, fechaNacimientoAno: e.target.value.replace(/\D/g, '')})} />
                          </div>
                      </div>
                      <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Tipo Doc.</label>
                          <select className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold outline-none" value={personalData.tipoDocumento} onChange={(e) => setPersonalData({...personalData, tipoDocumento: e.target.value})}>
                              <option value="DNI">DNI</option>
                              <option value="CUIL">CUIL</option>
                          </select>
                      </div>
                      <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Nro. Documento</label>
                          <input type="text" className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold outline-none" value={personalData.dni} onChange={(e) => setPersonalData({...personalData, dni: e.target.value.replace(/\D/g, '')})}/>
                      </div>
                      <div className="space-y-1.5 col-span-full">
                          <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Teléfono Móvil</label>
                          <div className="flex gap-3">
                              <div className="flex w-1/3 bg-bg-secondary border border-border-primary rounded-xl overflow-hidden h-12">
                                  <span className="h-full flex items-center justify-center bg-bg-primary/50 px-3 text-text-secondary text-xs font-bold border-r border-border-primary">0</span>
                                  <input type="text" placeholder="Cód. área" maxLength={4} className="w-full bg-transparent px-3 text-sm font-semibold outline-none border-none" value={personalData.codArea} onChange={(e) => setPersonalData({...personalData, codArea: e.target.value.replace(/\D/g, '')})} />
                              </div>
                              <div className="flex w-2/3 bg-bg-secondary border border-border-primary rounded-xl overflow-hidden h-12">
                                  <span className="h-full flex items-center justify-center bg-bg-primary/50 px-3 text-text-secondary text-xs font-bold border-r border-border-primary">15</span>
                                  <input type="text" placeholder="Número" maxLength={8} className="w-full bg-transparent px-3 text-sm font-semibold outline-none border-none" value={personalData.telefono} onChange={(e) => setPersonalData({...personalData, telefono: e.target.value.replace(/\D/g, '')})} />
                              </div>
                          </div>
                      </div>
                  </div>

                  {error && <p className="text-xs text-red-500 font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}

                  <div className="pt-4">
                     <Button 
                       onClick={() => {
                          if (!personalData.nombre || !personalData.apellido || !personalData.dni || !personalData.email) {
                             setError("Completá todos los campos de identidad obligatorios.");
                             return;
                          }
                          setError(null);
                          setCurrentStep(4);
                       }}
                       className={`w-full h-14 rounded-xl ${config.themeBtn} font-black text-sm uppercase tracking-widest border-none text-white cursor-pointer`}
                     >
                       Confirmar Identidad
                     </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: UBICACIÓN Y DETALLES DEL BIEN */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="max-w-3xl mx-auto space-y-8"
                >
                  <div className="space-y-2 text-center">
                    <div className={`w-12 h-12 rounded-xl ${config.themeBg} ${config.themeText} flex items-center justify-center mx-auto mb-2`}>
                        <MapPin size={24} />
                    </div>
                    <h2 className="text-2xl font-black font-accent tracking-tighter">{config.addressFieldsTitle}</h2>
                    <p className="text-xs text-text-secondary font-medium">{config.addressFieldsDesc}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Domicilio Base */}
                      <div className="md:col-span-2 space-y-1.5">
                          <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Calle</label>
                          <input type="text" className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold outline-none" value={addressData.calle} onChange={(e) => setAddressData({...addressData, calle: e.target.value})}/>
                      </div>
                      <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Nro</label>
                          <input type="text" className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold outline-none" value={addressData.numero} onChange={(e) => setAddressData({...addressData, numero: e.target.value})}/>
                      </div>
                      <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Localidad</label>
                          <input type="text" className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold outline-none" value={addressData.localidad} onChange={(e) => setAddressData({...addressData, localidad: e.target.value})}/>
                      </div>
                      <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Código Postal</label>
                          <input type="text" className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold outline-none" value={addressData.codigoPostal} onChange={(e) => setAddressData({...addressData, codigoPostal: e.target.value.replace(/\D/g, '')})}/>
                      </div>

                      {/* Campos Dinámicos por Tipo de Producto */}
                      {config.type === 'hogar' && (
                        <>
                          <div className="space-y-1.5">
                              <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Su vivienda es</label>
                              <select className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold outline-none" value={addressData.tipoVivienda} onChange={(e) => setAddressData({...addressData, tipoVivienda: e.target.value})}>
                                  <option value="tipooo1">Casa</option>
                                  <option value="tipooo2">Departamento</option>
                              </select>
                          </div>
                          <div className="space-y-1.5">
                              <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Muros</label>
                              <select className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold outline-none" value={addressData.muros} onChange={(e) => setAddressData({...addressData, muros: e.target.value})}>
                                  <option value="matconst1">Ladrillo / Hormigón</option>
                                  <option value="matconst2">Madera / Otros</option>
                              </select>
                          </div>
                          <div className="space-y-1.5 md:col-span-2">
                              <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Carácter</label>
                              <select className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold outline-none" value={addressData.caracter} onChange={(e) => setAddressData({...addressData, caracter: e.target.value})}>
                                  <option value="VIVIENDA_COMBINADOFAMILIAR_CARACTER1">Propietario</option>
                                  <option value="VIVIENDA_COMBINADOFAMILIAR_CARACTER2">Inquilino</option>
                              </select>
                          </div>
                        </>
                      )}

                      {config.type === 'monopatin' && (
                        <>
                          <div className="space-y-1.5">
                              <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Marca</label>
                              <input type="text" placeholder="Ej: Xiaomi, Segway" className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold outline-none" value={addressData.marca} onChange={(e) => setAddressData({...addressData, marca: e.target.value})}/>
                          </div>
                          <div className="space-y-1.5">
                              <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Modelo</label>
                              <input type="text" placeholder="Ej: Mi Electric Scooter Pro" className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold outline-none" value={addressData.modelo} onChange={(e) => setAddressData({...addressData, modelo: e.target.value})}/>
                          </div>
                          <div className="space-y-1.5">
                              <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Nro. de Serie o Chasis</label>
                              <input type="text" placeholder="Ej: SN1234567" className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold outline-none" value={addressData.serie} onChange={(e) => setAddressData({...addressData, serie: e.target.value})}/>
                          </div>
                          <div className="space-y-1.5">
                              <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Año de Fabricación</label>
                              <select className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold outline-none" value={addressData.anio} onChange={(e) => setAddressData({...addressData, anio: e.target.value})}>
                                  <option value="2026">2026</option>
                                  <option value="2025">2025</option>
                                  <option value="2024">2024</option>
                                  <option value="2023">2023</option>
                                  <option value="2022">2022</option>
                                  <option value="2021">2021</option>
                              </select>
                          </div>
                        </>
                      )}

                      {config.type === 'bicicleta' && (
                        <>
                          <div className="space-y-1.5">
                              <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Marca de la Bici</label>
                              <input type="text" placeholder="Ej: Specialized, Trek" className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold outline-none" value={addressData.marca} onChange={(e) => setAddressData({...addressData, marca: e.target.value})}/>
                          </div>
                          <div className="space-y-1.5">
                              <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Tipo de Bicicleta</label>
                              <select className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold outline-none" value={addressData.tipoBici} onChange={(e) => setAddressData({...addressData, tipoBici: e.target.value})}>
                                  <option value="MOUNTAIN">Mountain Bike</option>
                                  <option value="PASEO">Paseo / Urbana</option>
                                  <option value="Carrera">Carrera / Ruta</option>
                                  <option value="PLAYERA">Playera</option>
                                  <option value="BMX">BMX / Cross</option>
                                  <option value="PLEGABLE">Plegable</option>
                              </select>
                          </div>
                          <div className="space-y-1.5">
                              <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Rodado</label>
                              <select className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold outline-none" value={addressData.rodado} onChange={(e) => setAddressData({...addressData, rodado: e.target.value})}>
                                  <option value="rodado2">16</option>
                                  <option value="rodado3">20</option>
                                  <option value="rodado4">24</option>
                                  <option value="rodado5">26</option>
                                  <option value="rodado6">27.5</option>
                                  <option value="rodado7">28</option>
                                  <option value="rodado8">29</option>
                                  <option value="rodado9">29+</option>
                              </select>
                          </div>
                          <div className="space-y-1.5">
                              <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Número de Cuadro</label>
                              <input type="number" placeholder="Sólo números" className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold outline-none" value={addressData.numeroCuadro} onChange={(e) => setAddressData({...addressData, numeroCuadro: e.target.value})}/>
                          </div>
                          <div className="space-y-1.5 md:col-span-2">
                              <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">¿Tiene Factura de Compra?</label>
                              <select className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold outline-none" value={addressData.tieneFactura} onChange={(e) => setAddressData({...addressData, tieneFactura: e.target.value})}>
                                  <option value="SI">Sí, tengo factura/boleto de compra</option>
                                  <option value="NO">No, no poseo factura física</option>
                              </select>
                          </div>
                        </>
                      )}

                      {config.type === 'notebook' && (
                        <>
                          <div className="space-y-1.5">
                              <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Marca</label>
                              <input type="text" placeholder="Ej: Apple, Lenovo, Dell" className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold outline-none" value={addressData.marca} onChange={(e) => setAddressData({...addressData, marca: e.target.value})}/>
                          </div>
                          <div className="space-y-1.5">
                              <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Modelo</label>
                              <input type="text" placeholder="Ej: MacBook Pro M2" className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold outline-none" value={addressData.modelo} onChange={(e) => setAddressData({...addressData, modelo: e.target.value})}/>
                          </div>
                          <div className="space-y-1.5 md:col-span-2">
                              <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Número de Serie</label>
                              <input type="text" placeholder="Ej: C02YJ123456" className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold outline-none" value={addressData.serie} onChange={(e) => setAddressData({...addressData, serie: e.target.value})}/>
                          </div>
                        </>
                      )}
                  </div>

                  {error && <p className="text-xs text-red-500 font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}

                  <div className="pt-4">
                     <Button 
                       onClick={handleStep4Submit}
                       className={`w-full h-14 rounded-xl ${config.themeBtn} font-black text-sm uppercase tracking-widest border-none text-white cursor-pointer`}
                     >
                       {config.hasPhotosStep ? "Continuar a Fotos" : "Continuar al Pago"}
                     </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: CARGA DE FOTOS DE INSPECCIÓN (Bici / Notebook únicamente) */}
              {currentStep === 5 && config.hasPhotosStep && (
                <motion.div
                  key="step5-photos"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="max-w-3xl mx-auto space-y-8"
                >
                  <div className="space-y-2 text-center">
                    <div className={`w-12 h-12 rounded-xl ${config.themeBg} ${config.themeText} flex items-center justify-center mx-auto mb-2`}>
                        <Camera size={24} />
                    </div>
                    <h2 className="text-2xl font-black font-accent tracking-tighter">Inspección Digital</h2>
                    <p className="text-xs text-text-secondary font-medium">Subí las fotos requeridas para validar el estado de tu equipo.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(config.photoRequirements?.filter(req =>
                      !(req.key === 'foto_factura' && addressData.tieneFactura === 'NO')
                    ) ?? []).map((req) => {
                      const photo = uploadedPhotos[req.key];
                      const isUploading = photo && photo.progress < 100;

                      return (
                        <div key={req.key} className="flex flex-col h-full bg-bg-secondary/40 rounded-2xl border border-border-primary p-4 space-y-3 justify-between relative overflow-hidden">
                          <div>
                            <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest">{req.label}</span>
                            <p className="text-[10px] text-text-secondary font-medium mt-1 leading-snug">{req.placeholder}</p>
                          </div>

                          <div className="relative aspect-video rounded-xl bg-bg-secondary border-2 border-dashed border-border-primary flex flex-col items-center justify-center p-3 text-center transition-all overflow-hidden">
                            {photo ? (
                              <>
                                <img src={photo.preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover z-0" />
                                <div className="absolute inset-0 bg-black/60 z-10 flex flex-col items-center justify-center p-3">
                                  {isUploading ? (
                                    <div className="space-y-2 w-full px-2">
                                      <Loader2 className="animate-spin text-white mx-auto" size={24} />
                                      <p className="text-[9px] font-bold text-white uppercase tracking-widest">Subiendo... {photo.progress}%</p>
                                      <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500 h-full transition-all duration-150" style={{ width: `${photo.progress}%` }} />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-1 flex flex-col items-center">
                                      <CheckCircle2 size={24} className="text-emerald-500" />
                                      <p className="text-[9px] font-bold text-white uppercase tracking-widest">Cargada con éxito</p>
                                      <button 
                                        onClick={() => removePhoto(req.key)}
                                        className="mt-2 p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition-all border-none cursor-pointer flex items-center justify-center"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </>
                            ) : (
                              <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer group">
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handlePhotoChange(req.key, file);
                                  }} 
                                />
                                <Upload size={24} className="text-text-secondary group-hover:text-yuju-blue transition-colors mb-2" />
                                <span className="text-[10px] font-bold text-text-secondary group-hover:text-text-primary transition-colors">Seleccionar Archivo</span>
                              </label>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {error && <p className="text-xs text-red-500 font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}

                  <div className="pt-4">
                     <Button 
                       onClick={handlePhotosSubmit}
                       disabled={config.photoRequirements?.filter(req =>
                         !(req.key === 'foto_factura' && addressData.tieneFactura === 'NO')
                       ).some(req => !uploadedPhotos[req.key] || uploadedPhotos[req.key].progress < 100)}
                       className={`w-full h-14 rounded-xl ${config.themeBtn} font-black text-sm uppercase tracking-widest border-none text-white cursor-pointer`}
                     >
                       Continuar al Pago
                     </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 5/6: MÉTODO DE PAGO */}
              {((currentStep === 5 && !config.hasPhotosStep) || (currentStep === 6 && config.hasPhotosStep)) && (
                <motion.div
                  key="step-payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="max-w-xl mx-auto space-y-8"
                >
                  <div className="space-y-2 text-center">
                    <div className={`w-12 h-12 rounded-xl ${config.themeBg} ${config.themeText} flex items-center justify-center mx-auto mb-2`}>
                        <CreditCard size={24} />
                    </div>
                    <h2 className="text-2xl font-black font-accent tracking-tighter">Medio de Pago</h2>
                    <p className="text-xs text-text-secondary font-medium">Último paso para emitir tu póliza digital.</p>
                  </div>

                  <div className="space-y-4">
                      {/* Tarjeta Selector */}
                      <div 
                        onClick={() => setPaymentData({...paymentData, metodo: 'TARJETA_CREDITO'})}
                        className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center gap-4
                          ${paymentData.metodo === 'TARJETA_CREDITO' ? `${config.themeBg} shadow-lg` : 'bg-bg-secondary/50 border-border-primary hover:bg-bg-secondary/80 hover:shadow-md'}`}
                        style={{
                          borderColor: paymentData.metodo === 'TARJETA_CREDITO' ? config.themeColorHex : 'var(--border-primary)'
                        }}
                      >
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                            style={{
                              backgroundColor: paymentData.metodo === 'TARJETA_CREDITO' ? config.themeColorHex : 'var(--bg-primary)',
                              color: paymentData.metodo === 'TARJETA_CREDITO' ? '#fff' : 'var(--text-secondary)'
                            }}
                          >
                              <CreditCard size={20} />
                          </div>
                          <div>
                              <h3 className="font-black text-sm">Tarjeta de Crédito / Débito</h3>
                              <p className="text-[10px] text-text-secondary font-bold">VISA, MasterCard, AMEX, CABAL</p>
                          </div>
                      </div>

                      {paymentData.metodo === 'TARJETA_CREDITO' && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-2">
                              <div className="space-y-1.5">
                                  <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Marca de Tarjeta</label>
                                  <select className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold outline-none" value={paymentData.marca} onChange={(e) => setPaymentData({...paymentData, marca: e.target.value})}>
                                      <option value="VISA">VISA</option>
                                      <option value="MASTERCARD">MASTERCARD</option>
                                      <option value="AMEX">AMEX</option>
                                      <option value="CABAL">CABAL</option>
                                  </select>
                              </div>
                              <div className="space-y-1.5">
                                  <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">Número de Tarjeta</label>
                                  <input type="text" placeholder="XXXX XXXX XXXX XXXX" className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold outline-none" value={paymentData.numero} onChange={(e) => setPaymentData({...paymentData, numero: e.target.value.replace(/\D/g, '')})}/>
                              </div>
                          </motion.div>
                      )}

                      {/* CBU Selector */}
                      <div 
                        onClick={() => setPaymentData({...paymentData, metodo: 'CBU'})}
                        className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center gap-4
                          ${paymentData.metodo === 'CBU' ? `${config.themeBg} shadow-lg` : 'bg-bg-secondary/50 border-border-primary hover:bg-bg-secondary/80 hover:shadow-md'}`}
                        style={{
                          borderColor: paymentData.metodo === 'CBU' ? config.themeColorHex : 'var(--border-primary)'
                        }}
                      >
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                            style={{
                              backgroundColor: paymentData.metodo === 'CBU' ? config.themeColorHex : 'var(--bg-primary)',
                              color: paymentData.metodo === 'CBU' ? '#fff' : 'var(--text-secondary)'
                            }}
                          >
                              <Building2 size={20} />
                          </div>
                          <div>
                              <h3 className="font-black text-sm">CBU / Cuentas Bancarias</h3>
                              <p className="text-[10px] text-text-secondary font-bold">Débito automático directo en cuenta</p>
                          </div>
                      </div>

                      {paymentData.metodo === 'CBU' && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-2">
                              <div className="space-y-1.5">
                                  <label className="text-[9px] font-black uppercase text-text-secondary tracking-widest pl-1">CBU (22 dígitos)</label>
                                  <input type="text" placeholder="0000000000000000000000" maxLength={22} className="w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-sm font-semibold outline-none" value={paymentData.cbu} onChange={(e) => setPaymentData({...paymentData, cbu: e.target.value.replace(/\D/g, '')})}/>
                              </div>
                          </motion.div>
                      )}
                  </div>

                  {error && <p className="text-xs text-red-500 font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}

                  <div className="pt-4">
                     <Button 
                       onClick={handleFinalEmissionSubmit}
                       isLoading={isProcessing}
                       className={`w-full h-14 rounded-xl ${config.themeBtn} font-black text-sm uppercase tracking-widest border-none text-white cursor-pointer`}
                     >
                       Emitir Seguro de {config.title.replace('Seguro de ', '')}
                     </Button>
                  </div>
                </motion.div>
              )}

              {/* SUCCESS STEP */}
              {isSuccessStep && (
                <motion.div
                  key="step-success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 space-y-6"
                >
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto relative mb-4 bg-${config.themeColor}-500/20`}>
                     <div className={`absolute inset-0 blur-xl rounded-full animate-pulse bg-${config.themeColor}-500/10`} />
                     <ShieldCheck className={`${config.themeText} relative z-10`} size={48} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className={`flex items-center justify-center gap-2 mb-1 ${config.themeText}`}>
                       <CheckCircle2 size={20} />
                       <span className="text-[10px] font-black uppercase tracking-[0.3em]">Póliza Solicitada</span>
                    </div>
                    <h2 className="text-4xl font-black text-text-primary font-accent tracking-tighter whitespace-pre-wrap">¡Ya casi estamos!</h2>
                    <p className="text-xs text-text-secondary font-medium max-w-[420px] mx-auto leading-relaxed">
                        ¡Tu solicitud de seguro de {config.title.replace('Seguro de ', '').toLowerCase()} fue enviada con éxito! Te enviamos la confirmación por correo electrónico. En unos momentos nuestro equipo te enviará la documentación oficial.
                    </p>
                  </div>

                  <div className="pt-6">
                    <a href="/" className="inline-block">
                      <Button className={`${config.themeBtn} px-10 h-12 rounded-xl text-xs font-black uppercase tracking-widest border-none text-white`}>
                        Volver al Inicio
                      </Button>
                    </a>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
            </div>
            )}
          </GlassCard>

          {/* Premium FAQ Section */}
          {!isSuccessStep && (
            <FAQAccordion 
              items={config.type === 'notebook' ? notebookFAQ : config.type === 'bicicleta' ? bicicletaFAQ : config.type === 'monopatin' ? monopatinFAQ : hogarFAQ} 
              accentColor={isBici ? 'text-amber-500' : config.themeText}
              borderColor={isBici ? 'border-amber-500/20' : config.themeBorder}
              bgColor={isBici ? 'bg-amber-500/10' : config.themeBg}
            />
          )}

        </div>
      </div>
    </Layout>
  );
};
