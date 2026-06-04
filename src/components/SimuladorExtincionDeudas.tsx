import React, { useState, useMemo } from 'react';
import { FinancialEngine, Deuda } from '../services/motores/FinancialEngine';

export const SimuladorExtincionDeudas: React.FC<{ deudas?: Deuda[] }> = ({ deudas }) => {
  const [inyeccionExtra, setInyeccionExtra] = useState<number>(50000);
  
  const esMock = !deudas || deudas.length === 0;

  const deudasCargadas = useMemo<Deuda[]>(() => {
    if (deudas && deudas.length > 0) {
      return deudas.map(d => ({
        id: d.id,
        nombre: d.nombre,
        saldoPendiente: d.saldoPendiente,
        cuotaMensual: d.cuotaMensual,
        tasaInteres: d.tasaInteres
      }));
    }
    return [
      { id: '1', nombre: 'Tarjeta Visa Hipotecario', saldoPendiente: 120000, cuotaMensual: 15000, tasaInteres: 85 },
      { id: '2', nombre: 'Préstamo Auto', saldoPendiente: 450000, cuotaMensual: 35000, tasaInteres: 65 },
      { id: '3', nombre: 'Tarjeta Master Macro', saldoPendiente: 85000, cuotaMensual: 12000, tasaInteres: 110 }
    ];
  }, [deudas]);

  const simulacion = useMemo(() => {
    return FinancialEngine.procesarBolaDeNieveDeudas(deudasCargadas, inyeccionExtra);
  }, [deudasCargadas, inyeccionExtra]);

  const formatMoney = (val: number) => `$${val.toLocaleString()}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 w-full animate-in fade-in zoom-in duration-500 font-sans selection:bg-bunker-limon selection:text-black">
      <div className="space-y-6">
        <div className="bg-bunker-panel border border-white/5 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <span className="text-2xl text-bunker-limon">⚡</span>
            <div>
              <h2 className="text-lg font-black text-white tracking-widest uppercase font-sans">Motor Bola de Nieve</h2>
              <p className="text-[9px] text-bunker-mutado font-black uppercase tracking-widest font-sans">// Modelo de Extinción de Pasivos</p>
              {esMock && (
                <div className="mt-2.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[8px] font-black tracking-widest uppercase rounded-lg text-center">
                  ⚠️ MODO DEMO: Carga deudas reales en el Libro Diario
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-6 relative z-10">
            <label className="block text-[10px] font-black text-bunker-mutado uppercase tracking-widest mb-2 font-sans">Inyección de Capital Extra ($)</label>
            <input 
              type="number" 
              value={inyeccionExtra}
              onChange={(e) => setInyeccionExtra(Number(e.target.value))}
              className="w-full bg-black p-4 rounded-xl text-lg font-black text-white focus:outline-none border border-white/5 focus:border-bunker-limon/30 transition-colors"
            />
            <p className="text-[9px] text-bunker-mutado mt-2 font-semibold uppercase tracking-widest font-sans">Capital adicional disponible destinado a acelerar pagos.</p>
          </div>

          <div className="space-y-4 relative z-10">
            <h3 className="text-[10px] font-black uppercase text-bunker-limon tracking-widest border-b border-white/5 pb-2 font-sans">Deudas en Cartera</h3>
            {deudasCargadas.map(d => (
              <div key={d.id} className="bg-black/45 p-4 rounded-xl border border-white/5 relative overflow-hidden group hover:border-bunker-limon/20 transition-all">
                <div className="absolute top-0 right-0 w-1 h-full bg-white/20 group-hover:bg-bunker-limon transition-colors" />
                <h4 className="text-white font-black text-sm uppercase tracking-wide font-sans">{d.nombre}</h4>
                <div className="flex justify-between items-center text-xs mt-3">
                  <span className="text-bunker-mutado font-bold uppercase tracking-widest text-[9px] font-sans">Saldo Fijo: <span className="text-white text-xs ml-1">{formatMoney(d.saldoPendiente)}</span></span>
                  <span className="text-bunker-mutado font-bold uppercase tracking-widest text-[9px] font-sans">Cuota Base: <span className="text-bunker-limon text-xs ml-1">{formatMoney(d.cuotaMensual)}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6 flex flex-col h-full">
        <div className="bg-bunker-panel border border-white/5 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden flex-1">
          <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-bunker-limonDim rounded-full blur-[50px] pointer-events-none" />
          
          <h3 className="text-xs uppercase tracking-widest font-black text-white mb-8 flex items-center gap-2 relative z-10 font-sans">
            <span className="text-bunker-limon">🎯</span> Plan de Ataque Optimizado
          </h3>

          <div className="space-y-4 relative z-10 font-sans">
            {simulacion.planAtaque.map((paso, ix) => (
              <div key={paso.deudaiId} className={`p-5 rounded-2xl border ${paso.saldoRestante <= 0 ? 'bg-bunker-limonDim/20 border-bunker-limon/30 shadow-[0_0_20px_rgba(204,255,0,0.05)]' : 'bg-black/30 border-white/5'} backdrop-blur-md`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black ${paso.saldoRestante <= 0 ? 'bg-bunker-limon text-black' : 'bg-white/10 text-white'}`}>{ix + 1}</span>
                    <span className={`font-black text-sm uppercase tracking-wider ${paso.saldoRestante <= 0 ? 'text-bunker-limon' : 'text-white'}`}>{paso.nombre}</span>
                  </div>
                  {paso.saldoRestante <= 0 && (
                     <span className="text-[8px] bg-bunker-limonDim text-bunker-limon px-2.5 py-1 rounded border border-bunker-limon/30 font-black tracking-widest uppercase">
                       ¡EXTINGUIDA! 🎉
                     </span>
                  )}
                </div>
                
                <div className="flex justify-between items-end border-t border-white/5 pt-4">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest font-black text-bunker-mutado mb-1 block">Impacto (Pago Total)</span>
                    <span className={`text-lg font-black ${paso.saldoRestante <= 0 ? 'text-white' : 'text-bunker-limon'}`}>{formatMoney(paso.pagoTotalEsteMes)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-widest font-black text-bunker-mutado mb-1 block">Saldo final del mes</span>
                    <span className="text-base font-black text-white">{formatMoney(Math.max(paso.saldoRestante, 0))}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {simulacion.capitalBloqueadoParaProximoMes > 0 && (
            <div className="mt-8 bg-black/60 border border-white/5 rounded-2xl p-5 flex gap-4 items-center relative z-10 font-sans">
              <div className="text-2xl">🔒</div>
              <div>
                <h4 className="text-[10px] font-black uppercase text-bunker-limon tracking-widest mb-1 font-sans">Gatillo de Extinción</h4>
                <p className="text-[10px] text-zinc-300 font-medium leading-relaxed font-sans">
                  Al pulverizar deudas, se congelaron <strong className="text-bunker-limon">{formatMoney(simulacion.capitalBloqueadoParaProximoMes)}</strong> de capital mensual liberado. Este monto queda secuestrado para arrollar la próxima deuda en cadena.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
