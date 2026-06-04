import React, { useState } from 'react';
import { ShieldCheck, Calendar, FileText, Plus, ArrowUpRight, ArrowDownRight, MoreHorizontal, Activity, Sliders, DollarSign, Umbrella, Coffee, Zap } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { motion } from 'motion/react';
import { MiniCalendar } from './MiniCalendar';
import { WidgetEstacionalidad } from './WidgetEstacionalidad';
import { WidgetRadarFacturas } from './WidgetRadarFacturas';
import { WidgetCofresProposito } from './WidgetCofresProposito';

interface TransaccionBreve {
  id: string;
  comercio: string;
  fecha: string;
  hora: string;
  monto: number;
  tipo: 'ingreso' | 'egreso';
  icono?: React.ReactNode;
  colorIcono?: string;
}

interface InicioProps {
  nombreUsuario: string;
  avatarUrl?: string;
  excedenteAFavor: number;
  estadoMesAsegurado: boolean;
  transaccionesRecientes: TransaccionBreve[];
  transaccionesTotales: any[];
  onOpenEstrategia: () => void;
  onOpenCalendario: () => void;
  onOpenReportes: () => void;
  onOpenCargar: () => void;
  onVerTodo: () => void;
  onEditTransaction: (id: string, type: string) => void;
}

