import React from 'react';
import { AlertTriangle, ShieldAlert, PauseCircle, TrendingUp } from 'lucide-react';
import type { InterfazAlerta as TipoAlerta } from './AuditorGastosVampiro';

interface PropiedadesComponente {
  alerta: TipoAlerta;
  alPausarEnTriaje: (idGasto: string) => void;
}

/**
 * COMPONENTE: AlertaEficiencia
 * DISEÑO: Neumorfismo Búnker OS (Sombras profundas, material Irish Cream)
 */
export const AlertaEficiencia: React.FC<PropiedadesComponente> = ({ alerta, alPausarEnTriaje }) => {
  const esAnomaliaPrecio = alerta.tipoAnomalia === 'ANOMALIA_DE_PRECIO';

  return (
    <div className="p-8 rounded-[2rem] bg-[#E8DFD1] shadow-[8px_8px_16px_#DBCFBF,-8px_-8px_16px_#F5EFEB] flex flex-col gap-4 border border-white/20 transition-all hover:scale-[1.02]">
      {/* CABECERA DE ALERTA */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl shadow-[inset_2px_2px_5px_#DBCFBF,inset_-2px_-2px_5px_#F5EFEB] ${alerta.prioridad === 'ALTA' ? 'text-red-500' : 'text-[#8B735B]'}`}>
            {alerta.prioridad === 'ALTA' ? <ShieldAlert size={24} /> : <AlertTriangle size={24} />}
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B735B] opacity-50">
              {alerta.tipoAnomalia.replace('_', ' ')}
            </h4>
            <h3 className="text-lg font-black text-gray-800 tracking-tight leading-tight">
              {alerta.comercio}
            </h3>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-gray-800">${alerta.montoActual.toLocaleString()}</p>
          {esAnomaliaPrecio && (
            <div className="flex items-center gap-1 text-red-500 justify-end">
              <TrendingUp size={12} />
              <span className="text-[10px] font-bold">+${alerta.montoDiferencia?.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* MENSAJE DESCRIPTIVO */}
      <p className="text-xs font-bold text-[#8B735B]/70 leading-relaxed italic">
        "{alerta.mensajeAlerta}"
      </p>

      {/* ACCIONES ESTRATÉGICAS */}
      <div className="mt-4 flex gap-4">
        <button 
          onClick={() => alPausarEnTriaje(alerta.idGastoOriginal)}
          className="flex-1 py-4 flex items-center justify-center gap-2 rounded-2xl bg-[#E8DFD1] shadow-[4px_4px_8px_#DBCFBF,-4px_-4px_8px_#F5EFEB] active:shadow-[inset_4px_4px_8px_#DBCFBF,inset_-4px_-4px_8px_#F5EFEB] transition-all group"
        >
          <PauseCircle size={18} className="text-[#8B735B] group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black tracking-widest text-[#8B735B]">PAUSAR EN TRIAJE</span>
        </button>
        
        <button className="px-6 py-4 rounded-2xl bg-[#8B735B] text-white shadow-lg text-[10px] font-black tracking-widest hover:brightness-110 active:scale-95 transition-all">
          DESCARTAR
        </button>
      </div>
    </div>
  );
};

export default AlertaEficiencia;
