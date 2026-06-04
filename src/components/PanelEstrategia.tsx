import React from "react";
import {
  SituacionFinanciera,
  TipoProtocolo,
  useSimuladorEscenarios,
} from "../hooks/useSimuladorEscenarios";
import {
  ShieldCheck,
  TrendingUp,
  Coffee,
  Scissors,
  AlertOctagon,
  Flame,
  Sparkles,
} from "lucide-react";
import { ExplicacionCopiloto } from "./ExplicacionCopiloto";

interface PanelEstrategiaProps {
  situacionBase: SituacionFinanciera;
  isOpen: boolean;
  onClose: () => void;
  onProtocoloChange?: (protocoloId: TipoProtocolo, nombre: string) => void;
}

/**
 * Mapeo de iconos según el tipo de protocolo
 */
const mapearIcono = (id: TipoProtocolo) => {
  switch (id) {
    case "BLINDAJE":
      return <ShieldCheck className="w-5 h-5 text-cyan-300" />;
    case "EXPANSION":
      return <TrendingUp className="w-5 h-5 text-[#ff007f]" />;
    case "DISFRUTE":
      return <Coffee className="w-5 h-5 text-yellow-400" />;
    case "FRENAR_FUGAS":
      return <Scissors className="w-5 h-5 text-red-500" />;
    case "ABSORBER_IMPACTO":
      return <AlertOctagon className="w-5 h-5 text-orange-500" />;
    case "ROMPER_CRISTAL":
      return <Flame className="w-5 h-5 text-red-600" />;
    case "TACTICO_LIBRE":
      return <Scissors className="w-5 h-5 text-purple-400" />;
    default:
      return <ShieldCheck className="w-5 h-5 text-white/50" />;
  }
};

/**
 * Mapeo de descripciones amigables
 */
const mapearDescripcionAmigable = (id: TipoProtocolo) => {
  switch (id) {
    case "BLINDAJE":
      return "Guarda el dinero extra en tu fondo seguro para imprevistos. Te da tranquilidad total.";
    case "EXPANSION":
      return "Usa la plata extra para pagar deudas más rápido o invertirla para crecer tu patrimonio.";
    case "DISFRUTE":
      return "Separa este sobrante para gustos, salidas o recargar energías. Ya cumpliste tus metas.";
    case "FRENAR_FUGAS":
      return "Recorta temporalmente los gastos no esenciales (salidas, suscripciones) para equilibrar los números sin deudas.";
    case "ABSORBER_IMPACTO":
      return "Usa parte de tus ahorros de emergencia para cubrir este faltante temporal sin endeudarte.";
    case "ROMPER_CRISTAL":
      return "Situación extrema: pide un ingreso extra urgente o busca deuda barata para sobrevivir el mes.";
    case "TACTICO_LIBRE":
      return "Tú decides manualmente cuánto dinero va a gastos críticos y cuánto a estilo de vida.";
    default:
      return "";
  }
};

/**
 * Componente visual para la comparación de escenarios financieros alternativos en tiempo real.
 * Utiliza paleta Dark Mode con Glassmorphism.
 */
