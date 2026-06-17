import React from 'react';

export interface MonopatinIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
}

export const MonopatinIcon = ({ className = '', size = 24, color = "currentColor", ...props }: MonopatinIconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`lucide lucide-monopatin-icon lucide-monopatin ${className}`}
    {...props}
  >
    {/* Wheels */}
    <circle cx="6" cy="18" r="2" />
    <circle cx="18" cy="18" r="2" />
    
    {/* Foot deck and rear fender */}
    <path d="M6 16h12" />
    <path d="M6 18a2 2 0 0 1 2-2" />
    
    {/* Steering stem and handlebar */}
    <path d="M18 16L14 5" />
    <path d="M15 5H10" />
  </svg>
);
