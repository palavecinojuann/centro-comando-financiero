import React, { useState, useMemo } from 'react';
import { FinancialEngine, DeudaAvanzada, EstrategiaPasivos } from '../services/motores/FinancialEngine';

export const OptimizadorPasivos: React.FC = () => {
  // Simulación de deudas con el nuevo campo táctico 'factorFriccion'
  const [deudas, setDeudas] = useState<DeudaAvanzada[]>([
    { id: 'd1', nombre: 'PASIVO CONSOLIDADO TARJETA', saldoPendiente: 480000, cuotaMensual: 60000, tasaInteres: 65, factorFriccion: 4, esEstacional: false },
    { id: 'd2', nombre: 'CRÉDITO LIQUIDEZ CHICO', saldoPendiente: 150000, cuotaMensual: 25000, tasaInteres: 45, factorFriccion: 3, esEstacional: false },
    { id: 'd3', nombre: 'DEUDA COMPROMISO PERSONAL / RECONSTRUCCIÓN', saldoPendiente: 300000, cuotaMensual: 15000, tasaInteres: 0, factorFriccion: 9, esEstacional: false }, // Fricción alta por ser personal
  ]);

  const [estrategia, setEstrategia] = useState<EstrategiaPasivos>('BOLA_NIEVE');
  const [capitalExtra, setCapitalExtra] = useState<number>(50000);

  // Procesamiento en tiempo real con la nueva función extendida
  const optimizacion = useMemo(() => {
    return FinancialEngine.optimizarPasivosDinamico(deudas, capitalExtra, estrategia);
  }, [deudas, capitalExtra, estrategia]);

  return (
    <div className="max-w-5xl mx-auto bg-[#161A23]/60 backdrop-blur-xl border border-white/10 p-4 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden text-slate-200">
      
      {/* GLOW DE FONDO VIOLETA EXCLUSIVO (IA / ESTRATEGIA COGNITIVA) */}
      <div className="absolute -right-24 -top-24 w-52 h-52 bg-[#8B5CF6]/5 blur-[80px] pointer-events-none" />

      <div className="mb-8 border-b border-white/5 pb-6">
        <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-[#8B5CF6] font-bold mb-2">
          ADVANCED_LIQUIDATION // ALGORITHM_MATRIX
        </p>
        <h3 className="font-serif text-2xl tracking-normal text-white uppercase font-bold">
          Optimizador Táctico de Pasivos
        </h3>
      </div>

      {/* SELECTOR DE SECTORES ESTRATÉGICOS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8 bg-black/30 p-1.5 border border-white/5 rounded-2xl shadow-inner">
        {(['BOLA_NIEVE', 'AVALANCHA', 'ANILLO_SEGURIDAD', 'TSUNAMI'] as EstrategiaPasivos[]).map((tactic) => (
          <button
            key={tactic}
            onClick={() => setEstrategia(tactic)}
            className={`py-3 rounded-xl font-sans text-[10px] tracking-widest uppercase font-black transition-all duration-300 ${
              estrategia === tactic
                ? 'bg-[#161A23] text-[#8B5CF6] border border-white/10 shadow-[0_4px_20px_rgba(139,92,246,0.3)] scale-[1.02]'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            {tactic.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ENTRADAS Y VEREDICTO DE IA (ANCHO: 1 COLUMNA) */}
        <div className="space-y-6">
          <div className="bg-black/30 border border-white/5 p-6 rounded-2xl shadow-inner">
            <label className="block text-[10px] font-sans tracking-widest text-slate-400 uppercase font-bold mb-3">
              SURALIMENTACIÓN MENSUAL EXTRA ($)
            </label>
            <input 
              type="number" 
              step="5000"
              value={capitalExtra || ''} 
              onChange={(e) => setCapitalExtra(Number(e.target.value))}
              className="w-full bg-black/40 border border-white/10 p-3.5 rounded-xl font-sans text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-all"
              placeholder="0"
            />
          </div>

          {/* CUADRO DE VEREDICTO COGNITIVO VIOLETA NEÓN */}
          <div className="bg-[#161A23]/80 border border-[#8B5CF6]/30 p-6 rounded-2xl shadow-[0_10px_30px_rgba(139,92,246,0.05)] relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[#8B5CF6] text-lg">💡</span>
              <h4 className="text-[10px] font-sans tracking-[0.2em] uppercase text-[#8B5CF6] font-black">
                CRITERIO DE SELECCIÓN COGNITIVA
              </h4>
            </div>
            <p className="text-[13px] text-slate-300 font-sans leading-relaxed font-normal italic opacity-90">
              "{optimizacion.veredictoIA}"
            </p>
          </div>

          {optimizacion.capitalLiberadoProximoMes > 0 && (
            <div className="bg-gradient-to-br from-[#E5A93B]/10 to-[#E5A93B]/5 border border-[#E5A93B]/30 p-6 rounded-2xl font-sans shadow-[0_10px_20px_rgba(229, 169, 59, 0.05)]">
              <p className="text-[10px] tracking-widest uppercase text-[#E5A93B] font-black opacity-80">FLUJO REINYECTABLE PRÓXIMO CICLO</p>
              <p className="text-3xl font-black text-white mt-2 tracking-tighter">+${optimizacion.capitalLiberadoProximoMes.toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* LÍNEA DE IMPACTO PROYECTADO (ANCHO: 2 COLUMNAS) */}
        <div className="lg:col-span-2 space-y-4">
          <p className="text-[10px] font-sans tracking-widest uppercase text-slate-500 font-black mb-2 flex items-center gap-2">
            <span className="w-4 h-[1px] bg-slate-700"></span>
            ORDEN DE ATAQUE PROYECTADO SEGÚN MATRIZ
          </p>

          <div className="space-y-3">
            {optimizacion.ordenAtaque.map((item) => (
              <div 
                key={item.id}
                className="group bg-black/20 hover:bg-black/40 border border-white/5 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-l-4 border-l-[#8B5CF6] rounded-xl transition-all duration-300 hover:translate-x-1 shadow-sm"
              >
                <div className="font-sans">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] bg-[#8B5CF6]/20 text-[#a78bfa] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter">P{item.prioridad}</span>
                    <span className="text-sm font-bold text-white uppercase tracking-tight group-hover:text-[#8B5CF6] transition-colors">{item.nombre}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">Cuota base amortización: <span className="text-slate-300">${item.cuota.toLocaleString()}</span></p>
                </div>
                <div className="text-left sm:text-right font-sans">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1 opacity-60">Saldo Post-Impacto</p>
                  <p className={`text-base font-black tracking-tight ${item.saldo === 0 ? 'text-[#E5A93B] drop-shadow-[0_0_8px_rgba(229, 169, 59, 0.3)]' : 'text-slate-100'}`}>
                    {item.saldo === 0 ? '✓ EXTINGUIDA' : `$${item.saldo.toLocaleString()}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
