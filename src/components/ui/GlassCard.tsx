import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/utils';

<<<<<<< HEAD
interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
=======
interface GlassCardProps {
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

<<<<<<< HEAD
export const GlassCard: React.FC<GlassCardProps> = ({ children, className, delay = 0, onClick, style, id }) => {
=======
export const GlassCard: React.FC<GlassCardProps> = ({ children, className, delay = 0 }) => {
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={cn(
<<<<<<< HEAD
        'glass-card rounded-[40px] p-8 overflow-visible relative group',
        className
      )}
      onClick={onClick}
      style={style}
      id={id}
=======
        'glass-card rounded-[40px] p-8 overflow-hidden relative group',
        className
      )}
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)
    >
      {/* Dynamic Border Blur Interaction */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[inherit]" />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};
