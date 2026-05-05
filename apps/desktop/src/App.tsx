import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './AuthContext';
import { 
  LayoutDashboard, 
  Target, 
  TrendingUp, 
  BarChart3, 
  Plus, 
  Shield, 
  Zap, 
  Wallet, 
  LogOut,
  Calendar,
  Layers,
  Repeat,
  X,
  Check,
  Edit,
  ArrowRight
} from 'lucide-react';

// Motores de Inteligencia
import { useFinanceData, type Transaction } from './useFinanceData';

// --- COMPONENTES DE DISEÑO ---

const SidebarItem = ({ label, active, onClick, icon: Icon }: any) => (
  <button 
    onClick={onClick} 
    className={`px-10 py-5 flex items-center gap-4 w-full transition-all border-l-4 ${active ? 'bg-white/40 border-[#8B735B] text-[#8B735B] font-bold' : 'border-transparent opacity-40 hover:opacity-100'}`}
  >
    <Icon size={18} />
    <span className="text-[10px] uppercase font-black tracking-widest">{label}</span>
  </button>
);

const GlassCard = ({ title, value, subtext, color = "text-[#4A443F]" }: any) => (
  <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[32px] border border-white/80 shadow-sm">
    <p className="text-[9px] uppercase font-black opacity-30 tracking-[0.2em] mb-2">{title}</p>
    <p className={`text-2xl font-black ${color}`}>{value}</p>
    {subtext && <p className="text-[9px] opacity-40 mt-1 uppercase font-bold">{subtext}</p>}
  </div>
);

// --- VISTAS PRINCIPALES ---

