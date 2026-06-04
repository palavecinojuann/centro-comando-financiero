import React from 'react';

interface GraficoEstabilidadProps {
  porcentaje?: number;
  sobrante?: number;
}

export function GraficoEstabilidadOndas({ porcentaje = 0, sobrante = 0 }: GraficoEstabilidadProps) {
  // 1. Lógica del Anillo (Tope Visual)
  const isSurplus = porcentaje >= 100;
  const visualPercentage = Math.min(porcentaje, 100);
  
  // Parámetros de la Curva (SVG Arc)
  const radius = 80;
  const strokeWidth = 14;
  const arcLength = Math.PI * radius; // Circunferencia del semicírculo
  const strokeDashoffset = arcLength - (visualPercentage / 100) * arcLength;

  // Formato monetario
  const formatMoney = (val: number) => {
    return Math.abs(val).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  return (
    <div className="bg-[#1A1C23]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-6 font-sans w-full max-w-sm flex flex-col justify-center items-center relative overflow-hidden">
      <span className="text-slate-300 text-xs font-bold uppercase tracking-widest mb-6">
        Medidor de Estabilidad
      </span>

      <div className="relative flex items-center justify-center w-full h-40">
        {/* Curva de Fondo */}
        <svg className="absolute w-full h-full drop-shadow-xl" viewBox="0 0 200 150">
          <path 
            d={`M 20 130 A ${radius} ${radius} 0 0 1 180 130`}
            stroke="rgba(255, 255, 255, 0.05)" 
            strokeWidth={strokeWidth} 
            fill="none" 
            strokeLinecap="round"
          />
          {/* Curva de Progreso */}
          <path 
            d={`M 20 130 A ${radius} ${radius} 0 0 1 180 130`}
            stroke={isSurplus ? "#06B6D4" : "url(#colorGradient)"}
            strokeWidth={strokeWidth} 
            fill="none" 
            strokeDasharray={arcLength} 
            strokeDashoffset={strokeDashoffset} 
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            filter={isSurplus ? "drop-shadow(0px 0px 8px rgba(0,240,255,0.6))" : ""}
          />
          <defs>
             <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#D946EF" />
                <stop offset="100%" stopColor="#8B5CF6" />
             </linearGradient>
          </defs>
        </svg>

        {/* 2. Reemplazo del Texto Central */}
        <div className="absolute top-10 flex flex-col items-center justify-center text-center w-full">
          {isSurplus ? (
            <>
              <span className="text-[#06B6D4]/80 text-[10px] font-black uppercase tracking-widest mb-1 drop-shadow-sm">
                EXCEDENTE A FAVOR
              </span>
              <span className="text-white text-3xl font-black tracking-tighter drop-shadow-md">
                + ${formatMoney(sobrante)}
              </span>
            </>
          ) : (
            <>
              {/* 3. Estados de Déficit */}
              <span className="text-white text-5xl font-black tracking-tighter drop-shadow-md">
                {porcentaje}%
              </span>
              <span className="text-slate-300 text-[10px] uppercase tracking-widest font-bold mt-1">
                Gastos cubiertos
              </span>
            </>
          )}
        </div>
      </div>

      {/* Badge inferior de éxito si se superó o igualó el 100% */}
      {isSurplus && (
        <div className="mt-6 flex items-center justify-center bg-[#06B6D4]/10 border border-[#06B6D4]/30 text-[#06B6D4] px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(0,240,255,0.15)]">
          <span className="text-[10px] font-black uppercase tracking-widest">
            ✓ Mes Asegurado (100%)
          </span>
        </div>
      )}
      
      {/* Espaciador para igualar la altura si no está el badge */}
      {!isSurplus && <div className="mt-6 h-7"></div>}
    </div>
  );
}
