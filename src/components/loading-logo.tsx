
'use client';

import { motion } from 'framer-motion';
import { AppLogo } from '@/components/logo';

interface NeuroVicharLoadingLogoProps {
  text?: string;
}

export function NeuroVicharLoadingLogo({ text = "Initializing Synapses..." }: NeuroVicharLoadingLogoProps) {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
      <motion.div
        animate={{
          scale: [1, 1.1, 1, 1.1, 1],
          rotate: [0, 10, 0, -10, 0],
        }}
        transition={{
          duration: 2.0, // Slightly faster for a more "active" loading feel
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        <AppLogo className="w-24 h-24 md:w-32 md:h-32 text-primary" />
      </motion.div>
      <motion.p
        className="mt-6 text-lg md:text-xl font-medium text-foreground/70 tracking-wider"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
      >
        {text}
      </motion.p>
       <motion.div 
        className="mt-4 h-1.5 w-32 bg-primary/20 rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3}}
       >
        <motion.div
          className="h-full bg-gradient-to-r from-primary via-accent to-pink-500"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration: 1.5,
            ease: "linear",
          }}
        />
      </motion.div>
    </div>
  );
}
