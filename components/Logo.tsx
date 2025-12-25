
import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 40, className = "", animated = true }) => {
  return (
    <motion.div
      className={`relative inline-block ${className}`}
      whileHover={animated ? { scale: 1.1, rotateY: 15, rotateX: -10 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 10 }}
      style={{ width: size, height: size, perspective: '1000px' }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_15px_rgba(37,99,235,0.5)]"
      >
        {/* 3D Base Prism */}
        <rect x="10" y="10" width="80" height="80" rx="20" fill="url(#logo_grad)" fillOpacity="0.2" />
        <rect x="10" y="10" width="80" height="80" rx="20" stroke="url(#logo_grad)" strokeWidth="4" />
        
        {/* QR Pattern / Stylized U */}
        <path
          d="M30 30H45V45H30V30ZM55 30H70V45H55V30ZM30 55H45V70H30V55ZM55 55H70V70H55V55Z"
          fill="white"
        />
        <path
          d="M35 35H40V40H35V35ZM60 35H65V40H60V35ZM35 60H40V65H35V60Z"
          fill="url(#logo_grad)"
        />
        
        {/* The Central "U" for UDAY */}
        <path
          d="M48 48H52V62C52 64.2091 50.2091 66 48 66H42V62H48V48Z"
          fill="white"
          className={animated ? "animate-pulse" : ""}
        />

        <defs>
          <linearGradient id="logo_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full -z-10 animate-pulse"></div>
    </motion.div>
  );
};

export default Logo;
