import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Check, Calendar, TrendingUp, Compass } from 'lucide-react';
import { motion } from 'motion/react';

interface Transaccion {
  id: string;
  type: 'ingreso' | 'janlu' | 'gasto' | 'deuda';
  monto: number;
  fecha: string;
  concepto: string;
  categoria: string;
  estado?: string;
  recurrente?: boolean;
}

interface VistaHoyProps {
  operaciones: Transaccion[];
  onOpenCargar: () => void;
  onEditTransaction: (id: string, type: string) => void;
}

export function VistaHoy({ operaciones, onOpenCargar, onEditTransaction }: VistaHoyProps) {
  const hoy = new Date();
  
  // Formateadores locales
  const diaNumero = format(hoy, 'd');
  const diaNombre = format(hoy, 'EEEE', { locale: es });
  const mesAnio = format(hoy, 'MMMM yyyy', { locale: es });

  // 1. Filtrar transacciones del mes
  const esteMes = hoy.getMonth();
  const esteAnio = hoy.getFullYear();

  const transaccionesMes = operaciones.filter(op => {
    const f = new Date(op.fecha);
    return f.getMonth() === esteMes && f.getFullYear() === esteAnio;
  });

  // 2. Clasificar: Pagadas (estado === 'Finalizado' o 'Pagado' o gastos/ingresos ordinarios) y Planificadas (estado === 'Pendiente' o recurrente impago)
  const planificadas = transaccionesMes.filter(op => 
    op.estado === 'Pendiente' || (op.type === 'deuda' && op.estado !== 'Finalizado' && op.estado !== 'Pagado')
  );

  const pagadas = transaccionesMes.filter(op => 
    op.estado === 'Finalizado' || op.estado === 'Pagado' || (!op.estado && op.type !== 'deuda')
  );

  // 3. Objetivos (Cofres / Metas de deudas/ahorros)
  // Simulamos algunos objetivos realistas del bunker si no existen en Firestore
  const objetivos = [
    { id: 'obj1', nombre: 'Fondo de Emergencia', actual: 480000, meta: 600000, fecha: 'Últimos 30 días' },
    { id: 'obj2', nombre: 'Expansión Janlu Velas', actual: 89000, meta: 150000, fecha: 'Meta Julio' }
  ];

  const totalGastosPagados = pagadas
    .filter(op => op.type === 'gasto' || op.type === 'deuda')
    .reduce((sum, op) => sum + op.monto, 0);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="flex flex-col h-full font-sans select-none pb-12 animate-in fade-in duration-300">
      
      {/* Cabecera / Fecha Gigante */}
      <div className="flex justify-between items-start mb-8 px-4">
        <div className="flex items-baseline gap-4">
          <span className="font-serif text-6xl md:text-7xl font-black text-white leading-none">
            {diaNumero}
          </span>
          <div className="flex flex-col">
            <span className="font-serif text-sm md:text-base font-bold text-bunker-mutado uppercase tracking-widest leading-none">
              {diaNombre}
            </span>
            <span className="font-serif text-xs md:text-sm font-semibold text-white/40 uppercase tracking-widest mt-1">
              {mesAnio}
            </span>
          </div>
        </div>

        {/* Botón (+) Circular en Cian */}
        <button
          onClick={onOpenCargar}
          className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-tr from-[#00E5FF] to-[#00B0FF] text-black flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none"
          title="Nuevo Registro"
        >
          <Plus className="w-6 h-6 md:w-7 md:h-7 stroke-[3px]" />
        </button>
      </div>

      <div className="space-y-8 px-2">
        
        {/* SECCIÓN OBJETIVOS */}
        <section className="bg-bunker-panel/40 border border-white/5 p-6 rounded-3xl backdrop-blur-xl shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white">Objetivos</span>
            <span className="text-[8px] font-mono text-bunker-mutado uppercase tracking-widest">// COFRES DE PROPÓSITO</span>
          </div>

          <div className="space-y-4">
            {objetivos.map(obj => {
              const porcentaje = Math.min(100, (obj.actual / obj.meta) * 100);
              return (
                <div key={obj.id} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white font-bold tracking-wide uppercase text-[10px]">{obj.nombre}</span>
                    <span className="text-[#00E5FF] font-black font-mono">{formatMoney(obj.actual)} / {formatMoney(obj.meta)}</span>
                  </div>
                  {/* Barra de progreso en cian */}
                  <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-[#00E5FF] to-[#00B0FF] rounded-full shadow-[0_0_8px_#00E5FF]" 
                      style={{ width: `${porcentaje}%` }} 
                    />
                  </div>
                  <span className="text-[8px] font-mono text-bunker-mutado uppercase tracking-widest">{obj.fecha} • {porcentaje.toFixed(0)}% completado</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECCIÓN PLANIFICADAS */}
        <section className="bg-bunker-panel/40 border border-white/5 p-6 rounded-3xl backdrop-blur-xl shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white">Planificadas</span>
            <span className="text-[8px] font-mono text-bunker-mutado uppercase tracking-widest">// PAGOS Y FLUJOS PENDIENTES</span>
          </div>

          <div className="space-y-3">
            {planificadas.slice(0, 4).map(op => (
              <div 
                key={op.id}
                onClick={() => onEditTransaction(op.id, op.type)}
                className="flex justify-between items-center p-3 rounded-2xl bg-black/30 border border-white/5 hover:border-[#00E5FF]/20 transition-all cursor-pointer"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-white font-black text-xs uppercase tracking-wide">{op.concepto}</span>
                  <span className="text-bunker-mutado text-[8px] font-black uppercase tracking-widest">{op.categoria}</span>
                </div>
                {/* Badge de cantidad */}
                <div className={`px-3 py-1.5 rounded-xl font-black font-mono text-xs tracking-tight ${
                  op.type === 'ingreso' || op.type === 'janlu' ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'bg-[#FFD500]/10 text-[#FFD500]'
                }`}>
                  {formatMoney(op.monto)}
                </div>
              </div>
            ))}

            {planificadas.length === 0 && (
              <div className="text-center py-6 text-bunker-mutado text-[10px] font-mono uppercase tracking-widest opacity-40">
                // Sin cobros ni deudas pendientes
              </div>
            )}
          </div>
        </section>

        {/* SECCIÓN PAGADAS */}
        <section className="bg-bunker-panel/40 border border-white/5 p-6 rounded-3xl backdrop-blur-xl shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white">Pagadas</span>
            <span className="text-[8px] font-mono text-bunker-mutado uppercase tracking-widest">// REGISTRO DE CAJA EJECUTADO</span>
          </div>

          <div className="space-y-3">
            {pagadas.slice(0, 5).map(op => (
              <div 
                key={op.id}
                onClick={() => onEditTransaction(op.id, op.type)}
                className="flex justify-between items-center p-3 rounded-2xl bg-black/20 border border-white/5 hover:border-white/10 transition-all cursor-pointer"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-white font-black text-xs uppercase tracking-wide opacity-80">{op.concepto}</span>
                  <span className="text-bunker-mutado text-[8px] font-bold uppercase tracking-widest">{op.categoria}</span>
                </div>
                <div className={`font-black font-sans text-xs tracking-tight ${
                  op.type === 'ingreso' || op.type === 'janlu' ? 'text-[#00E5FF]' : 'text-white'
                }`}>
                  {op.type === 'ingreso' || op.type === 'janlu' ? '+' : '-'}{formatMoney(op.monto)}
                </div>
              </div>
            ))}

            {pagadas.length === 0 && (
              <div className="text-center py-6 text-bunker-mutado text-[10px] font-mono uppercase tracking-widest opacity-40">
                // Sin registros ejecutados en este período
              </div>
            )}
          </div>

          <div className="border-t border-white/5 pt-4 mt-4 flex justify-between items-center text-xs font-mono uppercase text-bunker-mutado">
            <span>Gastos Totales</span>
            <span className="text-white font-black font-sans tracking-tight">{formatMoney(totalGastosPagados)}</span>
          </div>
        </section>

      </div>
    </div>
  );
}
