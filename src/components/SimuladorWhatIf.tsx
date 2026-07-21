import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Beaker, TrendingUp, TrendingDown, AlertTriangle, ShieldCheck, Zap, Activity } from 'lucide-react';

const AnimatedCounter = ({ from, to, isDanger }: { from: number, to: number, isDanger: boolean }) => {
  const [displayValue, setDisplayValue] = useState(from);

  useEffect(() => {
    let startTime: number;
    const duration = 1200; 

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const noise = progress < 1 ? (Math.random() * 20 - 10) : 0;
      let currentValue = from + (to - from) * easeProgress + noise;
      currentValue = Math.max(0, Math.min(100, currentValue));

      if (progress < 1) {
        setDisplayValue(Math.round(currentValue));
        requestAnimationFrame(step);
      } else {
        setDisplayValue(to);
      }
    };

    requestAnimationFrame(step);
  }, [from, to]);

  const getColorClass = () => {
    if (isDanger) return "text-[#D946EF]";
    if (displayValue >= 90) return "text-[#E5A93B]";
    if (displayValue >= 70) return "text-white";
    return "text-slate-400";
  };

  return (
    <div className="relative">
      <span className={`text-4xl md:text-5xl font-contable font-black tracking-tighter ${getColorClass()}`}>
        {displayValue}%
      </span>
    </div>
  );
};

