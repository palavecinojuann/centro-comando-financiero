import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ShieldCheck, TrendingDown, CheckCircle2, ArrowRight } from 'lucide-react';
import { EvaluacionInyeccion } from '../services/MotorInyeccionExtraordinaria';

interface ModalInyeccionProps {
    isOpen: boolean;
    evaluacion: EvaluacionInyeccion | null;
    onClose: () => void;
    onExecute: () => void;
}

export function ModalInyeccion({ isOpen, evaluacion, onClose, onExecute }: ModalInyeccionProps) {
    const [isExecuting, setIsExecuting] = useState(false);
    const [isExecuted, setIsExecuted] = useState(false);

    if (!evaluacion || !evaluacion.esExtraordinario) return null;

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const handleExecute = () => {
        setIsExecuting(true);
        // Simulamos la animación del flujo de dinero
        setTimeout(() => {
            setIsExecuting(false);
            setIsExecuted(true);
            setTimeout(() => {
                onExecute();
            }, 2000);
        }, 2500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    {/* Dark Background con desenfoque extremo */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#0D0E15]/90 backdrop-blur-2xl"
                    />

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 50 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="bg-[#161A23]/50 border border-white/10 rounded-none p-8 max-w-lg w-full relative z-10 shadow-2xl overflow-hidden font-sans"
                    >
                        {/* Destellos Dorados / Cian */}
                        <div className="absolute top-[-20%] right-[-10%] w-[250px] h-[250px] bg-[#F1C40F]/15 rounded-full blur-[60px] pointer-events-none" />
                        <div className="absolute bottom-[-20%] left-[-10%] w-[250px] h-[250px] bg-[#E5A93B]/15 rounded-full blur-[60px] pointer-events-none" />

                        {!isExecuted ? (
                            <div className="flex flex-col items-center text-center relative z-10">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#E5A93B] to-[#F1C40F] p-0.5 mb-6 shadow-[0_0_30px_rgba(241,196,15,0.3)]">
                                    <div className="w-full h-full bg-[#0D0E15] rounded-full flex items-center justify-center relative overflow-hidden">
                                        <Zap className="w-8 h-8 text-[#F1C40F] relative z-10" />
                                    </div>
                                </div>

                                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                                    ¡Ingreso Extraordinario Detectado!
                                </h2>
                                <p className="text-[#F1C40F] text-lg font-bold mb-6 tracking-wide drop-shadow-[0_0_10px_rgba(241,196,15,0.2)]">
                                    Has registrado {formatMoney(evaluacion.monto)} 
                                    <span className="text-slate-300 text-sm ml-2">({evaluacion.origen})</span>
                                </p>

                                <div className="w-full bg-black/40 border border-[#E5A93B]/30 rounded-none p-5 mb-8 relative">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#E5A93B] rounded-l-xl shadow-[0_0_10px_#E5A93B]" />
                                    <div className="flex items-start gap-4 text-left">
                                        <div className="mt-1">
                                            {evaluacion.destinoRecomendado === 'BOLA_DE_NIEVE' 
                                                ? <TrendingDown className="w-6 h-6 text-[#E5A93B]" />
                                                : <ShieldCheck className="w-6 h-6 text-[#E5A93B]" />
                                            }
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold mb-1 tracking-wide">Propuesta del Cerebro Lógico</h4>
                                            <p className="text-[#E5A93B]/90 text-sm leading-relaxed">
                                                {evaluacion.mensajePropuesta}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full space-y-4">
                                    <button
                                        onClick={handleExecute}
                                        disabled={isExecuting}
                                        className="w-full relative py-4 bg-[#E5A93B] hover:bg-[#0891b2] text-[#0D0E15] rounded-none text-lg font-black uppercase tracking-wider shadow-[0_0_20px_rgba(229, 169, 59, 0.4)] transition-all flex items-center justify-center gap-2 group overflow-hidden disabled:opacity-80"
                                    >
                                        {/* Brillo */}
                                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] animate-[shimmer_2s_infinite] group-hover:block" />
                                        
                                        {isExecuting ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full border-2 border-[#0D0E15]/30 border-t-[#0D0E15] animate-spin" />
                                                Inyectando Fondos...
                                            </div>
                                        ) : (
                                            <>
                                                <Zap className="w-5 h-5" />
                                                Ejecutar Protocolo de Inyección
                                            </>
                                        )}
                                    </button>
                                    
                                    <button
                                        onClick={onClose}
                                        disabled={isExecuting}
                                        className="w-full text-slate-400 hover:text-white text-xs font-semibold py-2 transition-colors uppercase tracking-widest underline decoration-white/20 hover:decoration-white/60 underline-offset-4 disabled:opacity-50"
                                    >
                                        Omitir (Mezclar con saldo regular)
                                    </button>
                                </div>

                                {/* Animación de Flujo de Dinero (si se está ejecutando) */}
                                {isExecuting && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 100 }}
                                        animate={{ opacity: 1, y: -200 }}
                                        transition={{ duration: 1.5, ease: "easeIn" }}
                                        className="absolute z-50 pointer-events-none"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-[#E5A93B]/20 border border-[#E5A93B] flex items-center justify-center shadow-[0_0_20px_#E5A93B]">
                                            <ArrowRight className="w-5 h-5 text-[#E5A93B] -rotate-45" />
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center text-center py-10 relative z-10"
                            >
                                <div className="w-24 h-24 rounded-full bg-[#E5A93B]/20 border border-[#E5A93B] flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(229, 169, 59, 0.4)]">
                                    <CheckCircle2 className="w-12 h-12 text-[#E5A93B]" />
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase mb-2">Protocolo Ejecutado</h3>
                                <p className="text-[#E5A93B] font-medium"> Fondos inyectados tácticamente.</p>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
