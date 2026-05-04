import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './AuthContext';
import { 
  LayoutDashboard, 
  Target, 
  TrendingUp, 
  BarChart3, 
  Menu, 
  Plus, 
  Bell, 
  Shield, 
  Zap, 
  Wallet, 
  Settings as SettingsIcon,
  LogOut,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Camera,
  Search,
  Calendar,
  AlertTriangle
} from 'lucide-react';

// Motores de Inteligencia
import { useFinanceData, Transaction } from './useFinanceData';

// --- COMPONENTES DE DISEÑO ---

const SidebarItem = ({ label, active, onClick, icon: Icon }: any) => (
  <button 
    onClick={onClick} 
    className={`px-10 py-6 flex items-center gap-4 w-full transition-all border-l-4 ${active ? 'bg-[#F2EDE4] border-[#8B735B] text-[#8B735B] font-bold' : 'border-transparent opacity-40 hover:opacity-100'}`}
  >
    <div className={`w-5 h-5 border-2 border-current rounded-md flex items-center justify-center`}>
        {active && <div className="w-1.5 h-1.5 bg-current rounded-full" />}
    </div>
    <span className="text-[10px] uppercase font-black tracking-widest">{label}</span>
  </button>
);

const ModeButton = ({ label, active, onClick, icon: Icon }: any) => (
  <button 
    onClick={onClick}
    className={`px-10 py-4 rounded-[32px] flex items-center gap-3 transition-all ${active ? 'bg-gradient-to-b from-[#8B735B] to-[#4A443F] text-white shadow-xl scale-105' : 'bg-gradient-to-b from-[#E8DFD1] to-[#C4B9A9] text-[#4A443F]/80 opacity-70 hover:opacity-100'}`}
  >
    <Icon size={16} />
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
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

const DashboardView = ({ transactions, peacePoint, sustainabilityRatio, activeMode, setActiveMode, onAction }: any) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
    <header className="w-full flex justify-between items-center mb-10">
      <h1 className="text-4xl font-serif opacity-80 uppercase tracking-tighter">Command Center</h1>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-bold text-sm">Hogar Bimont</p>
          <p className="text-[9px] opacity-40 uppercase font-black tracking-widest">Protocolo Activo</p>
        </div>
        <div className="w-12 h-12 bg-white rounded-full border-2 border-white shadow-xl p-0.5"><img src="https://i.pravatar.cc/100" className="rounded-full" alt="Profile" /></div>
      </div>
    </header>

    <div className="relative w-[480px] h-[480px] flex items-center justify-center">
      <svg width="480" height="480" className="transform -rotate-90">
        <circle cx="240" cy="240" r="200" fill="transparent" stroke="rgba(139, 115, 91, 0.05)" strokeWidth="55" />
        <circle cx="240" cy="240" r="200" fill="transparent" stroke="#9BB095" strokeWidth="55" strokeDasharray="1256" strokeDashoffset={1256 - (1256 * 0.4)} strokeLinecap="butt" />
        <circle cx="240" cy="240" r="200" fill="transparent" stroke="#C88566" strokeWidth="55" strokeDasharray="1256" strokeDashoffset={1256 - (1256 * 0.2)} strokeDashoffset="-500" strokeLinecap="butt" />
        <circle cx="240" cy="240" r="200" fill="transparent" stroke="#D9A852" strokeWidth="55" strokeDasharray="1256" strokeDashoffset={1256 - (1256 * 0.3)} strokeDashoffset="-800" strokeLinecap="butt" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-xs opacity-40 font-bold uppercase tracking-[0.3em]">Peace Point</p>
        <h2 className="text-[120px] font-black tracking-tighter leading-none">{peacePoint}</h2>
        <p className="text-[9px] uppercase font-black tracking-[0.3em] opacity-40 mt-4">Security Score</p>
      </div>
    </div>

    <div className="flex gap-6 mt-16">
      <ModeButton label="Modo Blindaje" active={activeMode === 'blindaje'} onClick={() => setActiveMode('blindaje')} icon={Shield} />
      <ModeButton label="Modo Expansión" active={activeMode === 'expansion'} onClick={() => setActiveMode('expansion')} icon={Zap} />
      <ModeButton label="Modo Disfrute" active={activeMode === 'disfrute'} onClick={() => setActiveMode('disfrute')} icon={Target} />
    </div>

    <div className="grid grid-cols-4 gap-6 w-full mt-20">
      <GlassCard title="Sostenibilidad" value={`${sustainabilityRatio}%`} subtext="Cubierto por Sueldo" color={sustainabilityRatio >= 100 ? 'text-green-600' : 'text-orange-600'} />
      <GlassCard title="Refuerzos JANLU" value={`$${transactions.filter((t: any) => t.source === 'janlu').reduce((a: any, b: any) => a + b.amount, 0).toLocaleString()}`} />
      <GlassCard title="Gasto Mensual" value={`$${transactions.filter((t: any) => t.type === 'expense').reduce((a: any, b: any) => a + b.amount, 0).toLocaleString()}`} />
      <GlassCard title="Estatus Búnker" value={sustainabilityRatio >= 100 ? "Independiente" : "Inyección Requerida"} color={sustainabilityRatio >= 100 ? 'text-green-600' : 'text-orange-600'} />
    </div>
  </motion.div>
);

