import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  titulo: string;
  subtitulo: string;
  textoBoton: string;
  onAccion: () => void;
}

export function EmptyState({ icon: Icon, titulo, subtitulo, textoBoton, onAccion }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#161a23]/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-6"
    >
      <div className="w-24 h-24 rounded-full border border-[#06b6d4]/30 flex items-center justify-center bg-[#06b6d4]/10 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
        <Icon className="w-12 h-12 text-[#06b6d4]" strokeWidth={1.5} />
      </div>
      
      <div className="space-y-2">
        <h3 className="font-serif text-2xl text-white tracking-wider">{titulo}</h3>
        <p className="font-sans text-gray-400 tracking-widest uppercase text-xs">
          {subtitulo}
        </p>
      </div>

      <button 
        onClick={onAccion}
        className="px-6 py-3 rounded-full bg-gradient-to-r from-[#06b6d4] to-[#ff007f] text-white font-sans text-sm font-black tracking-widest uppercase hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/50 cursor-pointer"
      >
        {textoBoton}
      </button>
    </motion.div>
  );
}
