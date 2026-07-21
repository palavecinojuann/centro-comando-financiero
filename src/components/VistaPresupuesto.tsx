import React, { useState } from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis } from 'recharts';
import { Coffee, Shield, Home, BookOpen, Car, Zap, Coins, Briefcase, Gift, Settings, X, Plus, Trash2, Edit3, Save } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, addDoc, collection, deleteDoc } from 'firebase/firestore';
import { EmptyState } from './EmptyState';
import { motion } from 'motion/react';

interface VistaPresupuestoProps {
  gastos: any[];
  ingresosBimont: number;
  janluMesActual: number;
  categoriasGastosDb: any[];
  categoriasIngresosDb: any[];
}

const ICON_MAP: Record<string, React.ReactNode> = {
  'Shield': <Shield className="w-5 h-5 text-red-400" />,
  'Coins': <Coins className="w-5 h-5 text-indigo-400" />,
  'Home': <Home className="w-5 h-5 text-emerald-400" />,
  'BookOpen': <BookOpen className="w-5 h-5 text-blue-400" />,
  'Coffee': <Coffee className="w-5 h-5 text-amber-400" />,
  'Car': <Car className="w-5 h-5 text-cyan-400" />,
  'Zap': <Zap className="w-5 h-5 text-purple-400" />,
  'Briefcase': <Briefcase className="w-5 h-5 text-[#00E5FF]" />,
  'Gift': <Gift className="w-5 h-5 text-amber-400" />
};