export function SimuladorWhatIf({ puntoEstabilidad }: { puntoEstabilidad?: number }) {
  const [ventasJanlu, setVentasJanlu] = useState(0);
  const [costoLogistica, setCostoLogistica] = useState(0);
  const [inflacion, setInflacion] = useState(0);

  const [simulating, setSimulating] = useState(false);

  // Calcular probabilidades base dinámicamente según el Punto de Estabilidad real (con fallback a 100% si no viene)
  const peRef = puntoEstabilidad !== undefined && puntoEstabilidad > 0 ? puntoEstabilidad : 100;
  
  const baseCorto = Math.round(Math.min(100, Math.max(10, peRef)));
  const baseMedio = Math.round(Math.min(100, Math.max(5, peRef * 0.85)));
  const baseLargo = Math.round(Math.min(100, Math.max(2, peRef * 0.70)));

  const [probCorto, setProbCorto] = useState(baseCorto);
  const [probMedio, setProbMedio] = useState(baseMedio);
  const [probLargo, setProbLargo] = useState(baseLargo);

  // Previous to trigger animations
  const [prevCorto, setPrevCorto] = useState(baseCorto);
  const [prevMedio, setPrevMedio] = useState(baseMedio);
  const [prevLargo, setPrevLargo] = useState(baseLargo);

  useEffect(() => {
    setProbCorto(baseCorto);
    setProbMedio(baseMedio);
    setProbLargo(baseLargo);
    setPrevCorto(baseCorto);
    setPrevMedio(baseMedio);
    setPrevLargo(baseLargo);
  }, [baseCorto, baseMedio, baseLargo]);

  // Simulate Engine
  const runSimulation = () => {
    setSimulating(true);

    // Save previous
    setPrevCorto(probCorto);
    setPrevMedio(probMedio);
    setPrevLargo(probLargo);

    // Calculate new probabilities based on inputs
    const impactVentasCorto = (ventasJanlu / 100) * 10;
    const impactVentasMedio = (ventasJanlu / 100) * 25;
    const impactVentasLargo = (ventasJanlu / 100) * 40;

    const impactLogisticaCorto = -(costoLogistica / 150) * 15;
    const impactLogisticaMedio = -(costoLogistica / 150) * 20;
    const impactLogisticaLargo = -(costoLogistica / 150) * 10;

    const impactInflacionCorto = -(inflacion / 30) * 15;
    const impactInflacionMedio = -(inflacion / 30) * 25;
    const impactInflacionLargo = -(inflacion / 30) * 35;

    let newCorto = Math.round(baseCorto + impactVentasCorto + impactLogisticaCorto + impactInflacionCorto);
    let newMedio = Math.round(baseMedio + impactVentasMedio + impactLogisticaMedio + impactInflacionMedio);
    let newLargo = Math.round(baseLargo + impactVentasLargo + impactLogisticaLargo + impactInflacionLargo);

    newCorto = Math.max(0, Math.min(100, newCorto));
    newMedio = Math.max(0, Math.min(100, newMedio));
    newLargo = Math.max(0, Math.min(100, newLargo));

    setProbCorto(newCorto);
    setProbMedio(newMedio);
    setProbLargo(newLargo);

    setTimeout(() => setSimulating(false), 1200);
  };

  return (
    <div className="glass-premium neumorphic-dark-out p-6 lg:p-8 rounded-3xl relative overflow-hidden selection:bg-[#8B5CF6]/30 selection:text-white">
      {/* Ambience background glow */}
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-[#8B5CF6]/10 opacity-30 blur-[100px]" />

      <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start mb-8 border-b border-white/5 pb-6">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] text-[9px] font-black tracking-widest uppercase mb-4 border border-[#8B5CF6]/20">
            <Beaker className="w-3.5 h-3.5" /> Laboratorio de Escenarios
          </div>
          <h2 className="text-2xl font-black text-white leading-tight uppercase font-serif">
            Motor de Simulación <span className="text-[#8B5CF6] text-gradient-violet">Monte Carlo</span>
          </h2>
          <p className="text-slate-400 text-xs mt-3 leading-relaxed max-w-xl font-sans">
            Proyecta miles de futuros posibles alterando las variables de estrés sistémico. Modifica los escenarios para medir la resiliencia del Punto de Paz y el Fondo de Blindaje.
          </p>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sliders Panel */}
        <div className="lg:col-span-5 bg-white/5 p-6 rounded-[2rem] border border-white/5 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-4 h-4 text-[#8B5CF6]" />
            <h3 className="text-xs uppercase tracking-widest font-black text-white font-serif">Variables de Estrés</h3>
          </div>

          <div className="space-y-8 font-sans">
            {/* Ventas Janlu */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-black uppercase text-slate-400 flex items-center gap-1.5">
                  Ventas Janlu Velas <Zap className="w-3.5 h-3.5 text-[#E5A93B]" />
                </label>
                <span className={`text-xs font-black font-contable ${ventasJanlu >= 0 ? 'text-[#E5A93B]' : 'text-[#D946EF]'}`}>
                  {ventasJanlu > 0 ? '+' : ''}{ventasJanlu}%
                </span>
              </div>
              <input 
                type="range" 
                min="-50" 
                max="200" 
                value={ventasJanlu}
                onChange={(e) => setVentasJanlu(Number(e.target.value))}
                onMouseUp={runSimulation}
                onTouchEnd={runSimulation}
                className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-[#E5A93B]"
              />
              <div className="flex justify-between mt-2.5 text-[8px] text-slate-400 uppercase tracking-widest font-black">
                <span>Caída Fuerte</span>
                <span>Estable</span>
                <span>Escalamiento</span>
              </div>
            </div>

            {/* Costos Logísticos */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-black uppercase text-slate-400 flex items-center gap-1.5">
                  Costos de Logística <AlertTriangle className="w-3.5 h-3.5 text-[#F1C40F]" />
                </label>
                <span className="text-xs font-black font-contable text-white">
                  +{costoLogistica}%
                </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="150" 
                value={costoLogistica}
                onChange={(e) => setCostoLogistica(Number(e.target.value))}
                onMouseUp={runSimulation}
                onTouchEnd={runSimulation}
                className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-[#F1C40F]"
              />
            </div>

            {/* Inflación */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-black uppercase text-slate-400 flex items-center gap-1.5">
                  Inflación Proyectada <TrendingDown className="w-3.5 h-3.5 text-[#D946EF]" />
                </label>
                <span className="text-xs font-black font-contable text-white">
                  {inflacion}%
                </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="30" 
                value={inflacion}
                onChange={(e) => setInflacion(Number(e.target.value))}
                onMouseUp={runSimulation}
                onTouchEnd={runSimulation}
                className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-[#D946EF]"
              />
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-7 bg-white/5 p-6 rounded-[2rem] border border-white/5 shadow-2xl flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-8">
            <ShieldCheck className="w-4 h-4 text-[#8B5CF6]" />
            <h3 className="text-xs uppercase tracking-widest font-black text-white font-serif">Proyección de Supervivencia</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
            {/* Corto Plazo */}
            <motion.div 
              className={`p-6 rounded-2xl border transition-all ${probCorto < 80 ? 'bg-[#D946EF]/5 border-[#D946EF]/20' : 'bg-black/20 border-white/5'}`}
              animate={simulating ? { scale: [1, 1.03, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <div className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">6 Meses</div>
              <h4 className="text-white font-black text-xs uppercase tracking-wider mb-4">Corto Plazo</h4>
              <AnimatedCounter from={prevCorto} to={probCorto} isDanger={probCorto < 80} />
              <div className="mt-4 flex items-center gap-2">
                {probCorto < 80 ? (
                  <span className="text-[8px] text-[#D946EF] flex items-center gap-1 font-black uppercase tracking-wide bg-[#D946EF]/10 px-2.5 py-1 rounded border border-[#D946EF]/20">
                    ⚠️ Riesgo P.E.
                  </span>
                ) : (
                  <span className="text-[8px] text-[#E5A93B] flex items-center gap-1 font-black uppercase tracking-wide bg-[#E5A93B]/10 px-2.5 py-1 rounded border border-[#E5A93B]/20">
                    🛡️ Blindado
                  </span>
                )}
              </div>
            </motion.div>

            {/* Mediano Plazo */}
            <motion.div 
              className="p-6 rounded-2xl bg-black/20 border border-white/5"
              animate={simulating ? { scale: [1, 1.03, 1] } : {}}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">12 Meses</div>
              <h4 className="text-white font-black text-xs uppercase tracking-wider mb-4">Mediano Plazo</h4>
              <AnimatedCounter from={prevMedio} to={probMedio} isDanger={false} />
            </motion.div>

            {/* Largo Plazo */}
            <motion.div 
              className="p-6 rounded-2xl bg-black/20 border border-white/5"
              animate={simulating ? { scale: [1, 1.03, 1] } : {}}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">24 Meses</div>
              <h4 className="text-white font-black text-xs uppercase tracking-wider mb-4">Largo Plazo</h4>
              <AnimatedCounter from={prevLargo} to={probLargo} isDanger={false} />
            </motion.div>
          </div>
          
          {probCorto < 80 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-xl bg-[#D946EF]/10 border border-[#D946EF]/20 flex items-start gap-3 font-sans"
            >
              <AlertTriangle className="w-5 h-5 text-[#D946EF] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#D946EF] leading-relaxed font-black uppercase tracking-wide">
                El Punto de Estabilidad a corto plazo se proyecta por debajo del 80%. Se recomienda recortar gastos del Modo Disfrute y consolidar ahorro de seguridad inmediatamente.
              </p>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}

