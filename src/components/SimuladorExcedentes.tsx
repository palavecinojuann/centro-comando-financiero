import React, { useState } from 'react';
import { ShieldCheck, Zap, Coffee, Info, ChevronDown, Calculator, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function SimuladorExcedentes({ 
    excedenteBase = 1638900 
}: { 
    excedenteBase?: number 
}) {
  const esMock = excedenteBase <= 0;
  const excedenteEfectivo = esMock ? 1638900 : excedenteBase;

  const [blindaje, setBlindaje] = useState(0);
  const [deudas, setDeudas] = useState(0);
  const [expansion, setExpansion] = useState(0);
  const [disfrute, setDisfrute] = useState(0);
  const [showDesglose, setShowDesglose] = useState(false);

  const capitalAsignado = blindaje + deudas + expansion + disfrute;
  const capitalSinAsignar = excedenteEfectivo - capitalAsignado;

  const handleSliderChange = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    newValue: number,
    currentValue: number
  ) => {
    const maxPermitido = currentValue + capitalSinAsignar;
    if (newValue > maxPermitido) {
      setter(maxPermitido);
    } else {
      setter(newValue);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value).replace('ARS', '$').trim();
  };

  const META_BLINDAJE = 5000000;
  const META_EXPANSION = 2000000;

  const remanente1 = excedenteEfectivo - blindaje;
  const remanente2 = remanente1 - deudas;

  return (
    <div className="w-full max-w-lg mx-auto glass-premium neumorphic-dark-out p-6 rounded-[2rem] font-sans relative overflow-hidden selection:bg-[#06B6D4]/30 selection:text-white">
        {/* Decoración de fondo (Luces) */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#06B6D4]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
            {/* 1. Cabecera del Simulador */}
            <div className="mb-6 text-center bg-black/20 p-5 rounded-2xl border border-white/5">
                <h2 className="text-white text-base font-black uppercase tracking-widest mb-1 font-serif">Simulador de Distribución</h2>
                {esMock && (
                  <div className="my-2.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[8px] font-black tracking-widest uppercase rounded-lg">
                    ⚠️ MODO DEMO: Carga ingresos y gastos para activar tu flujo real
                  </div>
                )}
                <div className="flex flex-col items-center justify-center my-4">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mb-1 font-sans">Capital Libre Sin Asignar</span>
                    <span className={`text-3xl font-black tracking-tighter transition-colors font-contable ${capitalSinAsignar === 0 ? 'text-[#06B6D4]' : 'text-white'}`}>
                        {formatCurrency(capitalSinAsignar)}
                    </span>
                </div>
                <p className="text-slate-400 italic text-xs font-sans">"Lo que se genera de Janlu hoy se asimila a libertad familiar"</p>
            </div>

            {/* 2. Panel de Sliders (Controles Interactivos) */}
            <div className="space-y-6 mb-6">
                {/* Slider 1: Blindaje (Dorado) */}
                <div className="flex flex-col gap-2 group">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#F1C40F] flex items-center gap-1.5 relative group/tooltip">
                            <ShieldCheck className="w-4 h-4" /> Blindaje
                            <Info size={14} className="text-slate-400 cursor-help" />
                            <div className="absolute bottom-full left-0 mb-2 hidden group-hover/tooltip:block w-48 bg-black border border-white/5 p-2 rounded-lg text-[9px] normal-case tracking-normal z-20 shadow-xl">
                                Fase 1: Toma hasta el 100% del excedente para cubrir 6 meses de gastos vitales.
                            </div>
                        </span>
                        <span className="text-sm font-black text-white font-contable">{formatCurrency(blindaje)}</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max={excedenteEfectivo} 
                        step="1000"
                        value={blindaje}
                        onChange={(e) => handleSliderChange(setBlindaje, Number(e.target.value), blindaje)}
                        className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-[#F1C40F]"
                    />
                </div>

                {/* Slider 2: Deudas (Fucsia) */}
                <div className="flex flex-col gap-2 group">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#D946EF] flex items-center gap-1.5 relative group/tooltip">
                            <Briefcase className="w-4 h-4" /> Deudas
                            <Info size={14} className="text-slate-400 cursor-help" />
                            <div className="absolute bottom-full left-0 mb-2 hidden group-hover/tooltip:block w-48 bg-black border border-white/5 p-2 rounded-lg text-[9px] normal-case tracking-normal z-20 shadow-xl">
                                Fase 2: Ataca tus compromisos de manera agresiva para reducir intereses diarios.
                            </div>
                        </span>
                        <span className="text-sm font-black text-white font-contable">{formatCurrency(deudas)}</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max={excedenteEfectivo} 
                        step="1000"
                        value={deudas}
                        onChange={(e) => handleSliderChange(setDeudas, Number(e.target.value), deudas)}
                        className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-[#D946EF]"
                    />
                </div>

                {/* Slider 3: Expansión Janlu (Cian) */}
                <div className="flex flex-col gap-2 group">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#06B6D4] flex items-center gap-1.5 relative group/tooltip">
                            <Zap className="w-4 h-4" /> Expansión Janlu
                            <Info size={14} className="text-slate-400 cursor-help" />
                            <div className="absolute bottom-full left-0 mb-2 hidden group-hover/tooltip:block w-48 bg-black border border-white/5 p-2 rounded-lg text-[9px] normal-case tracking-normal z-20 shadow-xl">
                                Fase 3: Inyección de capital para acelerar el crecimiento de tu marca.
                            </div>
                        </span>
                        <span className="text-sm font-black text-white font-contable">{formatCurrency(expansion)}</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max={excedenteEfectivo} 
                        step="1000"
                        value={expansion}
                        onChange={(e) => handleSliderChange(setExpansion, Number(e.target.value), expansion)}
                        className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-[#06B6D4]"
                    />
                </div>

                {/* Slider 4: Disfrute (Cian) */}
                <div className="flex flex-col gap-2 group">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300 flex items-center gap-1.5 relative group/tooltip">
                            <Coffee className="w-4 h-4" /> Disfrute
                            <Info size={14} className="text-slate-400 cursor-help" />
                            <div className="absolute bottom-full left-0 mb-2 hidden group-hover/tooltip:block w-48 bg-black border border-white/5 p-2 rounded-lg text-[9px] normal-case tracking-normal z-20 shadow-xl">
                                Fase 3: Fondos liberados para vacaciones o gustos sin culpa.
                            </div>
                        </span>
                        <span className="text-sm font-black text-white font-contable">{formatCurrency(disfrute)}</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max={excedenteEfectivo} 
                        step="1000"
                        value={disfrute}
                        onChange={(e) => handleSliderChange(setDisfrute, Number(e.target.value), disfrute)}
                        className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-[#06B6D4]"
                    />
                </div>
            </div>

            {/* 3. Panel de Transparencia Lógica */}
            <div className="border border-white/5 rounded-2xl bg-black/20 overflow-hidden">
                <button 
                    type="button"
                    onClick={() => setShowDesglose(!showDesglose)}
                    className="w-full px-4 py-4 flex items-center justify-between hover:bg-white/5 transition-colors focus:outline-none cursor-pointer"
                >
                    <div className="flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-[#06B6D4]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Desglose Matemático (Greedy)</span>
                    </div>
                    <motion.div animate={{ rotate: showDesglose ? 180 : 0 }}>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                    </motion.div>
                </button>
                <AnimatePresence>
                    {showDesglose && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-black/40 border-t border-white/5"
                        >
                            <div className="p-4 font-contable text-[10px] text-slate-300 space-y-2">
                                <div className="flex justify-between text-white font-bold border-b border-white/5 pb-2 mb-2">
                                    <span>Paso Inicial: Excedente Total</span>
                                    <span>{formatCurrency(excedenteEfectivo)}</span>
                                </div>
                                <div className="flex justify-between text-[#F1C40F]">
                                    <span>(-) Fase 1 (Blindaje): Restamos</span>
                                    <span>{formatCurrency(blindaje)}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2 mb-2">
                                    <span className="text-slate-400 italic font-sans">↳ Llenando hasta meta de seguridad...</span>
                                </div>
                                <div className="flex justify-between text-white font-bold border-b border-white/5 pb-2 mb-2">
                                    <span>= Saldo Remanente 1</span>
                                    <span>{formatCurrency(remanente1)}</span>
                                </div>
                                <div className="flex justify-between text-[#D946EF]">
                                    <span>(-) Fase 2 (Bola de Nieve): Asignamos</span>
                                    <span>{formatCurrency(deudas)}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2 mb-2">
                                    <span className="text-slate-400 italic font-sans">↳ Priorizando reducción de interés diario...</span>
                                </div>
                                <div className="flex justify-between text-white font-bold border-b border-white/5 pb-2 mb-2">
                                    <span>= Saldo Remanente 2</span>
                                    <span>{formatCurrency(remanente2)}</span>
                                </div>
                                <div className="flex justify-between text-[#06B6D4]">
                                    <span>(-) Fase 3: Expansión Janlu</span>
                                    <span>{formatCurrency(expansion)}</span>
                                </div>
                                <div className="flex justify-between text-[#06B6D4] pb-2 border-b border-white/5 mb-2">
                                    <span>(-) Fase 3: Disfrute Libre</span>
                                    <span>{formatCurrency(disfrute)}</span>
                                </div>
                                <div className="flex justify-between text-white font-bold pt-2">
                                    <span>= Capital Sin Asignar</span>
                                    <span className={capitalSinAsignar === 0 ? "text-[#06B6D4]" : "text-white"}>
                                        {formatCurrency(capitalSinAsignar)}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 4. Cofres de Propósito (Barras de Metas) */}
            <div className="space-y-4 pt-6 border-t border-white/5">
                <h3 className="text-white text-[10px] font-black uppercase tracking-widest mb-4 font-serif">Cofres de Propósito</h3>
                
                {/* Cofre 1: Fondo de Emergencia (Dorado) */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-white text-xs font-black uppercase tracking-wide">🛡️ Fondo de Emergencia</span>
                        <span className="text-[#F1C40F] text-xs font-black font-contable">{(blindaje / META_BLINDAJE * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-[#F1C40F] shadow-[0_0_10px_#F1C40F]"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((blindaje / META_BLINDAJE) * 100, 100)}%` }}
                            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                        />
                    </div>
                    <div className="flex justify-between mt-2.5 text-[9px] text-slate-400 font-black uppercase">
                        <span className="font-contable">Aportado: {formatCurrency(blindaje)}</span>
                        <span className="font-contable">Meta: {formatCurrency(META_BLINDAJE)}</span>
                    </div>
                </div>

                {/* Cofre 2: Showroom Janlu (Cian) */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-white text-xs font-black uppercase tracking-wide">⚡ Showroom Janlu</span>
                        <span className="text-[#06B6D4] text-xs font-black font-contable">{(expansion / META_EXPANSION * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-[#06B6D4] shadow-[0_0_10px_#06B6D4]"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((expansion / META_EXPANSION) * 100, 100)}%` }}
                            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                        />
                    </div>
                    <div className="flex justify-between mt-2.5 text-[9px] text-slate-400 font-black uppercase">
                        <span className="font-contable">Aportado: {formatCurrency(expansion)}</span>
                        <span className="font-contable">Meta: {formatCurrency(META_EXPANSION)}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
