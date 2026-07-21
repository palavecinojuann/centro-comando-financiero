import React, { useState } from 'react';
import { CreditCard, Landmark, Coins, Home, Plus, Trash2, X, Save, Edit3 } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, addDoc, collection, deleteDoc } from 'firebase/firestore';
import { EmptyState } from './EmptyState';
import { motion } from 'motion/react';

interface VistaSaldoProps {
  cajaRealTotal: number;
  totalCuotasDeudas: number;
  deudas: any[];
  cuentas: any[];
  tarjetas: any[];
  activos: any[];
}

const ICON_MAP: Record<string, React.ReactNode> = {
  'Landmark': <Landmark className="w-4 h-4" />,
  'Coins': <Coins className="w-4 h-4" />,
  'CreditCard': <CreditCard className="w-4 h-4" />,
  'Home': <Home className="w-4 h-4" />
};

export function VistaSaldo({ cajaRealTotal, totalCuotasDeudas, deudas, cuentas, tarjetas, activos }: VistaSaldoProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'CUENTAS' | 'TARJETAS' | 'ACTIVOS'>('CUENTAS');
  
  // Estados para formulario de adición/edición
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemValue, setNewItemValue] = useState(0);
  const [newItemLimit, setNewItemLimit] = useState(0);
  const [newItemIcon, setNewItemIcon] = useState('Landmark');

  const ID_HOGAR = "hogar_bimont_central";

  // Formateador de moneda
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(amount).replace('ARS', '$');
  };

  // Mapear iconos para renderizado
  const cuentasCorrientes = cuentas.map(c => ({
    ...c,
    logo: ICON_MAP[c.icono] || <Landmark className="w-4 h-4" />
  }));

  const tarjetasCredito = tarjetas.map(t => ({
    ...t,
    logo: ICON_MAP[t.icono] || <CreditCard className="w-4 h-4" />
  }));

  const otrosActivos = activos.map(a => ({
    ...a,
    logo: ICON_MAP[a.icono] || <Coins className="w-4 h-4" />
  }));

  const totalCuentasCorrientes = cuentasCorrientes.reduce((acc, c) => acc + (c.balance || 0), 0);
  const totalTarjetasConsumido = tarjetasCredito.reduce((acc, t) => acc + (t.consumido || 0), 0);
  const totalOtrosActivos = otrosActivos.reduce((acc, o) => acc + (o.balance || 0), 0);

  // Handlers CRUD
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName) return;

    let colName = 'cuentas_corrientes';
    if (activeTab === 'TARJETAS') colName = 'tarjetas_credito';
    else if (activeTab === 'ACTIVOS') colName = 'otros_activos';

    const colRef = collection(db, `hogares/${ID_HOGAR}/${colName}`);

    try {
      if (editingItem) {
        const docRef = doc(db, `hogares/${ID_HOGAR}/${colName}`, editingItem.id);
        const updateData: any = {
          nombre: newItemName,
          icono: newItemIcon
        };
        if (activeTab === 'TARJETAS') {
          updateData.consumido = Number(newItemValue);
          updateData.limite = Number(newItemLimit);
        } else {
          updateData.balance = Number(newItemValue);
        }
        await updateDoc(docRef, updateData);
      } else {
        const addData: any = {
          nombre: newItemName,
          icono: newItemIcon,
          progreso: 50
        };
        if (activeTab === 'TARJETAS') {
          addData.consumido = Number(newItemValue);
          addData.limite = Number(newItemLimit);
        } else {
          addData.balance = Number(newItemValue);
        }
        await addDoc(colRef, addData);
      }
      resetForm();
    } catch (err) {
      console.error("Error saving item to Firestore:", err);
    }
  };

  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setNewItemName(item.nombre);
    setNewItemIcon(item.icono || 'Landmark');
    if (activeTab === 'TARJETAS') {
      setNewItemValue(item.consumido || 0);
      setNewItemLimit(item.limite || 0);
    } else {
      setNewItemValue(item.balance || 0);
    }
  };

  const handleDeleteItem = async (id: string) => {
    let colName = 'cuentas_corrientes';
    if (activeTab === 'TARJETAS') colName = 'tarjetas_credito';
    else if (activeTab === 'ACTIVOS') colName = 'otros_activos';

    if (!window.confirm("¿Seguro que deseas eliminar este elemento?")) return;

    try {
      await deleteDoc(doc(db, `hogares/${ID_HOGAR}/${colName}`, id));
      if (editingItem?.id === id) resetForm();
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setNewItemName('');
    setNewItemValue(0);
    setNewItemLimit(0);
    setNewItemIcon('Landmark');
  };

  return (
    <div className="flex flex-col h-full font-sans select-none pb-12 animate-in fade-in duration-300">
      
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-6 px-4">
        <div>
          <h3 className="text-white text-lg font-serif font-black uppercase tracking-widest">Saldo</h3>
          <p className="text-[9px] font-mono text-bunker-mutado uppercase tracking-widest">// BALANCES Y ACTIVOS CONSOLIDADOS</p>
        </div>
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="px-3 py-1.5 bg-bunker-panel border border-[#E5A93B]/20 text-[9px] text-[#E5A93B] font-black uppercase tracking-widest font-sans rounded-xl hover:bg-white/5 transition-all shadow-[0_0_10px_rgba(229, 169, 59, 0.1)] cursor-pointer"
        >
          Editar
        </button>
      </div>

      {/* Bloques Destacados Planos Superiores */}
      <div className="px-4 mb-8 space-y-3">
        {/* Caja 1: Saldo Líquido en Turquesa */}
        <div className="w-full bg-[#E5A93B] text-black font-contable font-black text-sm px-4 py-3 rounded-xl shadow-[0_0_15px_rgba(229, 169, 59, 0.2)] flex justify-between items-center">
          <span className="text-[8px] font-mono font-black tracking-widest uppercase">// CAJA REAL LÍQUIDA</span>
          <span>{formatMoney(totalCuentasCorrientes)}</span>
        </div>

        {/* Caja 2: Tarjetas / Deuda en Amarillo */}
        <div className="w-full bg-[#FFD500] text-black font-contable font-black text-sm px-4 py-3 rounded-xl shadow-[0_0_15px_rgba(255,213,0,0.15)] flex justify-between items-center">
          <span className="text-[8px] font-mono font-black tracking-widest uppercase">// CRÉDITO COMPROMETIDO</span>
          <span>{formatMoney(totalTarjetasConsumido)}</span>
        </div>
      </div>

      <div className="space-y-8 px-2">

        {/* CUENTAS CORRIENTES */}
        <section className="bg-bunker-panel border border-white/5 p-5 rounded-3xl backdrop-blur-xl">
          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
            <span className="text-[10px] font-serif font-black uppercase tracking-[0.25em] text-white">Cuentas Corrientes</span>
            <span className="text-[10px] font-black text-white/70 font-sans font-contable">{formatMoney(totalCuentasCorrientes)}</span>
          </div>

          {cuentasCorrientes.length === 0 ? (
            <EmptyState
              icon={Landmark}
              titulo="Sin Cuentas Registradas"
              subtitulo="Registrá tu primera cuenta bancaria para comenzar el monitoreo"
              textoBoton="Añadir Cuenta"
              onAccion={() => { setActiveTab('CUENTAS'); setIsEditModalOpen(true); }}
            />
          ) : (
            <motion.div 
              initial="hidden" 
              animate="visible" 
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
              className="space-y-4"
            >
              {cuentasCorrientes.map(cuenta => (
                <motion.div key={cuenta.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-bunker-mutado">
                      {cuenta.logo}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-white font-bold tracking-wide uppercase text-[10px]">{cuenta.nombre}</span>
                      <div className="w-24 h-1 bg-black/50 rounded-full overflow-hidden">
                        <div className="h-full bg-[#E5A93B]" style={{ width: `${cuenta.progreso || 50}%` }} />
                      </div>
                    </div>
                  </div>
                  <span className="text-white font-black font-sans text-xs font-contable">{formatMoney(cuenta.balance)}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        {/* TARJETAS DE CREDITO */}
        <section className="bg-bunker-panel border border-white/5 p-5 rounded-3xl backdrop-blur-xl">
          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
            <span className="text-[10px] font-serif font-black uppercase tracking-[0.25em] text-white">Tarjetas de Crédito</span>
            <span className="text-[10px] font-black text-[#FFD500] font-sans font-contable">{formatMoney(totalTarjetasConsumido)}</span>
          </div>

          {tarjetasCredito.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              titulo="Sin Tarjetas"
              subtitulo="Agregá tus tarjetas de crédito para trackear consumos"
              textoBoton="Añadir Tarjeta"
              onAccion={() => { setActiveTab('TARJETAS'); setIsEditModalOpen(true); }}
            />
          ) : (
            <motion.div 
              initial="hidden" 
              animate="visible" 
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
              className="space-y-4"
            >
              {tarjetasCredito.map(tc => {
                const pct = tc.limite > 0 ? (tc.consumido / tc.limite) * 100 : 0;
                return (
                  <motion.div key={tc.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-[#FFD500]/60">
                        {tc.logo}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-white font-bold tracking-wide uppercase text-[10px]">{tc.nombre}</span>
                        <div className="w-24 h-1 bg-black/50 rounded-full overflow-hidden">
                          <div className="h-full bg-[#FFD500]" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-[#FFD500] font-black font-sans text-xs font-contable">{formatMoney(tc.consumido)}</span>
                      <span className="text-[8px] font-mono text-bunker-mutado font-contable">Límite {formatMoney(tc.limite)}</span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </section>

        {/* OTROS ACTIVOS */}
        <section className="bg-bunker-panel border border-white/5 p-5 rounded-3xl backdrop-blur-xl">
          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
            <span className="text-[10px] font-serif font-black uppercase tracking-[0.25em] text-white">Otros Activos</span>
            <span className="text-[10px] font-black text-white/70 font-sans font-contable">{formatMoney(totalOtrosActivos)}</span>
          </div>

          {otrosActivos.length === 0 ? (
            <EmptyState
              icon={Coins}
              titulo="Sin Activos"
              subtitulo="Registrá tus bienes y ahorros para una vista patrimonial completa"
              textoBoton="Añadir Activo"
              onAccion={() => { setActiveTab('ACTIVOS'); setIsEditModalOpen(true); }}
            />
          ) : (
            <motion.div 
              initial="hidden" 
              animate="visible" 
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
              className="space-y-4"
            >
              {otrosActivos.map(activo => (
                <motion.div key={activo.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-bunker-mutado">
                      {activo.logo}
                    </div>
                    <span className="text-white font-bold tracking-wide uppercase text-[10px]">{activo.nombre}</span>
                  </div>
                  <span className="text-white font-black font-sans text-xs font-contable">{formatMoney(activo.balance)}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

      </div>

      {/* MODAL DE EDICIÓN FLOTANTE */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161a23] border border-white/10 w-full max-w-md p-6 rounded-3xl space-y-4 shadow-2xl relative">
            <header className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-white font-serif text-xs font-black uppercase tracking-widest">
                {editingItem ? 'Editar Elemento' : 'Gestionar Saldos y Activos'}
              </span>
              <button 
                onClick={() => { setIsEditModalOpen(false); resetForm(); }}
                className="p-1.5 border border-white/5 rounded-full text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </header>

            {/* Selector de pestañas */}
            {!editingItem && (
              <div className="flex bg-black/40 p-1 border border-white/5 rounded-xl font-mono text-[9px] w-full">
                {[
                  { id: 'CUENTAS', label: 'Cuentas' },
                  { id: 'TARJETAS', label: 'Tarjetas' },
                  { id: 'ACTIVOS', label: 'Activos' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id as any); resetForm(); }}
                    className={`flex-1 py-1.5 uppercase rounded-lg font-black transition-all cursor-pointer ${activeTab === tab.id ? 'bg-[#0E2531] text-[#E5A93B] border border-[#E5A93B]/20' : 'text-slate-400'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSaveItem} className="space-y-3.5">
              <div>
                <label className="text-[8px] font-mono tracking-widest text-slate-400 uppercase block mb-1">Nombre</label>
                <input 
                  type="text" 
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  placeholder="Ej. Banco Money Pro"
                  className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E5A93B]/50 font-sans"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[8px] font-mono tracking-widest text-slate-400 uppercase block mb-1">
                    {activeTab === 'TARJETAS' ? 'Consumido ($)' : 'Balance / Saldo ($)'}
                  </label>
                  <input 
                    type="number" 
                    value={newItemValue || ''}
                    onChange={e => setNewItemValue(Number(e.target.value))}
                    placeholder="0"
                    className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E5A93B]/50 font-mono"
                  />
                </div>

                {activeTab === 'TARJETAS' && (
                  <div>
                    <label className="text-[8px] font-mono tracking-widest text-slate-400 uppercase block mb-1">Límite ($)</label>
                    <input 
                      type="number" 
                      value={newItemLimit || ''}
                      onChange={e => setNewItemLimit(Number(e.target.value))}
                      placeholder="0"
                      className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E5A93B]/50 font-mono"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-[8px] font-mono tracking-widest text-slate-400 uppercase block mb-1">Icono</label>
                <div className="flex gap-2.5">
                  {Object.keys(ICON_MAP).map(iconName => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setNewItemIcon(iconName)}
                      className={`w-9 h-9 border rounded-xl flex items-center justify-center cursor-pointer transition-all ${newItemIcon === iconName ? 'bg-[#E5A93B]/10 border-[#E5A93B] text-[#E5A93B]' : 'border-white/5 bg-black/40 text-slate-400'}`}
                    >
                      {ICON_MAP[iconName]}
                    </button>
                  ))}
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
              <span className="text-[8px] font-mono tracking-widest text-slate-400 uppercase block mb-2">// ELEMENTOS REGISTRADOS</span>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                {(activeTab === 'CUENTAS' ? cuentas : activeTab === 'TARJETAS' ? tarjetas : activos).map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center bg-black/20 p-2.5 border border-white/5 rounded-xl hover:border-white/10 transition-all">
                    <div className="flex items-center gap-2">
                      <div className="text-slate-400">{ICON_MAP[item.icono] || <Landmark className="w-3.5 h-3.5" />}</div>
                      <div className="flex flex-col">
                        <span className="text-white text-[9px] font-black uppercase tracking-wide">{item.nombre}</span>
                        <span className="text-bunker-mutado text-[8px] font-mono">
                          {activeTab === 'TARJETAS' 
                            ? `${formatMoney(item.consumido || 0)} / lím: ${formatMoney(item.limite || 0)}`
                            : formatMoney(item.balance || 0)
                          }
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
