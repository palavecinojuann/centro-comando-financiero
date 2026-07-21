// AnalisisFlujos.tsx - Panel de Auditoría Visual de Flujos // BÚNKER
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Gasto } from '../services/motores/FinancialEngine';
import { FlujoCapitalSankey } from './FlujoCapitalSankey';

interface AnalisisFlujosProps {
  gastos: Gasto[];
  bimont?: number;
  janlu?: number;
  vitales?: number;
  variables?: number;
  excedente?: number;
}

export const AnalisisFlujos: React.FC<AnalisisFlujosProps> = ({ 
  gastos,
  bimont = 0,
  janlu = 0,
  vitales = 0,
  variables = 0,
  excedente = 0
}) => {
  
  // 1. Procesamiento y Clasificación de Datos en tiempo de ejecución
  const datosDistribucionCajas = React.useMemo(() => {
    let totalCimiento = 0;   // Niveles 1 y 2 (Sostenimiento / Supervivencia)
    let totalAcelerador = 0; // Niveles 3, 4 y 5 (Variables / Disfrute / Expansión)

    gastos.forEach(g => {
      if (g.nivel === 1 || g.nivel === 2) {
        // Si es estacional, visualizamos su impacto mensualizado prorrateado
        totalCimiento += g.esEstacional && g.mesesProrrateo ? g.monto / g.mesesProrrateo : g.monto;
      } else {
        totalAcelerador += g.monto;
      }
    });

    return [
      { name: 'SISTEMA CIMIENTO (🛡️)', value: totalCimiento, color: '#EAB308' },     // Dorado Imperial
      { name: 'VECTORES ACELERADOR (🚀)', value: totalAcelerador, color: '#E5A93B' } // Cian Neón
    ];
  }, [gastos]);

  const datosPorNivel = React.useMemo(() => {
    const nivelesMap: { [key: string]: number } = { 'N5': 0, 'N4': 0, 'N3': 0, 'N2': 0, 'N1': 0 };
    
    gastos.forEach(g => {
      const clave = `N${g.nivel}`;
      const montoEfectivo = g.esEstacional && g.mesesProrrateo ? g.monto / g.mesesProrrateo : g.monto;
      if (nivelesMap[clave] !== undefined) {
        nivelesMap[clave] += montoEfectivo;
      }
    });

    return Object.keys(nivelesMap).map(k => ({
      nivel: k,
      Monto: nivelesMap[k],
      // Color dinámico según la criticidad del nivel (N1 y N2 en Dorado, N3 en Fucsia, N4 y N5 en Cian)
      fill: k === 'N1' || k === 'N2' ? '#EAB308' : k === 'N3' ? '#D946EF' : '#E5A93B'
    })).reverse(); // Ordenar de N1 a N5
  }, [gastos]);

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 w-full mt-8">
      
      {/* GRÁFICO 1: DISTRIBUCIÓN ABSOLUTA DE CAJAS (GLASSMORPHISM PIE) */}
      <div className="bg-[#161A23]/60 backdrop-blur-xl border border-white/10 p-4 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden w-full">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#E5A93B]/40 to-transparent" />
        
        <div className="mb-6 border-b border-white/5 pb-6">
          <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-[#E5A93B] font-black mb-2">VISUAL_MATRIX // CORE_SPLIT</p>
          <h4 className="font-serif text-2xl tracking-normal text-white uppercase font-bold">Segmentación Bi-Flujo</h4>
        </div>

        <div className="h-72 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={datosDistribucionCajas}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={95}
                paddingAngle={6}
                dataKey="value"
                stroke="none"
              >
                {datosDistribucionCajas.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#161A23', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '20px',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}
                itemStyle={{ fontFamily: 'Outfit, sans-serif', fontSize: '13px', color: '#FFF' }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Valor central destacado */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[8px] font-sans tracking-[0.3em] uppercase text-slate-500 font-black">ESTRUCTURA</span>
            <span className="text-xl font-serif font-bold text-white">EQUILIBRA</span>
          </div>
        </div>

        {/* Leyenda Técnica Refinada */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 mt-6 font-sans text-[11px] tracking-tight font-medium">
          {datosDistribucionCajas.map((d, i) => (
            <div key={i} className="flex items-center gap-3 bg-black/20 px-4 py-2 rounded-xl border border-white/5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color, boxShadow: `0 0 10px ${d.color}60` }} />
              <span className="text-slate-400 uppercase tracking-widest text-[9px] font-black">{d.name.split(' ')[1]}:</span>
              <span className="text-white font-black">${d.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* GRÁFICO 2: CARGA ASIGNADA POR ESCALAFÓN DE PRIORIDAD (BARCHART) */}
      <div className="bg-[#161A23]/60 backdrop-blur-xl border border-white/10 p-4 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden w-full">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#8B5CF6]/40 to-transparent" />
        
        <div className="mb-6 border-b border-white/5 pb-6">
          <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-[#8B5CF6] font-black mb-2">CRITIC_LEVEL // BREAKDOWN</p>
          <h4 className="font-serif text-2xl tracking-normal text-white uppercase font-bold">Asignación por Niveles</h4>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datosPorNivel} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="nivel" 
                stroke="rgba(255,255,255,0.1)" 
                tick={{ fontFamily: 'Outfit, sans-serif', fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.1)" 
                tick={{ fontFamily: 'Outfit, sans-serif', fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `$${val > 999 ? (val/1000).toFixed(1) + 'k' : val}`}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                contentStyle={{ 
                  backgroundColor: '#161A23', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '20px',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}
                itemStyle={{ fontFamily: 'Outfit, sans-serif', fontSize: '13px', color: '#FFF' }}
              />
              <Bar dataKey="Monto" radius={[6, 6, 0, 0]} barSize={32}>
                {datosPorNivel.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Label aclaratorio técnico */}
        <div className="text-center mt-6">
          <span className="text-[9px] font-sans tracking-[0.3em] uppercase text-slate-500 font-black opacity-60">
            [ N1/N2: SEGURIDAD CRÍTICA (DORADO) // N3-N5: VECTORES VARIABLES (PÚRPURA) ]
          </span>
        </div>
      </div>

      {/* DIAGRAMA SANKEY DE FLUJO DE CAPITAL (GLASSMORPHISM DE ANCHO COMPLETO) */}
      <div className="col-span-1 md:col-span-2 bg-[#161A23]/60 backdrop-blur-xl border border-white/10 p-4 md:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden w-full">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#E5A93B]/40 to-transparent" />
        
        <div className="mb-6 border-b border-white/5 pb-6">
          <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-[#E5A93B] font-black mb-2">VECTOR_FLUIDS // SANKEY_FLOW</p>
          <h4 className="font-serif text-2xl tracking-normal text-white uppercase font-bold">Mapa de Caudales Financieros</h4>
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/5">
          <FlujoCapitalSankey 
            bimont={bimont}
            janlu={janlu}
            vitales={vitales}
            variables={variables}
            excedente={excedente}
          />
        </div>
      </div>

    </div>
  );
};
