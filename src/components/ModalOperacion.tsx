import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, DollarSign, Activity, AlertTriangle, Briefcase, Zap, Camera, Edit2, ChevronDown, ShieldCheck } from 'lucide-react';
import { db, auth, handleFirestoreError } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, onSnapshot, query, orderBy, deleteDoc, setDoc } from 'firebase/firestore';
import { EscanerTicketsUI } from './EscanerTicketsUI';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: any;
}

export function ModalOperacion({ isOpen, onClose, transactionToEdit }: ModalProps) {
  const [tipo, setTipo] = useState<'GASTO' | 'BIMONT' | 'JANLU' | 'DEUDA'>('GASTO');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [referencia, setReferencia] = useState('');
  const [categoriaMacro, setCategoriaMacro] = useState<'COMPROMISOS_INDISPENSABLES' | 'GASTOS_VARIABLES'>('COMPROMISOS_INDISPENSABLES');
  const [interes, setInteres] = useState('0');
  const [recurrente, setRecurrente] = useState(false);
  const [tipoLiquidacion, setTipoLiquidacion] = useState<'fija' | 'cuotas'>('fija');
  const [cuotaFija, setCuotaFija] = useState('');
  const [cuotasTotales, setCuotasTotales] = useState('1');
  const [cuotasPagadas, setCuotasPagadas] = useState('0');
  const [fechaOperacion, setFechaOperacion] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [dynamicCategories, setDynamicCategories] = useState<any[]>([]);

  useEffect(() => {
    const ID_HOGAR = "hogar_bimont_central";
    const q = query(collection(db, `hogares/${ID_HOGAR}/categorias`), orderBy('orden', 'asc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setDynamicCategories(items);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (transactionToEdit) {
       if (transactionToEdit.type === 'ingreso') {
          setTipo('BIMONT');
          setMonto(transactionToEdit.montoNeto?.toString() || '');
          setCategoria(transactionToEdit.origen || '');
       } else if (transactionToEdit.type === 'janlu') {
          setTipo('JANLU');
          setMonto(transactionToEdit.utilidad_neta?.toString() || '');
          setCategoria(transactionToEdit.origen || ''); 
       } else if (transactionToEdit.type === 'gasto') {
          setTipo('GASTO');
          setMonto(transactionToEdit.montoTotal?.toString() || '');
          setCategoria(transactionToEdit.categoria || '');
          setReferencia(transactionToEdit.referencia || '');
          setCategoriaMacro(transactionToEdit.categoriaMacro || 'COMPROMISOS_INDISPENSABLES');
          setRecurrente(transactionToEdit.recurrente || false);
       } else if (transactionToEdit.type === 'deuda') {
          setTipo('DEUDA');
          setMonto(transactionToEdit.capitalOrig?.toString() || '');
          setCategoria(transactionToEdit.nombreCompromiso || '');
          setInteres(transactionToEdit.interesPorcentual?.toString() || '0');
          setTipoLiquidacion(transactionToEdit.tipoLiquidacion || 'fija');
          setCuotaFija(transactionToEdit.cuotaMinima?.toString() || '');
          setCuotasTotales(transactionToEdit.cuotasTotales?.toString() || '1');
          setCuotasPagadas(transactionToEdit.cuotasPagadas?.toString() || '0');
       }
       
       const f = transactionToEdit.fechaGasto || transactionToEdit.fechaIngreso || transactionToEdit.fechaInyeccion || transactionToEdit.fechaVencimiento || transactionToEdit.fechaRegistro;
       if (f) {
           const d = f.toDate ? f.toDate() : new Date(f.seconds ? f.seconds * 1000 : f);
           setFechaOperacion(d.toISOString().split('T')[0]);
       } else {
           setFechaOperacion('');
       }
    } else {
       setTipo('GASTO');
       setMonto('');
       setCategoria('');
       setReferencia('');
       setCategoriaMacro('COMPROMISOS_INDISPENSABLES');
       setFechaOperacion('');
       setCuotaFija('');
       setInteres('0');
       setTipoLiquidacion('fija');
       setCuotasTotales('1');
       setCuotasPagadas('0');
    }
  }, [transactionToEdit, isOpen]);

  const handleTipoChange = (newTipo: 'GASTO' | 'BIMONT' | 'JANLU' | 'DEUDA') => {
    if (tipo !== newTipo) {
      if (tipo === 'GASTO' && newTipo !== 'GASTO') {
         if (referencia) {
            setCategoria(referencia);
         }
      } else if (tipo !== 'GASTO' && newTipo === 'GASTO') {
         if (categoria) {
            setReferencia(categoria);
            setCategoria('');
         }
      }
      setTipo(newTipo);
    }
  };

  if (!isOpen) return null;

  const handleCameraClick = () => {
    setShowScanner(true);
  };

  const handleScannerConfirm = (data: { monto: number; categoria: string; comercio: string; sugerenciaMacro?: 'COMPROMISOS_INDISPENSABLES' | 'GASTOS_VARIABLES' }) => {
    setMonto(data.monto.toString());
    setCategoria(data.comercio);
    if (data.sugerenciaMacro) {
      setCategoriaMacro(data.sugerenciaMacro);
    }
    setTipo('GASTO');
    setShowScanner(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !monto) return;
    setLoading(true);

    // Definimos el ID del hogar compartido
    const ID_HOGAR = "hogar_bimont_central";
    let rutaColeccion = "";
    let operacionTipo: any = "write";

    try {
      let datosOperacion: any = {};
      const fechaElegida = fechaOperacion ? new Date(fechaOperacion + "T12:00:00") : null;
      const valorMonto = parseFloat(monto);

      if (isNaN(valorMonto)) {
          alert("El monto debe ser un número válido.");
          setLoading(false);
          return;
      }

      switch (tipo) {
        case 'BIMONT':
          rutaColeccion = `hogares/${ID_HOGAR}/ingresos_principales`;
          operacionTipo = transactionToEdit ? 'update' : 'create';
          datosOperacion = {
            origen: categoria || "Sueldo Bimont S.A.",
            montoNeto: valorMonto
          };
          if (!transactionToEdit) {
            datosOperacion.cargadoPor = auth.currentUser.email || auth.currentUser.uid;
          }
          if (fechaElegida) datosOperacion.fechaIngreso = fechaElegida;
          else if (!transactionToEdit) datosOperacion.fechaIngreso = serverTimestamp();
          break;

        case 'GASTO':
          rutaColeccion = `hogares/${ID_HOGAR}/gastos_vitales`;
          operacionTipo = transactionToEdit ? 'update' : 'create';
          const isGastoCreation = !transactionToEdit || (transactionToEdit && transactionToEdit.type !== 'gasto');
          datosOperacion = {
            categoria: categoria || "Varios",
            referencia: referencia || "",
            montoTotal: valorMonto,
            categoriaMacro: categoriaMacro,
            recurrente: recurrente
          };
          if (isGastoCreation) {
             datosOperacion.estado = "Consolidado";
          }
          if (fechaElegida) datosOperacion.fechaGasto = fechaElegida;
          else if (isGastoCreation) datosOperacion.fechaGasto = serverTimestamp();
          break;

        case 'JANLU':
          rutaColeccion = `hogares/${ID_HOGAR}/janlu_bridge`;
          operacionTipo = transactionToEdit ? 'update' : 'create';
          const isJanluCreation = !transactionToEdit || (transactionToEdit && transactionToEdit.type !== 'janlu');
          datosOperacion = {
            utilidad_neta: valorMonto
          };
          if (isJanluCreation) {
             datosOperacion.periodo = new Date().toISOString();
          }
          if (fechaElegida) datosOperacion.fechaInyeccion = fechaElegida;
          else if (isJanluCreation) datosOperacion.fechaInyeccion = serverTimestamp();
          break;

        case 'DEUDA':
          rutaColeccion = `hogares/${ID_HOGAR}/debts`;
          operacionTipo = transactionToEdit ? 'update' : 'create';
          const isDeudaCreation = !transactionToEdit || (transactionToEdit && transactionToEdit.type !== 'deuda');
          datosOperacion = {
            nombreCompromiso: categoria,
            capitalOrig: valorMonto,
            interesPorcentual: parseFloat(interes) || 0,
            tipoLiquidacion: tipoLiquidacion,
            cuotasTotales: tipoLiquidacion === 'cuotas' ? (parseInt(cuotasTotales) || 1) : 1,
            cuotasPagadas: parseInt(cuotasPagadas) || 0
          };
          if (tipoLiquidacion === 'fija') {
            datosOperacion.cuotaMinima = parseFloat(cuotaFija) || 0;
          } else {
            if (isDeudaCreation) datosOperacion.cuotaMinima = 0;
          }
          if (fechaElegida) {
             datosOperacion.fechaVencimiento = fechaElegida;
             if (isDeudaCreation) datosOperacion.fechaRegistro = serverTimestamp();
          } else if (isDeudaCreation) {
             datosOperacion.fechaRegistro = serverTimestamp();
          }
          break;
      }

      if (transactionToEdit) {
         let originalTypeNormal = transactionToEdit.type;
         let newTypeNormal = tipo === 'BIMONT' ? 'ingreso' : tipo === 'GASTO' ? 'gasto' : tipo === 'JANLU' ? 'janlu' : 'deuda';
         
         if (originalTypeNormal !== newTypeNormal) {
             const getPath = (t: string) => {
                if (t === 'ingreso') return `hogares/${ID_HOGAR}/ingresos_principales`;
                if (t === 'gasto') return `hogares/${ID_HOGAR}/gastos_vitales`;
                if (t === 'janlu') return `hogares/${ID_HOGAR}/janlu_bridge`;
                if (t === 'deuda') return `hogares/${ID_HOGAR}/debts`;
                return '';
             };
             const oldPath = getPath(originalTypeNormal);
             await setDoc(doc(db, rutaColeccion, transactionToEdit.id), datosOperacion);
             await deleteDoc(doc(db, oldPath, transactionToEdit.id));
         } else {
             await updateDoc(doc(db, rutaColeccion, transactionToEdit.id), datosOperacion);
         }
      } else {
         await addDoc(collection(db, rutaColeccion), datosOperacion);
      }
      
      setMonto('');
      setCategoria('');
      setReferencia('');
      onClose();

    } catch (error) {
      console.error("Error al registrar la operación en el Búnker:", error);
      const errInfo = handleFirestoreError(error, operacionTipo, rutaColeccion);
      alert(`Error de Seguridad: ${errInfo.error}\nVerifica tus permisos.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-[#0D0E15]/95 w-full max-w-xl rounded-[40px] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden font-sans relative backdrop-blur-3xl animate-in zoom-in-95 duration-500 group">
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-[#06B6D4]/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#06B6D4]/20 transition-all duration-1000" />
          <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-[#8B5CF6]/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#8B5CF6]/20 transition-all duration-1000" />
          
          <div className="flex justify-between items-center p-10 border-b border-white/5 relative z-10 sticky top-0 bg-transparent backdrop-blur-md">
            <div className="flex items-center gap-6">
               <h2 className="text-white font-serif font-black text-2xl tracking-tight uppercase">
                 {transactionToEdit ? 'Modificar Orden' : 'Nueva Operación'}
               </h2>
               {!transactionToEdit && (
                   <button 
                     type="button"
                     onClick={handleCameraClick}
                     className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-[#06B6D4] rounded-2xl text-[9px] font-black tracking-[0.2em] transition-all shadow-lg border border-white/10 active:scale-95"
                   >
                     <Camera className="w-4 h-4" />
                     ELEGIR ESCANEO
                   </button>
               )}
            </div>
            <button onClick={onClose} className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white/30 hover:text-white transition-all border border-white/5">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-10 max-h-[75vh] overflow-y-auto relative z-10 custom-scrollbar">
            <div className="grid grid-cols-4 gap-4 mb-10">
              {[
                { id: 'GASTO', icon: Activity, label: 'Gasto', color: '#06B6D4' },
                { id: 'BIMONT', icon: Briefcase, label: 'Bimont', color: '#8B5CF6' },
                { id: 'JANLU', icon: Zap, label: 'Janlu', color: '#D946EF' },
                { id: 'DEUDA', icon: AlertTriangle, label: 'Deuda', color: '#FF7675' }
              ].map((item: any) => (
                <button 
                  key={item.id}
                  type="button"
                  onClick={() => handleTipoChange(item.id as any)} 
                  className={`flex flex-col items-center justify-center py-5 rounded-3xl border transition-all duration-500 ${tipo === item.id ? 'bg-white/10 border-[#06b6d4]/40 shadow-[0_0_25px_rgba(6,182,212,0.15)] scale-105' : 'bg-white/5 border-transparent text-white/30 hover:text-slate-200 hover:bg-white/10'}`}
                >
                  <item.icon className="w-7 h-7 mb-3" style={{ color: tipo === item.id ? item.color : 'currentColor' }} />
                  <span className={`text-[9px] uppercase font-black tracking-widest ${tipo === item.id ? 'text-white' : ''}`}>{item.label}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-white/5 p-8 rounded-[32px] border border-white/10 shadow-inner backdrop-blur-md group-focus-within:border-[#06b6d4]/50 transition-all">
                <label className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] mb-4 block">Monto Total de Operación</label>
                <div className="relative">
                  <DollarSign className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 text-[#06B6D4]/50" />
                  <input 
                    type="number" 
                    required
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    className="w-full bg-transparent border-b border-white/10 py-5 pl-10 pr-4 text-white text-4xl font-black placeholder-white/5 focus:outline-none focus:border-[#06B6D4] transition-all font-mono"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] mb-2 block">
                    {tipo === 'GASTO' ? 'Clasificación' : tipo === 'BIMONT' ? 'Fuente' : tipo === 'JANLU' ? 'Origen de Capital' : 'Entidad Acreedora'}
                  </label>
                  {tipo === 'GASTO' && dynamicCategories.length > 0 ? (
                    <div className="relative group/select">
                      <select 
                        required
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white font-black text-sm appearance-none focus:outline-none focus:border-[#06B6D4] transition-all shadow-inner"
                      >
                        <option value="" disabled className="bg-[#0D0E15]">Seleccione Destino...</option>
                        {dynamicCategories.map(cat => (
                          <option key={cat.id} value={cat.nombre} className="bg-[#0D0E15] text-white">{cat.nombre}</option>
                        ))}
                        <option value="Sostenimiento" className="bg-[#0D0E15] text-white">Sostenimiento (Varios)</option>
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#06B6D4] pointer-events-none group-hover/select:translate-y-[-40%] transition-transform" />
                    </div>
                  ) : (
                    <input 
                      type="text" 
                      required={(tipo === 'GASTO' || tipo === 'DEUDA')}
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white font-black text-sm placeholder-white/20 focus:outline-none focus:border-[#06B6D4] transition-all shadow-inner uppercase tracking-widest"
                      placeholder={tipo === 'GASTO' ? 'Ej. Alimentación' : 'Ej. Nómina Bimont'}
                    />
                  )}
                </div>

                {tipo === 'GASTO' && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-2">
                    <label className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] mb-2 block">
                      Referencia Táctica
                    </label>
                    <input 
                      type="text" 
                      value={referencia}
                      onChange={(e) => setReferencia(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white font-black text-sm placeholder-white/20 focus:outline-none focus:border-[#06B6D4] transition-all shadow-inner"
                      placeholder="Detalle de la transacción"
                    />
                  </div>
                )}
              </div>

              {(tipo === 'GASTO' || tipo === 'DEUDA') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] mb-2 block">
                      {tipo === 'GASTO' ? 'Nivel de Prioridad' : 'Tasa de Interés (%)'}
                    </label>
                    {tipo === 'GASTO' ? (
                      <div className="relative group/select">
                        <select 
                          value={categoriaMacro}
                          onChange={(e) => setCategoriaMacro(e.target.value as any)}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white font-black text-[11px] uppercase tracking-widest appearance-none focus:outline-none focus:border-[#06B6D4] transition-all shadow-inner"
                        >
                          <option value="COMPROMISOS_INDISPENSABLES" className="bg-[#0D0E15]">Compromisos Indispensables</option>
                          <option value="GASTOS_VARIABLES" className="bg-[#0D0E15]">Gastos Variables</option>
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#06B6D4] pointer-events-none" />
                      </div>
                    ) : (
                      <input 
                        type="number" 
                        required
                        min={0}
                        max={100}
                        value={interes}
                        onChange={(e) => setInteres(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white font-black text-base font-mono focus:outline-none focus:border-[#06B6D4] transition-all shadow-inner"
                      />
                    )}
                  </div>

                  {tipo === 'GASTO' && (
                    <div className="flex items-center gap-5 bg-white/5 p-5 rounded-2xl border border-white/10 shadow-sm mt-auto group/check">
                      <input 
                        type="checkbox"
                        id="recurrente"
                        checked={recurrente}
                        onChange={(e) => setRecurrente(e.target.checked)}
                        className="w-6 h-6 rounded-lg border-white/20 bg-black/50 text-[#06B6D4] focus:ring-[#06B6D4] focus:ring-offset-0 transition-all cursor-pointer"
                      />
                      <label htmlFor="recurrente" className="text-[10px] text-slate-300 font-black uppercase tracking-widest cursor-pointer group-hover/check:text-white transition-colors">
                        Protocolo Recurrente
                      </label>
                    </div>
                  )}
                </div>
              )}
              
              {tipo === 'DEUDA' && (
                <div className="space-y-8 animate-in slide-in-from-top-6 duration-700">
                  <div className="grid grid-cols-2 gap-5">
                     <button 
                      type="button"
                      onClick={() => setTipoLiquidacion('fija')}
                      className={`py-4 rounded-2xl border text-[9px] font-black uppercase tracking-[0.2em] transition-all ${tipoLiquidacion === 'fija' ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/50 text-white shadow-xl scale-105' : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'}`}
                     >
                       Fija Mensual
                     </button>
                     <button 
                      type="button"
                      onClick={() => setTipoLiquidacion('cuotas')}
                      className={`py-4 rounded-2xl border text-[9px] font-black uppercase tracking-[0.2em] transition-all ${tipoLiquidacion === 'cuotas' ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/50 text-white shadow-xl scale-105' : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'}`}
                     >
                       Por Cuotas
                     </button>
                  </div>

                  {tipoLiquidacion === 'cuotas' && (
                    <div className="grid grid-cols-2 gap-8 animate-in slide-in-from-top-4 duration-500">
                      <div className="space-y-2">
                        <label className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] mb-2 block">Cuerpo de Cuotas</label>
                        <input 
                          type="number" 
                          value={cuotasTotales}
                          onChange={(e) => setCuotasTotales(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white font-black text-base font-mono focus:outline-none focus:border-[#8B5CF6] transition-all shadow-inner"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] mb-2 block">Avance Actual</label>
                        <input 
                          type="number" 
                          value={cuotasPagadas}
                          onChange={(e) => setCuotasPagadas(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white font-black text-base font-mono focus:outline-none focus:border-[#8B5CF6] transition-all shadow-inner"
                        />
                      </div>
                    </div>
                  )}

                  {tipoLiquidacion === 'fija' && (
                    <div className="animate-in slide-in-from-top-4 p-8 bg-[#8B5CF6]/10 rounded-[32px] border border-[#8B5CF6]/20 backdrop-blur-md shadow-inner">
                      <label className="text-[10px] text-[#8B5CF6] font-black uppercase tracking-[0.3em] mb-4 block">
                        Cuota Táctica Mensual ($)
                      </label>
                      <input 
                        type="number" 
                        min="0"
                        value={cuotaFija}
                        onChange={(e) => setCuotaFija(e.target.value)}
                        placeholder="Monto fijo..."
                        className="w-full bg-transparent border-b border-[#8B5CF6]/30 py-5 text-white font-black text-3xl placeholder-white/5 focus:outline-none focus:border-[#8B5CF6] font-mono"
                      />
                      <p className="text-[10px] text-slate-500 mt-6 leading-relaxed font-black uppercase tracking-widest opacity-60">
                        // Inyección automática en flujo de compromisos recurrentes.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-white/5 p-8 rounded-[32px] border border-white/10 backdrop-blur-md transition-all group-focus-within:border-[#06b6d4]/30">
                <label className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] mb-4 block">
                  {tipo === 'DEUDA' ? 'Cronograma de Vencimiento' : 'Registro Temporal (Opcional)'}
                </label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={fechaOperacion}
                    onChange={(e) => setFechaOperacion(e.target.value)}
                    className="w-full bg-black/40 rounded-2xl py-4 px-6 text-white font-black text-sm border border-white/10 focus:outline-none focus:border-[#06B6D4] transition-all shadow-inner"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                {tipo === 'DEUDA' && fechaOperacion && new Date(fechaOperacion + 'T00:00:00') < new Date(new Date().setHours(0,0,0,0)) && (
                  <div className="mt-5 p-5 bg-red-500/5 rounded-2xl border border-red-500/20 animate-pulse">
                    <p className="text-red-500 text-[9px] leading-relaxed font-black uppercase tracking-widest">
                      // ADVERTENCIA: Impacto en registro retroactivo detectado.
                    </p>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-10 bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:shadow-[0_20px_40px_rgba(0,240,255,0.2)] text-white font-black tracking-[0.4em] uppercase rounded-full py-5 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 border border-white/10 relative z-20 group/submit"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {transactionToEdit ? <Edit2 className="w-5 h-5 group-hover/submit:rotate-12 transition-transform" /> : <ShieldCheck className="w-5 h-5 group-hover/submit:scale-110 transition-transform" />}
                    {transactionToEdit ? 'Actualizar Protocolo' : 'Ejecutar Orden'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      
      {showScanner && (
        <EscanerTicketsUI 
          onClose={() => setShowScanner(false)} 
          onConfirm={handleScannerConfirm} 
        />
      )}
    </>
  );
}
