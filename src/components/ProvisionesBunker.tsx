// ProvisionesBunker.tsx - Amortización de Curvas Estacionales // BÚNKER
import React, { useMemo } from 'react';
import { Gasto } from '../services/motores/FinancialEngine';

interface ProvisionesBunkerProps {
  gastos: Gasto[];
}

export const ProvisionesBunker: React.FC<ProvisionesBunkerProps> = ({ gastos }) => {
  
  // 1. Filtrar y procesar únicamente los egresos marcados como estacionales
  const provisionesActivas = useMemo(() => {
    return gastos
      .filter(g => g.esEstacional && g.mesesProrrateo && g.mesesProrrateo > 0)
      .map(g => {
        const cuotaMensual = g.monto / (g.mesesProrrateo || 12);
        return {
          id: g.id,
          descripcion: g.descripcion,
          montoTotal: g.monto,
          cuotaMensual: cuotaMensual,
          ciclo: g.mesesProrrateo
        };
      });
  }, [gastos]);

  // 2. Sumatoria total del fondo de reserva que debe retener el Cimiento por mes
  const totalRetencionMensual = useMemo(() => {
    return provisionesActivas.reduce((sum, p) => sum + p.cuotaMensual, 0);
  }, [provisionesActivas]);

  return (
    <div className="max-w-6xl w-full mx-auto bg-[#161A23]/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden text-slate-200 mt-8">
      {/* Contorno luminoso superior (Dorado Estabilidad para fondos de reserva) */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#EAB308]/40 to-transparent" />

      {/* Encabezado de Auditoría Estacional */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-6 mb-8">
        <div>
          <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-slate-500 font-black mb-2">
            AMORTIZATION // SEASONAL_FLOWS
          </p>
          <h3 className="font-serif text-2xl tracking-normal text-white uppercase font-bold">
            Fondo de Provisiones Estacionales
          </h3>
        </div>
        <div className="mt-4 sm:mt-0 bg-[#EAB308]/10 border border-[#EAB308]/20 px-6 py-4 rounded-2xl text-right shadow-lg">
          <p className="text-[9px] font-sans tracking-widest text-[#EAB308] uppercase font-black">RETENCIÓN REQUERIDA</p>
          <p className="font-sans text-2xl font-black text-[#EAB308] drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]">
            ${totalRetencionMensual.toLocaleString()}/mes
          </p>
        </div>
      </div>

      {/* Alerta de Retención Forzosa */}
      {totalRetencionMensual > 0 && (
        <div className="bg-black/30 border border-white/5 p-6 rounded-2xl font-sans text-xs text-slate-400 mb-8 leading-relaxed shadow-inner">
          <span className="text-[#EAB308] font-black uppercase tracking-widest mr-2">[ REGLA DE AMORTIZACIÓN ]</span> 
          El Core Lógico está descontando automáticamente <span className="text-white font-black">${totalRetencionMensual.toLocaleString()}</span> del ingreso de Bimont antes de calcular la liquidez libre. Este capital se acumula en un sub-fondo virtual para absorber picos anuales.
        </div>
      )}

      {/* Matriz de Gastos Prorrateados */}
      <div className="space-y-6">
        <p className="text-[10px] font-sans tracking-widest uppercase text-slate-500 font-black flex items-center gap-2 mb-4">
          <span className="w-4 h-[1px] bg-slate-700"></span>
          LÍNEA DE PASIVOS ANUALIZADOS EN ABSORCIÓN
        </p>

        {provisionesActivas.length === 0 ? (
          <div className="border border-dashed border-white/10 p-12 rounded-3xl text-center text-xs text-slate-500 font-sans tracking-widest uppercase opacity-40">
            NO SE DETECTAN IMPACTOS ESTACIONALES ACTIVOS EN EL CIMIENTO.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {provisionesActivas.map((p) => (
              <div 
                key={p.id} 
                className="group bg-black/20 border border-white/5 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300 hover:bg-white/5 hover:border-white/10"
              >
                <div>
                  <h5 className="text-sm font-bold text-white uppercase font-sans tracking-wide group-hover:text-[#EAB308] transition-colors">{p.descripcion}</h5>
                  <p className="text-[11px] text-slate-500 font-sans mt-1">
                    Impacto Total: <span className="text-slate-300 font-bold">${p.montoTotal.toLocaleString()}</span> // Ciclo: <span className="text-slate-300 font-bold">{p.ciclo} meses</span>
                  </p>
                </div>
                <div className="text-left sm:text-right font-sans">
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1 opacity-60">CARGA VIRTUAL</p>
                  <p className="text-lg font-black text-slate-100 group-hover:scale-105 transition-transform">
                    +${p.cuotaMensual.toLocaleString()}/mes
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
