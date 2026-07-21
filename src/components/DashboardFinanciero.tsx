// src/components/DashboardFinanciero.tsx
import React from 'react';
import { EstadoFinanciero } from '../services/motores/FinancialEngine';

interface DashboardProps {
  macroEstado: EstadoFinanciero;
  puntoEstabilidad: number;
  meteo?: { estado?: string; estadoRadar?: 'ESTABLE' | 'PRECAUCION' | 'TORMENTA'; mensaje: string };
  onGastoAdicionado?: (gasto: any, acumulado: number) => void;
  onOpenCargar?: () => void;
  onOpenTriaje?: () => void;
  onOpenDeudas?: () => void;
  alertasCL?: any[];
}

export const DashboardFinanciero: React.FC<DashboardProps> = ({ 
  macroEstado, 
  puntoEstabilidad, 
  onOpenCargar, 
  onOpenTriaje, 
  onOpenDeudas,
  alertasCL
}) => {
  // Cálculo de Saldo Consolidado (Bimont + Janlu = Liquidez Total)
  const saldoTotal = (macroEstado.ingresoBimont || 0) + (macroEstado.excedenteJanlu || 0);

  return (
    <main className="min-h-screen bg-bunker-bg text-bunker-texto p-6 font-sans selection:bg-bunker-limon selection:text-black">
      
      {/* Header & Avatar */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold tracking-tight font-sans">Búnker<span className="text-bunker-limon">.</span></h1>
        <div className="w-10 h-10 rounded-full bg-bunker-panel border-2 border-bunker-limon flex items-center justify-center shadow-[0_0_15px_rgba(204,255,0,0.3)]">
          <span className="font-bold text-sm">JB</span>
        </div>
      </header>

      {/* Héroe: Saldo Consolidado Gigante (Vibra Lemon) */}
      <section className="mb-10 text-center flex flex-col items-center">
        <span className="text-bunker-mutado text-xs uppercase tracking-widest font-semibold mb-2">Liquidez Disponible</span>
        <div className="text-6xl md:text-7xl font-black tracking-tighter flex items-start justify-center font-sans">
          <span className="text-3xl mt-2 text-bunker-limon mr-1 font-sans">$</span>
          {saldoTotal.toLocaleString('es-AR')}
        </div>
        
        {/* Gamificación: Rendimiento de Janlu (Emulando "Lemon Earn") */}
        <div className="mt-5 bg-bunker-panel inline-flex items-center px-4 py-2 rounded-2xl border border-white/5 cursor-pointer hover:border-bunker-limon transition-all shadow-inner">
          <span className="text-bunker-limon animate-pulse mr-2">⚡</span>
          <span className="text-sm font-medium">Janlu Earn: <span className="text-bunker-limon">+$15.200</span> excedente esta semana</span>
        </div>
      </section>

      {/* Grid de Botonera (Acciones Rápidas Billetera Virtual) */}
      <section className="grid grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Ingresar', icon: '↓', onClick: onOpenCargar }, 
          { label: 'Escanear', icon: '📷', onClick: onOpenCargar }, 
          { label: 'Triaje', icon: '🛡️', onClick: onOpenTriaje }, 
          { label: 'Deudas', icon: '❄️', onClick: onOpenDeudas }
        ].map((accion) => (
          <button 
            key={accion.label} 
            onClick={accion.onClick}
            type="button"
            className="flex flex-col items-center gap-2 group cursor-pointer focus:outline-none"
          >
            <div className="w-14 h-14 rounded-2xl bg-bunker-panel flex items-center justify-center group-hover:bg-bunker-limon group-hover:text-black transition-all duration-300 border border-white/5 shadow-inner">
              <span className="font-bold text-lg">{accion.icon}</span>
            </div>
            <span className="text-xs text-bunker-mutado font-medium group-hover:text-white transition-all">{accion.label}</span>
          </button>
        ))}
      </section>

      {/* Módulo Punto de Estabilidad (P.E.) rediseñado */}
      <section className="bg-bunker-panel rounded-[2rem] p-6 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
        <div className="absolute top-0 right-0 w-32 h-32 bg-bunker-limonDim blur-[80px] rounded-full pointer-events-none"></div>
        
        <h2 className="text-bunker-mutado text-xs uppercase tracking-widest font-bold mb-4 font-sans">Punto de Estabilidad (Bimont)</h2>
        <div className="flex items-end gap-4">
          <div className="text-5xl font-black tracking-tighter font-sans">
            {(puntoEstabilidad || 0).toFixed(1)}<span className="text-bunker-limon text-3xl">%</span>
          </div>
          <div className="flex-1 mb-2">
            <div className="w-full bg-black h-3 rounded-full overflow-hidden">
              <div 
                className="bg-bunker-limon h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(204,255,0,0.6)]" 
                style={{ width: `${Math.min(puntoEstabilidad || 0, 100)}%` }}
              />
            </div>
          </div>
        </div>
        {puntoEstabilidad >= 100 && (
          <p className="text-xs text-bunker-limon mt-4 font-medium flex items-center gap-1.5 animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-bunker-limon animate-pulse"></span>
            Familia blindada. Acelerador Janlu habilitado.
          </p>
        )}
      </section>

      {/* Alertas del Cerebro Lógico (C.L.) */}
      <section className="mt-8 bg-bunker-panel rounded-[2rem] p-6 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
        <div className="absolute top-0 left-0 w-32 h-32 bg-[#ff007f]/5 blur-[80px] rounded-full pointer-events-none"></div>
        <h2 className="text-bunker-mutado text-xs uppercase tracking-widest font-bold mb-4 font-sans flex items-center gap-2">
          <span>🧠 Auditoría del Cerebro Lógico (C.L.)</span>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-black/40 text-bunker-mutado tracking-normal">// METEO FINANCIERA</span>
        </h2>

        {alertasCL && alertasCL.length > 0 ? (
          <div className="space-y-4">
            {alertasCL.map((alerta) => {
              const esCritica = alerta.severidad === 'CRITICA';
              const esAlta = alerta.severidad === 'ALTA';
              const borderCol = esCritica 
                ? 'border-[#ff007f]/30 shadow-[0_0_15px_rgba(255,0,127,0.1)] animate-pulse' 
                : esAlta 
                  ? 'border-[#EAB308]/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]' 
                  : 'border-white/5';
              const titleCol = esCritica 
                ? 'text-[#ff007f]' 
                : esAlta 
                  ? 'text-[#EAB308]' 
                  : 'text-[#E5A93B]';
              const bgCol = esCritica 
                ? 'bg-[#ff007f]/5' 
                : esAlta 
                  ? 'bg-[#EAB308]/5' 
                  : 'bg-[#E5A93B]/5';

              return (
                <div 
                  key={alerta.id} 
                  className={`p-4 rounded-2xl border ${borderCol} ${bgCol} backdrop-blur-xl transition-all duration-300 hover:scale-[1.01]`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-mono tracking-widest font-black uppercase ${titleCol}`}>
                      [{alerta.categoria}] // {alerta.severidad}
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: esCritica ? '#ff007f' : esAlta ? '#EAB308' : '#E5A93B' }} />
                  </div>
                  <h3 className="text-white text-sm font-black tracking-tight mb-1 uppercase font-sans">
                    {alerta.titulo}
                  </h3>
                  <p className="text-xs text-bunker-texto/80 mb-3 leading-relaxed">
                    {alerta.mensaje}
                  </p>
                  {alerta.accion && (
                    <div className="mt-2 text-[10px] font-mono text-slate-400 bg-black/40 p-2.5 rounded-xl border border-white/5">
                      <span className="text-white font-bold uppercase mr-1">Sugerencia C.L:</span> {alerta.accion}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-5 rounded-2xl border border-[#E5A93B]/20 bg-[#E5A93B]/5 backdrop-blur-xl flex items-center gap-3">
            <span className="text-lg">🛡️</span>
            <span className="text-xs font-mono tracking-wide text-slate-300">
              Sistema estable. No se detectan anomalías de flujo de caja en el Cimiento familiar.
            </span>
          </div>
        )}
      </section>

    </main>
  );
}
