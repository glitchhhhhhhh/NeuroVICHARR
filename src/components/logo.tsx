'use client';
import type { SVGProps } from 'react';
import { motion } from 'framer-motion';

export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="5"
      initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.1, rotate: 5 }}
      {...props}
    >
      <motion.circle 
        cx="50" 
        cy="50" 
        r="45" 
        className="text-primary" 
        stroke="currentColor"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}
      />
      <motion.path
        d="M30 50 Q35 30 50 35 Q65 40 70 50"
        stroke="hsl(var(--accent))"
        strokeWidth="6"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5, ease: "easeInOut" }}
      />
      <motion.path
        d="M30 50 Q35 70 50 65 Q65 60 70 50"
        stroke="hsl(var(--accent))"
        strokeWidth="6"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7, ease: "easeInOut" }}
      />
      <motion.circle 
        cx="30" cy="50" r="5" 
        fill="hsl(var(--accent))" 
        stroke="none" 
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1, type: "spring", stiffness: 200 }}
      />
      <motion.circle 
        cx="70" cy="50" r="5" 
        fill="hsl(var(--accent))" 
        stroke="none" 
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.1, type: "spring", stiffness: 200 }}
      />
      <motion.circle 
        cx="50" cy="35" r="4" 
        fill="hsl(var(--foreground))" 
        stroke="none" 
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
      />
      <motion.circle 
        cx="50" cy="65" r="4" 
        fill="hsl(var(--foreground))" 
        stroke="none" 
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.3, type: "spring", stiffness: 200 }}
      />
    </motion.svg>
  );
}