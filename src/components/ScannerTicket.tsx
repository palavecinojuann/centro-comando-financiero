// ScannerTicket.tsx - Panel de Escaneo Multimodal con Inteligencia Artificial // BÚNKER
import React, { useState } from 'react';

interface ScannerTicketProps {
  onAnalisisCompleto: (comercio: string, monto: number, porcentaje: number) => void;
}

export const ScannerTicket: React.FC<ScannerTicketProps> = ({ onAnalisisCompleto }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [veredicto, setVeredicto] = useState<any>(null);

  const procesarImagen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setVeredicto(null);

    // Conversión del archivo a Base64 para su transmisión segura hacia el servidor
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64String = (reader.result as string).split(',')[1];
      
      try {
        // Llamada a nuestro endpoint en Express (proxy a Gemini)
        const response = await fetch('/api/ocr-ticket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64String,
            mimeType: file.type
          })
        });

        const data = await response.json();
        setVeredicto(data);
      } catch (error) {
        console.error("Error en la transmisión de datos multimodales:", error);
      } finally {
        setLoading(false);
      }
    };
  };

  return (
    <div className="max-w-md mx-auto bg-[#161A23]/50 backdrop-blur-xl border border-[#8B5CF6]/20 p-6 rounded-none shadow-2xl relative overflow-hidden text-slate-200">
      {/* Contorno luminoso superior Violeta (Exclusivo IA) */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#8B5CF6]/40 to-transparent" />

      <div className="mb-6">
        <p className="text-[9px] font-mono tracking-[0.25em] uppercase text-[#8B5CF6] font-bold mb-1">
          COGNITIVE // VISION_OCR
        </p>
        <h3 className="font-serif text-sm tracking-widest text-white uppercase font-medium">
          Auditoría Óptica de Tickets
        </h3>
      </div>

      {/* Input Técnico de Carga */}
      <div className="space-y-4">
        <div className="border border-dashed border-[#8B5CF6]/30 bg-black/20 p-6 text-center relative hover:border-[#8B5CF6]/60 transition-colors">
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" // Dispara la cámara trasera directamente en dispositivos móviles
            onChange={procesarImagen}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={loading}
          />
          <p className="text-xs font-mono text-slate-400">
            [ {loading ? "EJECUTANDO ANÁLISIS COGNITIVO..." : "EJECUTAR ESCANEO CIBERNÉTICO DE TICKET"} ]
          </p>
        </div>

        {/* Loader Animado de la Bóveda */}
        {loading && (
          <div className="py-4 flex justify-center items-center gap-3">
            <div className="w-4 h-4 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-mono tracking-widest text-[#8B5CF6] uppercase animate-pulse">
              Deconstruyendo matriz de ítems...
            </span>
          </div>
        )}

        {/* Renderizado de Veredicto e Inyección al Triaje */}
        {veredicto && (
          <div className="bg-black/40 border border-white/5 p-4 space-y-4 animate-fadeIn">
            <div className="font-mono text-[11px] space-y-1.5 border-b border-white/5 pb-3">
              <p className="text-slate-500">&gt; COMERCIO: <span className="text-white font-bold">{veredicto.comercio}</span></p>
              <p className="text-slate-500">&gt; IMPORTE TOTAL: <span className="text-white font-bold">${veredicto.montoTotal?.toLocaleString()}</span></p>
              <p className="text-slate-500">&gt; REPARTO SUGERIDO CIMIENTO: <span className="text-[#06B6D4] font-bold">{veredicto.porcentajeCimiento}%</span></p>
            </div>

            <div className="p-3 bg-[#8B5CF6]/5 border border-[#8B5CF6]/10 text-[10px] font-mono text-slate-400 leading-normal">
              <span className="text-[#8B5CF6] font-bold">VEREDICTO IA:</span> {veredicto.justificacionCognitiva}
            </div>

            <button
              onClick={() => {
                onAnalisisCompleto(veredicto.comercio, veredicto.montoTotal, veredicto.porcentajeCimiento);
                setVeredicto(null);
              }}
              className="w-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/40 hover:bg-[#8B5CF6]/20 hover:border-[#8B5CF6] text-[#8B5CF6] hover:text-white hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] text-[10px] font-mono tracking-widest uppercase py-2.5 font-bold transition-all duration-300"
            >
              CONFIRMAR E INYECTAR EN TRIAJE REAL
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
