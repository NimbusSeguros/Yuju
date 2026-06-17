import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className,
  isLoading,
  disabled,
  ...props 
}) => {
  const variants = {
    primary: 'btn-primary',
    outline: 'btn-outline',
    ghost: 'hover:bg-bg-secondary text-text-primary border border-transparent',
  };

  const sizes = {
    sm: 'px-6 py-2 text-xs',
    md: 'px-8 py-3.5 text-sm',
    lg: 'px-10 py-4 text-base',
  };

  return (
    <motion.button
      whileHover={!isLoading && !disabled ? { y: -2 } : {}}
      whileTap={!isLoading && !disabled ? { scale: 0.98 } : {}}
      disabled={isLoading || disabled}
      className={cn(
        'inline-flex items-center justify-center transition-all duration-300 font-black uppercase tracking-widest font-accent cursor-pointer',
        variants[variant],
        sizes[size],
        (isLoading || disabled) && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...(props as any)}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Cargando...</span>
        </div>
      ) : children}
    </motion.button>
  );
};