export function Inicio({
  nombreUsuario,
  avatarUrl,
  excedenteAFavor,
  estadoMesAsegurado,
  transaccionesRecientes,
  transaccionesTotales,
  onOpenEstrategia,
  onOpenCalendario,
  onOpenReportes,
  onOpenCargar,
  onVerTodo,
  onEditTransaction
}: InicioProps) {
  const [splitExpansion, setSplitExpansion] = useState(50);
  const [splitBlindaje, setSplitBlindaje] = useState(30);

  // 1. Calcular historial de liquidez dinámicamente
  const historialMensualMap = new Map<string, number>();

  transaccionesTotales.forEach(t => {
    if (t.type === 'ingreso' || t.type === 'janlu') {
      const fechaObj = t.fechaIngreso || t.fechaInyeccion || t.fechaGasto || t.fechaRegistro || t.fechaVencimiento || t.fecha;
      if (fechaObj) {
        let date: Date;
        if (fechaObj.toDate) {
            date = fechaObj.toDate();
        } else if (fechaObj.seconds) {
            date = new Date(fechaObj.seconds * 1000);
        } else {
            date = new Date(fechaObj);
        }
        
        const year = date.getFullYear();
        const month = date.getMonth();
        const key = `${year}-${String(month + 1).padStart(2, '0')}`;
        
        const monto = (t.montoNeto || t.utilidad_neta || t.montoTotal || t.capitalOrig || t.monto || 0);

        if (!historialMensualMap.has(key)) {
          historialMensualMap.set(key, 0);
        }
        historialMensualMap.set(key, historialMensualMap.get(key)! + monto);
      }
    }
  });

  const liquidezHistorial = Array.from(historialMensualMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, valor]) => {
       const [yearStr, monthStr] = key.split('-');
       const d = new Date(parseInt(yearStr), parseInt(monthStr) - 1);
       const mesStr = d.toLocaleDateString('es-AR', { month: 'short' });
       return { 
         mes: mesStr.charAt(0).toUpperCase() + mesStr.slice(1), 
         valor 
       };
    });

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor).replace('ARS', '$').trim();
  };

  return (
    <div className="flex flex-col min-h-screen bg-bunker-bg font-sans pb-20 md:pb-8 w-full relative overflow-x-hidden selection:bg-bunker-limon selection:text-black">
      
      {/* 1. Header (Saludo) */}
      <header className="flex items-center justify-between p-6 pt-10 relative z-10">
        <div className="flex flex-col">
          <span className="text-bunker-mutado text-xs font-black uppercase tracking-[0.25em] font-sans">Protocolo Vigente // BÚNKER</span>
          <span className="text-bunker-texto text-3xl md:text-5xl font-black tracking-tight font-sans uppercase mt-1">Control Central</span>
        </div>
        <div className="w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-bunker-limon shadow-[0_0_20px_rgba(204,255,0,0.3)] bg-bunker-panel/50 transition-all hover:scale-110 flex items-center justify-center">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="font-bold text-lg text-bunker-limon">JB</span>
          )}
        </div>
      </header>

      {/* Nueva Operación Rápida */}
      <section className="px-6 mt-6 relative z-10">
        <motion.button 
          whileHover={{ scale: 1.01, y: -1 }}
          whileTap={{ scale: 0.99 }}
          onClick={onOpenCargar}
          className="w-full py-5 bg-bunker-panel hover:bg-bunker-panel/80 border border-bunker-limon/20 rounded-2xl flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(0,0,0,0.5)] group transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:rotate-90 group-hover:bg-bunker-limon transition-all duration-500">
            <Plus className="w-5 h-5 text-white group-hover:text-black" />
          </div>
          <span className="text-white font-black uppercase tracking-[0.2em] text-xs">Nueva Operación Rápida</span>
        </motion.button>
      </section>

      {/* 2. Tarjeta Principal Flotante (Glassmorphism + Framer Motion) */}
      <section className="px-6 mt-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -4 }}
          className="w-full rounded-3xl bg-bunker-panel border border-white/5 p-8 shadow-[0_45px_90px_rgba(0,0,0,0.9)] relative overflow-hidden flex flex-col justify-center items-center text-center"
        >
          {/* Luces volumétricas internas */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-bunker-limonDim rounded-full blur-[110px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          
          <span className="text-bunker-mutado text-xs font-black tracking-[0.3em] uppercase mb-4">Capital de Contingencia</span>
          
          <h1 className={`text-4xl md:text-7xl font-black mb-6 tracking-tighter ${excedenteAFavor >= 0 ? 'text-white' : 'text-[#FF4A4A]'} font-sans`}>
            {excedenteAFavor >= 0 ? '+' : '-'} {formatearMoneda(Math.abs(excedenteAFavor))}
          </h1>

          <div className="flex items-center gap-3 px-6 py-2.5 bg-black/50 rounded-full border border-white/5 backdrop-blur-md">
            {estadoMesAsegurado ? (
               <><ShieldCheck className="w-5 h-5 text-bunker-limon" /><span className="text-bunker-limon text-[9px] font-black uppercase tracking-[0.25em]">Blindaje Certificado</span></>
            ) : (
               <><Activity className="w-5 h-5 text-[#FF4A4A]" /><span className="text-[#FF4A4A] text-[9px] font-black uppercase tracking-[0.25em]">Intervención Requerida</span></>
            )}
          </div>
        </motion.div>
      </section>

      {/* Gráfico de Ondas (Spline Neon Dinámico) - Background Integration */}
      <div className="hidden absolute inset-0 z-0 opacity-15 pointer-events-none md:block" style={{ top: '42%' }}>
         <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={liquidezHistorial} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOnda" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#CCFF00" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#000000" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="valor" stroke="#CCFF00" strokeWidth={5} fillOpacity={1} fill="url(#colorOnda)" />
            </AreaChart>
          </ResponsiveContainer>
      </div>

      <section className="px-6 mt-8 md:hidden relative z-10 w-full h-56 overflow-hidden rounded-3xl bg-bunker-panel border border-white/5 shadow-2xl">
         <div className="absolute top-6 left-8 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-bunker-limon shadow-[0_0_10px_#CCFF00]"></div>
            <span className="text-bunker-mutado text-[10px] font-black uppercase tracking-[0.3em]">Curva de Liquidez</span>
         </div>
         <div className="w-full h-full pt-16">
          <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={liquidezHistorial.length > 0 ? liquidezHistorial : [{mes: 'Ene', valor: 0}, {mes: 'Feb', valor: 0}]} margin={{ top: 10, right: 20, left: 20, bottom: 30 }}>
                <defs>
                  <linearGradient id="colorOndaMovil" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#CCFF00" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#000000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="mes" 
                  hide={false} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold' }}
                  dy={15}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121214', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', backdropFilter: 'blur(10px)' }} 
                  itemStyle={{ color: '#CCFF00', fontWeight: 'bold', fontSize: '14px' }}
                  formatter={(value: number) => [formatearMoneda(value), "Liquidez"]}
                  labelStyle={{ color: 'rgba(255,255,255,0.6)', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  cursor={{ stroke: 'rgba(204,255,0,0.3)', strokeWidth: 1, strokeDasharray: '4 4' }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="valor" 
                  stroke="#CCFF00" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorOndaMovil)" 
                  animationDuration={2500}
                />
              </AreaChart>
            </ResponsiveContainer>
         </div>
      </section>

      {/* 3. Fila de Botones de Acción */}
      <section className="px-6 mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={onOpenEstrategia} className="flex flex-col items-center gap-3 cursor-pointer">
            <div className="w-16 h-16 rounded-2xl bg-bunker-panel border border-white/5 flex items-center justify-center shadow-xl hover:border-bunker-limon hover:bg-white/5 transition-all">
              <ShieldCheck className="w-7 h-7 text-bunker-limon" />
            </div>
            <span className="text-bunker-mutado text-[9px] font-black uppercase tracking-widest font-sans">Simular</span>
          </motion.button>

          <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={onOpenCalendario} className="flex flex-col items-center gap-3 cursor-pointer">
            <div className="w-16 h-16 rounded-2xl bg-bunker-panel border border-white/5 flex items-center justify-center shadow-xl hover:border-bunker-limon hover:bg-white/5 transition-all">
              <Calendar className="w-7 h-7 text-bunker-limon" />
            </div>
            <span className="text-bunker-mutado text-[9px] font-black uppercase tracking-widest font-sans">Agenda</span>
          </motion.button>

          <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={onOpenReportes} className="flex flex-col items-center gap-3 cursor-pointer">
            <div className="w-16 h-16 rounded-2xl bg-bunker-panel border border-white/5 flex items-center justify-center shadow-xl hover:border-bunker-limon hover:bg-white/5 transition-all">
              <FileText className="w-7 h-7 text-bunker-limon" />
            </div>
            <span className="text-bunker-mutado text-[9px] font-black uppercase tracking-widest font-sans">Estatutos</span>
          </motion.button>

          <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={onOpenCargar} className="flex flex-col items-center gap-3 cursor-pointer">
            <div className="w-16 h-16 rounded-2xl bg-bunker-panel border border-bunker-limon flex items-center justify-center shadow-[0_0_20px_rgba(204,255,0,0.2)] hover:bg-bunker-limon hover:text-black transition-all">
              <Plus className="w-8 h-8 text-bunker-limon hover:text-black" />
            </div>
            <span className="text-bunker-mutado text-[9px] font-black uppercase tracking-widest font-sans">Añadir</span>
          </motion.button>
        </div>
      </section>

      {/* 🗓️ Widget de Calendario Táctico */}
      <section className="px-6 mt-10 relative z-10 font-sans">
        <div className="bg-bunker-panel border border-white/5 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-bunker-limonDim border border-bunker-limon/30 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-bunker-limon" />
              </div>
              <h3 className="text-white font-black text-xs tracking-widest uppercase font-sans">Meteo Financiera</h3>
            </div>
            <span className="text-[10px] font-black text-bunker-mutado tracking-[0.2em] uppercase font-sans">Calendario</span>
          </div>
          <MiniCalendar 
            transacciones={(transaccionesTotales || []).map(t => ({
              id: t.id,
              comercio: t.referencia || t.descripcion || 'Operación',
              fecha: t.fechaGasto || t.fechaIngreso || t.fechaInyeccion || t.fechaVencimiento || t.fecha,
              monto: t.montoTotal || t.montoNeto || t.monto || 0,
              type: t.type
            }))}
          />
        </div>
      </section>

      {/* 🚀 Tablero Táctico Avanzado (Aplanador de Curvas & Radar de Facturas) */}
      <section className="px-6 mt-10 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 font-sans animate-in fade-in duration-500">
        <WidgetEstacionalidad />
        <WidgetRadarFacturas idHogar="hogar_bimont_central" />
      </section>

      {/* 🪙 Cofres de Propósito & Ahorro Directo */}
      <section className="px-6 mt-10 relative z-10 font-sans animate-in fade-in duration-500">
        <WidgetCofresProposito />
      </section>

      {excedenteAFavor > 0 && (
        <section className="px-6 mt-10 relative z-10 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-bunker-panel border border-white/5 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
             
             <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center border border-white/5">
                    <Sliders className="w-5 h-5 text-bunker-limon" />
                  </div>
                  <h3 className="text-white font-black text-base uppercase tracking-tight font-sans">Distribución Táctica</h3>
               </div>
               <span className="text-bunker-limon font-black text-xs uppercase tracking-widest bg-black/60 px-4 py-2 rounded-full border border-bunker-limon/10 font-sans">{formatearMoneda(excedenteAFavor)}</span>
             </div>

             <div className="space-y-8">
               {/* Expansión Janlu */}
               <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-bunker-mutado flex items-center gap-2 font-sans"><Zap className="w-4 h-4 text-bunker-limon"/> Expansión Capital</span>
                     <span className="text-sm font-black text-white font-sans">{formatearMoneda((excedenteAFavor * splitExpansion) / 100)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max={100 - splitBlindaje} 
                    value={splitExpansion} 
                    onChange={(e) => setSplitExpansion(Number(e.target.value))}
                    className="w-full h-1.5 bg-black rounded-lg appearance-none cursor-pointer accent-bunker-limon"
                  />
               </div>

               {/* Blindaje */}
               <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-bunker-mutado flex items-center gap-2 font-sans"><ShieldCheck className="w-4 h-4 text-bunker-limon"/> Reserva Blindada</span>
                     <span className="text-sm font-black text-white font-sans">{formatearMoneda((excedenteAFavor * splitBlindaje) / 100)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max={100 - splitExpansion} 
                    value={splitBlindaje} 
                    onChange={(e) => setSplitBlindaje(Number(e.target.value))}
                    className="w-full h-1.5 bg-black rounded-lg appearance-none cursor-pointer accent-bunker-limon"
                  />
               </div>
             </div>
          </div>
        </section>
      )}

      {/* 4. Libro Diario (Transacciones Recientes) */}
      <section className="px-6 mt-12 flex-1 flex flex-col relative z-10 pb-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-bunker-mutado text-[10px] font-black uppercase tracking-[0.3em] font-sans">Libro de Operaciones</h2>
          <button onClick={onVerTodo} className="text-bunker-limon text-[10px] font-black uppercase tracking-widest border-b border-bunker-limon/30 pb-1 cursor-pointer">Archivos</button>
        </div>
        
        <div className="flex flex-col gap-4">
          {transaccionesRecientes.map((tx, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={tx.id} 
              onClick={() => onEditTransaction(tx.id, (tx as any).realType || (tx.tipo === 'ingreso' ? 'ingreso' : 'gasto'))}
              className="flex items-center justify-between p-5 rounded-3xl bg-bunker-panel border border-white/5 hover:border-bunker-limon/20 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  {tx.icono ? tx.icono : (
                    tx.tipo === 'ingreso' ? <ArrowUpRight className="w-6 h-6 text-bunker-limon" /> : <ArrowDownRight className="w-6 h-6 text-white/50" />
                  )}
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-white font-black text-sm uppercase tracking-wide font-sans">{tx.comercio}</span>
                  <span className="text-bunker-mutado text-[9px] font-black uppercase tracking-widest font-sans">{tx.fecha}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <span className={`font-black tracking-tight text-base font-sans ${tx.tipo === 'ingreso' ? 'text-bunker-limon' : 'text-white'}`}>
                  {tx.tipo === 'egreso' ? '-' : '+'} {formatearMoneda(Math.abs(tx.monto))}
                </span>
                <span className="text-bunker-mutado text-[9px] font-semibold font-mono">{tx.hora}</span>
              </div>
            </motion.div>
          ))}

          {transaccionesRecientes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 bg-bunker-panel rounded-3xl border border-white/5 border-dashed">
              <MoreHorizontal className="w-8 h-8 text-white/5 mb-2" />
              <p className="text-bunker-mutado text-xs font-black uppercase tracking-widest">Sin transacciones</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
