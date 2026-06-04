import React, { useState, useEffect } from 'react';
import { Camera, Check, Edit3, X, Upload } from 'lucide-react';
import { IntervencionGemini } from '../services/motores/IntervencionGemini';

type ScannerState = 'IDLE' | 'SCANNING' | 'RESULT';

interface EscanerTicketsUIProps {
  onClose: () => void;
  onConfirm: (data: { monto: number; categoria: string; comercio: string; sugerenciaMacro?: 'COMPROMISOS_INDISPENSABLES' | 'GASTOS_VARIABLES' }) => void;
}

export function EscanerTicketsUI({ onClose, onConfirm }: EscanerTicketsUIProps) {
  const [scannerState, setScannerState] = useState<ScannerState>('IDLE');
  const [scanTextIndex, setScanTextIndex] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{monto: number, comercio: string, categoria: string, sugerenciaMacro: 'COMPROMISOS_INDISPENSABLES' | 'GASTOS_VARIABLES' } | null>(null);

  const IA = new IntervencionGemini();

  const scanTexts = [
    "Leyendo imagen...",
    "Detectando monto...",
    "Buscando comercio...",
    "Asignando categoría..."
  ];

  useEffect(() => {
    let textInterval: NodeJS.Timeout;

    if (scannerState === 'SCANNING') {
      textInterval = setInterval(() => {
        setScanTextIndex((prev) => (prev + 1) % scanTexts.length);
      }, 750);
    }

    return () => {
      clearInterval(textInterval);
    };
  }, [scannerState]);

  const processImage = async (file: File) => {
    try {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setScannerState('SCANNING');
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const resultado = await IA.procesarTicketImagen(base64String, file.type);
        
        if (resultado) {
          setScanResult({
            monto: resultado.montoTotal,
            comercio: resultado.nombreComercio,
            categoria: resultado.categoriaMacroSugerida === 'COMPROMISOS_INDISPENSABLES' ? 'Gasto Primario' : 'Gasto Secundario',
            sugerenciaMacro: resultado.categoriaMacroSugerida
          });
          setScannerState('RESULT');
        } else {
          // Si falla volvemos o mostramos un error genérico
          setScannerState('IDLE');
          alert("No se pudo procesar el ticket. Intenta de nuevo.");
        }
      };
      
      reader.readAsDataURL(file);
    } catch (e) {
      console.error(e);
      setScannerState('IDLE');
    }
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const handleSimulateCapture = () => {
    // Para demostración si no sube archivo y no quiere fallar
    setImagePreview("https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80");
    setScannerState('SCANNING');
    
    setTimeout(() => {
      setScanResult({
        monto: 45000,
        comercio: "YPF S.A.",
        categoria: "Transporte / Combustible",
        sugerenciaMacro: 'COMPROMISOS_INDISPENSABLES'
      });
      setScannerState('RESULT');
    }, 3000);
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D0E15]/90 backdrop-blur-md">
      <div className="relative w-full max-w-sm aspect-[3/4] rounded-[2rem] overflow-hidden border border-white/10 bg-black/40 shadow-2xl flex flex-col">
        
        {/* Botón cerrar */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* ESTADO: IDLE */}
        {scannerState === 'IDLE' && (
          <div 
            key="idle"
            className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in"
          >
              <div className="w-20 h-20 rounded-full bg-[#161A23]/50 border-2 border-white/10 flex items-center justify-center mb-6">
                <Camera className="w-8 h-8 text-white/50" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Escanear Ticket</h3>
              <p className="text-white/50 text-sm mb-8">
                Sube o toma una foto de tu ticket para extraer automáticamente el monto y comercio.
              </p>

              <div className="space-y-3 w-full">
                <label className="w-full flex items-center justify-center gap-2 bg-[#06B6D4]/10 text-[#06B6D4] py-4 rounded-none border border-[#06B6D4]/20 cursor-pointer hover:bg-[#06B6D4]/20 transition-colors font-bold">
                  <Camera className="w-5 h-5" />
                  Tomar Foto
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCapture} />
                </label>
                <label className="w-full flex items-center justify-center gap-2 bg-[#161A23]/50 text-white py-4 rounded-none border border-white/10 cursor-pointer hover:bg-white/10 transition-colors font-medium">
                  <Upload className="w-5 h-5" />
                  Subir Imagen
                  <input type="file" accept="image/*" className="hidden" onChange={handleCapture} />
                </label>
                <button onClick={handleSimulateCapture} className="w-full text-xs text-white/30 py-2">
                  (Simular captura)
                </button>
              </div>
          </div>
        )}

        {/* ESTADO: SCANNING */}
        {scannerState === 'SCANNING' && (
          <div 
            key="scanning"
            className="absolute inset-0 z-10 flex items-center justify-center bg-[#0D0E15] animate-in fade-in"
          >
              {/* Imagen de fondo desenfocada */}
              {imagePreview && (
                <div 
                  className="absolute inset-0 opacity-30 select-none pointer-events-none bg-cover bg-center"
                  style={{ backgroundImage: `url(${imagePreview})`, filter: 'blur(4px) grayscale(50%)' }}
                />
              )}
              
            {/* Área de enfoque / Scanner Bounding Box */}
            <div className="absolute inset-x-8 top-24 bottom-32 border border-[#06B6D4]/30 rounded-none pointer-events-none overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[#06B6D4]/10 animate-pulse" />
                <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-[#06B6D4] rounded-tl-3xl" />
                <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-[#06B6D4] rounded-tr-3xl" />
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-[#06B6D4] rounded-bl-3xl" />
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-[#06B6D4] rounded-br-3xl" />
                
                {/* Láser Scanner */}
                <div className="absolute inset-0 overflow-hidden">
                  <div 
                    className="w-full h-1 bg-gradient-to-r from-transparent via-[#D946EF] to-[#06B6D4] shadow-[0_0_15px_#D946EF,0_0_30px_#06B6D4] absolute animate-bounce"
                    style={{ top: '10%' }}
                  />
                </div>
            </div>

              {/* Mensaje flotante */}
              <div className="relative z-20 flex flex-col items-center">
                <div className="w-16 h-16 rounded-none bg-[#161A23]/50 border border-white/10 backdrop-blur-xl flex items-center justify-center mb-6 relative overflow-hidden">
                   <div className="absolute inset-0 opacity-20 border-[3px] border-[#06B6D4] rounded-none -m-1 animate-ping" />
                   <Camera className="w-6 h-6 text-white animate-pulse" />
                </div>
                
              <div 
                key={scanTextIndex}
                className="px-5 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl text-white text-sm font-medium tracking-wide shadow-xl animate-in fade-in slide-in-from-bottom-2"
              >
                {scanTexts[scanTextIndex]}
              </div>
              </div>
          </div>
        )}

        {/* ESTADO: RESULT */}
        {scannerState === 'RESULT' && scanResult && (
          <div 
            key="result"
            className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-transparent to-[#06B6D4]/5 animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-500 ease-out"
          >
               <div className="w-full bg-[#161A23]/50 backdrop-blur-2xl border border-white/10 rounded-none p-6 shadow-2xl relative overflow-hidden mb-6 animate-in slide-in-from-bottom-4 duration-700 ease-out delay-150 fill-mode-both">
                 {/* Efecto de luz */}
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#06B6D4]/20 blur-[50px] rounded-full pointer-events-none" />
                 
                 <div className="text-center relative z-10">
                   <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Monto Detectado</p>
                   <h2 className="text-5xl font-black text-white tracking-tighter mb-6">$ {scanResult.monto.toLocaleString('es-AR')}</h2>
                   
                   <div className="space-y-4">
                     <div className="flex flex-col gap-1 items-center">
                       <span className="text-xs text-white/50 uppercase">Comercio</span>
                       <span className="text-base font-bold text-white">{scanResult.comercio}</span>
                     </div>
                     <div className="flex flex-col gap-1 items-center">
                       <span className="text-xs text-white/50 uppercase">Categoría Sugerida</span>
                       <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#D946EF]/20 text-[#D946EF] border border-[#D946EF]/30 text-xs font-bold">
                         {scanResult.categoria}
                       </span>
                     </div>
                   </div>
                 </div>
               </div>

               <div className="w-full space-y-3 animate-in slide-in-from-bottom-4 duration-700 ease-out delay-300 fill-mode-both">
                 <button 
                  onClick={() => setScannerState('IDLE')}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm text-slate-300 hover:text-white transition-colors"
                 >
                   <Edit3 className="w-4 h-4" />
                   Escanear otro / Corregir
                 </button>
                 
                 <button 
                  onClick={() => onConfirm({ 
                    monto: scanResult.monto, 
                    comercio: scanResult.comercio, 
                    categoria: scanResult.categoria,
                    sugerenciaMacro: scanResult.sugerenciaMacro 
                  })}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#06B6D4] to-[#00B894] text-black font-black py-4 rounded-none hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] shadow-[#06B6D4]/20"
                 >
                   <Check className="w-5 h-5" />
                   Confirmar y Cargar
                 </button>
               </div>
          </div>
        )}
      </div>
    </div>
  );
}
