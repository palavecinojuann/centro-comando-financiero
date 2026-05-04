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
  CheckCircle2
} from 'lucide-react';

// Motores de Inteligencia (Traídos de la versión de casa)
import { auditarGastosVampiro } from './AuditorGastosVampiro';
import type { InterfazAlerta as TipoAlerta } from './AuditorGastosVampiro';
import { ServicioLectorTickets } from './ServicioLectorTickets';
import { ServicioCopilotoGemini } from './ServicioCopilotoGemini';
import type { InsightIA } from './ServicioCopilotoGemini';
import { useFinanceData } from './useFinanceData';

// --- COMPONENTES DE APOYO ---

const LoginView = ({ onLogin }: { onLogin: () => void }) => (
  <div className="min-h-screen bg-[#F2EDE4] flex items-center justify-center p-6">
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full bg-white rounded-[48px] p-12 shadow-2xl border border-white text-center space-y-8"
    >
      <div className="flex justify-center">
        <div className="p-6 bg-[#E8DFD1]/30 rounded-[32px]">
          <Shield size={48} className="text-[#8B735B]" />
        </div>
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-serif text-[#4A443F]">Finanzas del Hogar</h1>
        <p className="text-sm opacity-40 uppercase font-black tracking-widest">Protocolo de Acceso Seguro</p>
      </div>
      <button 
        onClick={onLogin}
        className="w-full py-5 rounded-full bg-[#8B735B] text-white font-black text-lg shadow-xl shadow-[#8B735B]/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest flex items-center justify-center gap-3"
      >
        <span>Entrar con Google</span>
      </button>
      <p className="text-[10px] opacity-20 uppercase font-bold tracking-tighter">Bimont Command Center v1.0 • Acceso Encriptado</p>
    </motion.div>
  </div>
);

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-4 transition-all w-full ${active ? 'text-[#8B735B]' : 'text-[#4A443F]/40 hover:text-[#4A443F]'}`}
  >
    <div className={`p-3 rounded-2xl transition-all ${active ? 'bg-white shadow-lg' : ''}`}>
      <Icon size={24} />
    </div>
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
  </button>
);

const CategoryPill = ({ label }: { label: string }) => {
  const colors: any = {
    Freelance: 'bg-blue-100 text-blue-700',
    Groceries: 'bg-green-100 text-green-700',
    Housing: 'bg-purple-100 text-purple-700',
    Dining: 'bg-orange-100 text-orange-700',
  };
  return <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${colors[label] || 'bg-gray-100 text-gray-700'}`}>{label}</span>;
};

// --- APP PRINCIPAL ---

