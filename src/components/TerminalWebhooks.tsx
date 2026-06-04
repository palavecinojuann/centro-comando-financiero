import React, { useState } from 'react';

interface TerminalWebhooksProps {
  alertasCL?: any[];
}

export const TerminalWebhooks: React.FC<TerminalWebhooksProps> = ({ alertasCL }) => {
  // Datos simulados de los últimos webhooks capturados en segundo plano
  const [logs] = useState([
    { id: 'l1', time: '12:14:02', origen: 'MERCADO_PAGO_API', desc: 'COTO DIGITAL SUK.', monto: 45200, status: 'CONSOLIDADO_N5', color: '#06B6D4' },
    { id: 'l2', time: '10:45:18', origen: 'VISA_STREAM_INTEGRATION', desc: 'YPF ACASSUSO', monto: 35000, status: 'CONSOLIDADO_N5', color: '#06B6D4' },
    { id: 'l3', time: '08:22:10', origen: 'STRIPE_WEBHOOK_NODE', desc: 'NETFLIX TOKYO', monto: 8900, status: 'CONSOLIDADO_N3', color: '#8B5CF6' },
  ]);

  return (
    <div className="max-w-4xl mx-auto bg-black/40 backdrop-blur-2xl border border-white/10 p-6 md:p-10 rounded-3xl shadow-[0_40px_80px_rgba(0,0,0,0.6)] relative overflow-hidden text-slate-200 group">
      
      {/* GLOW DE PUERTO ACTIVO CIAN */}
      <div className="absolute -left-20 -bottom-20 w-44 h-44 bg-[#06B6D4]/10 blur-[80px] pointer-events-none group-hover:bg-[#06B6D4]/15 transition-all duration-1000" />

      {/* Encabezado del Terminal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-8 mb-10 gap-6">
        <div>
          <p className="text-[9px] font-black tracking-[0.4em] uppercase text-[#06B6D4] mb-3 opacity-70">
            NETWORK_STREAM // PASIVE_CAPTURE
          </p>
          <h3 className="font-serif text-3xl md:text-4xl tracking-tight text-white uppercase font-black">
            Alertas de Terminal
          </h3>
        </div>
        <div className="bg-[#161a23]/80 border border-[#06B6D4]/30 px-6 py-3 rounded-2xl font-mono text-[9px] text-[#06B6D4] tracking-[0.2em] font-black uppercase shadow-[0_0_20px_rgba(6,182,212,0.1)]">
          GATEWAY: SECURE_LISTENING
        </div>
      </div>

      {/* Alertas del Cerebro Lógico (C.L.) en formato Terminal */}
      {alertasCL && alertasCL.length > 0 && (
        <div className="mb-10">
          <p className="text-[9px] font-black tracking-[0.3em] uppercase text-[#ff007f] mb-4 flex items-center gap-3">
            <span className="w-8 h-[1px] bg-[#ff007f]/50 animate-pulse"></span>
            Alertas Críticas del Cerebro Lógico // AUDIT_STREAM
          </p>
          <div className="bg-black/20 border border-white/5 rounded-3xl p-6 md:p-8 space-y-5 max-h-[400px] overflow-y-auto custom-scrollbar shadow-inner relative z-10">
            {alertasCL.map((alerta) => {
              const esCritica = alerta.severidad === 'CRITICA';
              const esAlta = alerta.severidad === 'ALTA';
              const color = esCritica ? '#ff007f' : esAlta ? '#EAB308' : '#06B6D4';
              return (
                <div key={alerta.id} className="font-mono text-[11px] leading-relaxed border-b border-white/5 pb-4 last:border-none">
                  <div className="flex justify-between items-start gap-4 flex-wrap mb-1">
                    <span className="font-black text-[10px]" style={{ color }}>
                      &gt;&gt; [C.L. AUDIT // {alerta.categoria}] {alerta.severidad}
                    </span>
                    <span className="text-slate-600 text-[9px]">{alerta.id}</span>
                  </div>
                  <div className="text-white font-bold text-xs uppercase mb-1">{alerta.titulo}</div>
                  <div className="text-slate-400 text-[11px] mb-2">{alerta.mensaje}</div>
                  {alerta.accion && (
                    <div className="text-[9px] text-[#06B6D4] bg-[#06B6D4]/5 border border-[#06B6D4]/15 px-3 py-1.5 rounded-lg inline-block">
                      <span className="font-bold">DECRETO C.L. REQUERIDO:</span> {alerta.accion}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista de Intercepciones en Tiempo Real */}
      <div className="space-y-6">
        <p className="text-[9px] font-black tracking-[0.3em] uppercase text-slate-500 mb-6 flex items-center gap-3">
          <span className="w-8 h-[1px] bg-[#06b6d4]/30"></span>
          Ingesta de Datos Reciente // RT_SYNC
        </p>

        <div className="bg-black/20 border border-white/5 rounded-3xl p-6 md:p-8 space-y-5 max-h-[500px] overflow-y-auto custom-scrollbar shadow-inner relative z-10">
          {logs.map((log) => (
            <div key={log.id} className="group text-[12px] flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-5 last:border-none gap-4 hover:bg-white/5 p-4 rounded-2xl transition-all duration-300">
              <div className="flex items-center gap-5 flex-wrap font-sans">
                 <div className="flex flex-col">
                  <span className="text-slate-600 font-mono text-[10px] tracking-widest">[{log.time}]</span>
                  <span className="text-[#06B6D4] font-black text-[9px] tracking-[0.1em] uppercase mt-0.5">{log.origen}</span>
                 </div>
                <span className="text-white font-black text-sm uppercase tracking-tight group-hover:text-[#06B6D4] transition-colors">{log.desc}</span>
              </div>
              <div className="flex items-center gap-5 self-stretch sm:self-auto justify-between sm:justify-end">
                <span className="text-white font-black tracking-tighter text-lg font-mono">${log.monto.toLocaleString()}</span>
                <span 
                  className="px-4 py-1.5 text-[9px] font-black rounded-xl border uppercase tracking-[0.2em] shadow-sm"
                  style={{ color: log.color, borderColor: `${log.color}30`, backgroundColor: `${log.color}10` }}
                >
                  {log.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-[9px] font-black tracking-[0.4em] text-slate-500 mt-10 text-center opacity-40 uppercase">
        [ Protocolo de monitoreo continuo bi-flujo ]
      </div>
    </div>
  );
};
