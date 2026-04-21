import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={cn(
        'glass-card rounded-[40px] p-8 overflow-visible relative group',
        className
      )}
    >
      {/* Dynamic Border Blur Interaction */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[inherit]" />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};
