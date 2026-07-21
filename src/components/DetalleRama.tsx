import React, { useMemo } from 'react';
import { Briefcase, Zap, Car, Utensils, ShieldCheck, Heart, BookOpen, Coffee, ArrowUpRight, ArrowDownRight, TrendingUp, Calendar as CalIcon } from 'lucide-react';
import { formatNumber } from '../App';

export interface RamaSeleccionada {
  titulo: string;
  filtro: (t: any) => boolean;
  bgColor: string;
  icon: any;
  colorHex: string;
}

interface DetalleRamaProps {
  rama: RamaSeleccionada;
  transacciones: any[];
  onVolver: () => void;
}

export const DetalleRama = ({ rama, transacciones, onVolver }: DetalleRamaProps) => {
  const transaccionesRama = useMemo(() => {
    return transacciones.filter(rama.filtro).sort((a, b) => {
      const dateA = a.fechaGasto || a.fechaIngreso || a.fechaInyeccion || a.fechaRegistro;
      const dateB = b.fechaGasto || b.fechaIngreso || b.fechaInyeccion || b.fechaRegistro;
      return (dateB?.toMillis?.() || 0) - (dateA?.toMillis?.() || 0);
    });
  }, [transacciones, rama]);

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    let totalMesActual = 0;
    let totalMesAnterior = 0;
    let totalFuturoProyectado = 0;

    transaccionesRama.forEach(t => {
      const dt = t.fechaGasto || t.fechaIngreso || t.fechaInyeccion || t.fechaRegistro;
      if (!dt) return;
      const d = dt.toDate ? dt.toDate() : new Date(dt.seconds ? dt.seconds * 1000 : dt);
      
      const val = t.montoNeto || t.utilidad_neta || t.montoTotal || t.capitalOrig || 0;
      
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        totalMesActual += val;
      } else if (d.getFullYear() === lastMonthYear && d.getMonth() === lastMonth) {
        totalMesAnterior += val;
      } else if (d.getTime() > now.getTime()) {
        totalFuturoProyectado += val;
      }
    });

    const diff = totalMesActual - totalMesAnterior;
    const crecimiento = totalMesAnterior > 0 ? (diff / totalMesAnterior) * 100 : (totalMesActual > 0 ? 100 : 0);

    return { totalMesActual, totalMesAnterior, diff, crecimiento, totalFuturoProyectado };
  }, [transaccionesRama]);

  return (
    <div className="h-full flex flex-col gap-6 px-4 pb-6 md:px-0">
      <div className="flex items-center gap-4">
        <button onClick={onVolver} className="w-10 h-10 rounded-full bg-[#1c222e] flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
          ←
        </button>
        <div className={`w-12 h-12 rounded-none flex items-center justify-center text-white shadow-lg ${rama.bgColor}`}>
          <rama.icon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{rama.titulo}</h2>
          <p className="text-[#8b949e] text-sm uppercase tracking-widest font-medium">Análisis de Rama</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#161A23]/50 backdrop-blur-md border border-white/10 rounded-none p-6 shadow-lg">
          <p className="text-slate-300 text-xs uppercase tracking-widest font-bold mb-2">Mes Actual</p>
          <p className="text-3xl font-black text-white">{formatNumber(stats.totalMesActual)}</p>
          <div className="mt-4 flex items-center gap-2">
            <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${stats.crecimiento >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {stats.crecimiento >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(stats.crecimiento).toFixed(1)}%
            </span>
            <span className="text-slate-400 text-xs">vs mes anterior ({formatNumber(stats.totalMesAnterior)})</span>
          </div>
        </div>
        
        <div className="bg-[#161A23]/50 backdrop-blur-md border border-white/10 rounded-none p-6 shadow-lg">
          <p className="text-slate-300 text-xs uppercase tracking-widest font-bold mb-2">Compromiso / Ingreso Futuro</p>
          <p className="text-3xl font-black text-white">{formatNumber(stats.totalFuturoProyectado)}</p>
          <div className="mt-4 flex items-center gap-2 text-white/50 text-xs">
            <CalIcon className="w-4 h-4" />
            <span>Proyectado post fecha actual</span>
          </div>
        </div>

        <div className="bg-[#161A23]/50 backdrop-blur-md border border-white/10 rounded-none p-6 shadow-lg flex flex-col justify-center items-center text-center">
          <p className="text-slate-300 text-xs uppercase tracking-widest font-bold mb-4">Rendimiento Táctico</p>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-opacity-20 ${stats.crecimiento > 0 ? 'bg-green-500 text-green-400' : 'bg-red-500 text-red-400'}`}>
            <TrendingUp className="w-8 h-8" />
          </div>
        </div>
      </div>

      <div className="bg-[#161A23]/50 backdrop-blur-md border border-white/10 rounded-none p-6 shadow-lg flex-1 overflow-hidden flex flex-col">
        <h3 className="text-slate-200 font-bold mb-4 uppercase tracking-widest text-xs">Historial de Transacciones</h3>
        <div className="flex-1 overflow-y-auto space-y-3">
          {transaccionesRama.length > 0 ? transaccionesRama.map(t => {
             const dt = t.fechaGasto || t.fechaIngreso || t.fechaInyeccion || t.fechaRegistro;
             let fStr = "";
             if (dt) {
               const d = dt.toDate ? dt.toDate() : new Date(dt.seconds ? dt.seconds * 1000 : dt);
               fStr = d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
             }
             const monto = t.montoNeto || t.utilidad_neta || t.montoTotal || t.capitalOrig || 0;
             const desc = t.origen || t.nombreCompromiso || t.categoria || "Operación";
             return (
               <div key={t.id} className="flex justify-between items-center p-4 bg-[#161A23]/50 border border-white/10 rounded-none hover:border-[#E5A93B]/50 transition-all">
                  <div>
                    <p className="text-white font-medium">{desc}</p>
                    <p className="text-slate-400 text-xs mt-1">{fStr}</p>
                  </div>
                  <p className="text-lg font-bold" style={{ color: rama.colorHex }}>{formatNumber(monto)}</p>
               </div>
             );
          }) : (
            <div className="h-full flex flex-col items-center justify-center text-white/30">
               <Briefcase className="w-8 h-8 mb-2" />
               <p>No hay registros para esta rama</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
