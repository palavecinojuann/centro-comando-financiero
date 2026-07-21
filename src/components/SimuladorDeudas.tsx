import React, { useState, useMemo } from 'react';
import { FinancialEngine, Deuda } from '../services/motores/FinancialEngine';
import { AuditorCognitivo, AnalisisDeuda } from '../services/motores/AuditorCognitivo';
import { Brain, Loader2 } from 'lucide-react';

interface SimuladorDeudasProps {
  deudas: Deuda[];
  onSaldosMutated: (nuevasDeudas: Deuda[]) => void;
}

export const SimuladorDeudas: React.FC<SimuladorDeudasProps> = ({ deudas, onSaldosMutated }) => {
  const [inyeccionExtra, setInyeccionExtra] = useState<number>(50000);
  
  // Estado para el análisis de IA
  const [analizandoIA, setAnalizandoIA] = useState(false);
  const [analisisIA, setAnalisisIA] = useState<AnalisisDeuda | null>(null);

  // 2. Ejecución del algoritmo Bola de Nieve mediante el motor lógico
  const resultadoBolaDeNieve = useMemo(() => {
    return FinancialEngine.procesarBolaDeNieveDeudas(deudas, inyeccionExtra);
  }, [deudas, inyeccionExtra]);

  // Función interna para simular el pago real de este mes y actualizar saldos
  const aplicarPagosDelMes = () => {
    const nuevasDeudas = deudas.map(deuda => {
      const ataque = resultadoBolaDeNieve.planAtaque.find(p => p.deudaiId === deuda.id);
      if (ataque) {
        const nuevoSaldo = Math.max(0, deuda.saldoPendiente - ataque.pagoTotalEsteMes);
        return {
          ...deuda,
          saldoPendiente: nuevoSaldo,
          // Si el saldo llega a 0, la cuota base se extingue en el sistema
          cuotaMensual: nuevoSaldo === 0 ? 0 : deuda.cuotaMensual
        };
      }
      return deuda;
    });
    
    onSaldosMutated(nuevasDeudas);
    // Reseteamos el extra opcional tras el impacto
    setInyeccionExtra(0);
    setAnalisisIA(null); // Limpiar análisis al cambiar el escenario
  };

  const ejecutarAnalisisIA = async () => {
    setAnalizandoIA(true);
    const auditor = new AuditorCognitivo();
    const resultado = await auditor.analizarEstrategiaDeudas(deudas.filter(d => d.saldoPendiente > 0));
    setAnalisisIA(resultado);
    setAnalizandoIA(false);
  };

  return (
    <div className="max-w-6xl mx-auto bg-[#161a23]/60 backdrop-blur-xl border border-white/10 p-4 md:p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden mt-8">
      {/* Fondo con brillo */}
      <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#E5A93B]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10 gap-6 border-b border-white/5 pb-8">
        <div>
          <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-[#E5A93B] font-black mb-2">
            LIQUIDATION_ENGINE // SNOWBALL_MATRIX
          </p>
          <h3 className="font-serif text-2xl tracking-normal text-white uppercase font-bold flex items-center gap-3">
             Plan de Ataque: Bola de Nieve
          </h3>
        </div>
        
        <button
          onClick={ejecutarAnalisisIA}
          disabled={analizandoIA || deudas.every(d => d.saldoPendiente === 0)}
          className="flex items-center gap-3 bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-[#a78bfa] px-6 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-[#8B5CF6]/30 shadow-[0_4px_15px_rgba(139,92,246,0.2)] disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
        >
          {analizandoIA ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
          {analizandoIA ? 'Auditando...' : 'Auditoría IA (Táctica)'}
        </button>
      </div>

      {analisisIA && (
        <div className="mb-10 p-8 bg-gradient-to-br from-[#8B5CF6]/15 to-[#8B5CF6]/5 border border-[#8B5CF6]/30 rounded-3xl relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 shadow-[0_10px_40px_rgba(112,0,255,0.1)] backdrop-blur-md">
          <div className="col-span-1 border-r border-[#8B5CF6]/20 pr-4">
             <div className="flex items-center gap-3 mb-4">
                <Brain className="w-6 h-6 text-[#a78bfa] drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]" />
                <h4 className="text-[10px] font-sans tracking-[0.2em] uppercase text-[#a78bfa] font-black">Veredicto Cognitivo</h4>
             </div>
             <p className="text-3xl font-serif font-bold text-white tracking-tight mb-4">{analisisIA.estrategiaOptima === 'BOLA_DE_NIEVE' ? 'Bola de Nieve' : 'Avalancha'}</p>
             <p className="text-[13px] font-sans font-normal text-slate-300 leading-relaxed italic opacity-90">"{analisisIA.fundamento}"</p>
          </div>
          
          <div className="col-span-2 space-y-6">
             <h4 className="text-[10px] font-sans font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
                <span className="w-4 h-[1px] bg-slate-700"></span>
                Acciones de Extinción Sugeridas
             </h4>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {analisisIA.acciones.map((accion, idx) => (
                 <div key={idx} className="bg-black/30 border border-white/10 p-5 rounded-2xl group hover:bg-black/50 transition-colors">
                    <p className="text-white font-black text-sm uppercase tracking-tight group-hover:text-[#a78bfa] transition-colors">{accion.nombre}</p>
                    <p className="text-[11px] text-[#E5A93B] font-bold uppercase tracking-wider mt-3 border-t border-white/5 pt-3 mb-1">Impacto Táctico:</p>
                    <p className="text-[12px] text-slate-300 font-medium leading-normal">{accion.sugerenciaTactica}</p>
                 </div>
               ))}
             </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-10">
        {/* Controles de Entrada */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-[#161A23]/80 p-6 rounded-3xl border border-white/10 shadow-inner backdrop-blur-md">
            <label className="block text-[10px] font-sans font-black uppercase tracking-widest text-[#F1C40F] mb-4">
              SURALIMENTACIÓN EXTRA ($)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-lg font-black text-slate-500">$</span>
              <input 
                type="number" 
                step="5000"
                value={inyeccionExtra || ''} 
                onChange={(e) => setInyeccionExtra(Number(e.target.value))}
                className="w-full bg-black/40 p-4 pl-10 rounded-xl text-xl font-black text-white focus:outline-none border border-white/5 focus:border-[#F1C40F] transition-all shadow-inner"
                placeholder="0"
              />
            </div>
            <p className="text-[11px] font-medium text-slate-500 mt-4 leading-relaxed font-sans italic opacity-80">
              Capital excedente inyectado directamente para reducir el capital de las deudas prioritarias.
            </p>
          </div>

          {/* Caja de Retención: Dinero Secuestrado */}
          {resultadoBolaDeNieve.capitalBloqueadoParaProximoMes > 0 && (
            <div className="group bg-gradient-to-br from-[#E5A93B]/15 to-transparent border border-[#E5A93B]/30 p-6 rounded-3xl text-[#E5A93B] shadow-[0_10px_20px_rgba(229, 169, 59, 0.05)]">
              <h4 className="text-[10px] font-sans font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <span className="animate-pulse">🔒</span> Dinero Comprometido
              </h4>
              <p className="text-3xl font-serif font-bold text-white tracking-tighter">${resultadoBolaDeNieve.capitalBloqueadoParaProximoMes.toLocaleString()}</p>
              <p className="text-[11px] font-medium text-[#E5A93B]/80 mt-3 leading-relaxed font-sans italic">
                Suma de cuotas extinguidas que el búnker ha <strong className="font-black">secuestrado</strong> para la siguiente deuda.
              </p>
            </div>
          )}

          <button
            onClick={aplicarPagosDelMes}
            className="w-full bg-gradient-to-r from-[#ff007f] to-[#ff4d94] text-white p-5 rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-[0_10px_25px_rgba(255,0,127,0.4)] hover:brightness-110 transition-all active:scale-[0.97] border border-white/10"
          >
            Ejecutar Impacto Mensual
          </button>
        </div>

        {/* Monitoreo de Línea de Ataque */}
        <div className="lg:col-span-2 space-y-6">
          <p className="text-[10px] font-sans font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <span className="w-4 h-[1px] bg-slate-700"></span>
            ORDEN DE ATAQUE PROYECTADO
          </p>
          
          <div className="space-y-4">
            {deudas.map((deuda) => {
              const ejecucion = resultadoBolaDeNieve.planAtaque.find(p => p.deudaiId === deuda.id);
              const esExtinguida = deuda.saldoPendiente === 0;

              return (
                <div 
                  key={deuda.id} 
                  className={`group p-6 rounded-2xl border transition-all duration-500 hover:translate-x-1 ${
                    esExtinguida 
                      ? 'bg-black/40 border-white/5 opacity-50 grayscale' 
                      : 'bg-[#161A23]/80 border-white/10 shadow-lg hover:border-[#E5A93B]/40 backdrop-blur-md'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div className="font-sans">
                      <h4 className={`font-black text-lg uppercase tracking-tight ${esExtinguida ? 'text-slate-500' : 'text-white'}`}>{deuda.nombre}</h4>
                      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-70">
                        Tasa: {deuda.tasaInteres}% // Cuota: ${deuda.cuotaMensual.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-left sm:text-right font-sans">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Saldo a Extinguir</p>
                      <p className={`text-xl font-serif font-bold tracking-tighter ${esExtinguida ? 'text-[#E5A93B]' : 'text-[#F1C40F]'}`}>
                        {esExtinguida ? '✓ EXTINGUIDA' : `$${deuda.saldoPendiente.toLocaleString()}`}
                      </p>
                    </div>
                  </div>

                  {!esExtinguida && ejecucion && (
                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-sans italic opacity-90">
                      <span className="text-slate-400 font-bold uppercase tracking-widest">Absorción total este ciclo:</span>
                      <span className="font-sans bg-[#E5A93B]/10 px-4 py-2 rounded-xl text-[#E5A93B] font-black border border-[#E5A93B]/20 shadow-[0_0_15px_rgba(229, 169, 59, 0.1)]">
                        -${ejecucion.pagoTotalEsteMes.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