const CommandCenter: React.FC = () => {
  const { user, logout } = useAuth();
  const { expenses, peacePoint, addExpense, loading: dataLoading } = useFinanceData();
  const [currentView, setCurrentView] = useState<'dashboard' | 'ledger' | 'manager' | 'simulator' | 'nuevo-gasto'>('dashboard');
  const [activeMode, setActiveMode] = useState<'blindaje' | 'expansion' | 'disfrute'>('blindaje');
  
  // Estados de Inteligencia
  const [alertasVampiro, setAlertasVampiro] = useState<TipoAlerta[]>([]);
  const [insights, setInsights] = useState<InsightIA[]>([]);
  const [escaneando, setEscaneando] = useState(false);

  const lectorOCR = useMemo(() => new ServicioLectorTickets(), []);
  const copilotGemini = useMemo(() => new ServicioCopilotoGemini(), []);

  // Efecto para Auditoría e IA
  useEffect(() => {
    if (expenses.length > 0) {
      setAlertasVampiro(auditarGastosVampiro(expenses as any));
      copilotGemini.analizarPatrones(expenses, 15000).then(setInsights);
    }
  }, [expenses]);

  const [newExpense, setNewExpense] = useState({ amount: 145.50, description: 'Alquiler mensual mayo', category: 'Hogar', method: 'Visa **** 4902' });

  const handleConfirmExpense = async () => {
    await addExpense(newExpense);
    setCurrentView('dashboard');
  };

  const handleScan = () => {
    setEscaneando(true);
    setTimeout(() => {
      const mockText = "YPF ESTACION DE SERVICIO\nTOTAL: $45.800,00";
      const result = lectorOCR.procesarTexto(mockText);
      setNewExpense({
        amount: result.montoTotal,
        description: result.nombreComercio,
        category: result.categoria || 'Logística',
        method: 'Efectivo'
      });
      setEscaneando(false);
      setCurrentView('nuevo-gasto');
    }, 2000);
  };

  if (dataLoading) return <div className="min-h-screen bg-[#F2EDE4] flex items-center justify-center font-black opacity-20 uppercase tracking-[0.5em]">Sincronizando Hogar...</div>;

  return (
    <div className="min-h-screen bg-[#F2EDE4] text-[#4A443F] font-sans flex overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-24 bg-[#E8DFD1]/50 backdrop-blur-xl border-r border-white/20 flex flex-col items-center py-8 z-20">
        <div className="mb-12">
          <Menu size={28} className="opacity-40" />
        </div>
        <div className="flex-1 flex flex-col gap-4 w-full">
          <SidebarItem icon={LayoutDashboard} label="Resumen" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
          <SidebarItem icon={TrendingUp} label="Ledger" active={currentView === 'ledger'} onClick={() => setCurrentView('ledger')} />
          <SidebarItem icon={BarChart3} label="Manager" active={currentView === 'manager'} onClick={() => setCurrentView('manager')} />
          <SidebarItem icon={Target} label="Simulador" active={currentView === 'simulator'} onClick={() => setCurrentView('simulator')} />
        </div>
        <div 
          onClick={logout}
          className="mt-auto opacity-20 hover:opacity-100 transition-all cursor-pointer p-4 hover:text-red-600"
        >
          <LogOut size={24} />
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 relative overflow-y-auto custom-scrollbar">
        
        {/* Header Universal */}
        <header className="px-8 py-6 flex justify-between items-center sticky top-0 bg-[#F2EDE4]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold uppercase tracking-widest opacity-80 font-serif">
              {currentView === 'dashboard' ? 'Command Center' : 
               currentView === 'ledger' ? 'October 2023 - Ledger' : 
               currentView === 'manager' ? 'Financial Insights' : 'Simulator'}
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="font-bold text-xs">{user?.displayName || 'Usuario'}</p>
                <p className="text-[9px] opacity-40 uppercase font-bold tracking-widest">Acceso Bunker</p>
              </div>
              <img src={user?.photoURL || "https://i.pravatar.cc/150"} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="Profile" />
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {/* DASHBOARD */}
          {currentView === 'dashboard' && (
            <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-8 pb-12 space-y-12">
              <section className="flex flex-col items-center justify-center pt-4">
                <div className="relative w-[380px] h-[380px] flex items-center justify-center">
                  <svg width="380" height="380" className="transform -rotate-90">
                    <circle cx="190" cy="190" r="150" fill="transparent" stroke="rgba(139, 115, 91, 0.05)" strokeWidth="45" />
                    <circle cx="190" cy="190" r="150" fill="transparent" stroke="#9BB095" strokeWidth="45" strokeDasharray="100 800" strokeDashoffset="0" strokeLinecap="round" />
                    <circle cx="190" cy="190" r="150" fill="transparent" stroke="#C88566" strokeWidth="45" strokeDasharray="200 700" strokeDashoffset="-110" strokeLinecap="round" />
                    <circle cx="190" cy="190" r="150" fill="transparent" stroke="#D9A852" strokeWidth="45" strokeDasharray="150 750" strokeDashoffset="-320" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <p className="text-xs opacity-40 font-bold uppercase tracking-widest">Peace Point</p>
                    <h2 className="text-8xl font-bold tracking-tighter leading-none">{peacePoint}</h2>
                    <p className="text-[9px] uppercase font-bold tracking-[0.2em] opacity-30 mt-2">Financial Security Score</p>
                  </div>
                </div>
                <div className="flex gap-4 mt-12">
                  {[
                    { id: 'blindaje', label: 'Modo Blindaje', icon: ShieldCheck, action: handleScan },
                    { id: 'expansion', label: 'Modo Expansión', icon: Zap },
                    { id: 'disfrute', label: 'Modo Disfrute', icon: Heart }
                  ].map(mode => (
                    <button key={mode.id} onClick={() => mode.action ? mode.action() : setActiveMode(mode.id as any)} className={`px-8 py-4 rounded-full flex items-center gap-3 transition-all shadow-sm border ${activeMode === mode.id ? 'bg-white text-[#4A443F] border-[#8B735B]/20 scale-105' : 'bg-transparent text-[#4A443F]/40 border-transparent'}`}>
                      {escaneando && mode.id === 'blindaje' ? <Camera className="animate-pulse" size={18} /> : <mode.icon size={18} />}
                      <span className="text-xs font-bold">{mode.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* ALERTAS IA (Traídas de casa) */}
              {alertasVampiro.length > 0 && (
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {alertasVampiro.slice(0, 2).map((alerta, i) => (
                    <div key={i} className="bg-orange-50/50 border border-orange-100 rounded-3xl p-6 flex items-center gap-4">
                      <AlertTriangle className="text-orange-500" />
                      <div>
                        <p className="text-[10px] font-black uppercase text-orange-500 tracking-widest">Gasto Vampiro</p>
                        <p className="text-sm font-bold">{alerta.comercio} duplicado</p>
                      </div>
                    </div>
                  ))}
                </section>
              )}

              <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-white/50">
                  <p className="text-[10px] uppercase font-bold opacity-30 mb-1">Total en Cuentas</p>
                  <p className="text-2xl font-bold">$ 117.364,00</p>
                </div>
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-white/50">
                  <p className="text-[10px] uppercase font-bold opacity-30 mb-1">Crecimiento</p>
                  <p className="text-2xl font-bold text-green-600">+0,08% ↗</p>
                </div>
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-white/50">
                   <p className="text-[10px] uppercase font-bold opacity-30 mb-1">Insights IA</p>
                   <p className="text-[11px] font-medium leading-relaxed italic">"{insights[0]?.mensaje || 'Analizando búnker...'}"</p>
                </div>
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-white/50">
                  <p className="text-[10px] uppercase font-bold opacity-30 mb-1">Alertas</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">#{alertasVampiro.length}</span>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {/* ... (Resto de las vistas Ledger, Manager, Simulator se mantienen con la estructura Irish Cream) ... */}
          {currentView === 'ledger' && (
            <motion.div key="ledger" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-8 flex gap-8">
               <div className="flex-1 bg-white/60 rounded-[32px] p-8 shadow-sm border border-white/50">
                <table className="w-full text-left">
                  <thead className="text-[10px] uppercase font-bold opacity-30 border-b border-black/5">
                    <tr><th className="pb-4">Date</th><th className="pb-4">Description</th><th className="pb-4">Category</th><th className="pb-4">Amount</th></tr>
                  </thead>
                  <tbody className="text-sm">
                    {expenses.map((row, i) => (
                      <tr key={i} className="border-b border-black/5">
                        <td className="py-6 opacity-60">{row.date?.toDate().toLocaleDateString() || '...'}</td>
                        <td className="py-6 font-bold">{row.description}</td>
                        <td className="py-6"><CategoryPill label={row.category} /></td>
                        <td className="py-6 font-bold text-red-500">-${row.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* VISTA NUEVO GASTO */}
          {currentView === 'nuevo-gasto' && (
            <motion.div key="add" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-0 bg-[#F2EDE4] z-[100] flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-white rounded-[60px] p-12 shadow-2xl relative overflow-hidden space-y-12">
                <button onClick={() => setCurrentView('dashboard')} className="absolute top-10 left-10 text-3xl opacity-20">←</button>
                <header className="text-center pt-4">
                  <p className="text-sm font-bold opacity-60">Nuevo Registro <span className="opacity-20 font-black">| OCR</span></p>
                  <div className="mt-8">
                    <h2 className="text-7xl font-light tracking-tighter">€ {newExpense.amount}</h2>
                    <p className="text-[10px] opacity-40 uppercase font-black tracking-widest mt-3">Confirmar datos escaneados</p>
                  </div>
                </header>
                <div className="space-y-6 pt-8 border-t border-black/5">
                  <div className="flex justify-between items-end gap-4">
                    <div className="flex-1"><p className="text-[9px] font-black uppercase opacity-20 mb-1 tracking-[0.2em]">Comercio</p><p className="text-sm font-bold">{newExpense.description}</p></div>
                  </div>
                  <div><p className="text-[9px] font-black uppercase opacity-20 mb-1 tracking-[0.2em]">Categoría</p><p className="text-sm font-bold">{newExpense.category}</p></div>
                </div>
                <button onClick={handleConfirmExpense} className="w-full py-6 rounded-full bg-[#8B735B] text-white font-black text-lg shadow-xl uppercase tracking-widest">Confirmar Gasto</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAB */}
        <button onClick={() => setCurrentView('nuevo-gasto')} className="fixed bottom-12 right-12 w-16 h-16 bg-[#8B735B] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-10"><Plus size={32} /></button>
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
  if (loading) return <div className="min-h-screen bg-[#F2EDE4] flex items-center justify-center font-black uppercase tracking-[0.5em] opacity-20">Iniciando Búnker...</div>;
  if (!user) return <LoginView onLogin={login} />;
  return <CommandCenter />;
};

export default App;
