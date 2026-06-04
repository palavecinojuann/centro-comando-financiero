import React, { useState, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface ProyeccionBovedaProps {
  costoSupervivenciaMensual: number; // Viene calculado dinámicamente desde el FinancialEngine (100% del P.E.)
}

export const ProyeccionBoveda: React.FC<ProyeccionBovedaProps> = ({ costoSupervivenciaMensual = 1200000 }) => {
  // 1. Inputs de control para la simulación del Acelerador
  const [excedenteMensualAcelerador, setExcedenteMensualAcelerador] = useState<number>(300000);
  const [horizonteMeses, setHorizonteMeses] = useState<number>(24);
  const [tasaRetornoAnual, setTasaRetornoAnual] = useState<number>(8); // Simulación de tasa de interés compuesto para resguardo (ej. FCI o MEP)

  // El objetivo técnico de Blindaje son 6 meses del costo de vida indexado del Cimiento
  const objetivoBlindajeTotal = useMemo(() => costoSupervivenciaMensual * 6, [costoSupervivenciaMensual]);

  // 2. Algoritmo de Proyección de Interés Compuesto y Atribución de Fases
  const datosProyeccion = useMemo(() => {
    const datos = [];
    let capitalAcumulado = 0;
    const tasaMensual = (tasaRetornoAnual / 100) / 12;

    for (let mes = 1; mes <= horizonteMeses; mes++) {
      // Aplicación matemática del flujo mensual del Acelerador + rendimiento compuesto
      capitalAcumulado = (capitalAcumulado + excedenteMensualAcelerador) * (1 + tasaMensual);
      
      // Cálculo de cobertura de Blindaje Técnico (Fondo de Emergencia de 6 meses)
      const porcentajeFondoEmergencia = Math.min((capitalAcumulado / objetivoBlindajeTotal) * 100, 100);

      datos.push({
        mes: `Mes ${mes}`,
        Capital: Math.round(capitalAcumulado),
        Blindaje: Math.round(porcentajeFondoEmergencia)
      });
    }
    return datos;
  }, [excedenteMensualAcelerador, horizonteMeses, tasaRetornoAnual, objetivoBlindajeTotal]);

  const capitalFinalSimulado = datosProyeccion[datosProyeccion.length - 1]?.Capital || 0;
  const mesesParaBlindajeCompleto = useMemo(() => {
    const mesIndex = datosProyeccion.findIndex(d => d.Capital >= objetivoBlindajeTotal);
    return mesIndex !== -1 ? mesIndex + 1 : null;
  }, [datosProyeccion, objetivoBlindajeTotal]);

  return (
    <div className="max-w-6xl mx-auto bg-black/40 backdrop-blur-3xl border border-white/10 p-6 md:p-10 rounded-3xl shadow-[0_40px_80px_rgba(0,0,0,0.6)] relative overflow-hidden text-slate-200">
      {/* Contorno luminoso superior Cian Neón (Liquidez / Crecimiento) */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#06B6D4]/30 to-transparent" />
      
      {/* GLOW AMBIENTAL PROYECTADO */}
      <div className="absolute -left-24 -top-24 w-56 h-56 bg-[#06B6D4]/10 blur-[100px] pointer-events-none" />

      {/* Encabezado Técnico */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-10 mb-12 gap-8">
        <div>
          <p className="text-[9px] font-black tracking-[0.4em] uppercase text-[#06B6D4] mb-3 opacity-70">
            FORECAST_ENGINE // FINANCIAL_ACCELERATOR
          </p>
          <h3 className="font-serif text-3xl md:text-5xl tracking-tight text-white uppercase font-black">
            Bóveda Familiar
          </h3>
        </div>
        <div className="mt-4 sm:mt-0 text-left sm:text-right">
          <p className="text-[9px] font-black tracking-[0.3em] text-slate-500 uppercase mb-2">OBJETIVO BLINDAJE TÉCNICO (6M)</p>
          <p className="text-3xl md:text-4xl font-black text-white tracking-tighter font-mono">${objetivoBlindajeTotal.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* COLUMNA DE CONTROLES TÁCTICOS */}
        <div className="space-y-8">
          <div className="bg-[#161a23]/50 border border-white/5 p-8 space-y-8 rounded-3xl backdrop-blur-md shadow-xl">
            <div>
              <label className="block text-[9px] font-black tracking-[0.3em] text-slate-400 uppercase mb-4">
                Inyección Mensual Excedente ($)
              </label>
              <input 
                type="number" 
                step="25000"
                value={excedenteMensualAcelerador || ''} 
                onChange={(e) => setExcedenteMensualAcelerador(Number(e.target.value))}
                className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl font-sans text-base text-white focus:outline-none focus:border-[#06B6D4] transition-all shadow-inner"
              />
            </div>

            <div>
              <div className="flex justify-between text-[9px] font-black tracking-[0.3em] text-slate-400 uppercase mb-4">
                <span>Horizonte Temporal</span>
                <span className="text-[#06B6D4] font-black">{horizonteMeses} Meses</span>
              </div>
              <input 
                type="range" min="6" max="36" step="6"
                value={horizonteMeses} 
                onChange={(e) => setHorizonteMeses(Number(e.target.value))}
                className="w-full accent-[#06B6D4] bg-black/40 h-2 cursor-pointer rounded-full"
              />
            </div>

            <div>
              <label className="block text-[9px] font-black tracking-[0.3em] text-slate-400 uppercase mb-4">
                Rendimiento de Cobertura Anual (%)
              </label>
              <input 
                type="number" 
                value={tasaRetornoAnual} 
                onChange={(e) => setTasaRetornoAnual(Number(e.target.value))}
                className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl font-sans text-base text-[#06B6D4] focus:outline-none focus:border-[#06B6D4] transition-all shadow-inner"
              />
            </div>
          </div>

          {/* VEREDICTO MATRICIAL DE COBERTURA */}
          <div className="bg-[#161A23]/80 border border-[#06B6D4]/20 p-8 rounded-3xl text-sm space-y-4 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10">
                <Sparkles className="w-12 h-12 text-[#06B6D4]" />
            </div>
            <div className="text-[9px] font-black tracking-[0.3em] text-slate-500 uppercase">&gt; ESTATUS DE BÓVEDA PROYECTADO:</div>
            <div className="text-4xl font-black text-[#06B6D4] drop-shadow-[0_0_15px_rgba(6,182,212,0.4)] tracking-tighter font-mono">
              ${capitalFinalSimulado.toLocaleString()}
            </div>
            <p className="text-[13px] text-slate-400 leading-relaxed font-medium">
              {mesesParaBlindajeCompleto 
                ? `✓ Protocolo validado. El búnker alcanzará la estabilidad de Blindaje en el Mes ${mesesParaBlindajeCompleto}.`
                : `⚠ Advertencia: El flujo actual no consolida el Blindaje de seguridad en el horizonte de tiempo simulado.`
              }
            </p>
          </div>
        </div>

        {/* COLUMNA DE GRÁFICO VECTORIAL DE CRECIMIENTO */}
        <div className="lg:col-span-2 bg-[#161a23]/30 border border-white/5 p-8 rounded-3xl relative flex flex-col justify-between shadow-2xl backdrop-blur-md overflow-hidden">
          <p className="text-[9px] font-black tracking-[0.4em] uppercase text-slate-500 mb-8">
            CURVA VECTORIAL // COMPREHENSIVE ASSET GROWTH
          </p>
          
          <div className="h-[400px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={datosProyeccion} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="mes" 
                  stroke="rgba(255,255,255,0.05)" 
                  tick={{ fontFamily: 'Outfit, sans-serif', fontSize: 10, fill: '#64748b', fontWeight: 'bold' }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                   hide 
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'rgba(22, 26, 35, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '24px',
                    backdropFilter: 'blur(15px)',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                    padding: '16px'
                  }}
                  itemStyle={{ fontFamily: 'Outfit, sans-serif', fontSize: '15px', color: '#FFF', fontWeight: 'bold' }}
                  labelStyle={{ fontFamily: 'Cinzel, serif', fontSize: '11px', color: '#06B6D4', marginBottom: '8px', fontWeight: 'black', letterSpacing: '0.1em' }}
                  cursor={{ stroke: '#06B6D4', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="Capital" stroke="#06B6D4" strokeWidth={5} fillOpacity={1} fill="url(#colorCapital)" animationDuration={3000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center mt-10">
            <span className="text-[8px] font-black tracking-[0.5em] uppercase text-slate-600 opacity-60">
              [ ÁREA COMPUESTA RECALCULADA SEGÚN EL RITMO DIARIO ]
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