export function VistaPresupuesto({ gastos, ingresosBimont, janluMesActual, categoriasGastosDb, categoriasIngresosDb }: VistaPresupuestoProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'GASTOS' | 'INGRESOS'>('GASTOS');
  
  // Estados de edición
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemLimit, setNewItemLimit] = useState(0);
  const [newItemIcon, setNewItemIcon] = useState('Shield');

  const ID_HOGAR = "hogar_bimont_central";

  // 1. Calcular consumos reales por categorías para Gastos
  const totalPorCategoria = (cat: string) => {
    return gastos
      .filter(g => g.categoria === cat || g.concepto?.toLowerCase().includes(cat.toLowerCase()))
      .reduce((sum, g) => sum + g.monto, 0);
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(amount).replace('ARS', '$');
  };

  // Mapear categorías dinámicas desde Firestore
  const categoriasGastos = categoriasGastosDb.map(cat => ({
    ...cat,
    valor: totalPorCategoria(cat.nombre) || 0,
    limite: cat.limite || 0,
    icono: ICON_MAP[cat.icono] || <Shield className="w-5 h-5 text-slate-400" />
  }));

  const categoriasIngresos = categoriasIngresosDb.map(cat => {
    let valor = cat.valor || 0;
    if (cat.nombre.toLowerCase().includes('sueldo')) {
      valor = ingresosBimont || valor;
    } else if (cat.nombre.toLowerCase().includes('janlu')) {
      valor = janluMesActual || valor;
    }
    return {
      ...cat,
      valor,
      icono: ICON_MAP[cat.icono] || <Coins className="w-5 h-5 text-slate-400" />
    };
  });

  const totalGastosReal = categoriasGastos.reduce((sum, c) => sum + c.valor, 0);
  const totalIngresosReal = categoriasIngresos.reduce((sum, c) => sum + c.valor, 0);

  // Datos de minigráfico diario de gastos
  const mockDailyData = [
    { day: '1', amount: 1500 },
    { day: '5', amount: 3500 },
    { day: '10', amount: 1200 },
    { day: '15', amount: 8000 },
    { day: '20', amount: 4500 },
    { day: '25', amount: 2000 },
    { day: '30', amount: 6000 }
  ];

  // Handlers CRUD
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName) return;

    const colName = activeTab === 'GASTOS' ? 'presupuesto_gastos' : 'presupuesto_ingresos';
    const colRef = collection(db, `hogares/${ID_HOGAR}/${colName}`);

    try {
      if (editingItem) {
        const docRef = doc(db, `hogares/${ID_HOGAR}/${colName}`, editingItem.id);
        const data: any = {
          nombre: newItemName,
          icono: newItemIcon
        };
        if (activeTab === 'GASTOS') {
          data.limite = Number(newItemLimit);
        } else {
          data.valor = Number(newItemLimit); // Para ingresos, almacenamos en la propiedad valor
        }
        await updateDoc(docRef, data);
      } else {
        const data: any = {
          nombre: newItemName,
          icono: newItemIcon
        };
        if (activeTab === 'GASTOS') {
          data.limite = Number(newItemLimit);
        } else {
          data.valor = Number(newItemLimit);
        }
        await addDoc(colRef, data);
      }
      resetForm();
    } catch (err) {
      console.error("Error saving budget category:", err);
    }
  };

  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setNewItemName(item.nombre);
    setNewItemIcon(item.icono || 'Shield');
    setNewItemLimit(activeTab === 'GASTOS' ? item.limite || 0 : item.valor || 0);
  };

  const handleDeleteItem = async (id: string) => {
    const colName = activeTab === 'GASTOS' ? 'presupuesto_gastos' : 'presupuesto_ingresos';
    if (!window.confirm("¿Seguro que deseas eliminar esta categoría?")) return;

    try {
      await deleteDoc(doc(db, `hogares/${ID_HOGAR}/${colName}`, id));
      if (editingItem?.id === id) resetForm();
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setNewItemName('');
    setNewItemLimit(0);
    setNewItemIcon('Shield');
  };

  return (
    <div className="flex flex-col h-full font-sans select-none pb-12 animate-in fade-in duration-300">
      
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-6 px-4">
        <div>
          <h3 className="text-white text-lg font-serif font-black uppercase tracking-widest">Presupuesto</h3>
          <p className="text-[9px] font-mono text-bunker-mutado uppercase tracking-widest">// PLANIFICACIÓN MENSUAL POR CATEGORÍAS</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-bunker-panel border border-white/5 text-[9px] text-white font-black uppercase tracking-widest font-sans rounded-xl px-2 py-1 focus:outline-none cursor-pointer">
            <option>Junio 2026</option>
            <option>Julio 2026</option>
          </select>
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="p-1 text-bunker-mutado hover:text-[#00E5FF] transition-colors cursor-pointer" 
            title="Configurar límites"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mini Gráfico de Barras */}
      <div className="px-4 mb-6">
        <div className="bg-black/30 border border-white/5 p-4 rounded-3xl h-24 relative overflow-hidden flex flex-col justify-end">
          <div className="absolute top-2 left-4 text-[8px] font-mono tracking-widest text-bunker-mutado uppercase font-black">// HISTORIAL DIARIO DE CAUDALES</div>
          <div className="w-full h-12">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockDailyData}>
                <Bar dataKey="amount" fill="#00E5FF" radius={[2, 2, 0, 0]} />
                <XAxis dataKey="day" hide />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="space-y-8 px-2">
        
        {/* SECCIÓN GASTOS - LISTA DE LÍMITES */}
        <section className="bg-bunker-panel/40 border border-white/5 p-5 rounded-3xl backdrop-blur-xl">
          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white">Gastos Presupuestados</span>
            <span className="text-[10px] font-black text-white/50 font-sans">{formatMoney(totalGastosReal)} / Limitado</span>
          </div>

          {/* Lista de gastos con barras de progreso */}
          {categoriasGastos.length === 0 ? (
            <EmptyState
              icon={Settings}
              titulo="Sin Categorías de Gasto"
              subtitulo="Configurá tus límites presupuestarios mensuales"
              textoBoton="Configurar Límites"
              onAccion={() => { setActiveTab('GASTOS'); setIsEditModalOpen(true); }}
            />
          ) : (
            <motion.div 
              initial="hidden" 
              animate="visible" 
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
              className="space-y-3"
            >
              {categoriasGastos.map(cat => {
                const ratio = cat.limite > 0 ? (cat.valor / cat.limite) * 100 : 0;
                const pct = Math.min(100, ratio);
                
                // Color de la barra y texto según nivel de alerta (Burn Rate)
                let barColor = "bg-[#06b6d4]"; // Cian - Normal
                let glowColor = "shadow-[0_0_8px_rgba(6,182,212,0.3)]";
                let textColor = "text-[#06b6d4]";
                
                if (ratio > 90) {
                  barColor = "bg-[#ff007f]"; // Fucsia - Alerta/Emergencia
                  glowColor = "shadow-[0_0_8px_rgba(255,0,127,0.45)]";
                  textColor = "text-[#ff007f]";
                } else if (ratio > 70) {
                  barColor = "bg-[#F1C40F]"; // Dorado - Prevención
                  glowColor = "shadow-[0_0_8px_rgba(241,196,15,0.35)]";
                  textColor = "text-[#F1C40F]";
                }

                return (
                  <motion.div key={cat.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex items-center gap-3.5 bg-black/25 border border-white/5 p-3 rounded-2xl hover:border-white/10 transition-all duration-300">
                    {/* Icon Container */}
                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-inner">
                      {cat.icono}
                    </div>
                    
                    {/* Info & Progress */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-white text-[10px] font-black uppercase tracking-wider font-sans">{cat.nombre}</span>
                        <span className={`text-[9px] font-mono font-black ${textColor}`}>{ratio.toFixed(0)}%</span>
                      </div>
                      {/* Progress Bar Track */}
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                        <div 
                          className={`h-full ${barColor} ${glowColor} transition-all duration-500 rounded-full`} 
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Values */}
                    <div className="text-right flex flex-col justify-center pl-2 flex-shrink-0 font-sans">
                      <span className="text-white text-[10px] font-black font-sans">{formatMoney(cat.valor)}</span>
                      <span className="text-bunker-mutado text-[7.5px] font-mono mt-0.5 uppercase tracking-wide">lím: {formatMoney(cat.limite)}</span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </section>

        {/* SECCIÓN INGRESOS - LISTA */}
        <section className="bg-bunker-panel/40 border border-white/5 p-5 rounded-3xl backdrop-blur-xl">
          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white">Ingresos Presupuestados</span>
            <span className="text-[10px] font-black text-[#00E5FF] font-sans">{formatMoney(totalIngresosReal)}</span>
          </div>

          {categoriasIngresos.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              titulo="Sin Fuentes de Ingreso"
              subtitulo="Registrá tus fuentes de ingreso para proyecciones precisas"
              textoBoton="Agregar Ingreso"
              onAccion={() => { setActiveTab('INGRESOS'); setIsEditModalOpen(true); }}
            />
          ) : (
            <motion.div 
              initial="hidden" 
              animate="visible" 
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
              className="space-y-3"
            >
              {categoriasIngresos.map(cat => (
                <motion.div key={cat.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex items-center justify-between bg-black/25 border border-white/5 p-3 rounded-2xl hover:border-white/10 transition-all duration-300">
                  <div className="flex items-center gap-3.5">
                    {/* Icon Container */}
                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-inner">
                      {cat.icono}
                    </div>
                    <span className="text-white text-[10px] font-black uppercase tracking-wider font-sans">{cat.nombre}</span>
                  </div>
                  
                  {/* Value */}
                  <div className="text-right font-sans">
                    <span className="text-[#00E5FF] text-[11px] font-black font-sans">{formatMoney(cat.valor)}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        {/* COMPARATIVA FINAL DE PRESUPUESTO */}
        <div className="bg-black/30 border border-white/5 p-5 rounded-3xl flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[8px] font-mono text-bunker-mutado uppercase tracking-widest font-black">// BALANCE GENERAL</span>
            <span className="text-white text-[10px] font-black uppercase mt-0.5">Suficiencia Presupuesto</span>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="text-[#00E5FF] text-xs font-black font-sans">{formatMoney(totalIngresosReal - totalGastosReal)} Neto</span>
            <span className="text-[8px] font-mono text-bunker-mutado uppercase">Consumo de Caja</span>
          </div>
        </div>

      </div>

      {/* MODAL DE EDICIÓN FLOTANTE */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161a23] border border-white/10 w-full max-w-md p-6 rounded-3xl space-y-4 shadow-2xl relative">
            <header className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-white font-serif text-xs font-black uppercase tracking-widest">
                {editingItem ? 'Editar Categoría' : 'Configurar Presupuestos y Límites'}
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
                  { id: 'GASTOS', label: 'Gastos' },
                  { id: 'INGRESOS', label: 'Ingresos' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id as any); resetForm(); }}
                    className={`flex-1 py-1.5 uppercase rounded-lg font-black transition-all cursor-pointer ${activeTab === tab.id ? 'bg-[#0E2531] text-[#00E5FF] border border-[#00E5FF]/20' : 'text-slate-400'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSaveItem} className="space-y-3.5">
              <div>
                <label className="text-[8px] font-mono tracking-widest text-slate-400 uppercase block mb-1">Nombre de la Categoría</label>
                <input 
                  type="text" 
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  placeholder="Ej. Ropa, Servicios, Salidas..."
                  className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#00E5FF]/50 font-sans"
                  required
                />
              </div>

              <div>
                <label className="text-[8px] font-mono tracking-widest text-slate-400 uppercase block mb-1">
                  {activeTab === 'GASTOS' ? 'Límite Mensual ($)' : 'Proyección Estimada ($)'}
                </label>
                <input 
                  type="number" 
                  value={newItemLimit || ''}
                  onChange={e => setNewItemLimit(Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#00E5FF]/50 font-mono"
                />
              </div>

              <div>
                <label className="text-[8px] font-mono tracking-widest text-slate-400 uppercase block mb-1">Icono</label>
                <div className="flex gap-2.5 flex-wrap">
                  {Object.keys(ICON_MAP).map(iconName => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setNewItemIcon(iconName)}
                      className={`w-9 h-9 border rounded-xl flex items-center justify-center cursor-pointer transition-all ${newItemIcon === iconName ? 'bg-[#00E5FF]/10 border-[#00E5FF] text-[#00E5FF]' : 'border-white/5 bg-black/40 text-slate-400'}`}
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
                  className="px-4 py-1.5 bg-[#00E5FF] text-black text-[9px] font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  {editingItem ? 'Actualizar' : 'Añadir'}
                </button>
              </div>
            </form>

            {/* Listado para edición/eliminación */}
            <div className="border-t border-white/5 pt-4">
              <span className="text-[8px] font-mono tracking-widest text-slate-400 uppercase block mb-2">// CATEGORÍAS REGISTRADAS</span>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                {(activeTab === 'GASTOS' ? categoriasGastosDb : categoriasIngresosDb).map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center bg-black/20 p-2.5 border border-white/5 rounded-xl hover:border-white/10 transition-all">
                    <div className="flex items-center gap-2">
                      <div className="text-slate-400">{ICON_MAP[item.icono] || <Shield className="w-4 h-4" />}</div>
                      <div className="flex flex-col">
                        <span className="text-white text-[9px] font-black uppercase tracking-wide">{item.nombre}</span>
                        <span className="text-bunker-mutado text-[8px] font-mono">
                          {activeTab === 'GASTOS' 
                            ? `Límite: ${formatMoney(item.limite || 0)}`
                            : `Proyección: ${formatMoney(item.valor || 0)}`
                          }
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => handleEditClick(item)}
                        className="p-1 border border-white/5 rounded-md hover:bg-[#00E5FF]/10 hover:border-[#00E5FF]/30 text-slate-400 hover:text-[#00E5FF] cursor-pointer"
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
