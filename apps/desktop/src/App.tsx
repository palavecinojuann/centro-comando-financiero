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
  ChevronRight,
  ShieldCheck,
  Zap,
  Heart,
  Search,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Settings as SettingsIcon,
  LogOut,
  Shield,
  Camera,
  Sparkles,
  Brain,
  AlertTriangle,
  CheckCircle2,
  Wallet,
  Briefcase
} from 'lucide-react';

// Motores de Inteligencia
import { auditarGastosVampiro } from './AuditorGastosVampiro';
import type { InterfazAlerta as TipoAlerta } from './AuditorGastosVampiro';
import { ServicioLectorTickets } from './ServicioLectorTickets';
import { ServicioCopilotoGemini } from './ServicioCopilotoGemini';
import type { InsightIA } from './ServicioCopilotoGemini';
import { useFinanceData, Transaction } from './useFinanceData';

// --- COMPONENTES DE APOYO ---

const LoginView = ({ onLogin }: { onLogin: () => void }) => (
  <div className="min-h-screen bg-[#F2EDE4] flex items-center justify-center p-6">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white rounded-[48px] p-12 shadow-2xl border border-white text-center space-y-8">
      <div className="flex justify-center"><div className="p-6 bg-[#E8DFD1]/30 rounded-[32px]"><Shield size={48} className="text-[#8B735B]" /></div></div>
      <div className="space-y-2">
        <h1 className="text-4xl font-serif text-[#4A443F]">Finanzas del Hogar</h1>
        <p className="text-sm opacity-40 uppercase font-black tracking-widest">Protocolo de Acceso Seguro</p>
      </div>
      <button onClick={onLogin} className="w-full py-5 rounded-full bg-[#8B735B] text-white font-black text-lg shadow-xl uppercase tracking-widest flex items-center justify-center gap-3">
        <span>Entrar con Google</span>
      </button>
      <p className="text-[10px] opacity-20 uppercase font-bold tracking-tighter">Bimont Hogar v1.0 • Acceso Encriptado</p>
    </motion.div>
  </div>
);

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 p-4 transition-all w-full ${active ? 'text-[#8B735B]' : 'text-[#4A443F]/40 hover:text-[#4A443F]'}`}>
    <div className={`p-3 rounded-2xl transition-all ${active ? 'bg-white shadow-lg' : ''}`}><Icon size={24} /></div>
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
  </button>
);

const TransactionRow = ({ t }: { t: Transaction }) => (
  <tr className="border-b border-black/5 hover:bg-white/40 transition-colors">
    <td className="py-6 opacity-60 text-xs">{t.date?.toDate().toLocaleDateString() || '...'}</td>
    <td className="py-6 font-bold">{t.description}</td>
    <td className="py-6">
        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${t.source === 'janlu' ? 'bg-orange-100 text-orange-700' : t.source === 'salary' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
            {t.source === 'janlu' ? '🚀 JANLU' : t.source === 'salary' ? '💼 Sueldo' : t.category}
        </span>
    </td>
    <td className={`py-6 font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
        {t.type === 'income' ? '+' : '-'}${t.amount}
    </td>
  </tr>
);

// --- APP PRINCIPAL ---

