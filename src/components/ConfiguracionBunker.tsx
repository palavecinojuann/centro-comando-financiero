// ConfiguracionBunker.tsx - Panel de Control de Parámetros Maestros // BÚNKER
import React, { useState } from 'react';

interface ConfiguracionProps {
  ingresoBimontActual: number;
  factorInflacionActual: number;
  diaSimuladoActual: number;
  onGuardarParametros: (ingreso: number, inflacion: number, dia: number) => void;
}

export const ConfiguracionBunker: React.FC<ConfiguracionProps> = ({
  ingresoBimontActual,
  factorInflacionActual,
  diaSimuladoActual,
  onGuardarParametros,
}) => {
  // States locales para el formulario de edición
  const [ingreso, setIngreso] = useState<number>(ingresoBimontActual);
  const [inflacion, setInflacion] = useState<number>(factorInflacionActual);
  const [dia, setDia] = useState<number>(diaSimuladoActual);
  const [notificacion, setNotificacion] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Inyección de parámetros hacia el orquestador y persistencia
    onGuardarParametros(ingreso, inflacion, dia);
    
    // Disparar feedback visual Cian Neón
    setNotificacion(true);
    setTimeout(() => setNotificacion(false), 3000);
  };

  return (
    <div className="max-w-md mx-auto bg-[#161A23]/50 backdrop-blur-xl border border-white/10 p-6 rounded-none shadow-2xl relative overflow-hidden">
      {/* Contorno luminoso superior dorado (Alerta/Control de estructura) */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#EAB308]/30 to-transparent" />

      {/* Encabezado Técnico */}
      <div className="mb-6">
        <p className="text-[9px] font-mono tracking-[0.25em] uppercase text-slate-500 font-bold mb-1">
          SISTEMA // CONFIG_PARAMETERS
        </p>
        <h3 className="font-serif text-sm tracking-widest text-white uppercase font-medium">
          Variables del Cimiento Family
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Entrada 1: Ingreso Fijo Bimont */}
        <div>
          <label className="block text-[9px] font-mono tracking-widest text-slate-400 uppercase font-bold mb-1.5">
            Líquido Nominal Bimont S.A. ($)
          </label>
          <input
            type="number"
            value={ingreso}
            onChange={(e) => setIngreso(Number(e.target.value))}
            className="w-full bg-black/40 border border-white/10 p-3 font-mono text-sm text-white focus:outline-none focus:border-[#EAB308] transition-colors"
          />
        </div>

        {/* Entrada 2: Factor de Inflación / Desvío de Canasta */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-[9px] font-mono tracking-widest text-slate-400 uppercase font-bold">
              Coeficiente Inflacionario Real (Multiplier)
            </label>
            <span className="text-[10px] font-mono text-[#EAB308] font-bold">
              {((inflacion - 1) * 100).toFixed(1)}% Desvío
            </span>
          </div>
          <input
            type="number"
            step="0.01"
            min="1.00"
            max="2.00"
            value={inflacion}
            onChange={(e) => setInflacion(Number(e.target.value))}
            className="w-full bg-black/40 border border-white/10 p-3 font-mono text-sm text-[#EAB308] focus:outline-none focus:border-[#EAB308] transition-colors"
          />
        </div>

        {/* Entrada 3: Día de Corte para simulación de Burn Rate */}
        <div>
          <label className="block text-[9px] font-mono tracking-widest text-slate-400 uppercase font-bold mb-1.5">
            Ventana Temporal (Día Actual del Ciclo)
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={dia}
            onChange={(e) => setDia(Number(e.target.value))}
            className="w-full bg-black/40 border border-white/10 p-3 font-mono text-sm text-white focus:outline-none focus:border-[#EAB308] transition-colors"
          />
        </div>

        {/* Estado de Transmisión Exitosa (Cian Neón) */}
        {notificacion && (
          <div className="bg-[#06B6D4]/10 border border-[#06B6D4]/30 p-3 rounded-none text-center transition-all duration-300">
            <p className="text-[10px] font-mono tracking-widest uppercase text-[#06B6D4] font-bold">
              &gt; CONFIG_OVERRIDE: MATRIZ RECALCULADA CON ÉXITO
            </p>
          </div>
        )}

        {/* Botón de Impacto Técnico */}
        <button
          type="submit"
          className="w-full bg-transparent border border-[#EAB308]/30 hover:border-[#EAB308] text-[#EAB308] text-[10px] font-mono tracking-widest uppercase py-3 font-black transition-all duration-300 hover:shadow-[0_0_15px_rgba(234,179,8,0.15)]"
        >
          SURALIMENTAR CORE MATEMÁTICO
        </button>
      </form>
    </div>
  );
};
