import React from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis } from 'recharts';
import { Coffee, Shield, Home, BookOpen, Car, Zap, Coins, Briefcase, Gift, Settings } from 'lucide-react';

interface VistaPresupuestoProps {
  gastos: any[];
  ingresosBimont: number;
  janluMesActual: number;
}

export function VistaPresupuesto({ gastos, ingresosBimont, janluMesActual }: VistaPresupuestoProps) {
  
  // 1. Calcular consumos reales por categorías para Gastos
  const totalPorCategoria = (cat: string) => {
    return gastos
      .filter(g => g.categoria === cat || g.referencia?.toLowerCase().includes(cat.toLowerCase()))
      .reduce((sum, g) => sum + g.monto, 0);
  };

  const deudasVal = totalPorCategoria('Deuda') || totalPorCategoria('Cuotas');
  const ropaVal = totalPorCategoria('Ropa') || totalPorCategoria('Shopping');
  const casaVal = totalPorCategoria('Casa') || totalPorCategoria('Alquiler') || totalPorCategoria('Supermercado');
  const formacionVal = totalPorCategoria('Formación') || totalPorCategoria('Colegio') || totalPorCategoria('Estudio');
  const cafeVal = totalPorCategoria('Café') || totalPorCategoria('Salidas') || totalPorCategoria('Disfrute');
  const vehiculoVal = totalPorCategoria('Vehículo') || totalPorCategoria('Nafta') || totalPorCategoria('Auto');
  const serviciosVal = totalPorCategoria('Servicios') || totalPorCategoria('Luz') || totalPorCategoria('Gas') || totalPorCategoria('Internet');

  const totalGastosReal = deudasVal + ropaVal + casaVal + formacionVal + cafeVal + vehiculoVal + serviciosVal;
  const totalIngresosReal = ingresosBimont + janluMesActual;

  // Categorías de gastos con sus iconos circulares y límites
  const categoriasGastos = [
    { id: 'g1', nombre: 'Deudas', valor: deudasVal || 10000, limite: 25000, icono: <Shield className="w-5 h-5 text-red-400" /> },
    { id: 'g2', nombre: 'Ropa', valor: ropaVal || 7000, limite: 15000, icono: <Coins className="w-5 h-5 text-indigo-400" /> },
    { id: 'g3', nombre: 'Casa', valor: casaVal || 6500, limite: 30000, icono: <Home className="w-5 h-5 text-emerald-400" /> },
    { id: 'g4', nombre: 'Formación', valor: formacionVal || 5000, limite: 10000, icono: <BookOpen className="w-5 h-5 text-blue-400" /> },
    { id: 'g5', nombre: 'Café', valor: cafeVal || 4500, limite: 8000, icono: <Coffee className="w-5 h-5 text-amber-400" /> },
    { id: 'g6', nombre: 'Vehículo', valor: vehiculoVal || 1000, limite: 12000, icono: <Car className="w-5 h-5 text-cyan-400" /> },
    { id: 'g7', nombre: 'Servicios', valor: serviciosVal || 800, limite: 15000, icono: <Zap className="w-5 h-5 text-purple-400" /> }
  ];

  const categoriasIngresos = [
    { id: 'i1', nombre: 'Sueldo', valor: ingresosBimont || 45000, icono: <Briefcase className="w-5 h-5 text-[#00E5FF]" /> },
    { id: 'i2', nombre: 'Regalos', valor: 25000, icono: <Gift className="w-5 h-5 text-amber-400" /> },
    { id: 'i3', nombre: 'Janlu Bridge', valor: janluMesActual || 20000, icono: <Coins className="w-5 h-5 text-emerald-400" /> }
  ];

  // Datos de minigráfico diario de gastos
  const mockDailyData = [
    { day: '1', amount: 1500 },
    { day: '5', amount: 3500 },
    { day: '10', amount: 1200 },
    { day: '15', amount: 8000 },
    { day: '20', amount: 4500 },
    { day: '25', amount: 2000 },
    { day: '30', amount: 6000 }
  ];

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
          <h3 className="text-white text-lg font-sans font-black uppercase tracking-widest">Presupuesto</h3>
          <p className="text-[9px] font-mono text-bunker-mutado uppercase tracking-widest">// PLANIFICACIÓN MENDSUAL POR CATEGORÍAS</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-bunker-panel border border-white/5 text-[9px] text-white font-black uppercase tracking-widest font-sans rounded-xl px-2 py-1 focus:outline-none cursor-pointer">
            <option>Junio 2026</option>
            <option>Julio 2026</option>
          </select>
          <button className="p-1 text-bunker-mutado hover:text-white" title="Configurar límites">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mini Gráfico de Barras */}
      <div className="px-4 mb-6">
        <div className="bg-black/30 border border-white/5 p-4 rounded-3xl h-24 relative overflow-hidden flex flex-col justify-end">
          <div className="absolute top-2 left-4 text-[8px] font-mono tracking-widest text-bunker-mutado uppercase font-black">// HISTORIAL DIARIO DE CAUDALES</div>
          <div className="w-full h-12">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockDailyData}>
                <Bar dataKey="amount" fill="#00E5FF" radius={[2, 2, 0, 0]} />
                <XAxis dataKey="day" hide />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="space-y-8 px-2">
        
        {/* SECCIÓN GASTOS - ICONOS CIRCULARES */}
        <section className="bg-bunker-panel/40 border border-white/5 p-5 rounded-3xl backdrop-blur-xl">
          <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white">Gastos Presupuestados</span>
            <span className="text-[10px] font-black text-white/50 font-sans">{formatMoney(totalGastosReal)} / Limitado</span>
          </div>

          {/* Grid de círculos */}
          <div className="grid grid-cols-4 gap-y-6 gap-x-2">
            {categoriasGastos.map(cat => {
              const ratio = Math.min(100, (cat.valor / cat.limite) * 100);
              return (
                <div key={cat.id} className="flex flex-col items-center text-center gap-1.5">
                  {/* Círculo indicador con borde progresivo */}
                  <div className="relative w-14 h-14 rounded-full bg-black/45 border border-white/5 flex items-center justify-center hover:border-[#00E5FF]/20 transition-all cursor-pointer shadow-lg">
                    {/* Ring indicador de porcentaje */}
                    <div 
                      className="absolute inset-0.5 rounded-full border border-dashed border-[#00E5FF]/10" 
                      style={{ transform: `rotate(${ratio * 3.6}deg)` }}
                    />
                    {cat.icono}
                    {/* Badge de porcentaje */}
                    <div className="absolute -bottom-1.5 bg-black border border-white/10 px-1 py-0.5 rounded-md text-[7px] font-black font-mono text-white">
                      {ratio.toFixed(0)}%
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-0.5 mt-1">
                    <span className="text-white text-[8px] font-black uppercase tracking-wider truncate max-w-[65px]">{cat.nombre}</span>
                    <span className="text-bunker-mutado text-[7px] font-mono">{formatMoney(cat.valor)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECCIÓN INGRESOS - ICONOS CIRCULARES */}
        <section className="bg-bunker-panel/40 border border-white/5 p-5 rounded-3xl backdrop-blur-xl">
          <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white">Ingresos Presupuestados</span>
            <span className="text-[10px] font-black text-[#00E5FF] font-sans">{formatMoney(totalIngresosReal)}</span>
          </div>

          <div className="grid grid-cols-4 gap-y-6 gap-x-2">
            {categoriasIngresos.map(cat => (
              <div key={cat.id} className="flex flex-col items-center text-center gap-1.5">
                <div className="relative w-14 h-14 rounded-full bg-black/40 border border-white/5 flex items-center justify-center hover:border-emerald-500/20 transition-all cursor-pointer shadow-lg">
                  {cat.icono}
                </div>
                <div className="flex flex-col gap-0.5 mt-1">
                  <span className="text-white text-[8px] font-black uppercase tracking-wider truncate max-w-[65px]">{cat.nombre}</span>
                  <span className="text-[#00E5FF] text-[7px] font-mono">{formatMoney(cat.valor)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* COMPARATIVA FINAL DE PRESUPUESTO */}
        <div className="bg-black/30 border border-white/5 p-5 rounded-3xl flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[8px] font-mono text-bunker-mutado uppercase tracking-widest font-black">// BALANCE GENERAL</span>
            <span className="text-white text-[10px] font-black uppercase mt-0.5">Suficiencia Presupuesto</span>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="text-[#00E5FF] text-xs font-black font-sans">{formatMoney(totalIngresosReal - totalGastosReal)} Neto</span>
            <span className="text-[8px] font-mono text-bunker-mutado uppercase">Consumo de Caja</span>
          </div>
        </div>

      </div>
    </div>
  );
}