export function PanelEstrategia({
  situacionBase,
  isOpen,
  onClose,
  onProtocoloChange,
}: PanelEstrategiaProps) {
  const [porcentajesManuales, setPorcentajesManuales] = React.useState({
    indispensables: 50,
    variables: 50,
  });

  const balance = situacionBase.ingresosTotales - situacionBase.gastosTotales;
  // Lógica del recomendador/optimizador
  const protocoloRecomendado = balance >= 0 ? "BLINDAJE" : "FRENAR_FUGAS";

  const { escenarioActivo, escenariosAlternativos, cambiarProtocolo } =
    useSimuladorEscenarios(situacionBase, protocoloRecomendado);

  React.useEffect(() => {
    if (onProtocoloChange) {
      onProtocoloChange(escenarioActivo.id, escenarioActivo.nombre);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [escenarioActivo.id, escenarioActivo.nombre]);

  const manejarSeleccion = (id: TipoProtocolo) => {
    cambiarProtocolo(id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-4xl h-full bg-[#0D0E15]/95 backdrop-blur-3xl border-l border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col animate-in slide-in-from-right duration-700 ease-out overflow-y-auto overflow-x-hidden p-6 md:p-12 rounded-l-[40px] md:rounded-l-[60px] relative">
        
        {/* Luces volumétricas de fondo */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#06B6D4]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#ff007f]/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Header Modal */}
        <div className="flex justify-between items-center mb-12 pb-6 border-b border-white/5 sticky top-0 bg-transparent z-20 backdrop-blur-md">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#8B5CF6]/10 flex items-center justify-center border border-[#8B5CF6]/30 text-[#06B6D4] shadow-[0_0_20px_rgba(139,92,246,0.2)]">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-white font-serif font-black text-2xl tracking-tight uppercase">
                Arquitectura Estratégica
              </h2>
              <p className="text-[#06B6D4] text-[9px] font-black tracking-[0.3em] uppercase opacity-70">
                Protocolos de Operación // Equilibra OS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all border border-white/10 uppercase text-[9px] font-black tracking-widest active:scale-95"
          >
            Cerrar Terminal
          </button>
        </div>

        <div className="flex flex-col xl:flex-row gap-12 w-full font-sans relative z-10">
          <div className="flex flex-col gap-8 w-full xl:w-2/3">
            {/* Cabecera del Panel */}
            <div className="flex flex-col gap-2">
              <h2 className="text-[#06B6D4] text-[9px] font-black uppercase tracking-[0.4em] flex items-center justify-between">
                <span>SIMULADOR DE RITMO OPERATIVO</span>
                <div
                  className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest ${balance >= 0 ? "bg-[#06b6d4]/10 text-[#06b6d4] border border-[#06b6d4]/30" : "bg-red-500/10 text-red-400 border border-red-500/30"}`}
                >
                  {balance >= 0 ? "SUPERÁVIT DETECTADO" : "DÉFICIT DETECTADO"}
                </div>
              </h2>
              <h3 className="text-white text-3xl font-black tracking-tighter uppercase font-serif">
                Optimización de Escenarios
              </h3>
            </div>

            {/* Escenario Principal Activo (Relieve 3D Destacado) */}
            <div className="flex flex-col gap-4">
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] pl-1">
                Protocolo en Ejecución
              </p>
              <div className="bg-white/5 backdrop-blur-xl p-8 md:p-10 rounded-[32px] shadow-2xl border border-white/10 relative overflow-hidden transition-all duration-500 group">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#06b6d4] to-[#8B5CF6] shadow-[0_0_15px_#06B6D4]"></div>

                {/* Etiqueta Sugerido por IA */}
                {escenarioActivo.id === protocoloRecomendado && (
                  <div className="absolute top-6 right-6 flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-md shadow-lg">
                    <Sparkles className="w-3.5 h-3.5 text-[#06B6D4]" />
                    <span className="text-[9px] font-black text-white tracking-[0.2em] uppercase font-sans">
                      Sugerencia IA
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-8">
                  <div className="w-20 h-20 shrink-0 rounded-3xl bg-black/40 border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                    {React.cloneElement(
                      mapearIcono(escenarioActivo.id) as React.ReactElement,
                      {
                        className:
                          "w-10 h-10 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]",
                      },
                    )}
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-white font-black text-3xl mb-3 tracking-tight font-serif uppercase">
                      {escenarioActivo.nombre}
                    </h4>
                    <p className="text-slate-400 text-base font-medium leading-relaxed max-w-lg">
                      {mapearDescripcionAmigable(escenarioActivo.id)}
                    </p>
                    <div className="mt-8 bg-black/40 rounded-2xl px-6 py-5 border border-white/5 shadow-inner">
                      <p className="text-[#06B6D4] text-sm font-black leading-relaxed tracking-wide font-sans italic opacity-90">
                        ➤ {escenarioActivo.resultadoProyectado}
                      </p>
                    </div>
                  </div>
                </div>

                {escenarioActivo.id === "TACTICO_LIBRE" && (
                  <div className="mt-10 pt-10 border-t border-white/5 space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-black text-[#06b6d4] uppercase tracking-[0.3em]">
                        Asignación de Recursos Manual
                      </span>
                      <span
                        className={`text-base font-black font-mono ${Object.values(porcentajesManuales).reduce((a: number, b: number) => a + b, 0) === 100 ? "text-[#06b6d4]" : "text-[#ff007f]"}`}
                      >
                        {Object.values(porcentajesManuales).reduce(
                          (a: number, b: number) => a + b,
                          0,
                        )}
                        % / 100%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                      {Object.entries(porcentajesManuales).map(([nivel, perc]: [string, any]) => (
                        <div key={nivel} className="space-y-4">
                          <div className="flex justify-between items-center text-[11px] font-black text-white uppercase tracking-wider">
                            <span>{nivel === 'indispensables' ? 'Supervivencia' : 'Estilo de Vida'}</span>
                            <span className="text-[#06b6d4]">{perc}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={perc}
                            onChange={(e) =>
                              setPorcentajesManuales({
                                ...porcentajesManuales,
                                [nivel]: parseInt(e.target.value),
                              })
                            }
                            className="w-full h-2 bg-black/40 rounded-full appearance-none cursor-pointer accent-[#8B5CF6]"
                          />
                          <p className="text-xs font-black text-white/40 font-mono tracking-tighter">
                            ${((situacionBase.ingresosTotales * perc) / 100).toLocaleString()} ARS
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-[#ff007f]/5 p-5 rounded-2xl border border-[#ff007f]/20">
                      <p className="text-[11px] text-[#ff007f] font-black leading-relaxed tracking-widest uppercase opacity-80">
                        // Advertencia: Protocolo de anulación algorítmica activo.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Escenarios Alternativos */}
            <div className="flex flex-col gap-4 mt-6">
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] pl-1">
                Matriz de Alternativas
              </p>
              <div className="grid grid-cols-1 gap-5">
                {escenariosAlternativos.map((escenario) => (
                  <button
                    key={escenario.id}
                    onClick={() => manejarSeleccion(escenario.id)}
                    className="text-left relative bg-white/5 backdrop-blur-md px-8 py-6 rounded-3xl border border-white/5 hover:border-[#06B6D4]/30 hover:bg-white/10 transition-all duration-300 group"
                  >
                    {/* IA Tag en alternativas */}
                    {escenario.id === protocoloRecomendado && (
                      <div className="absolute top-4 right-6 flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                        <Sparkles className="w-3 h-3 text-[#06B6D4]" />
                        <span className="text-[8px] font-black text-white tracking-widest uppercase">IA</span>
                      </div>
                    )}

                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 flex-shrink-0 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-all duration-500 group-hover:border-[#06b6d4]/50">
                        {React.cloneElement(
                          mapearIcono(escenario.id) as React.ReactElement,
                          {
                            className:
                              "w-7 h-7 text-white/50 group-hover:text-white transition-all",
                          },
                        )}
                      </div>
                      <div className="flex flex-col pr-8 font-sans">
                        <h5 className="text-white font-black text-xl group-hover:text-[#06b6d4] transition-colors tracking-tight uppercase font-serif">
                          {escenario.nombre}
                        </h5>
                        <p className="text-slate-500 text-sm font-medium mt-1 mb-3 leading-relaxed group-hover:text-slate-300 transition-colors">
                          {mapearDescripcionAmigable(escenario.id)}
                        </p>
                        <p className="text-[#06b6d4] text-[10px] font-black leading-relaxed uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">
                          PROYECCIÓN: {escenario.resultadoProyectado}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Auditor Cognitivo Modal / Panel Right Side */}
          <div className="w-full xl:w-1/3 flex flex-col">
            <div className="sticky top-12 bg-black/40 p-1 rounded-[32px] border border-white/5">
              <ExplicacionCopiloto situacionBase={situacionBase} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
