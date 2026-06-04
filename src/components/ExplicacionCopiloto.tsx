import React from 'react';
import { Bot, AlertTriangle, ShieldAlert, CheckCircle2, TrendingUp } from 'lucide-react';
import { SituacionFinanciera } from '../hooks/useSimuladorEscenarios';

interface ExplicacionCopilotoProps {
    situacionBase: SituacionFinanciera;
}

export function ExplicacionCopiloto({ situacionBase }: ExplicacionCopilotoProps) {
    const balance = situacionBase.ingresosTotales - situacionBase.gastosTotales;
    const esDeficit = balance < 0;

    const observacion = esDeficit 
        ? "El nivel de gastos proyectado para este mes está superando nuestra fuerza de ingresos."
        : "Detecto que tendremos un margen de capital sobrante al finalizar el mes.";

    const impacto = esDeficit
        ? `Faltan $${Math.abs(balance).toLocaleString('es-AR')} para mantener la Estabilidad sin comprometer el capital de emergencia.`
        : `Contamos con un margen seguro de $${balance.toLocaleString('es-AR')} que está inactivo y perdiendo valor.`;

    const accionSugerida = esDeficit
        ? "Recomiendo activar el protocolo Frenar Fugas inmediatamente."
        : "Recomiendo activar el Modo Blindaje o Expansión Patrimonial.";

    const resultadoEsperado = esDeficit
        ? "Así protegemos los compromisos clave (Niveles 1 y 2) cortando gastos prescindibles sin recurrir a deuda."
        : "Lograremos capitalizar ese dinero asegurando el Búnker o acelerando nuestro crecimiento.";

    return (
        <div className="bg-[#161A23]/50 backdrop-blur-md rounded-[2rem] p-6 shadow-[0_0_20px_rgba(112,0,255,0.15)] w-full border border-[#8B5CF6]/30 font-sans relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5CF6]/20 blur-[50px] rounded-full mix-blend-screen pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center border border-[#8B5CF6]/40 text-cyan-300">
                    <Bot className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg tracking-tight flex items-center gap-2">
                        Auditor Cognitivo
                        <span className="bg-[#8B5CF6] px-2 py-0.5 rounded-full text-[10px] uppercase font-black tracking-wider text-white animate-pulse">Online</span>
                    </h3>
                    <p className="text-cyan-300 text-xs font-medium">Análisis Táctico de IA</p>
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                <div className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div>
                        <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest mb-0.5">1. Observación</p>
                        <p className="text-white/90 text-sm font-medium">{observacion}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                        <ShieldAlert className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                        <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest mb-0.5">2. Impacto</p>
                        <p className="text-white/90 text-sm font-medium">{impacto}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-cyan-300" />
                    </div>
                    <div>
                        <p className="text-cyan-300/70 text-[10px] uppercase font-bold tracking-widest mb-0.5">3. Acción Sugerida</p>
                        <p className="text-cyan-300 text-sm font-bold">{accionSugerida}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                        <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest mb-0.5">4. Resultado Esperado</p>
                        <p className="text-white/90 text-sm font-medium">{resultadoEsperado}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
