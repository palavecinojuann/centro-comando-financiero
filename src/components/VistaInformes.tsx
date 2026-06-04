import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Calendar, Filter } from 'lucide-react';

interface VistaInformesProps {
  gastos: any[];
}

export function VistaInformes({ gastos }: VistaInformesProps) {
  const [fechaInicio, setFechaInicio] = useState('2026-06-01');
  const [fechaFin, setFechaFin] = useState('2026-06-30');

  // 1. Agrupar gastos por categoría
  const categoriasMap = new Map<string, number>();
  let totalGastado = 0;

  gastos.forEach(g => {
    const f = new Date(g.fecha);
    const ini = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (f >= ini && f <= fin) {
      const cat = g.categoria || 'Varios';
      const monto = g.monto || 0;
      totalGastado += monto;
      categoriasMap.set(cat, (categoriasMap.get(cat) || 0) + monto);
    }
  });

  // Si no hay datos, creamos unos datos mock realistas del bunker como fallback para la demostración
  const data = categoriasMap.size > 0 
    ? Array.from(categoriasMap.entries()).map(([name, value]) => ({ name, value }))
    : [
        { name: 'Ropa', value: 7000 },
        { name: 'Deudas', value: 5000 },
        { name: 'Formación', value: 2000 },
        { name: 'Casa', value: 1000 },
        { name: 'Vehículo', value: 1000 },
        { name: 'Gastos en servicios', value: 600 }
      ];

  if (totalGastado === 0) {
    totalGastado = data.reduce((sum, item) => sum + item.value, 0);
  }

  // Colores de acento inspirados en la referencia
  const COLORS = ['#00E5FF', '#FFD500', '#FF007F', '#10B981', '#8B5CF6', '#F59E0B', '#3B82F6'];

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="flex flex-col h-full font-sans select-none pb-12 animate-in fade-in duration-300">
      
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-6 px-4">
        <div>
          <h3 className="text-white text-lg font-sans font-black uppercase tracking-widest">Gastos</h3>
          <p className="text-[9px] font-mono text-bunker-mutado uppercase tracking-widest">// DISTRIBUCIÓN POR DOUGHNUT CHART</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 border border-white/5 bg-bunker-panel hover:bg-white/5 rounded-xl text-bunker-mutado hover:text-white transition-all cursor-pointer">
            <Filter className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Date Picker de Rango */}
      <div className="px-4 mb-8">
        <div className="flex items-center justify-between p-3.5 bg-black/40 border border-white/5 rounded-2xl text-[10px] font-mono text-white/70">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#00E5FF]" />
            <input 
              type="date" 
              value={fechaInicio} 
              onChange={(e) => setFechaInicio(e.target.value)}
              className="bg-transparent text-white font-mono focus:outline-none cursor-pointer text-center"
            />
          </div>
          <span className="text-bunker-mutado px-2">hasta</span>
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={fechaFin} 
              onChange={(e) => setFechaFin(e.target.value)}
              className="bg-transparent text-white font-mono focus:outline-none cursor-pointer text-center"
            />
          </div>
        </div>
      </div>

      {/* Gráfico de Dona */}
      <div className="flex justify-center items-center h-52 mb-8 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Texto interno de la Dona */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-white text-base font-black tracking-tight">{formatMoney(totalGastado)}</span>
          <span className="text-bunker-mutado text-[8px] font-mono tracking-widest uppercase mt-0.5">Gastos</span>
        </div>
      </div>

      {/* Leyenda de Categorías de Gastos */}
      <div className="px-4">
        <section className="bg-bunker-panel/40 border border-white/5 p-5 rounded-3xl backdrop-blur-xl">
          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white">Detalle de Categorías</span>
            <span className="text-[8px] font-mono text-bunker-mutado uppercase tracking-widest">// LEYENDA MOCK</span>
          </div>

          <div className="space-y-3.5">
            {data.map((item, idx) => {
              const color = COLORS[idx % COLORS.length];
              const pct = ((item.value / totalGastado) * 100).toFixed(0);
              return (
                <div key={item.name} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3">
                    {/* Caja de color */}
                    <div className="w-3 h-3 rounded-md shadow-sm" style={{ backgroundColor: color }} />
                    <span className="text-white font-bold tracking-wide uppercase text-[10px]">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-bunker-mutado text-[10px]">{pct}%</span>
                    <span className="text-white font-black font-sans">{formatMoney(item.value)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

    </div>
  );
}