const DashboardView = ({ transactions, peacePoint, sustainability, effectiveIncome, effectiveExpenses, liquidSurplus }: any) => {
  const list = transactions || [];
  const pendingCommitments = list.filter((t: any) => (t.type === 'commitment' || t.type === 'recurring') && !t.paid);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
      <div className="relative w-[450px] h-[450px] flex items-center justify-center mb-10">
        <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl scale-90"></div>
        <svg width="450" height="450" className="transform -rotate-90 relative z-10">
          <circle cx="225" cy="225" r="200" fill="transparent" stroke="rgba(139, 115, 91, 0.05)" strokeWidth="35" />
          <circle 
            cx="225" cy="225" r="200" fill="transparent" 
            stroke={sustainability >= 100 ? '#9BB095' : '#D9A852'} 
            strokeWidth="35" 
            strokeDasharray="1256" 
            strokeDashoffset={1256 - (1256 * (Math.min(100, sustainability)/100))} 
            strokeLinecap="round" 
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20">
          <span className="text-[9px] uppercase font-black opacity-30 tracking-[0.4em] mb-2">Peace Point</span>
          <h2 className="text-[120px] font-black tracking-tighter leading-none text-[#4A443F]">{peacePoint}</h2>
          <div className="mt-6 px-5 py-2 bg-white/60 backdrop-blur-md rounded-full border border-white shadow-sm flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${sustainability >= 100 ? 'bg-green-500' : 'bg-orange-500'}`}></div>
            <span className={`text-[9px] font-black uppercase tracking-widest ${sustainability >= 100 ? 'text-green-700' : 'text-orange-700'}`}>Sostenibilidad {sustainability}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 w-full mt-10">
        <div className="col-span-8 grid grid-cols-2 gap-6">
          <GlassCard title="Gastos Mensuales" value={`$${effectiveExpenses.toLocaleString()}`} />
          <GlassCard title="Ingreso Neto" value={`$${effectiveIncome.toLocaleString()}`} color="text-green-600" />
          <div className="col-span-2 bg-gradient-to-br from-[#8B735B] to-[#4A443F] p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <p className="text-[9px] uppercase font-black opacity-60 tracking-[0.3em] mb-2">Excedente Líquido</p>
            <p className="text-4xl font-black">${liquidSurplus.toLocaleString()}</p>
            <p className="text-[10px] opacity-60 mt-4 font-bold uppercase tracking-widest italic">Capital disponible para directrices tácticas</p>
          </div>
        </div>
        
        <div className="col-span-4 bg-white/40 backdrop-blur-xl rounded-[32px] p-8 border border-white border-opacity-60 flex flex-col max-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <p className="text-[10px] uppercase font-black opacity-30 tracking-widest">Agenda de Pagos</p>
            <Calendar size={16} className="opacity-20" />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
            {pendingCommitments.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                <Shield size={32} />
                <p className="text-[9px] font-black uppercase tracking-widest mt-4">Todo Asegurado</p>
              </div>
            ) : (
              pendingCommitments.map((t: any) => (
                <div key={t.id} className="bg-white/60 p-4 rounded-2xl border border-white flex justify-between items-center group">
                  <div>
                    <p className="font-bold text-sm text-[#4A443F]">{t.description}</p>
                    <p className="text-[8px] font-black uppercase text-red-500 mt-1">Vence: {new Date(t.dueDate).toLocaleDateString()}</p>
                  </div>
                  <p className="font-black text-lg">${Number(t.amount).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const TransactionView = ({ transactions, onDelete, onEdit }: any) => {
  const list = transactions || [];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {list.map((t: any, i: number) => {
        return (
          <motion.div 
            key={t.id} 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: i * 0.05 }}
            className="bg-white/50 backdrop-blur-md p-6 rounded-[32px] border border-white shadow-sm flex justify-between items-center hover:bg-white/80 transition-all group"
          >
            <div className="flex items-center gap-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                t.type === 'income' ? 'bg-green-100 text-green-600' : 
                (t.type === 'commitment' || t.type === 'recurring') ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-500'
              }`}>
                {t.type === 'income' ? <Plus size={20}/> : t.type === 'recurring' ? <Repeat size={18}/> : t.type === 'commitment' ? <Calendar size={18}/> : <Wallet size={18}/>}
              </div>
              <div>
                <p className="font-bold text-lg">{t.description}</p>
                <p className="text-[9px] font-black uppercase opacity-30 tracking-widest mt-1">
                  {t.type === 'commitment' ? `CUOTA ${t.currentInstallment}/${t.totalInstallments}` : t.type === 'recurring' ? 'GASTO FIJO MENSUAL' : t.source === 'janlu' ? 'CAPITAL JANLU' : 'FLUJO HOGAR'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className={`text-2xl font-black ${t.type === 'income' ? 'text-green-600' : 'text-[#4A443F]'}`}>
                  {t.type === 'income' ? '+' : '-'}${Number(t.amount).toLocaleString()}
                </p>
                <p className="text-[9px] opacity-30 font-bold uppercase mt-1">{new Date(t.date?.toDate?.() || t.date).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => onEdit(t)}
                  className="w-10 h-10 rounded-full bg-blue-50 text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => { if(confirm('¿Borrar esta operación?')) onDelete(t.id) }}
                  className="w-10 h-10 rounded-full bg-red-50 text-red-300 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

const TacticalView = ({ activeProtocol, liquidSurplus, setSimulatedProtocol, simulatedProtocol, setSimIncomeBoost, setSimExpenseCut, simIncomeBoost, simExpenseCut }: any) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
    <div className="bg-white/60 backdrop-blur-xl p-12 rounded-[48px] border border-white shadow-xl relative overflow-hidden">
      <div className="flex justify-between items-end mb-10">
        <div>
          <p className="text-[9px] uppercase font-black opacity-30 tracking-[0.4em] mb-2">Simulador de Estrategia</p>
          <h3 className="text-4xl font-serif">Centro Táctico</h3>
        </div>
        <div className="flex gap-4">
          {['EMERGENCIA', 'BLINDAJE', 'EXPANSION'].map(p => (
            <button 
              key={p}
              onClick={() => setSimulatedProtocol(p)}
              className={`px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                activeProtocol === p ? 'bg-[#8B735B] text-white' : 'bg-white/40 text-[#4A443F]/40 hover:bg-white'
              }`}
            >
              {p}
            </button>
          ))}
          {simulatedProtocol && <button onClick={() => {setSimulatedProtocol(null); setSimIncomeBoost(0); setSimExpenseCut(0);}} className="text-[9px] font-bold opacity-30 hover:opacity-100">RESET</button>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 mb-10">
        <div className="bg-white/40 p-6 rounded-3xl border border-white/60">
          <p className="text-[9px] font-black uppercase opacity-30 tracking-widest mb-4">Ingreso Extra (+)</p>
          <input type="range" min="0" max="500000" step="10000" value={simIncomeBoost} onChange={(e) => setSimIncomeBoost(e.target.value)} className="w-full accent-[#8B735B]" />
          <p className="text-xl font-black mt-4 text-green-600">+${Number(simIncomeBoost).toLocaleString()}</p>
        </div>
        <div className="bg-white/40 p-6 rounded-3xl border border-white/60">
          <p className="text-[9px] font-black uppercase opacity-30 tracking-widest mb-4">Recorte Gasto (-)</p>
          <input type="range" min="0" max="300000" step="5000" value={simExpenseCut} onChange={(e) => setSimExpenseCut(e.target.value)} className="w-full accent-[#8B735B]" />
          <p className="text-xl font-black mt-4 text-red-500">-${Number(simExpenseCut).toLocaleString()}</p>
        </div>
        <div className={`p-6 rounded-3xl text-white flex flex-col justify-between ${liquidSurplus > 0 ? 'bg-[#4A443F]' : 'bg-red-900'}`}>
          <p className="text-[9px] font-black uppercase opacity-40 tracking-widest">Excedente</p>
          <p className="text-3xl font-black">${liquidSurplus.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white/80 p-8 rounded-[32px] border-2 border-white">
        <div className="flex items-center gap-4 mb-6">
          <Target size={24} className="text-[#8B735B]" />
          <h4 className="text-xl font-serif uppercase tracking-tight">Directrices de Capital: {activeProtocol}</h4>
        </div>
        
        {activeProtocol === 'EXPANSION' && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
              <p className="text-[8px] font-black uppercase opacity-40 mb-2 text-orange-900">Inyección JANLU (50%)</p>
              <p className="text-2xl font-black text-orange-600">${(liquidSurplus * 0.5).toLocaleString()}</p>
            </div>
            <div className="bg-[#F2EDE4] p-6 rounded-2xl">
              <p className="text-[8px] font-black uppercase opacity-40 mb-2">Inversión (30%)</p>
              <p className="text-2xl font-black text-[#8B735B]">${(liquidSurplus * 0.3).toLocaleString()}</p>
            </div>
            <div className="bg-[#F2EDE4] p-6 rounded-2xl">
              <p className="text-[8px] font-black uppercase opacity-40 mb-2">Disfrute (20%)</p>
              <p className="text-2xl font-black text-[#4A443F]">${(liquidSurplus * 0.2).toLocaleString()}</p>
            </div>
          </div>
        )}
        {activeProtocol === 'BLINDAJE' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#F2EDE4] p-6 rounded-2xl border border-[#8B735B]/20">
              <p className="text-[8px] font-black uppercase opacity-40 mb-2 text-[#8B735B]">Reserva de Emergencia (80%)</p>
              <p className="text-2xl font-black text-[#8B735B]">${(liquidSurplus * 0.8).toLocaleString()}</p>
            </div>
            <div className="bg-[#F2EDE4] p-6 rounded-2xl border border-black/5">
              <p className="text-[8px] font-black uppercase opacity-40 mb-2">Caja Operativa (20%)</p>
              <p className="text-2xl font-black text-[#4A443F]">${(liquidSurplus * 0.2).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

// --- COMPONENTE APP ---

const CommandCenterContent = () => {
  const { user, loading: authLoading, login, logout } = useAuth();
  const { transactions, peacePoint: basePeacePoint, addTransaction, updateTransaction, deleteTransaction, loading: dataLoading } = useFinanceData();
  const [view, setView] = useState<'dashboard' | 'ledger' | 'tactical'>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isMobileMode, setIsMobileMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  // Modal State
  const [newAmt, setNewAmt] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState<'expense' | 'income' | 'commitment' | 'recurring'>('expense');
  const [newSource, setNewSource] = useState<'salary' | 'janlu' | 'other'>('salary');
  const [newDueDate, setNewDueDate] = useState("");
  const [newInstallments, setNewInstallments] = useState(1);
  const [newDueDay, setNewDueDay] = useState(1);

  // Simulation State
  const [simulatedProtocol, setSimulatedProtocol] = useState<string | null>(null);
  const [simIncomeBoost, setSimIncomeBoost] = useState(0);
  const [simExpenseCut, setSimExpenseCut] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsMobileMode(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { effectiveIncome, effectiveExpenses, liquidSurplus, sustainability, peacePoint, activeProtocol } = useMemo(() => {
    const list = transactions || [];
    const baseSalary = list.filter(t => t.type === 'income' && t.source === 'salary').reduce((a, b) => a + Number(b.amount), 0);
    const janluIncome = list.filter(t => t.source === 'janlu').reduce((a, b) => a + Number(b.amount), 0);
    const totalIncome = baseSalary + janluIncome;
    const currentExpenses = list.filter(t => t.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);

    const effInc = totalIncome + Number(simIncomeBoost);
    const effExp = Math.max(0, currentExpenses - Number(simExpenseCut));
    const liqSurplus = effInc - effExp;
    const sust = effExp === 0 ? 100 : Math.min(100, Math.floor((baseSalary / effExp) * 100));
    const pp = 800 + (sust * 2) + Math.floor(liqSurplus / 10000);

    let autoP = 'BLINDAJE';
    if (effExp > effInc) autoP = 'EMERGENCIA';
    else if (sust >= 100 && liqSurplus >= 50000) autoP = 'EXPANSION';

    return { 
      effectiveIncome: Number(effInc) || 0, 
      effectiveExpenses: Number(effExp) || 0, 
      liquidSurplus: Number(liqSurplus) || 0, 
      sustainability: Number(sust) || 0, 
      peacePoint: Number(pp) || 0, 
      activeProtocol: simulatedProtocol || autoP 
    };
  }, [transactions, simIncomeBoost, simExpenseCut, simulatedProtocol]);

  const resetForm = () => {
    setNewAmt("");
    setNewDesc("");
    setNewDueDate("");
    setNewInstallments(1);
    setNewDueDay(1);
    setShowSuccess(false);
    setEditingTransaction(null);
  };

  const handleEdit = (t: any) => {
    setEditingTransaction(t);
    setNewAmt(t.amount.toString());
    setNewDesc(t.description);
    setNewType(t.type);
    setNewSource(t.source);
    setNewDueDate(t.dueDate || "");
    setNewInstallments(t.totalInstallments || 1);
    setNewDueDay(t.dueDay || 1);
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!newAmt || !newDesc || isSaving) return;
    
    setIsSaving(true);
    let calculatedDueDate = newDueDate;
    if (newType === 'recurring') {
      const today = new Date();
      let targetDate = new Date(today.getFullYear(), today.getMonth(), newDueDay);
      if (targetDate < today) targetDate.setMonth(targetDate.getMonth() + 1);
      calculatedDueDate = targetDate.toISOString();
    }

    try {
      const data: any = {
        amount: Number(newAmt),
        description: newDesc,
        type: newType,
        source: newSource,
        dueDate: calculatedDueDate || null,
        totalInstallments: newType === 'commitment' ? Number(newInstallments) : null,
        currentInstallment: newType === 'commitment' ? (editingTransaction?.currentInstallment || 1) : null,
        dueDay: newType === 'recurring' ? Number(newDueDay) : null,
        paid: editingTransaction?.paid || false
      };

      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, data);
      } else {
        await addTransaction(data);
      }

      setShowSuccess(true);
    } catch (error: any) {
      console.error("Error al registrar:", error);
      alert("Error al registrar: " + (error.message || "Error desconocido"));
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || (user && dataLoading)) {
    return (
      <div className="h-screen w-screen flex items-center justify-center font-black uppercase tracking-[0.5em] opacity-20 bg-[#F2EDE4]">
        Sincronizando Finanzas...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-screen bg-[#F2EDE4] flex flex-col items-center justify-center p-10 text-[#4A443F]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full text-center space-y-10">
          <div className="w-24 h-24 bg-white rounded-[32px] mx-auto flex items-center justify-center text-[#8B735B] shadow-xl border-4 border-white">
            <Shield size={48} />
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-serif tracking-tighter uppercase opacity-80">Finanzas</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Gestión de Hogar</p>
          </div>
          <button onClick={login} className="w-full py-6 bg-gradient-to-b from-[#8B735B] to-[#4A443F] text-white rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform active:scale-95">
            Acceder al Sistema
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-[#F2EDE4] overflow-hidden text-[#4A443F]">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#E8DFD1]/50 backdrop-blur-xl border-r border-white/40 flex flex-col py-12">
        <div className="px-10 mb-16 space-y-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#8B735B] shadow-sm"><Shield size={24} /></div>
          <div className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm border border-white/50 flex items-center gap-2 ${
            activeProtocol === 'EMERGENCIA' ? 'bg-red-100 text-red-700' : 
            activeProtocol === 'BLINDAJE' ? 'bg-orange-100 text-[#8B735B]' : 'bg-green-100 text-green-700'
          }`}>
            <Zap size={10}/> Protocolo: {activeProtocol}
          </div>
        </div>
        <nav className="flex-1">
          <SidebarItem label="Panel Central" icon={LayoutDashboard} active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <SidebarItem label="Historial" icon={TrendingUp} active={view === 'ledger'} onClick={() => setView('ledger')} />
          <SidebarItem label="Centro Táctico" icon={Target} active={view === 'tactical'} onClick={() => setView('tactical')} />
        </nav>
        <div className="px-10 mt-auto opacity-20 hover:opacity-100 transition-all cursor-pointer" onClick={logout}>
          <div className="flex items-center gap-4 text-red-600 font-bold uppercase text-[9px] tracking-widest"><LogOut size={18}/> Salir</div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-16 overflow-y-auto custom-scrollbar relative">
        <header className="flex justify-between items-center mb-16 max-w-6xl mx-auto">
          <div>
            <h1 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-2">Comando Financiero</h1>
            <h2 className="text-4xl font-serif opacity-80 uppercase">
              {view === 'dashboard' ? 'Resumen Ejecutivo' : view === 'ledger' ? 'Libro Mayor' : 'Operaciones Tácticas'}
            </h2>
          </div>
          <button onClick={() => setShowAddModal(true)} className="bg-gradient-to-b from-[#8B735B] to-[#4A443F] text-white px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-3">
            <Plus size={16}/> Nuevo Registro
          </button>
        </header>

        <div className="max-w-6xl mx-auto pb-20">
          <AnimatePresence mode="wait">
            {view === 'dashboard' && <DashboardView transactions={transactions} peacePoint={peacePoint} sustainability={sustainability} effectiveIncome={effectiveIncome} effectiveExpenses={effectiveExpenses} liquidSurplus={liquidSurplus} />}
            {view === 'ledger' && <TransactionView transactions={transactions} onDelete={deleteTransaction} onEdit={handleEdit} />}
            {view === 'tactical' && <TacticalView activeProtocol={activeProtocol} liquidSurplus={liquidSurplus} setSimulatedProtocol={setSimulatedProtocol} simulatedProtocol={simulatedProtocol} setSimIncomeBoost={setSimIncomeBoost} setSimExpenseCut={setSimExpenseCut} simIncomeBoost={simIncomeBoost} simExpenseCut={simExpenseCut} />}
          </AnimatePresence>
        </div>

        {/* MODAL INTELIGENTE (Adaptable PC/Móvil) */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#F2EDE4]/90 backdrop-blur-xl z-50 flex items-center justify-center p-6">
              <motion.div 
                initial={{ y: 50, scale: 0.95 }} 
                animate={{ y: 0, scale: 1 }} 
                className={`bg-white/40 backdrop-blur-2xl rounded-[60px] border border-white relative overflow-hidden flex flex-col shadow-2xl ${
                  isMobileMode ? 'w-[390px] h-[800px] border-[12px] border-[#4A443F] p-10' : 'w-full max-w-4xl p-16'
                }`}
              >
                <button onClick={() => { setShowAddModal(false); setShowSuccess(false); }} className="absolute top-10 right-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/50 text-[#4A443F]"><X size={24}/></button>
                
                {showSuccess ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-inner">
                      <Check size={48} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-serif text-[#4A443F]">{editingTransaction ? '¡Cambios Guardados!' : '¡Operación Registrada!'}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-2">Los datos se han sincronizado correctamente</p>
                    </div>
                    <div className="flex gap-4 w-full max-w-md pt-8">
                      <button onClick={() => { setShowAddModal(false); setShowSuccess(false); setEditingTransaction(null); }} className="flex-1 py-5 rounded-3xl bg-white border border-black/5 text-[#4A443F] font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-gray-50">Volver al Panel</button>
                      {!editingTransaction && <button onClick={resetForm} className="flex-1 py-5 rounded-3xl bg-[#4A443F] text-white font-black text-[10px] uppercase tracking-widest shadow-xl">Cargar Otra</button>}
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">{editingTransaction ? 'Editar Registro' : 'Nuevo Registro'}</h2>
                    </div>
                    <div className={`flex ${isMobileMode ? 'flex-col text-center mt-10' : 'justify-between items-end border-b border-black/5 pb-12'}`}>
                      <div className={isMobileMode ? 'w-full mb-8' : 'w-1/2 pr-10 border-r border-black/5'}>
                        <p className="text-[9px] uppercase font-black opacity-30 tracking-widest mb-4">Monto Estimado</p>
                        <input type="number" value={newAmt} onChange={e => setNewAmt(e.target.value)} className={`font-light bg-transparent outline-none w-full tracking-tighter text-[#4A443F] placeholder:opacity-10 ${isMobileMode ? 'text-6xl text-center' : 'text-8xl'}`} placeholder="0.00" autoFocus />
                      </div>
                      <div className={isMobileMode ? 'w-full' : 'w-1/2 pl-10'}>
                        <p className="text-[9px] uppercase font-black opacity-30 tracking-widest mb-4">Concepto</p>
                        <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} className={`font-bold bg-transparent border-b border-black/10 outline-none w-full text-[#4A443F] placeholder:opacity-30 pb-2 ${isMobileMode ? 'text-xl text-center' : 'text-3xl'}`} placeholder="Ej: Supermercado" />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-10">
                      <button onClick={() => setNewType('expense')} className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${newType === 'expense' ? 'bg-[#4A443F] text-white shadow-lg' : 'bg-white/40 text-[#4A443F]/40'}`}>Gasto Único</button>
                      <button onClick={() => setNewType('income')} className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${newType === 'income' ? 'bg-green-600 text-white shadow-lg' : 'bg-white/40 text-[#4A443F]/40'}`}>Ingreso</button>
                      <button onClick={() => setNewType('commitment')} className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${newType === 'commitment' ? 'bg-orange-500 text-white shadow-lg' : 'bg-white/40 text-[#4A443F]/40'}`}>A Cuotas</button>
                      <button onClick={() => setNewType('recurring')} className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${newType === 'recurring' ? 'bg-[#8B735B] text-white shadow-lg' : 'bg-white/40 text-[#4A443F]/40'}`}>Gasto Fijo</button>
                    </div>

                    <div className="mt-8 flex-1">
                      {newType === 'commitment' ? (
                        <div className="grid grid-cols-2 gap-6">
                          <div><p className="text-[9px] uppercase font-black opacity-30 mb-4">Primer Vencimiento</p><input type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} className="w-full p-4 rounded-2xl bg-white/40 border border-white font-bold" /></div>
                          <div><p className="text-[9px] uppercase font-black opacity-30 mb-4">Total Cuotas</p><input type="number" value={newInstallments} onChange={e => setNewInstallments(Number(e.target.value))} className="w-full p-4 rounded-2xl bg-white/40 border border-white font-bold" /></div>
                        </div>
                      ) : newType === 'recurring' ? (
                        <div className="w-1/2">
                          <p className="text-[9px] uppercase font-black opacity-30 mb-4">Día del mes</p>
                          <input type="number" min="1" max="31" value={newDueDay} onChange={e => setNewDueDay(Number(e.target.value))} className="w-full p-4 rounded-2xl bg-white/40 border border-white font-bold" />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-[9px] uppercase font-black opacity-30">Origen</p>
                          <div className="flex gap-4">
                            <button onClick={() => setNewSource('salary')} className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest ${newSource === 'salary' ? 'bg-[#4A443F] text-white' : 'bg-white/40 text-[#4A443F]/40'}`}>Base</button>
                            <button onClick={() => setNewSource('janlu')} className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest ${newSource === 'janlu' ? 'bg-[#D9A852] text-white' : 'bg-white/40 text-[#4A443F]/40'}`}>JANLU</button>
                          </div>
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={handleSave} 
                      disabled={isSaving}
                      className={`w-full py-6 rounded-[32px] bg-gradient-to-b from-[#8B735B] to-[#4A443F] text-white font-black text-xs uppercase tracking-[0.3em] shadow-xl mt-8 flex items-center justify-center gap-4 transition-all ${isSaving ? 'opacity-50 scale-95' : 'hover:scale-[1.02]'}`}
                    >
                      {isSaving ? 'Sincronizando...' : 'Confirmar Operación'}
                    </button>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CommandCenterContent />
    </AuthProvider>
  );
};

export default App;
