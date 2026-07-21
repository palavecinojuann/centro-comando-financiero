import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingDown, ShieldCheck, AlertTriangle, CalendarDays, CheckCircle2, Lock } from 'lucide-react';
import { MotorEstacionalidad, AlertaEstacional } from '../services/MotorEstacionalidad';

export function WidgetEstacionalidad() {
    const [alerta, setAlerta] = useState<AlertaEstacional | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const motor = new MotorEstacionalidad();
        const alertaDetectada = motor.evaluarEstacionalidad();
        setAlerta(alertaDetectada);
    }, []);

    const handleAprobarReserva = async () => {
        if (!alerta) return;
        setIsSaving(true);
        const motor = new MotorEstacionalidad();
        await motor.simularAprobacionReserva(alerta);
        setIsSaving(false);
        setIsSaved(true);
    };

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (!alerta && !isSaved) return null; // No renderizar si no hay alertas en este momento

    return (
        <div className="bg-[#161A23]/50 backdrop-blur-xl rounded-none p-5 border border-white/10 shadow-lg relative overflow-hidden font-sans">
            {/* Background Grid Neumórfico */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-50" />
            
            <div className="relative z-10 flex items-center gap-3 mb-5 border-b border-white/10 pb-3">
                <div className="p-2 rounded-none bg-[#E5A93B]/20 border border-[#E5A93B]/30 shadow-[0_0_15px_rgba(229, 169, 59, 0.3)]">
                    <TrendingDown className="w-5 h-5 text-[#E5A93B]" />
                </div>
                <div>
                    <h3 className="text-white font-black tracking-tight">Aplanador de Curvas</h3>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-[#E5A93B]">Motor Estacional Activo</p>
                </div>
            </div>

            <div className="min-h-[140px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {!isSaved ? (
                        <motion.div
                            key="alerta_predictiva"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="w-full flex flex-col items-center"
                        >
                            {alerta && (
                                <div className="w-full bg-[#0D0E15]/80 p-5 rounded-none border border-white/10 shadow-inner flex flex-col gap-4">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                                            <CalendarDays className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <div>
                                            <p className="text-white text-sm font-medium leading-relaxed">
                                                Pico de gasto detectado en <span className="font-bold text-amber-400">{alerta.mesesRestantes} meses</span> ({alerta.nombreEvento}).
                                            </p>
                                            <p className="text-gray-400 text-xs mt-1">
                                                Sugerencia: Separar <span className="text-[#E5A93B] font-bold">{formatMoney(alerta.sugerenciaAhorroMensual)}</span> este mes para aplanar la curva.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAprobarReserva}
                                        disabled={isSaving}
                                        className="w-full relative py-3 bg-[#E5A93B] hover:bg-[#0891b2] text-[#0D0E15] rounded-none text-sm font-bold shadow-[0_0_20px_rgba(229, 169, 59, 0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group overflow-hidden"
                                    >
                                        {/* Brillo dinámico en el botón */}
                                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] animate-[shimmer_2.5s_infinite] group-hover:block" />
                                        
                                        {isSaving ? (
                                            <>
                                                <Lock className="w-4 h-4 animate-pulse" />
                                                Bloqueando Fondos...
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck className="w-4 h-4" />
                                                Aprobar Reserva Estacional
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="reserva_exitosa"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="w-full bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-none flex flex-col items-center text-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden"
                        >
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 blur-[40px] rounded-full pointer-events-none" />
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#E5A93B]/20 blur-[40px] rounded-full pointer-events-none" />
                            
                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="text-emerald-400 font-bold text-lg">Curva Aplanada</h4>
                                <p className="text-emerald-500/70 text-xs font-medium uppercase tracking-widest mt-1">
                                    El Punto de Paz de {alerta?.mesObjetivo === 3 ? 'Marzo' : alerta?.mesObjetivo === 12 ? 'Diciembre' : 'Julio'} está asegurado
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
