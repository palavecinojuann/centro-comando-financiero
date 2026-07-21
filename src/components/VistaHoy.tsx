import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Check, Calendar, TrendingUp, Compass, X, Trash2, Edit3, Save, Target, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { EmptyState } from './EmptyState';
import { doc, updateDoc, addDoc, collection, deleteDoc } from 'firebase/firestore';

interface Transaccion {
  id: string;
  type: 'ingreso' | 'janlu' | 'gasto' | 'deuda';
  monto: number;
  fecha: string;
  concepto: string;
  categoria: string;
  estado?: string;
  recurrente?: boolean;
}

interface VistaHoyProps {
  operaciones: Transaccion[];
  onOpenCargar: () => void;
  onEditTransaction: (id: string, type: string) => void;
  objetivosDb: any[];
}

export function VistaHoy({ operaciones, onOpenCargar, onEditTransaction, objetivosDb }: VistaHoyProps) {
  const hoy = new Date();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemTarget, setNewItemTarget] = useState(0);
  const [newItemAccumulated, setNewItemAccumulated] = useState(0);

  const ID_HOGAR = "hogar_bimont_central";

  // Formateadores locales
  const diaNumero = format(hoy, 'd');
  const diaNombre = format(hoy, 'EEEE', { locale: es });
  const mesAnio = format(hoy, 'MMMM yyyy', { locale: es });

  const esteMes = hoy.getMonth();
  const esteAnio = hoy.getFullYear();

  const transaccionesMes = operaciones.filter(op => {
    const f = new Date(op.fecha);
    return f.getMonth() === esteMes && f.getFullYear() === esteAnio;
  });

  const planificadas = transaccionesMes.filter(op => 
    op.estado === 'Pendiente' || (op.type === 'deuda' && op.estado !== 'Finalizado' && op.estado !== 'Pagado')
  );

  const pagadas = transaccionesMes.filter(op => 
    op.estado === 'Finalizado' || op.estado === 'Pagado' || (!op.estado && op.type !== 'deuda')
  );

  // Mapear objetivos de Firestore
  const objetivos = objetivosDb.map(obj => ({
    id: obj.id,
    nombre: obj.nombre,
    actual: obj.acumulado || 0,
    meta: obj.objetivo || 1000,
    fecha: 'Meta Activa',
    icono: obj.icono || 'Target',
    ...obj
  }));

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(amount).replace('ARS', '$');
  };

  // Handlers CRUD para Objetivos
  const handleSaveObjective = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName) return;

    const colRef = collection(db, `hogares/${ID_HOGAR}/cofres`);

    try {
      if (editingItem) {
        const docRef = doc(db, `hogares/${ID_HOGAR}/cofres`, editingItem.id);
        await updateDoc(docRef, {
          nombre: newItemName,
          objetivo: Number(newItemTarget),
          acumulado: Number(newItemAccumulated)
        });
      } else {
        await addDoc(colRef, {
          nombre: newItemName,
          objetivo: Number(newItemTarget),
          acumulado: Number(newItemAccumulated),
          icono: 'Target'
        });
      }
      resetForm();
    } catch (err) {
      console.error("Error saving objective:", err);
    }
  };

  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setNewItemName(item.nombre);
    setNewItemTarget(item.objetivo || 0);
    setNewItemAccumulated(item.acumulado || 0);
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este objetivo?")) return;
    try {
      await deleteDoc(doc(db, `hogares/${ID_HOGAR}/cofres`, id));
      if (editingItem?.id === id) resetForm();
    } catch (err) {
      console.error("Error deleting objective:", err);
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setNewItemName('');
    setNewItemTarget(0);
    setNewItemAccumulated(0);
  };

  return (
    <div className="flex flex-col h-full font-sans select-none pb-12 animate-in fade-in duration-300">
      
      {/* Cabecera / Fecha Gigante */}
      <div className="flex justify-between items-start mb-8 px-4">
        <div className="flex items-baseline gap-4">
          <span className="font-serif text-6xl md:text-7xl font-black text-white leading-none">
            {diaNumero}
          </span>
          <div className="flex flex-col">
            <span className="font-serif text-sm md:text-base font-bold text-bunker-mutado uppercase tracking-widest leading-none">
              {diaNombre}
            </span>
            <span className="font-serif text-xs md:text-sm font-semibold text-white/40 uppercase tracking-widest mt-1">
              {mesAnio}
            </span>
          </div>
        </div>

        {/* Botón (+) Circular en Cian */}
        <button
          onClick={onOpenCargar}
          className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-tr from-[#E5A93B] to-[#00B0FF] text-black flex items-center justify-center shadow-[0_0_15px_rgba(229, 169, 59, 0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none animate-pulse"
          title="Nuevo Registro"
        >
          <Plus className="w-6 h-6 md:w-7 md:h-7 stroke-[3px]" />
        </button>
      </div>

      <div className="space-y-8 px-2">
        
        {/* SECCIÓN OBJETIVOS */}
        <section className="bg-bunker-panel border border-white/5 p-6 rounded-3xl backdrop-blur-xl shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-serif font-black uppercase tracking-[0.25em] text-white">Objetivos</span>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="p-1 text-bunker-mutado hover:text-[#E5A93B] transition-colors cursor-pointer"
                title="Configurar objetivos"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-[8px] font-mono text-bunker-mutado uppercase tracking-widest">// COFRES DE PROPÓSITO</span>
          </div>

          <div className="space-y-4">
            {objetivos.map(obj => {
              const porcentaje = Math.min(100, (obj.actual / obj.meta) * 100);
              return (
                <div key={obj.id} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white font-bold tracking-wide uppercase text-[10px]">{obj.nombre}</span>
                    <span className="text-[#E5A93B] font-black font-mono font-contable">{formatMoney(obj.actual)} / {formatMoney(obj.meta)}</span>
                  </div>
                  {/* Barra de progreso en cian */}
                  <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-[#E5A93B] to-[#00B0FF] rounded-full shadow-[0_0_8px_#E5A93B]" 
                      style={{ width: `${porcentaje}%` }} 
                    />
                  </div>
                  <span className="text-[8px] font-mono text-bunker-mutado uppercase tracking-widest">{obj.fecha} • {porcentaje.toFixed(0)}% completado</span>
                </div>
              );
            })}

            {objetivos.length === 0 && (
              <div className="text-center py-6 text-bunker-mutado text-[10px] font-mono uppercase tracking-widest opacity-40">
                // Sin objetivos activos
              </div>
            )}
          </div>
        </section>

        {transaccionesMes.length === 0 ? (
          <EmptyState
            icon={Calendar}
            titulo="Sin Operaciones Hoy"
            subtitulo="Tu libro del día está limpio — registrá tu primera operación"
            textoBoton="Registrar Operación"
            onAccion={onOpenCargar}
          />
        ) : (
          <>
            {/* SECCIÓN PLANIFICADAS */}
            <section className="bg-bunker-panel border border-white/5 p-6 rounded-3xl backdrop-blur-xl shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-serif font-black uppercase tracking-[0.25em] text-white">Planificadas</span>
                <span className="text-[8px] font-mono text-bunker-mutado uppercase tracking-widest">// PAGOS Y FLUJOS PENDIENTES</span>
              </div>

              {planificadas.length === 0 ? (
                <div className="text-center py-6 text-bunker-mutado text-[10px] font-mono uppercase tracking-widest opacity-40">
                  // Sin cobros ni deudas pendientes
                </div>
              ) : (
                <motion.div 
                  initial="hidden" 
                  animate="visible" 
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
                  className="space-y-3"
                >
                  {planificadas.slice(0, 4).map(op => (
                    <motion.div 
                      key={op.id}
                      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                      onClick={() => onEditTransaction(op.id, op.type)}
                      className="flex justify-between items-center p-3 rounded-2xl bg-black/30 border border-white/5 hover:border-[#E5A93B]/20 transition-all cursor-pointer"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-white font-black text-xs uppercase tracking-wide">{op.concepto}</span>
                        <span className="text-bunker-mutado text-[8px] font-black uppercase tracking-widest">{op.categoria}</span>
                      </div>
                      {/* Badge de cantidad destacado en color plano */}
                      <div className={`px-3 py-1 rounded-xl font-black font-contable text-[11px] tracking-tight ${
                        op.type === 'ingreso' || op.type === 'janlu' 
                          ? 'bg-[#E5A93B] text-black' 
                          : op.concepto.toLowerCase().includes('transferencia') || op.categoria.toLowerCase().includes('transferencia')
                            ? 'bg-white text-black'
                            : 'bg-[#FFD500] text-black'
                      }`}>
                        {formatMoney(op.monto)}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </section>

            {/* SECCIÓN PAGADAS */}
            <section className="bg-bunker-panel border border-white/5 p-6 rounded-3xl backdrop-blur-xl shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-serif font-black uppercase tracking-[0.25em] text-white">Pagadas</span>
                <span className="text-[8px] font-mono text-bunker-mutado uppercase tracking-widest">// REGISTRO DE CAJA EJECUTADO</span>
              </div>

              {pagadas.length === 0 ? (
                <div className="text-center py-6 text-bunker-mutado text-[10px] font-mono uppercase tracking-widest opacity-40">
                  // Ninguna transacción cobrada o pagada este mes
                </div>
              ) : (
                <motion.div 
                  initial="hidden" 
                  animate="visible" 
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
                  className="space-y-3"
                >
                  {pagadas.slice(0, 5).map(op => (
                    <motion.div 
                      key={op.id}
                      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                      onClick={() => onEditTransaction(op.id, op.type)}
                      className="flex justify-between items-center p-3 rounded-2xl bg-black/30 border border-white/5 hover:border-[#E5A93B]/20 transition-all cursor-pointer"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-white font-black text-xs uppercase tracking-wide truncate max-w-[150px]">{op.concepto}</span>
                        <span className="text-bunker-mutado text-[8px] font-black uppercase tracking-widest">{op.categoria}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-black font-contable text-xs">{formatMoney(op.monto)}</span>
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-emerald-400 stroke-[3px]" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </section>
          </>
        )}

      </div>

      {/* MODAL DE EDICIÓN FLOTANTE PARA OBJETIVOS */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161a23] border border-white/10 w-full max-w-md p-6 rounded-3xl space-y-4 shadow-2xl relative">
            <header className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-white font-serif text-xs font-black uppercase tracking-widest">
                {editingItem ? 'Editar Objetivo' : 'Configurar Objetivos y Cofres'}
              </span>
              <button 
                onClick={() => { setIsEditModalOpen(false); resetForm(); }}
                className="p-1.5 border border-white/5 rounded-full text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </header>

            {/* Formulario */}
            <form onSubmit={handleSaveObjective} className="space-y-3.5">
              <div>
                <label className="text-[8px] font-mono tracking-widest text-slate-400 uppercase block mb-1">Nombre del Objetivo</label>
                <input 
                  type="text" 
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  placeholder="Ej. Fondo de Emergencia, Viaje..."
                  className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E5A93B]/50 font-sans"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[8px] font-mono tracking-widest text-slate-400 uppercase block mb-1">Monto Acumulado ($)</label>
                  <input 
                    type="number" 
                    value={newItemAccumulated || ''}
                    onChange={e => setNewItemAccumulated(Number(e.target.value))}
                    placeholder="0"
                    className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E5A93B]/50 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[8px] font-mono tracking-widest text-slate-400 uppercase block mb-1">Monto Meta ($)</label>
                  <input 
                    type="number" 
                    value={newItemTarget || ''}
                    onChange={e => setNewItemTarget(Number(e.target.value))}
                    placeholder="0"
                    className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E5A93B]/50 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                {editingItem && (
                  <button 
                    type="button"
                    onClick={resetForm}
                    className="px-3 py-1.5 border border-white/5 hover:bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-300 rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                )}
                <button 
                  type="submit"
                  className="px-4 py-1.5 bg-[#E5A93B] text-black text-[9px] font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  {editingItem ? 'Actualizar' : 'Añadir'}
                </button>
              </div>
            </form>

            {/* Listado para edición/eliminación */}
            <div className="border-t border-white/5 pt-4">
              <span className="text-[8px] font-mono tracking-widest text-slate-400 uppercase block mb-2">// OBJETIVOS ACTIVOS</span>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                {objetivos.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center bg-black/20 p-2.5 border border-white/5 rounded-xl hover:border-white/10 transition-all">
                    <div className="flex items-center gap-2">
                      <div className="text-slate-400"><Target className="w-4 h-4" /></div>
                      <div className="flex flex-col">
                        <span className="text-white text-[9px] font-black uppercase tracking-wide">{item.nombre}</span>
                        <span className="text-bunker-mutado text-[8px] font-mono">
                          {formatMoney(item.actual)} / {formatMoney(item.meta)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => handleEditClick(item)}
                        className="p-1 border border-white/5 rounded-md hover:bg-[#E5A93B]/10 hover:border-[#E5A93B]/30 text-slate-400 hover:text-[#E5A93B] cursor-pointer"
                        title="Editar"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 border border-white/5 rounded-md hover:bg-red-500/10 hover:border-red-500/30 text-slate-400 hover:text-red-500 cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