const TransactionView = ({ transactions, onAdd }: any) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
     <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-serif opacity-80">Registros del Búnker</h2>
        <button onClick={onAdd} className="bg-[#8B735B] text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-xl flex items-center gap-2"><Plus size={16}/> Nuevo Registro</button>
     </div>
     <div className="bg-white/40 rounded-[40px] border border-white overflow-hidden shadow-sm">
        <table className="w-full text-left">
            <thead className="bg-[#E8DFD1]/30 text-[10px] uppercase font-black opacity-30">
                <tr><th className="px-8 py-4">Fecha</th><th className="px-8 py-4">Descripción</th><th className="px-8 py-4">Categoría</th><th className="px-8 py-4">Monto</th></tr>
            </thead>
            <tbody>
                {transactions.map((t: any) => (
                    <tr key={t.id} className="border-b border-black/5 hover:bg-white/40 transition-all">
                        <td className="px-8 py-6 opacity-40 text-xs font-bold">{t.date?.toDate().toLocaleDateString() || 'Reciente'}</td>
                        <td className="px-8 py-6 font-bold">{t.description}</td>
                        <td className="px-8 py-6">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${t.source === 'janlu' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                {t.source === 'janlu' ? '🚀 JANLU' : t.category}
                            </span>
                        </td>
                        <td className={`px-8 py-6 font-black ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                            {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
     </div>
  </motion.div>
);

// --- COMPONENTE APP ---

const CommandCenterContent = () => {
  const { user, logout } = useAuth();
  const { transactions, peacePoint, addTransaction, loading } = useFinanceData();
  const [view, setView] = useState<'dashboard' | 'ledger' | 'manager' | 'simulator'>('dashboard');
  const [activeMode, setActiveMode] = useState<'blindaje' | 'expansion' | 'disfrute'>('blindaje');
  const [showAddModal, setShowAddModal] = useState(false);

  const sustainabilityRatio = useMemo(() => {
    const salary = transactions.filter(t => t.type === 'income' && t.source === 'salary').reduce((a, b) => a + b.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
    if (expenses === 0) return 100;
    return Math.min(100, Math.floor((salary / expenses) * 100));
  }, [transactions]);

  if (loading) return <div className="h-screen w-screen flex items-center justify-center font-black uppercase tracking-[0.5em] opacity-20 bg-[#F2EDE4]">Sincronizando Búnker...</div>;

  return (
    <div className="h-screen w-screen flex bg-[#F2EDE4] overflow-hidden text-[#4A443F]">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#E8DFD1] flex flex-col py-12">
        <div className="px-10 mb-20">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#8B735B] shadow-sm"><Shield size={24} /></div>
        </div>
        <nav className="flex-1">
          <SidebarItem label="Mi Resumen" icon={LayoutDashboard} active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <SidebarItem label="Registros" icon={TrendingUp} active={view === 'ledger'} onClick={() => setView('ledger')} />
          <SidebarItem label="Manager" icon={BarChart3} active={view === 'manager'} onClick={() => setView('manager')} />
          <SidebarItem label="Simulador" icon={Target} active={view === 'simulator'} onClick={() => setView('simulator')} />
        </nav>
        <div className="px-10 mt-auto opacity-20 hover:opacity-100 transition-all cursor-pointer" onClick={logout}>
          <div className="flex items-center gap-4 text-red-600"><LogOut size={20}/><span className="text-[10px] font-black uppercase tracking-widest">Salir del Sistema</span></div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-20 overflow-y-auto custom-scrollbar relative">
        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <DashboardView 
              transactions={transactions} 
              peacePoint={peacePoint} 
              sustainabilityRatio={sustainabilityRatio} 
              activeMode={activeMode} 
              setActiveMode={setActiveMode}
            />
          )}
          {view === 'ledger' && (
            <TransactionView transactions={transactions} onAdd={() => setShowAddModal(true)} />
          )}
        </AnimatePresence>

        {/* MODAL DE CARGA (Estilo iPhone Mockup) */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#F2EDE4]/90 backdrop-blur-xl z-50 flex items-center justify-center">
               <motion.div initial={{ y: 100, scale: 0.9 }} animate={{ y: 0, scale: 1 }} className="w-[390px] h-[844px] bg-[#F2EDE4] rounded-[60px] border-[12px] border-[#4A443F] relative overflow-hidden p-10 flex flex-col shadow-2xl">
                    <button onClick={() => setShowAddModal(false)} className="absolute top-10 left-10 text-xl opacity-20">←</button>
                    <header className="text-center space-y-4 pt-10">
                        <p className="text-[11px] font-black uppercase opacity-30 tracking-[0.4em]">Añadir Gasto</p>
                        <div className="bg-white/50 p-10 rounded-[40px] border border-white">
                            <h2 className="text-5xl font-light tracking-tighter">$ 0.00</h2>
                            <p className="text-[9px] opacity-40 uppercase font-black mt-4 tracking-widest">Hogar Bimont • Real Time</p>
                        </div>
                    </header>
                    <div className="grid grid-cols-3 gap-4 mt-10">
                        {['🏠', '🚚', '🌱', '🍸', '💼'].map((emoji, i) => (
                            <div key={i} className="p-5 rounded-[28px] bg-white/40 flex flex-col items-center gap-2 border border-white hover:bg-white transition-all cursor-pointer">
                                <span className="text-2xl">{emoji}</span>
                                <span className="text-[8px] font-black uppercase tracking-tighter opacity-40">Categoría</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-auto space-y-6">
                        <button className="w-full py-6 rounded-full bg-[#D9A852] text-white font-black text-xs uppercase tracking-widest shadow-xl">Confirmar Gasto</button>
                    </div>
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