const CommandCenter: React.FC = () => {
  const { user, logout } = useAuth();
  const { transactions, peacePoint, addTransaction, loading: dataLoading } = useFinanceData();
  const [currentView, setCurrentView] = useState<'dashboard' | 'ledger' | 'manager' | 'simulator' | 'nuevo-registro'>('dashboard');
  const [activeMode, setActiveMode] = useState<'blindaje' | 'expansion' | 'disfrute'>('blindaje');
  
  // Inteligencia
  const [alertasVampiro, setAlertasVampiro] = useState<TipoAlerta[]>([]);
  const [insights, setInsights] = useState<InsightIA[]>([]);
  const [escaneando, setEscaneando] = useState(false);

  useEffect(() => {
    if (transactions.length > 0) {
      setAlertasVampiro(auditarGastosVampiro(transactions as any));
    }
  }, [transactions]);

  // Estado para el nuevo registro
  const [newReg, setNewReg] = useState<Partial<Transaction>>({ amount: 0, description: '', category: 'Otros', type: 'expense', source: 'other' });

  const handleConfirm = async () => {
    if (newReg.amount && newReg.amount > 0) {
        await addTransaction(newReg as any);
        setCurrentView('dashboard');
    }
  };

  const handleJanluInjection = () => {
    setNewReg({ amount: 500, description: 'Inyección Manual JANLU', category: 'Inyección', type: 'income', source: 'janlu' });
    setCurrentView('nuevo-registro');
  };

  const sustainabilityRatio = useMemo(() => {
    const salary = transactions.filter(t => t.type === 'income' && t.source === 'salary').reduce((a, b) => a + b.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
    if (expenses === 0) return 100;
    return Math.min(100, Math.floor((salary / expenses) * 100));
  }, [transactions]);

  if (dataLoading) return <div className="min-h-screen bg-[#F2EDE4] flex items-center justify-center font-black opacity-20 uppercase tracking-[0.5em]">Sincronizando Hogar...</div>;

  return (
    <div className="min-h-screen bg-[#F2EDE4] text-[#4A443F] font-sans flex overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-24 bg-[#E8DFD1]/50 backdrop-blur-xl border-r border-white/20 flex flex-col items-center py-8 z-20">
        <div className="mb-12"><Menu size={28} className="opacity-40" /></div>
        <div className="flex-1 flex flex-col gap-4 w-full">
          <SidebarItem icon={LayoutDashboard} label="Resumen" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
          <SidebarItem icon={TrendingUp} label="Ledger" active={currentView === 'ledger'} onClick={() => setCurrentView('ledger')} />
          <SidebarItem icon={BarChart3} label="Manager" active={currentView === 'manager'} onClick={() => setCurrentView('manager')} />
          <SidebarItem icon={Target} label="Simulador" active={currentView === 'simulator'} onClick={() => setCurrentView('simulator')} />
        </div>
        <div onClick={logout} className="mt-auto opacity-20 hover:opacity-100 transition-all cursor-pointer p-4 hover:text-red-600"><LogOut size={24} /></div>
      </aside>

      <main className="flex-1 relative overflow-y-auto custom-scrollbar">
        <header className="px-8 py-6 flex justify-between items-center sticky top-0 bg-[#F2EDE4]/80 backdrop-blur-md z-10">
          <h1 className="text-xl font-bold uppercase tracking-widest opacity-80 font-serif">Finanzas del Hogar</h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="font-bold text-xs">{user?.displayName || 'Usuario'}</p>
                <p className="text-[9px] opacity-40 uppercase font-black tracking-widest">Hogar Bimont</p>
              </div>
              <img src={user?.photoURL || "https://i.pravatar.cc/150"} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="Profile" />
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && (
            <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-8 pb-12 space-y-12">
              <section className="flex flex-col items-center justify-center pt-4">
                <div className="relative w-[380px] h-[380px] flex items-center justify-center">
                  <svg width="380" height="380" className="transform -rotate-90">
                    <circle cx="190" cy="190" r="150" fill="transparent" stroke="rgba(139, 115, 91, 0.05)" strokeWidth="45" />
                    <circle cx="190" cy="190" r="150" fill="transparent" stroke={sustainabilityRatio >= 100 ? '#9BB095' : '#D9A852'} strokeWidth="45" strokeDasharray={`${(sustainabilityRatio * 942) / 100} 942`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <p className="text-xs opacity-40 font-bold uppercase tracking-widest">Sostenibilidad</p>
                    <h2 className="text-8xl font-bold tracking-tighter leading-none">{sustainabilityRatio}%</h2>
                    <p className="text-[9px] uppercase font-bold tracking-[0.2em] opacity-30 mt-2">Cubierto por Sueldo</p>
                  </div>
                </div>
                
                <div className="flex gap-4 mt-12">
                  <button onClick={handleJanluInjection} className="px-8 py-4 rounded-full bg-white border border-orange-100 text-orange-600 shadow-sm flex items-center gap-3 hover:scale-105 transition-all">
                    <Zap size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">Inyección JANLU</span>
                  </button>
                  <button onClick={() => setCurrentView('nuevo-registro')} className="px-8 py-4 rounded-full bg-[#8B735B] text-white shadow-lg flex items-center gap-3 hover:scale-105 transition-all">
                    <Wallet size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">Cargar Sueldo</span>
                  </button>
                </div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-white/50">
                  <p className="text-[10px] uppercase font-bold opacity-30 mb-1">Gasto Mensual</p>
                  <p className="text-2xl font-bold">${transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0).toFixed(0)}</p>
                </div>
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-white/50">
                  <p className="text-[10px] uppercase font-bold opacity-30 mb-1">Punto de Paz</p>
                  <p className="text-2xl font-bold">{peacePoint}</p>
                </div>
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-white/50">
                  <p className="text-[10px] uppercase font-bold opacity-30 mb-1">Refuerzos JANLU</p>
                  <p className="text-2xl font-bold text-orange-600">${transactions.filter(t => t.source === 'janlu').reduce((a, b) => a + b.amount, 0).toFixed(0)}</p>
                </div>
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-white/50">
                  <p className="text-[10px] uppercase font-bold opacity-30 mb-1">Estatus</p>
                  <p className={`text-xs font-black uppercase ${sustainabilityRatio >= 100 ? 'text-green-600' : 'text-orange-500'}`}>
                    {sustainabilityRatio >= 100 ? 'Independencia Total' : 'Inyección Requerida'}
                  </p>
                </div>
              </section>
            </motion.div>
          )}

          {currentView === 'ledger' && (
            <motion.div key="ledger" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-8 pb-12">
               <div className="bg-white/60 rounded-[32px] p-8 shadow-sm border border-white/50">
                <table className="w-full text-left">
                  <thead className="text-[10px] uppercase font-bold opacity-30 border-b border-black/5">
                    <tr><th className="pb-4">Fecha</th><th className="pb-4">Descripción</th><th className="pb-4">Origen</th><th className="pb-4">Monto</th></tr>
                  </thead>
                  <tbody className="text-sm">
                    {transactions.map((t, i) => <TransactionRow key={i} t={t} />)}
                    {transactions.length === 0 && <tr><td colSpan={4} className="py-20 text-center opacity-20 font-black uppercase tracking-[1em]">Sin movimientos</td></tr>}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {currentView === 'nuevo-registro' && (
            <motion.div key="add" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-0 bg-[#F2EDE4] z-[100] flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-white rounded-[60px] p-12 shadow-2xl relative overflow-hidden space-y-12">
                <button onClick={() => setCurrentView('dashboard')} className="absolute top-10 left-10 text-3xl opacity-20">←</button>
                <header className="text-center pt-4">
                  <p className="text-sm font-bold opacity-60 uppercase tracking-widest">{newReg.type === 'income' ? 'Registrar Ingreso' : 'Registrar Gasto'}</p>
                  <div className="mt-8">
                    <input 
                        type="number" 
                        value={newReg.amount} 
                        onChange={(e) => setNewReg({...newReg, amount: Number(e.target.value)})}
                        className="text-7xl font-light tracking-tighter text-center bg-transparent border-none outline-none w-full"
                        placeholder="0.00"
                    />
                    <p className="text-[10px] opacity-40 uppercase font-black tracking-widest mt-3">Monto en Pesos</p>
                  </div>
                </header>
                <div className="space-y-4">
                    <input 
                        type="text" 
                        placeholder="Descripción (ej. Sueldo Mayo)" 
                        value={newReg.description}
                        onChange={(e) => setNewReg({...newReg, description: e.target.value})}
                        className="w-full p-6 bg-[#F2EDE4]/40 rounded-3xl text-sm font-bold border-none outline-none"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setNewReg({...newReg, type: 'income', source: 'salary'})} className={`p-4 rounded-3xl text-[10px] font-black uppercase ${newReg.source === 'salary' ? 'bg-[#8B735B] text-white' : 'bg-[#F2EDE4]/40'}`}>Es mi Sueldo</button>
                        <button onClick={() => setNewReg({...newReg, type: 'income', source: 'janlu'})} className={`p-4 rounded-3xl text-[10px] font-black uppercase ${newReg.source === 'janlu' ? 'bg-orange-500 text-white' : 'bg-[#F2EDE4]/40'}`}>Inyectar JANLU</button>
                    </div>
                </div>
                <button onClick={handleConfirm} className="w-full py-6 rounded-full bg-[#4A443F] text-white font-black text-lg shadow-xl uppercase tracking-widest hover:scale-[1.02] transition-all">Confirmar Registro</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={() => { setNewReg({amount: 0, description: '', type: 'expense', source: 'other'}); setCurrentView('nuevo-registro'); }} className="fixed bottom-12 right-12 w-16 h-16 bg-[#8B735B] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-10"><Plus size={32} /></button>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
  const { user, loading, login } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#F2EDE4] flex items-center justify-center font-black uppercase tracking-[0.5em] opacity-20">Iniciando Hogar...</div>;
  if (!user) return <LoginView onLogin={login} />;
  return <CommandCenter />;
};

export default App;
