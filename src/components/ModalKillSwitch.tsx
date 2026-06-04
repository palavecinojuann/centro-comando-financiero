import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

interface ModalKillSwitchProps {
    isOpen: boolean;
    nivelGasto: number;
    mensajeAlerta: string;
    onCancel: () => void;
    onForce: () => void;
}

export function ModalKillSwitch({ isOpen, nivelGasto, mensajeAlerta, onCancel, onForce }: ModalKillSwitchProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
                    />
                    
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 50 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="bg-[#0D0E15] border-2 border-red-600 rounded-none p-8 max-w-lg w-full relative z-10 shadow-[0_0_50px_rgba(220,38,38,0.3)] overflow-hidden"
                    >
                        {/* Efecto de luz roja de fondo */}
                        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-red-600/30 rounded-full blur-[60px] pointer-events-none" />

                        <div className="flex flex-col items-center text-center relative z-10">
                            <div className="w-24 h-24 rounded-none bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6 shadow-inner">
                                <ShieldAlert className="w-12 h-12 text-red-500" />
                            </div>

                            <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                                Operación Denegada
                            </h2>
                            <div className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest rounded-full mb-6 border border-red-500/20">
                                Bloqueo Táctico de Nivel {nivelGasto}
                            </div>

                            <p className="text-slate-200 text-lg font-medium leading-relaxed mb-8">
                                {mensajeAlerta || `Este gasto erosiona tu Punto de Paz por debajo del 100%. Supervivencia familiar en riesgo.`}
                            </p>

                            <div className="w-full space-y-4">
                                <button
                                    onClick={onCancel}
                                    className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white py-4 rounded-none font-bold text-lg transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                                >
                                    Entendido. Cancelar Gasto
                                </button>
                                
                                <button
                                    onClick={onForce}
                                    className="w-full text-red-500/40 hover:text-red-400 text-xs font-semibold py-2 transition-colors uppercase tracking-widest underline decoration-red-500/20 hover:decoration-red-400 underline-offset-4"
                                >
                                    Forzar Gasto (Requiere activar Triaje)
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
