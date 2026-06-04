import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Edit3, Check, Calendar, AlertCircle, TrendingUp, CheckCircle2, Trash2, MoreVertical, FastForward, Snowflake, PauseCircle, Clock, CheckCircle } from 'lucide-react';
import { db, handleFirestoreError } from '../firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

interface Transaccion {
  id: string;
  type: string;
  [key: string]: any;
}

interface PanelProps {
  transacciones: Transaccion[];
}

export const PanelCompromisosFuturos = ({ transacciones }: PanelProps) => {
  const [payingId, setPayingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [showBadgeId, setShowBadgeId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [snowballId, setSnowballId] = useState<string | null>(null);
  const [snowballValue, setSnowballValue] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'fecha' | 'monto'>('fecha');

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  const ID_HOGAR = "hogar_bimont_central";

  // Check if paid this month
  const isPaidThisMonth = (isoDate?: string) => {
    if (!isoDate) return false;
    const d = new Date(isoDate);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  const formatDateValue = (val: any) => {
    if (!val) return 'N/A';
    if (typeof val === 'string') return val;
    if (val.seconds) return new Date(val.seconds * 1000).toLocaleDateString('es-AR', {day: '2-digit', month: '2-digit'});
    return 'N/A';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
  };

  // get normalized dates for sorting and computations
  const parseDate = (fechaVal: any): Date => {
    if (!fechaVal) return new Date(8640000000000000); // Max date if none
    let targetDate: Date;
    if (fechaVal.seconds) {
      targetDate = new Date(fechaVal.seconds * 1000);
    } else if (typeof fechaVal === 'string') {
      targetDate = new Date(`${fechaVal}T12:00:00Z`);
    } else {
      targetDate = new Date(fechaVal);
    }
    return isNaN(targetDate.getTime()) ? new Date(8640000000000000) : targetDate;
  };

  const getBadgeEstado = (fechaVal: any, isPaid: boolean, isPausado: boolean) => {
    if (isPausado) {
       return { 
          color: 'bg-white/10 text-white/50 border-white/20', 
          icon: <PauseCircle className="w-3 h-3" />, 
          text: 'Pausado (Triaje)',
          glow: 'drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]'
       };
    }
    if (isPaid) {
       return { 
          color: 'bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/20', 
          icon: <CheckCircle2 className="w-3 h-3" />, 
          text: 'Al Día',
          glow: 'drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]'
       };
    }
    
    if (!fechaVal) return { color: 'bg-[#161A23]/50 text-slate-400 border-white/10', icon: <Clock className="w-3 h-3" />, text: 'Pendiente', glow: '' };
    
    let targetDate: Date = parseDate(fechaVal);
    if (targetDate.getTime() === 8640000000000000) return { color: 'bg-[#161A23]/50 text-slate-400 border-white/10', icon: <Clock className="w-3 h-3" />, text: 'Pendiente', glow: '' };

    const today = new Date();
    today.setHours(0,0,0,0);
    targetDate.setHours(0,0,0,0);
    
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { 
        color: 'bg-red-500/20 text-red-500 border-red-500/30', 
        icon: <AlertCircle className="w-3 h-3" />, 
        text: 'Atrasado (Riesgo)',
        glow: 'drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]'
      };
    } else if (diffDays <= 5) {
      return { 
        color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', 
        icon: <AlertCircle className="w-3 h-3" />, 
        text: `Vence en ${diffDays} día${diffDays !== 1 ? 's' : ''}`,
        glow: 'drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]'
      };
    }

    return { 
      color: 'bg-[#161A23]/50 text-slate-400 border-white/10', 
      icon: <Calendar className="w-3 h-3" />, 
      text: `Vence el ${targetDate.getDate().toString().padStart(2, '0')}/${(targetDate.getMonth()+1).toString().padStart(2, '0')}`,
      glow: ''
    };
  };

  const computeEstadoEnum = (fechaVal: any, isPaid: boolean, isPausado: boolean) => {
    if (isPausado) return 'PAUSADO';
    if (isPaid) return 'PAGADO';
    const targetDate = parseDate(fechaVal);
    if (targetDate.getTime() === 8640000000000000) return 'PENDIENTE';
    const today = new Date();
    today.setHours(0,0,0,0);
    targetDate.setHours(0,0,0,0);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'ATRASADO';
    return 'PENDIENTE';
  };

  // Filter groups
  const deudasCuotas = transacciones.filter(t => t.type === 'deuda' && t.tipoLiquidacion === 'cuotas');
  const deudasFijas = transacciones.filter(t => t.type === 'deuda' && t.tipoLiquidacion === 'fija');
  const gastosRecurrentes = transacciones.filter(t => t.type === 'gasto' && t.recurrente === true);
  
  // Unified obligations
  const allObligations = [
    // CUOTAS
    ...deudasCuotas.map(d => {
      const isPaid = isPaidThisMonth(d.ultimoMesPagado) || d.estaSaldada;
      const isPausado = d.pausadoEnTriaje;
      const parsedDate = parseDate(d.fechaVencimiento);
      const estado = computeEstadoEnum(d.fechaVencimiento, isPaid, isPausado);
      
      return {
        _id: "cuota_" + d.id,
        _origenId: d.id,
        _item: d,
        _tipo: 'CUOTA',
        _nombre: d.nombreCompromiso || 'Deuda Fija',
        _montoBase: Number(d.capitalOrig) || 0,
        _montoOperativo: (Number(d.capitalOrig) || 0) / (Number(d.cuotasTotales) || 1),
        _fechaStr: formatDateValue(d.fechaVencimiento),
        _parsedDate: parsedDate,
        _isPaid: isPaid,
        _isPausado: isPausado,
        _estado: estado,
        _badge: getBadgeEstado(d.fechaVencimiento, isPaid, isPausado),
        _rutaC: `hogares/${ID_HOGAR}/debts`,
        _campoMonto: 'capitalOrig',
        _total: Number(d.cuotasTotales) || 1,
        _pagadas: Number(d.cuotasPagadas) || 0,
        _estaSaldada: d.estaSaldada || false
      }
    }),
    // DEUDAS FIJAS
    ...deudasFijas.map(d => {
      const isPaid = isPaidThisMonth(d.ultimoMesPagado);
      const isPausado = d.pausadoEnTriaje;
      const parsedDate = parseDate(d.fechaVencimiento);
      const estado = computeEstadoEnum(d.fechaVencimiento, isPaid, isPausado);

      return {
        _id: "fija_" + d.id,
        _origenId: d.id,
        _item: d,
        _tipo: 'FIJA',
        _nombre: d.nombreCompromiso || 'Deuda Fija',
        _montoBase: Number(d.cuotaMinima) || Number(d.capitalOrig) || 0,
        _montoOperativo: Number(d.cuotaMinima) || Number(d.capitalOrig) || 0,
        _fechaStr: formatDateValue(d.fechaVencimiento),
        _parsedDate: parsedDate,
        _isPaid: isPaid,
        _isPausado: isPausado,
        _estado: estado,
        _badge: getBadgeEstado(d.fechaVencimiento, isPaid, isPausado),
        _rutaC: `hogares/${ID_HOGAR}/debts`,
        _campoMonto: 'cuotaMinima',
        _total: 1,
        _pagadas: isPaid ? 1 : 0,
        _estaSaldada: false
      }
    }),
    // RECURRENTES
    ...gastosRecurrentes.map(g => {
      const isPaid = isPaidThisMonth(g.ultimoMesPagado);
      const isPausado = g.pausadoEnTriaje;
      const parsedDate = parseDate(g.fechaGasto);
      const estado = computeEstadoEnum(g.fechaGasto, isPaid, isPausado);

      return {
        _id: "gasto_" + g.id,
        _origenId: g.id,
        _item: g,
        _tipo: 'FIJA',
        _nombre: g.categoria || 'Gasto Recurrente',
        _montoBase: Number(g.montoTotal) || 0,
        _montoOperativo: Number(g.montoTotal) || 0,
        _fechaStr: formatDateValue(g.fechaGasto),
        _parsedDate: parsedDate,
        _isPaid: isPaid,
        _isPausado: isPausado,
        _estado: estado,
        _badge: getBadgeEstado(g.fechaGasto, isPaid, isPausado),
        _rutaC: `hogares/${ID_HOGAR}/gastos_vitales`,
        _campoMonto: 'montoTotal',
        _total: 1,
        _pagadas: isPaid ? 1 : 0,
        _estaSaldada: false
      }
    })
  ].sort((a, b) => {
     if (sortBy === 'fecha') {
       return a._parsedDate.getTime() - b._parsedDate.getTime();
     } else {
       return b._montoOperativo - a._montoOperativo;
     }
  });

  const atrasados = allObligations.filter(o => o._estado === 'ATRASADO');
  const pendientes = allObligations.filter(o => o._estado === 'PENDIENTE');
  const pagadosYPausados = allObligations.filter(o => o._estado === 'PAGADO' || o._estado === 'PAUSADO');

  // Unified Actions
  const startEditing = (o: any) => {
    setEditingId(o._id);
    setEditValue(o._montoBase);
  };

  const saveEditing = async (o: any) => {
    try {
      await updateDoc(doc(db, o._rutaC, o._origenId), {
        [o._campoMonto]: editValue
      });
      setEditingId(null);
      setShowBadgeId(o._id);
      setTimeout(() => setShowBadgeId(null), 3000);
    } catch (err) {
      handleFirestoreError(err, 'update', o._rutaC);
    }
  };

  const deleteItem = async (o: any) => {
    if (confirm('¿Eliminar este compromiso?')) {
      try {
        await deleteDoc(doc(db, o._rutaC, o._origenId));
      } catch (err) {
        handleFirestoreError(err, 'delete', o._rutaC);
      }
    }
  };

  const liquidarCuota = async (o: any, advanceMonths: number = 1) => {
    const deuda = o._item;
    setPayingId(o._origenId);
    const current = Number(deuda.cuotasPagadas) || 0;
    const total = Number(deuda.cuotasTotales) || 1;
    const nextPagadas = current + advanceMonths;
    const estaSaldada = nextPagadas >= total;

    try {
      await updateDoc(doc(db, `hogares/${ID_HOGAR}/debts`, deuda.id), {
        cuotasPagadas: nextPagadas,
        estaSaldada: estaSaldada,
        ultimoMesPagado: new Date().toISOString()
      });
      setToastMensaje(advanceMonths > 1 ? "Pago adelantado registrado con éxito" : "Pago registrado");
      setTimeout(() => setToastMensaje(null), 4000);
      setTimeout(() => setPayingId(null), 500);
      setOpenDropdownId(null);
    } catch (err) {
      handleFirestoreError(err, 'update', `hogares/${ID_HOGAR}/debts`);
      setPayingId(null);
    }
  };

  const liquidarObligacion = async (o: any, advanceMonths: number = 1) => {
    setPayingId(o._origenId);
    try {
      const originalTx = o._item;
      let updatedFields: any = {
        ultimoMesPagado: new Date().toISOString()
      };

      if (originalTx.type === 'gasto' && originalTx.fechaGasto) {
         let d = originalTx.fechaGasto.toDate ? originalTx.fechaGasto.toDate() : new Date(originalTx.fechaGasto.seconds ? originalTx.fechaGasto.seconds * 1000 : originalTx.fechaGasto);
         d.setMonth(d.getMonth() + advanceMonths);
         updatedFields.fechaGasto = d;
      } else if (originalTx.type === 'deuda' && originalTx.fechaVencimiento) {
         let d = new Date(originalTx.fechaVencimiento);
         if (!isNaN(d.getTime())) {
            d.setMonth(d.getMonth() + advanceMonths);
            updatedFields.fechaVencimiento = d.toISOString().split('T')[0];
         }
      }

      await updateDoc(doc(db, o._rutaC, o._origenId), updatedFields);
      
      setToastMensaje(advanceMonths > 1 ? "Pago adelantado. Próximo vencimiento extendido." : "Pago registrado. Próximo vencimiento proyectado para el mes siguiente");
      setTimeout(() => setToastMensaje(null), 4000);
      setTimeout(() => setPayingId(null), 500);
      setOpenDropdownId(null);
    } catch (err) {
      handleFirestoreError(err, 'update', o._rutaC);
      setPayingId(null);
    }
  };

  const inyectarExcedente = async (o: any) => {
    if (snowballValue <= 0) return;
    setPayingId(o._origenId);
    try {
      const originalTx = o._item;
      const currentCapital = Number(originalTx.capitalOrig || originalTx.montoTotal) || 0;
      const newCapital = Math.max(0, currentCapital - snowballValue);
      
      let fieldToUpdate = originalTx.type === 'gasto' ? 'montoTotal' : 'capitalOrig';

      await updateDoc(doc(db, o._rutaC, originalTx.id), {
        [fieldToUpdate]: newCapital
      });
      setToastMensaje("Excedente inyectado. Saldo recalculado.");
      setTimeout(() => setToastMensaje(null), 4000);
      setSnowballId(null);
      setSnowballValue(0);
      setTimeout(() => setPayingId(null), 500);
      setOpenDropdownId(null);
    } catch(err) {
      handleFirestoreError(err, 'update', o._rutaC);
      setPayingId(null);
    }
  };

  const togglePausaTriaje = async (o: any) => {
    try {
      await updateDoc(doc(db, o._rutaC, o._origenId), {
        pausadoEnTriaje: !o._isPausado
      });
      setToastMensaje(!o._isPausado ? "Obligación Pausada en Triaje" : "Obligación Reanudada");
      setTimeout(() => setToastMensaje(null), 3000);
      setOpenDropdownId(null);
    } catch (err) {
      handleFirestoreError(err, 'update', o._rutaC);
    }
  };

  const renderCard = (o: any) => {
    const isCuota = o._tipo === 'CUOTA';
    const hasDropdown = openDropdownId === o._id;
    const isEditing = editingId === o._id;
    const isPaying = payingId === o._origenId;
    
    const isPausado = o._isPausado;
    const isPaid = o._isPaid;
    const isAtrasado = o._estado === 'ATRASADO';
    
    let borderColor = 'border-white/5';
    let sideBarColor = 'bg-[#06B6D4]';
    
    if (isPausado) {
        borderColor = 'border-amber-500/30';
        sideBarColor = 'bg-amber-500/50';
    } else if (isAtrasado) {
        borderColor = 'border-red-500/30';
        sideBarColor = 'bg-red-500/80';
    } else if (isPaid) {
        sideBarColor = 'bg-white/10';
    } else if (isCuota) {
        sideBarColor = 'bg-[#8B5CF6]'; 
    }

    const estaSaldada = o._estaSaldada;
    const progress = Math.min((o._pagadas / o._total) * 100, 100);

    return (
      <motion.div 
        layout
        key={o._id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ zIndex: hasDropdown ? 50 : 1 }}
        className={`bg-[#161a23]/40 backdrop-blur-3xl border ${borderColor} rounded-[32px] p-6 md:p-8 shadow-xl relative overflow-visible group hover:bg-white/5 transition-all duration-500 ${(isPaid || estaSaldada) ? 'opacity-40 grayscale scale-95' : 'hover:-translate-y-1'}`}
      >
        <div className={`absolute top-0 left-0 w-2 h-full rounded-l-[32px] ${sideBarColor} shadow-[4px_0_15px_rgba(0,0,0,0.3)]`} />
        
        <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-widest border backdrop-blur-md transition-all duration-500 ${o._badge.color} ${o._badge.glow}`}>
            {o._badge.icon}
            {o._badge.text}
          </div>
          
          <div className="relative" ref={hasDropdown ? dropdownRef : null}>
            <button 
              onClick={() => setOpenDropdownId(hasDropdown ? null : o._id)}
              className="p-2.5 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 shadow-inner"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {hasDropdown && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="absolute right-0 top-full mt-3 w-64 bg-[#0d0e15]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden p-2"
                >
                  <div className="flex flex-col gap-1.5">
                    <button 
                      onClick={() => isCuota ? liquidarCuota(o, 1) : liquidarObligacion(o, 1)}
                      disabled={estaSaldada || isPaid || isPaying}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-2xl text-[11px] font-black text-slate-200 hover:bg-[#06B6D4]/20 hover:text-[#06B6D4] transition-all disabled:opacity-30 uppercase tracking-widest"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Registrar Pago
                    </button>
                    <button 
                      onClick={() => isCuota ? liquidarCuota(o, 2) : liquidarObligacion(o, 2)}
                      disabled={estaSaldada || isPaying}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-2xl text-[11px] font-black text-slate-200 hover:bg-[#8B5CF6]/20 hover:text-[#8B5CF6] transition-all disabled:opacity-30 uppercase tracking-widest"
                    >
                      <FastForward className="w-4 h-4" />
                      Adelantar Mes
                    </button>
                    {isCuota && (
                      <button 
                        onClick={() => { setSnowballId(o._id); setOpenDropdownId(null); setSnowballValue(0); }}
                        disabled={estaSaldada || isPaying}
                        className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-2xl text-[11px] font-black text-slate-200 hover:bg-emerald-500/20 hover:text-emerald-400 transition-all disabled:opacity-30 uppercase tracking-widest"
                      >
                        <Snowflake className="w-4 h-4" />
                        Inyectar Extra
                      </button>
                    )}
                    <div className="h-[1px] bg-white/5 my-1 mx-2" />
                    <button 
                      onClick={() => togglePausaTriaje(o)}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-2xl text-[11px] font-black text-amber-500 hover:bg-amber-500/10 transition-all uppercase tracking-widest"
                    >
                      <PauseCircle className="w-4 h-4" />
                      {isPausado ? 'Reanudar' : 'Pausar'}
                    </button>
                    <div className="h-[1px] bg-white/5 my-1 mx-2" />
                    <button 
                      onClick={() => { deleteItem(o); setOpenDropdownId(null); }}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-2xl text-[11px] font-black text-red-500 hover:bg-red-500/10 transition-all uppercase tracking-widest"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex justify-between items-center pr-24 mb-6">
          <div>
            <h4 className="text-2xl font-black text-white/95 tracking-tight font-serif uppercase group-hover:text-[#06B6D4] transition-colors">{o._nombre}</h4>
            {isCuota ? (
                <p className="text-[9px] text-[#8B5CF6] uppercase tracking-[0.4em] font-black mt-1">ESTRATEGIA // BOLA DE NIEVE</p>
            ) : (
                <p className="text-[9px] text-[#06B6D4] uppercase tracking-[0.4em] font-black mt-1">PASIVO // ESTRUCTURA FIJA</p>
            )}
          </div>
        </div>

        {/* Snowball Injector */}
        <AnimatePresence>
          {snowballId === o._id && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6 mt-4"
            >
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-6 flex flex-col sm:flex-row gap-4 items-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <Snowflake className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex-1 relative w-full">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50 text-base font-black font-mono">$</span>
                  <input
                    type="number"
                    autoFocus
                    className="w-full bg-black/40 border border-emerald-500/30 rounded-2xl py-3 pl-9 pr-4 text-white font-black font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all text-base shadow-inner"
                    placeholder="Monto..."
                    value={snowballValue || ''}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        inyectarExcedente(o);
                      }
                    }}
                  />
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button 
                      onClick={() => setSnowballId(null)}
                      className="flex-1 sm:flex-none text-slate-500 hover:text-white px-5 py-3 text-[10px] uppercase font-black tracking-widest transition-colors"
                    >Cancelar</button>
                    <button 
                      onClick={() => inyectarExcedente(o)}
                      className="flex-1 sm:flex-none bg-emerald-500 text-black px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-[0_10px_20px_rgba(16,185,129,0.2)] active:scale-95"
                    >Inyectar</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex justify-between items-center mt-4">
            <div className="text-right flex items-center justify-start gap-4 flex-1 flex-wrap">
              {isEditing ? (
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-44">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#06B6D4]/50 text-base font-black font-mono">$</span>
                    <input
                      type="number"
                      autoFocus
                      className="w-full bg-black/40 border border-[#06B6D4]/30 rounded-2xl py-2.5 pl-9 pr-4 text-white font-black font-mono focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/30 transition-all shadow-inner"
                      value={editValue}
                      onChange={(e) => setEditValue(Number(e.target.value) || 0)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEditing(o)}
                    />
                  </div>
                  <button 
                    onClick={() => saveEditing(o)}
                    className="w-11 h-11 rounded-2xl bg-[#06B6D4]/10 hover:bg-[#06B6D4]/20 border border-[#06B6D4]/30 flex items-center justify-center shrink-0 transition-all shadow-[0_0_15px_rgba(0,240,255,0.1)] active:scale-90"
                  >
                    <Check className="w-5 h-5 text-[#06B6D4]" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-5 w-full justify-between sm:justify-start">
                  <div className="flex flex-col items-start leading-tight">
                      <div className="flex items-center gap-4">
                          <span className="text-3xl font-black text-white font-mono tracking-tighter" title="Monto a liquidar">{formatCurrency(o._montoOperativo).replace('ARS', '')}</span>
                          <button 
                            onClick={() => startEditing(o)}
                            title="Ajustar Base"
                            disabled={isPaid || estaSaldada}
                            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center transition-all group-hover:border-white/20 disabled:opacity-20"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-white/30 group-hover:text-[#06B6D4]" />
                          </button>
                      </div>
                      {isCuota && (
                          <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                            SALDO REMANENTE: <span className="text-[#06B6D4] font-mono">{formatCurrency(o._montoBase)}</span>
                          </div>
                      )}
                  </div>
                </div>
              )}
            </div>
        </div>

        {isCuota && (
            <div className="mt-4">
            <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                <span className="text-white/50">Progreso Bola de Nieve</span>
                <span className="text-[#8B5CF6]">Cuota {o._pagadas} de {o._total}</span>
            </div>
            <div className="h-2 w-full bg-[#161A23]/50 rounded-full overflow-hidden">
                <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${isPausado ? 'bg-amber-500/50' : 'bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4]'}`}
                />
            </div>
            </div>
        )}

      </motion.div>
    );
  };

  return (
    <div className="w-full h-full bg-black/40 backdrop-blur-3xl p-6 md:p-12 text-white font-sans rounded-[2.5rem] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.6)] relative overflow-hidden group">
      {/* Background blurs */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#06B6D4]/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-[#06B6D4]/15 transition-all duration-1000" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#8B5CF6]/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-[#8B5CF6]/15 transition-all duration-1000" />

      <header className="mb-10 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <p className="text-[9px] font-black tracking-[0.4em] uppercase text-[#8B5CF6] mb-3 opacity-70">
            RADAR_VENCIMIENTOS // FUTURE_STREAM
          </p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase font-serif">Compromisos</h2>
        </div>
        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg">
            <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest pl-2">Ordenar:</span>
            <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-[#161a23]/80 text-white font-black border border-white/5 rounded-xl outline-none px-4 py-2 text-[10px] uppercase tracking-widest transition-all focus:border-[#06B6D4]/50 cursor-pointer hover:bg-white/5"
            >
                <option value="fecha">Cronología</option>
                <option value="monto">Impacto Capital</option>
            </select>
         </div>
      </header>

      <div className="space-y-16 relative z-10">
        {atrasados.length > 0 && (
            <section className="animate-in fade-in slide-in-from-left duration-500">
                <div className="flex items-center gap-5 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                        <AlertCircle className="w-7 h-7 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black tracking-tight text-red-400 uppercase font-serif">Alerta Crítica</h3>
                        <p className="text-[9px] uppercase tracking-[0.3em] text-red-500/60 font-black">Incumplimiento detectado</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {atrasados.map(o => renderCard(o))}
                </div>
            </section>
        )}

        {pendientes.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom duration-700">
                <div className="flex items-center gap-5 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                        <Calendar className="w-7 h-7 text-amber-500" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black tracking-tight text-white uppercase font-serif">Agenda Próxima</h3>
                        <p className="text-[9px] uppercase tracking-[0.3em] text-amber-500/60 font-black">Vencimientos en curso</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {pendientes.map(o => renderCard(o))}
                </div>
            </section>
        )}

        {pagadosYPausados.length > 0 && (
            <section className="opacity-80 animate-in fade-in duration-1000">
                <div className="flex items-center gap-5 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-[#161A23]/80 flex items-center justify-center border border-white/10">
                        <CheckCircle className="w-7 h-7 text-slate-400" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black tracking-tight text-slate-300 uppercase font-serif">Archivo</h3>
                        <p className="text-[9px] uppercase tracking-[0.3em] text-slate-500 font-black">Mes asegurado / Triaje Activo</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {pagadosYPausados.map(o => renderCard(o))}
                </div>
            </section>
        )}

        {allObligations.length === 0 && (
            <div className="text-center py-24 bg-white/5 rounded-3xl border border-dashed border-white/10 animate-pulse">
                <CheckCircle2 className="w-16 h-16 text-[#06B6D4]/30 mx-auto mb-6" />
                <p className="text-slate-400 font-black tracking-[0.2em] text-xs uppercase">Terminal sin obligaciones pendientes</p>
            </div>
        )}
      </div>

      <AnimatePresence>
        {toastMensaje && (
          <motion.div
             initial={{ opacity: 0, y: 50, x: '-50%' }}
             animate={{ opacity: 1, y: 0, x: '-50%' }}
             exit={{ opacity: 0, y: 20, x: '-50%' }}
             className="fixed bottom-10 left-1/2 z-50 bg-[#00B894]/90 backdrop-blur-xl border border-[#00B894] px-6 py-3 rounded-full shadow-[0_0_20px_rgba(0,184,148,0.3)] flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-sm tracking-wide">{toastMensaje}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
