
import React from 'react';
import { motion } from 'framer-motion';

interface Button3DProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const Button3D: React.FC<Button3DProps> = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary',
  disabled = false,
  type = 'button'
}) => {
  const baseStyles = "relative px-6 py-3.5 font-bold rounded-xl transition-all active:translate-y-1 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base";
  
  const variants = {
    primary: "bg-blue-600 text-white shadow-[0_5px_0_0_#1d4ed8] hover:shadow-[0_2px_0_0_#1d4ed8] hover:translate-y-[2px]",
    secondary: "bg-purple-600 text-white shadow-[0_5px_0_0_#7e22ce] hover:shadow-[0_2px_0_0_#7e22ce] hover:translate-y-[2px]",
    danger: "bg-rose-600 text-white shadow-[0_5px_0_0_#be123c] hover:shadow-[0_2px_0_0_#be123c] hover:translate-y-[2px]",
    ghost: "bg-zinc-800 text-zinc-300 shadow-[0_5px_0_0_#18181b] hover:shadow-[0_2px_0_0_#18181b] hover:translate-y-[2px]"
  };

  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
};

export default Button3D;
