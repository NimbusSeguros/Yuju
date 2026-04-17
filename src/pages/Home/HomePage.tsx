import { motion } from 'framer-motion';
import { Car, Bike, Home, ArrowRight, ShieldCheck, ChevronRight, Activity, MousePointer2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/utils';
import { useTheme } from '../../hooks/useTheme';

const services = [
  {
    title: 'Seguro de Auto',
    icon: Car,
    desc: 'Protección inteligente para tu vehículo con asistencia mecánica 24/7.',
    href: '/cotizar/seguro-auto',
    color: 'from-[#3369ff] to-[#60a5fa]',
    hoverColor: 'border-yuju-blue/20',
    btnHover: 'hover:bg-yuju-blue shadow-yuju-blue/20'
  },
  {
    title: 'Seguro de Moto',
    icon: Bike,
    desc: 'Cobertura especializada para rodar con total libertad y tranquilidad.',
    href: '/cotizar/seguro-moto',
    color: 'from-orange-500 to-orange-400',
    hoverColor: 'border-orange-500/20',
    btnHover: 'hover:bg-orange-500 shadow-orange-500/20'
  },
  {
    title: 'Seguro de Hogar',
    icon: Home,
    desc: 'Tu refugio, protegido con la mayor seguridad y beneficios exclusivos.',
    href: '/cotizar/seguro-hogar',
    color: 'from-emerald-500 to-emerald-400',
    hoverColor: 'border-emerald-500/20',
    btnHover: 'hover:bg-emerald-500 shadow-emerald-500/20'
  },
];

const partners = [
  "https://res.cloudinary.com/dewcgbpvp/image/upload/v1722988252/RUS_mqiqvz.png",
  "https://res.cloudinary.com/dewcgbpvp/image/upload/v1722988252/SANCRISTOBAL_kazpdd.png",
  "https://res.cloudinary.com/dewcgbpvp/image/upload/v1722988247/FEDPA_eq1khi.png",
  "https://res.cloudinary.com/dewcgbpvp/image/upload/v1722988245/EXPERTA_n9hhnn.png",
  "https://res.cloudinary.com/dewcgbpvp/image/upload/v1722988250/MERCANTIL_x2mdnw.png",
  "https://res.cloudinary.com/dewcgbpvp/image/upload/v1722988250/MAPFRE_bxhq37.png",
  "https://res.cloudinary.com/dewcgbpvp/image/upload/v1722988249/INTEGRITY_gjydc4.png",
  "https://res.cloudinary.com/dewcgbpvp/image/upload/v1722988244/ATM_frtz71.png",
];

const testimonials = [
  {
    name: 'Lucía López',
    date: '03/01/2024',
    text: 'Estoy muy contenta con el servicio de Yuju seguros. La atención de Malena fue excelente. Los recomiendo 100%.'
  },
  {
    name: 'Martín Fernández',
    date: '21/12/2023',
    text: 'Muy satisfecho con el servicio. Me ofrecieron el mejor precio y cobertura para mi seguro. Los recomiendo.'
  },
  {
    name: 'Pablo Rodríguez',
    date: '19/02/2024',
    text: 'Me atendieron súper rápido y pude contratar de forma sencilla. Me explicaron todo con claridad y con paciencia.'
  },
  {
    name: 'Laura González',
    date: '10/03/2024',
    text: 'Me está asesorando Malena. ¡Una genia! Me atendió de forma impecable y me dio el mejor precio.'
  },
  {
    name: 'Carlos Mendez',
    date: '15/03/2024',
    text: 'Excelente atención y rapidez en la gestión. El precio fue el más competitivo que encontré.'
  },
];

export const HomePage = () => {
  const { theme } = useTheme();

  return (
    <div className="relative overflow-hidden bg-bg-primary transition-colors duration-500">

      {/* SECTION: HERO - Reworked for Yuju Blue style + Real Image */}
      <section className="relative min-h-screen flex items-center pt-20 md:pt-24 pb-8 overflow-hidden px-6">
        {/* Background Base (Yuju Blue) */}
        <div className="absolute inset-0 bg-yuju-blue z-0 overflow-hidden">
          {/* Subtle tech patterns overlay */}
          <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '48px 48px' }} />
          {/* Floating animated blobs for futuristic touch */}
          <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] bg-yuju-cyan blur-[180px] rounded-full opacity-50" />
          <motion.div animate={{ scale: [1, 1.4, 1], rotate: [0, -120, 0] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute -bottom-1/4 -right-1/6 w-[700px] h-[700px] bg-yuju-cyan blur-[200px] rounded-full opacity-40" />
          <motion.div animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-[#3369ff] blur-[150px] rounded-full opacity-40 border border-white/5" />

          {/* Real Background Image Overlay (Right Side) */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute inset-y-0 right-0 w-full lg:w-3/5 bg-cover bg-center lg:rounded-l-[80px] opacity-40 lg:opacity-100"
              style={{
                backgroundImage: `url('file:///C:/Users/schut/.gemini/antigravity/brain/864463c5-3699-4436-912c-8ec06fa1c974/premium_yuju_hero_family_car_2026_1775603137026.png')`,
                maskImage: 'linear-gradient(to left, black 60%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to left, black 60%, transparent 100%)'
              }} />
            <div className="absolute inset-0 bg-gradient-to-r from-yuju-blue via-yuju-blue/40 to-transparent lg:hidden" />
          </div>
        </div>

        <div className="max-w-5xl mx-auto w-full relative z-20 flex flex-col items-center text-center space-y-8 py-6 md:py-8">
          <div className="space-y-4 md:space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-black leading-tight text-white font-accent tracking-tighter">
                Conectá con la alegría <br /> de estar protegido.
              </h1>

              <div className="pt-1">
                <div className="hero-box-highlight">
                  <span className="text-xl md:text-3xl lg:text-4xl  tracking-tighter">
                    Elegí, cotizá y viví seguro,
                  </span>
                </div>
              </div>

              <p className="text-2xl md:text-3xl lg:text-4xl text-white font-medium tracking-tight">
                en unos simples pasos
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center pt-4"
            >
              <a href="#seguros" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-white/10 hover:bg-white text-white hover:text-yuju-blue border-white/20 px-12 h-16 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-500 backdrop-blur-md">
                  Cotizá ahora <ArrowRight size={20} className="ml-3" />
                </Button>
              </a>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator for tech feel */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 opacity-40">
          <div className="w-5 h-8 border-2 border-white/20 rounded-full flex justify-center p-1">
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-1 h-1 bg-yuju-cyan rounded-full" />
          </div>
        </div>
      </section>

      {/* SECTION: TRUST - Sourced from dev_v1 partners */}
      <section className="py-8 bg-bg-primary overflow-hidden border-y border-border-primary/50 relative z-30">
        <div className="logo-track-container relative">
          <div className="logo-track grayscale-0 opacity-100 items-center">
            {[...partners, ...partners, ...partners].map((logo, i) => {
              const isMercantil = logo.includes('MERCANTIL');
              const isFedPat = logo.includes('FEDPA');

              let logoSrc = logo;
              if (theme === 'dark') {
                if (isMercantil) logoSrc = "https://res.cloudinary.com/dr8n9s55i/image/upload/v1755863727/mercantil_xhcmdc.png";
                if (isFedPat) logoSrc = "https://res.cloudinary.com/dr8n9s55i/image/upload/v1758284666/Logo_FedPat_-_Blanco_myusp4.png";
              }

              return (
                <div key={i} className="min-w-[180px] h-14 flex items-center justify-center px-4">
                  <img
                    src={logoSrc}
                    alt="Partner"
                    className={cn(
                      "max-h-full w-auto object-contain filter drop-shadow-sm transition-all duration-700 hover:scale-105",
                      theme === 'dark'
                        ? ((isMercantil || isFedPat) ? "opacity-50 hover:opacity-100" : "brightness-0 invert opacity-40 hover:brightness-100 hover:invert-0 hover:opacity-100")
                        : "grayscale opacity-50 hover:grayscale-0 hover:opacity-100"
                    )}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION: SERVICES - Unified Design */}
      <section id="seguros" className="py-10 px-6 bg-bg-secondary scroll-mt-32">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="space-y-6">
              <div className="px-4 py-1 bg-yuju-blue/10 text-yuju-blue inline-block rounded-full text-xs font-black uppercase tracking-widest">
                Coberturas Inteligentes
              </div>
              <h2 className="section-title uppercase tracking-[ -0.05em]">Elegí tu Tranquilidad</h2>
              <p className="section-subtitle">
                Descubrí seguros diseñados para tu estilo de vida. Cotización instantánea e inteligente para personas que valoran su tiempo.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) => (
              <GlassCard
                key={service.title}
                className={cn(
                  "group p-6 border-border-primary bg-bg-primary transition-all duration-700 relative overflow-hidden flex flex-col h-full min-h-[340px] rounded-[32px]",
                  `hover:${service.hoverColor}`
                )}
              >
                {/* Background glow per service color */}
                <div className={cn("absolute -bottom-20 -right-20 w-48 h-48 blur-3xl opacity-0 group-hover:opacity-25 transition-opacity rounded-full bg-gradient-to-tr", service.color)} />

                <div className="relative mb-6">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center relative z-10",
                      "bg-gradient-to-br border border-white/20 shadow-xl",
                      service.color
                    )}
                  >
                    <service.icon size={32} className="text-white" />
                  </motion.div>
                  {/* Subtle soft shadow/glow behind icon */}
                  <div className={cn("absolute inset-0 blur-xl opacity-40 scale-110", service.color)} />
                </div>

                <h3 className="text-2xl font-black text-text-primary mb-3 font-accent tracking-tighter uppercase whitespace-pre-wrap leading-tight min-h-[4rem] flex items-center">{service.title}</h3>
                <p className="text-text-secondary mb-8 leading-relaxed font-medium text-sm min-h-[4.5rem]">
                  {service.desc}
                </p>

                <div className="mt-auto">
                  <Link to={service.href} className="block group/btn">
                    <Button variant="ghost" className={cn(
                      "w-full text-text-primary font-black uppercase tracking-widest text-[10px] flex items-center justify-between px-6 py-4 rounded-2xl bg-bg-secondary transition-all duration-300",
                      service.btnHover,
                      "hover:text-white"
                    )}>
                      <span>Ver detalles</span>
                      <ArrowRight size={16} className="translate-x-0 group-hover/btn:translate-x-1.5 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: EXPERIENCE REWORKED - The "Yuju v1" spirit modernized */}
      <section className="py-10 px-6 relative bg-bg-primary overflow-hidden">
        <div className="absolute top-0 right-0 w-[50%] h-full bg-yuju-blue/5 -skew-x-12 translate-x-1/2" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="relative">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ duration: 1 }}>
              <div className="relative rounded-[40px] overflow-hidden shadow-2xl border-4 border-white dark:border-white/10 aspect-video">
                <img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1000"
                  alt="Lifestyle" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 duration-500" />
                <div className="absolute inset-0 bg-yuju-blue/20 mix-blend-multiply" />
              </div>

              {/* Floating Tech Badge */}
              <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -bottom-10 -right-10 glass-card p-6 rounded-3xl border-yuju-blue/20 bg-bg-primary/90 flex items-center gap-4 shadow-2xl">
                <div className="w-12 h-12 bg-yuju-cyan/20 text-yuju-cyan flex items-center justify-center rounded-2xl">
                  <Activity size={24} />
                </div>
                <div className="flex flex-col pr-10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Monitoreo</span>
                  <span className="text-sm font-black text-text-primary uppercase font-accent">Tecnología Activa</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          <div className="space-y-10">
            <div className="space-y-4">
              <h2 className="section-title uppercase">Nacimos para<br />simplificar el futuro</h2>
              <p className="text-text-secondary leading-relaxed font-medium">
                Somos una empresa joven, dinámica y comprometida con la innovación y la sostenibilidad. Nacimos como la evolución digital de Nimbus Bróker, integrando 15 años de trayectoria con la agilidad del mañana.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-yuju-blue">
                  <MousePointer2 size={16} />
                  <span className="text-xs font-black uppercase tracking-widest">Digital First</span>
                </div>
                <p className="text-sm font-bold text-text-primary">Experiencia 100% online, sin papeles ni complicaciones.</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-yuju-cyan">
                  <ShieldCheck size={16} />
                  <span className="text-xs font-black uppercase tracking-widest">Respaldo Total</span>
                </div>
                <p className="text-sm font-bold text-text-primary">Las aseguradoras más solventes del mercado argentino.</p>
              </div>
            </div>

            <Link to="/institucional">
              <Button variant="outline" className="group">
                Conocé nuestra historia <ChevronRight size={18} className="ml-2 group-hover:translate-x-1.5 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION: TESTIMONIALS - New Horizontal Scroll Section */}
      <section className="py-10 bg-bg-secondary overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-16">
          <h2 className="text-yuju-blue font-black uppercase tracking-widest text-sm mb-4">Opiniones de nuestros clientes</h2>
          <p className="section-title">Lo que dicen de nosotros</p>
        </div>

        <div className="relative flex overflow-hidden group">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="flex gap-8 px-4 py-8"
          >
            {[...testimonials, ...testimonials].map((t, i) => (
              <GlassCard key={i} className="min-w-[350px] md:min-w-[450px] p-8 border-border-primary hover:border-yuju-blue/30 transition-all duration-500 bg-bg-primary">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-yuju-blue font-black text-lg uppercase font-accent">{t.name}</h4>
                    <span className="text-text-secondary text-[11px] font-bold uppercase tracking-widest">{t.date}</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-yuju-blue flex items-center justify-center text-white shadow-lg shadow-yuju-blue/20">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                </div>
                <p className="text-text-secondary leading-relaxed font-medium text-[15px]">
                  "{t.text}"
                </p>
              </GlassCard>
            ))}
          </motion.div>
        </div>
      </section>

    </div>
  );
};
