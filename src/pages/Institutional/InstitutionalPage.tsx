import { motion } from 'framer-motion';
import { Shield, Rocket, Heart, Zap, Target, Eye, Leaf, Flag } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { SEOHelmet } from '../../components/SEO/SEOHelmet';
import { cn } from '../../utils/utils';

const pillars = [
  {
    title: "Tecnología y Agilidad",
    desc: "Experiencias online rápidas, sencillas y multicanal.",
    icon: Zap,
    color: "from-yuju-blue to-yuju-cyan"
  },
  {
    title: "Facilidad y Personalización",
    desc: "Plataforma intuitiva con seguros a medida para cada cliente.",
    icon: Target,
    color: "from-indigo-500 to-purple-500"
  },
  {
    title: "Humanidad y Confianza",
    desc: "Asesoramiento cálido y soporte constante cuando más nos necesitás.",
    icon: Heart,
    color: "from-rose-500 to-pink-500"
  },
  {
    title: "Excelencia y Calidad",
    desc: "Productos justos, modernos y 100% transparentes.",
    icon: Shield,
    color: "from-emerald-500 to-teal-500"
  },
  {
    title: "Innovación y Creatividad",
    desc: "Soluciones creativas adaptadas al estilo de vida de hoy.",
    icon: Rocket,
    color: "from-orange-500 to-amber-500"
  },
  {
    title: "Sostenibilidad",
    desc: "Compromiso social y reducción del impacto ambiental.",
    icon: Leaf,
    color: "from-green-500 to-emerald-500"
  }
];

