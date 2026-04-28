import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2, Home, ArrowRight, RotateCcw } from 'lucide-react';
import { MotorbikeIcon } from '../icons/MotorbikeIcon';
import { Button } from '../ui/Button';
import { GlassCard } from '../ui/GlassCard';

interface SuccessStepProps {
  onReset: () => void;
  brand: string;
  model: string;
  insurer: string;
}

export const SuccessStep: React.FC<SuccessStepProps> = ({ onReset, brand, model, insurer }) => {
  const otherProducts = [
    {
      title: 'Seguro de Hogar',
      description: 'Protegé tu casa con la mejor cobertura.',
      icon: <Home className="text-yuju-blue" size={24} />,
      link: '/cotizar/seguro-hogar',
      color: 'bg-blue-500/10'
    },
    {
      title: 'Seguro de Moto',
      description: 'Rodá tranquilo con auxilio y RC.',
      icon: <MotorbikeIcon className="text-emerald-500" size={24} />,
      link: '/cotizar/seguro-moto',
      color: 'bg-emerald-500/10'
    }
  ];

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-12 overflow-hidden">
      {/* Backdrop oscuro y denso para bloquear TODO lo de atrás */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-3xl"
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-xl bg-yuju-dark rounded-[48px] p-8 md:p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border border-white/5"
      >
        {/* Adorno de luz sutil en el fondo */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-yuju-blue/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]" />

        <div className="relative z-10 text-center space-y-8">
          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/10"
            >
              <CheckCircle2 size={40} className="text-emerald-500" />
            </motion.div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-black font-accent text-white tracking-tighter leading-none">
              ¡Solicitud <span className="text-yuju-blue">Enviada!</span>
            </h1>
            <p className="text-slate-400 font-bold text-base md:text-lg max-w-lg mx-auto">
              Gracias por elegir <span className="text-yuju-blue">{insurer}</span> para tu <span className="text-white">{brand} {model}</span>. 
              Un asesor te contactará en breve.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {otherProducts.map((product, idx) => (
              <GlassCard 
                key={idx}
                className="p-6 rounded-[32px] border-white/5 hover:border-yuju-blue/30 transition-all group cursor-pointer bg-white/5"
              >
                <div className={`w-12 h-12 rounded-2xl ${product.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {product.icon}
                </div>
                <h3 className="text-sm font-black tracking-widest mb-1 text-white">
                  {product.title}
                </h3>
                <p className="text-[11px] text-slate-400 font-bold mb-4 opacity-60 leading-tight">
                  {product.description}
                </p>
                <Link to={product.link} className="flex items-center gap-2 text-yuju-blue text-[10px] font-black tracking-widest group-hover:gap-3 transition-all">
                  Cotizar ahora
                  <ArrowRight size={14} />
                </Link>
              </GlassCard>
            ))}
          </div>

          <div className="pt-4">
            <Button 
              onClick={onReset}
              variant="outline"
              className="h-12 px-10 border-white/10 hover:bg-white/5 text-slate-400 hover:text-white font-black tracking-[0.2em] text-[10px] flex items-center gap-2 mx-auto rounded-2xl transition-all"
            >
              <RotateCcw size={16} />
              Nueva Cotización
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
