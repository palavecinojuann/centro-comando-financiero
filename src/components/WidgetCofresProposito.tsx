import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Plane, Coins, Tent, Star } from 'lucide-react';
import { MotorCofres, CofreProposito, EscaneoResult } from '../services/MotorCofres';

// Estado inicial simulado para demostración interactiva
const COFRES_INICIALES: CofreProposito[] = [
    {
        id: 'viaje_familiar',
        nombreMeta: 'Vacaciones en Familia',
        montoObjetivo: 2000000,
        montoActual: 1500000,
        porcentajeCompletado: 75
    },
    {
        id: 'escapada_finde',
        nombreMeta: 'Escapada de Fin de Semana',
        montoObjetivo: 350000,
        montoActual: 120000,
        porcentajeCompletado: 34
    }
];

export function WidgetCofresProposito() {
    const [cofres, setCofres] = useState<CofreProposito[]>(COFRES_INICIALES);
    const [alertaSobrante, setAlertaSobrante] = useState<EscaneoResult | null>(null);
    const [showTransferAnimation, setShowTransferAnimation] = useState(false);

    useEffect(() => {
        // Simulamos un escaneo de sobrantes a los 2.5 segundos
        const motor = new MotorCofres();
        const resultado = motor.escanearSobrantesMes('Supermercado', 300000, 285000); // Hay un sobrante de 15.000
        
        if (resultado.tieneSobrante) {
            const timer = setTimeout(() => {
                setAlertaSobrante(resultado);
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, []);

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const handleTransferir = (cofreDestinoId: string) => {
        if (!alertaSobrante) return;

        setShowTransferAnimation(true);
        const montoTransferido = alertaSobrante.montoSobrante;
        setAlertaSobrante(null);

        // Simulamos el impacto en el backend (estado local)
        setTimeout(() => {
            const motor = new MotorCofres();
            setCofres(prevCofres => prevCofres.map(c => {
                if (c.id === cofreDestinoId) {
                    const nuevoMonto = c.montoActual + montoTransferido;
                    return {
                        ...c,
                        montoActual: nuevoMonto,
                        porcentajeCompletado: motor.actualizarPorcentaje(nuevoMonto, c.montoObjetivo)
                    };
                }
                return c;
            }));
            
            // Ocultamos la animación de la moneda que viaja
            setTimeout(() => {
                setShowTransferAnimation(false);
            }, 800);
        }, 1200); 
    };

    const handleMantenerCaja = () => {
        setAlertaSobrante(null);
    };

    return (
        <div className="w-full relative font-sans">
            {/* Notificación Proactiva (Intercepción de Sobrante) */}
            <AnimatePresence>
                {alertaSobrante && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="absolute -top-[140px] left-0 right-0 z-50 p-5 rounded-none bg-[#0D0E15]/95 backdrop-blur-3xl border border-[#06b6d4]/50 shadow-[0_30px_60px_rgba(6,182,212,0.25)] flex flex-col gap-4 overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#06b6d4]/10 rounded-full blur-[50px] pointer-events-none" />
                        
                        <div className="relative z-10 flex gap-4">
                            <div className="w-14 h-14 rounded-full bg-[#06b6d4]/20 border border-[#06b6d4]/50 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                                <Star className="w-7 h-7 text-[#06b6d4]" />
                            </div>
                            <div className="flex-1 text-white">
                                <h4 className="font-black text-xl leading-tight text-white tracking-tight">Victoria Táctica</h4>
                                <p className="text-[15px] text-gray-400 mt-1.5 leading-snug">
                                    {alertaSobrante.mensajeAlerta} ¿Desean enviar este sobrante al Cofre <span className="font-bold text-[#06b6d4] underline decoration-[#06b6d4]/40 underline-offset-2">Vacaciones en Familia</span>?
                                </p>
                            </div>
                        </div>
                        
                        <div className="relative z-10 flex items-center gap-3 mt-1">
                            <button 
                                onClick={() => handleTransferir('viaje_familiar')}
                                className="flex-1 bg-[#06b6d4] hover:bg-[#0891b2] text-[#0D0E15] font-black py-3 rounded-none shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                                <Coins className="w-5 h-5" />
                                Transferir al Cofre
                            </button>
                            <button
                                onClick={handleMantenerCaja}
                                className="flex-1 bg-[#161A23]/50 hover:bg-white/10 text-slate-300 hover:text-white/90 border border-white/10 py-3 rounded-none font-bold transition-all text-sm active:scale-95"
                            >
                                Mantener en Caja
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-[#161A23]/50 backdrop-blur-xl rounded-none p-5 border border-white/10 shadow-lg relative overflow-hidden mt-8 md:mt-0 flex flex-col h-full">
                {/* Ambient Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-50" />
                
                {/* Iluminación de Cofres */}
                <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[300px] h-[300px] bg-[#ff007f]/5 rounded-full blur-[80px] pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between mb-4 relative z-10">
                    <div>
                        <h3 className="font-black text-[#ff007f] tracking-tight flex items-center gap-2">
                            <Gift className="w-5 h-5 text-[#ff007f]" />
                            Cofres de Propósito
                        </h3>
                    </div>
                </div>

                {/* Grid de Metas */}
                <div className="flex-1 flex flex-col justify-center gap-3 relative z-10">
                    {cofres.map(cofre => (
                        <motion.div 
                            layout
                            key={cofre.id}
                            className="bg-[#0D0E15]/50 border border-white/5 rounded-none p-3 relative overflow-hidden group hover:bg-[#161A23]/50 hover:border-white/10 transition-all"
                        >
                            <div className="flex items-center gap-3 mb-2 w-full">
                                <div className="w-8 h-8 rounded-lg bg-[#161A23]/50 flex items-center justify-center border border-white/10 shadow-sm shrink-0">
                                    {cofre.id === 'viaje_familiar' ? <Plane className="w-4 h-4 text-[#ff007f]" /> : <Tent className="w-4 h-4 text-[#ff007f]" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-white leading-tight text-sm truncate w-full" title={cofre.nombreMeta}>{cofre.nombreMeta}</h4>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate w-full">
                                        Meta: {formatMoney(cofre.montoObjetivo)}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-1 flex justify-between items-baseline">
                                <span className="text-lg font-black text-white">{formatMoney(cofre.montoActual)}</span>
                            </div>
                            
                            <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/5 shadow-inner">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${cofre.porcentajeCompletado}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut", type: "spring" }}
                                    className="h-full bg-gradient-to-r from-[#ff007f] to-[#ff4d94] rounded-full relative shadow-[0_0_10px_rgba(255,0,127,0.3)]"
                                >
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Animación Central de Transferencia */}
                <AnimatePresence>
                    {showTransferAnimation && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0, y: 150 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 2, filter: 'blur(10px)' }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
                        >
                            <div className="p-4 bg-gradient-to-tr from-[#06b6d4] to-[#0891b2] rounded-full shadow-[0_0_80px_#06b6d4]">
                                <Coins className="w-12 h-12 text-[#0D0E15]" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