export const InstitutionalPage = () => {
  return (
    <div className="bg-bg-primary min-h-screen">
      <SEOHelmet
        title="Institucional - Nuestra Historia"
        description="Conocé la historia de Yuju: la evolución de 15 años de trayectoria en Nimbus Bróker a la Insurtech líder de Argentina."
      />

      {/* HERO SECTION */}
      <section className="relative pt-52 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-yuju-blue/5 pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center relative z-10">

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black text-text-primary uppercase font-accent tracking-tighter leading-none mb-10"
          >
            Nacimos para <br />
            <span className="text-yuju-blue italic">simplificar</span> el futuro
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-text-secondary max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Somos la evolución digital de una trayectoria de 15 años. Fusionamos la solidez de la experiencia con la agilidad de la tecnología.
          </motion.p>
        </div>
      </section>

      {/* EVOLUTION SECTION */}
      <section className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-4xl md:text-5xl font-black text-text-primary uppercase font-accent tracking-tighter">
                Más de 15 años <br />
                <span className="text-text-primary/40">trascendiendo límites</span>
              </h2>
              <div className="space-y-6 text-lg text-text-secondary leading-relaxed font-medium">
                <p>
                  Yuju nace como la evolución digital de Nimbus Bróker de Seguros. No somos solo una plataforma; somos el resultado de años de aprendizaje, confianza y miles de familias protegidas.
                </p>
                <p>
                  Entendimos que el mundo cambió y que la protección debía cambiar con él. Por eso, integramos la solidez de nuestra trayectoria con la agilidad de una Insurtech propia, eliminando la fricción y potenciando la transparencia.
                </p>
              </div>

              <div className="flex items-center gap-8 pt-6">
                <div className="text-center">
                  <div className="text-4xl font-black text-yuju-blue font-accent">15+</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Años Exp.</div>
                </div>
                <div className="w-px h-10 bg-border-primary" />
                <div className="text-center">
                  <div className="text-4xl font-black text-yuju-cyan font-accent">100%</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Digital</div>
                </div>
              </div>
            </motion.div>

            <div className="relative">
              <div className="absolute -inset-4 bg-yuju-blue/10 blur-3xl rounded-full" />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative glass-card aspect-square rounded-[60px] flex items-center justify-center p-1"
              >
                <div className="w-full h-full rounded-[58px] overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000"
                    alt="Tech Evolution" className="w-full h-full object-cover" />
                </div>
                {/* Floating elements */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-yuju-blue/20 blur-2xl rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yuju-cyan/20 blur-3xl rounded-full" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE IDENTITY: MISSION, VISION & OBJECTIVE */}
      <section className="py-32 px-6 bg-bg-secondary overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <GlassCard className="p-10 h-full flex flex-col gap-6 border-border-primary overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yuju-blue/5 rounded-bl-full translate-x-8 -translate-y-8" />
              <div className="w-16 h-16 rounded-2xl bg-bg-primary border border-border-primary flex items-center justify-center text-yuju-blue mb-2">
                <Target size={32} />
              </div>
              <h3 className="text-3xl font-black text-text-primary uppercase font-accent">Misión</h3>
              <p className="text-lg text-text-secondary leading-relaxed font-medium">
                Revolucionar la protección de lo que la gente ama mediante tecnología, mejorando la seguridad y calidad de vida con soluciones ágiles y transparentes.
              </p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="p-10 h-full flex flex-col gap-6 border-border-primary overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yuju-cyan/5 rounded-bl-full translate-x-8 -translate-y-8" />
              <div className="w-16 h-16 rounded-2xl bg-bg-primary border border-border-primary flex items-center justify-center text-yuju-cyan mb-2">
                <Eye size={32} />
              </div>
              <h3 className="text-3xl font-black text-text-primary uppercase font-accent">Visión</h3>
              <p className="text-lg text-text-secondary leading-relaxed font-medium">
                Ser la Insurtech líder de la región, destacada por su excelencia, innovación constante y por construir los vínculos de mayor confianza en la industria.
              </p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-10 h-full flex flex-col gap-6 border-border-primary overflow-hidden relative group border-yuju-blue/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full translate-x-8 -translate-y-8" />
              <div className="w-16 h-16 rounded-2xl bg-bg-primary border border-border-primary flex items-center justify-center text-indigo-500 mb-2">
                <Flag size={32} />
              </div>
              <h3 className="text-3xl font-black text-text-primary uppercase font-accent">Objetivo</h3>
              <p className="text-lg text-text-secondary leading-relaxed font-medium">
                Cubrir a tus seres queridos y tu patrimonio, con productos justos y modernos, totalmente transparentes y al mejor precio del mercado.
              </p>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* PILLARS / VALUES */}
      <section className="py-32 px-6 bg-bg-primary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-yuju-blue font-black uppercase tracking-widest text-sm mb-4">Nuestros Pilares</h2>
            <p className="text-5xl md:text-6xl font-black text-text-primary uppercase font-accent tracking-tighter">Valores que nos impulsan</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard className="p-10 h-full border-border-primary hover:border-yuju-blue/30 bg-bg-secondary/30 transition-all duration-500 overflow-hidden relative group">
                  <div className={cn("absolute -bottom-10 -right-10 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity rounded-full bg-gradient-to-tr", pillar.color)} />
                  <div className="w-14 h-14 rounded-xl bg-bg-primary border border-border-primary flex items-center justify-center text-yuju-blue mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <pillar.icon size={24} />
                  </div>
                  <h4 className="text-xl font-black text-text-primary mb-4 uppercase font-accent">{pillar.title}</h4>
                  <p className="text-text-secondary font-medium leading-relaxed">
                    {pillar.desc}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL MANTRA */}
      <section className="py-40 px-6 bg-gradient-to-b from-bg-primary to-bg-secondary text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-40 bg-gradient-to-b from-transparent to-yuju-blue/30" />
        <div className="max-w-4xl mx-auto space-y-12 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-yuju-blue font-black uppercase tracking-[0.3em] text-xs"
          >
            Yuju 2026
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-7xl font-black text-text-primary uppercase font-accent tracking-tighter leading-tight"
          >
            El futuro del seguro es <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yuju-blue to-yuju-cyan">más simple de lo que imaginás.</span>
          </motion.h2>
          <p className="text-xl text-text-secondary font-medium italic opacity-60">
            Conectá con la seguridad. Conectá con Yuju.
          </p>
        </div>
      </section>
    </div>
  );
};
