import React, { useState } from 'react';
import { AuditorCognitivo, RecomendacionEstrategica, TransaccionSospechosa } from '../services/motores/AuditorCognitivo';
import { Bot, Sparkles, AlertTriangle, Target, Activity, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface CopilotoProps {
  contexto: {
    ingresos: number;
    gastos: number;
    excedente: number;
    deuda: number;
  };
  gastoSospechoso?: TransaccionSospechosa;
  onEjecutarAccion?: (recomendacion: RecomendacionEstrategica) => void;
  hideFloatingButton?: boolean;
}

export function CopilotoEstrategico({ contexto, gastoSospechoso, onEjecutarAccion, hideFloatingButton }: CopilotoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [recomendacion, setRecomendacion] = useState<RecomendacionEstrategica | null>(null);
  const [isAnalizando, setIsAnalizando] = useState(false);
  const [ejecutado, setEjecutado] = useState(false);

  React.useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    const handleClose = () => setIsOpen(false);
    window.addEventListener('toggle-copiloto', handleToggle);
    window.addEventListener('close-copiloto', handleClose);
    return () => {
      window.removeEventListener('toggle-copiloto', handleToggle);
      window.removeEventListener('close-copiloto', handleClose);
    };
  }, []);

  // Iniciar la invocación de Gemini
  const auditar = async () => {
    setIsAnalizando(true);
    setEjecutado(false);
    
    const auditor = new AuditorCognitivo();
    const result = await auditor.invocarPromptGeminiNLP({
      contexto,
      gastoVampiro: gastoSospechoso
    });

    if (result) {
      setRecomendacion(result);
    }
    
    setIsAnalizando(false);
  };

  const handleEjecutar = async () => {
    if (!recomendacion) return;
    
    try {
      // Inyección directa en Firestore para simular ciclo de automatización
      await addDoc(collection(db, 'transacciones'), {
        type: 'accion_ia',
        descripcion: recomendacion.accion,
        fechaRegistro: new Date(),
        montoNeto: 0,
        estado: 'EJECUTADO',
        observacion: recomendacion.observacion
      });
      
      setEjecutado(true);
      if (onEjecutarAccion) {
        onEjecutarAccion(recomendacion);
      }
    } catch (error) {
      console.error("Error aplicando acción en Firebase:", error);
    }
  };

  return (
    <>
      {/* Botón Flotante / Trigger del Panel */}
      {!hideFloatingButton && (
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-[#F2EDE4] text-[#2D2D2D] p-4 rounded-full shadow-[0_0_20px_rgba(217,168,82,0.3)] border border-[#D9A852]/30 flex items-center gap-3 backdrop-blur-xl"
        >
          <Bot className="w-6 h-6 text-[#D9A852]" />
          <span className="font-bold tracking-tight hidden md:block">Copiloto IA</span>
        </motion.button>
      )}

      {/* Widget Expansible */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-0 right-0 h-full w-full md:w-[420px] bg-[#0A0D14]/95 backdrop-blur-3xl border-l border-white/10 z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#D9A852]/20 flex items-center justify-center border border-[#D9A852]/50 shadow-[0_0_15px_rgba(217,168,82,0.4)]">
                   <Sparkles className="w-5 h-5 text-[#D9A852]" />
                </div>
                <div>
                   <h2 className="text-[#F2EDE4] font-bold text-lg leading-tight" style={{ fontFamily: 'Cinzel, serif' }}>Copiloto Financiero IA</h2>
                   <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold">Motor de Triaje Táctico</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white p-2 text-xl font-light">&times;</button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
               
               {/* Contexto inyectado */}
               <div className="bg-[#161A23]/50 border border-white/10 rounded-none p-4">
                  <p className="text-slate-400 text-[9px] uppercase font-bold tracking-widest mb-3">Contexto Inyectado</p>
                  <div className="grid grid-cols-2 gap-2">
                     <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                        <span className="text-slate-400 text-[10px] uppercase font-bold">Ingresos</span>
                        <p className="text-[#00B894] font-bold text-sm text-right">${(contexto.ingresos / 1000).toFixed(0)}k</p>
                     </div>
                     <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                        <span className="text-slate-400 text-[10px] uppercase font-bold">Gastos</span>
                        <p className="text-[#FF7675] font-bold text-sm text-right">${(contexto.gastos / 1000).toFixed(0)}k</p>
                     </div>
                     <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                        <span className="text-slate-400 text-[10px] uppercase font-bold">Excedente</span>
                        <p className="text-[#06B6D4] font-bold text-sm text-right">${(contexto.excedente / 1000).toFixed(0)}k</p>
                     </div>
                     <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                        <span className="text-slate-400 text-[10px] uppercase font-bold">Deuda</span>
                        <p className="text-[#F1C40F] font-bold text-sm text-right">${(contexto.deuda / 1000).toFixed(0)}k</p>
                     </div>
                  </div>
               </div>

               {/* Estado Inicial o Error */}
               {!recomendacion && !isAnalizando && (
                  <div className="flex flex-col items-center justify-center py-10 flex-1 text-center">
                     <Bot className="w-16 h-16 text-white/10 mb-4" />
                     <h3 className="text-white/70 font-bold mb-2">Auditor en Reposo</h3>
                     <p className="text-slate-400 text-xs px-6 mb-6">Iniciar diagnóstico para identificar fugas, anomalías y generar una directriz táctica.</p>
                     <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={auditar}
                        className="bg-[#D9A852]/20 border border-[#D9A852]/50 text-[#D9A852] font-bold text-xs uppercase px-6 py-3 rounded-none shadow-[0_0_15px_rgba(217,168,82,0.2)] hover:bg-[#D9A852]/30 transition-colors flex items-center gap-2"
                     >
                        <Activity className="w-4 h-4" /> Iniciar Diagnóstico
                     </motion.button>
                  </div>
               )}

               {/* Loader */}
               {isAnalizando && (
                  <div className="flex flex-col items-center justify-center py-10 flex-1 text-center space-y-4">
                     <Loader2 className="w-10 h-10 text-[#D9A852] animate-spin" />
                     <p className="text-[#D9A852] text-xs uppercase tracking-widest font-bold animate-pulse">Procesando NLP...</p>
                  </div>
               )}

               {/* Resultados del Prompt (4 Pasos) */}
               {recomendacion && !isAnalizando && (
                  <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="space-y-4"
                  >
                     {/* 1. Observación */}
                     <div className="bg-[#1A1C23]/60 border border-white/10 rounded-none p-4 shadow-xl">
                        <div className="flex items-center gap-2 mb-2">
                           <AlertTriangle className="w-4 h-4 text-[#F1C40F]" />
                           <h4 className="text-[#F1C40F] text-[10px] uppercase tracking-widest font-black">Observación</h4>
                        </div>
                        <p className="text-slate-200 text-sm leading-relaxed font-light">{recomendacion.observacion}</p>
                     </div>

                     {/* 2. Impacto */}
                     <div className="bg-[#1A1C23]/60 border border-white/10 rounded-none p-4 shadow-xl">
                        <div className="flex items-center gap-2 mb-2">
                           <Target className="w-4 h-4 text-[#FF7675]" />
                           <h4 className="text-[#FF7675] text-[10px] uppercase tracking-widest font-black">Impacto</h4>
                        </div>
                        <p className="text-slate-200 text-sm leading-relaxed font-light">{recomendacion.impacto}</p>
                     </div>

                     {/* 3. Acción */}
                     <div className="bg-[#D9A852]/10 border border-[#D9A852]/30 rounded-none p-4 shadow-[0_0_20px_rgba(217,168,82,0.1)]">
                        <div className="flex items-center gap-2 mb-2">
                           <Sparkles className="w-4 h-4 text-[#D9A852]" />
                           <h4 className="text-[#D9A852] text-[10px] uppercase tracking-widest font-black">Acción Sugerida</h4>
                        </div>
                        <p className="text-[#F2EDE4] text-sm leading-relaxed font-medium">{recomendacion.accion}</p>
                     </div>

                     {/* 4. Resultado Esperado */}
                     <div className="bg-[#00B894]/10 border border-[#00B894]/30 rounded-none p-4 shadow-[0_0_20px_rgba(0,184,148,0.1)]">
                        <div className="flex items-center gap-2 mb-2">
                           <Activity className="w-4 h-4 text-[#00B894]" />
                           <h4 className="text-[#00B894] text-[10px] uppercase tracking-widest font-black">Resultado Esperado</h4>
                        </div>
                        <p className="text-[#00B894] text-sm leading-relaxed font-medium">{recomendacion.resultadoEsperado}</p>
                     </div>

                  </motion.div>
               )}

            </div>

            {/* Footer / Botón de Acción Directa */}
            {recomendacion && !isAnalizando && (
               <div className="p-6 border-t border-white/10 bg-black/40">
                  <motion.button 
                     whileHover={{ scale: ejecutado ? 1 : 1.02 }}
                     whileTap={{ scale: ejecutado ? 1 : 0.98 }}
                     onClick={handleEjecutar}
                     disabled={ejecutado}
                     className={`w-full py-4 rounded-none flex justify-center items-center gap-2 font-bold transition-all shadow-xl
                        ${ejecutado 
                           ? 'bg-[#00B894]/20 text-[#00B894] border border-[#00B894]/50 cursor-default' 
                           : 'bg-gradient-to-r from-[#D9A852] to-[#b88c42] text-[#1A1C23] hover:shadow-[0_0_30px_rgba(217,168,82,0.4)]'}`}
                  >
                     {ejecutado ? (
                        <>
                           <CheckCircle className="w-5 h-5" /> Táctica Aplicada
                        </>
                     ) : (
                        <>
                           <Sparkles className="w-5 h-5" /> Ejecutar al Triaje
                        </>
                     )}
                  </motion.button>
               </div>
            )}
            
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
