import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  LogOut
} from 'lucide-react';

// --- COMPONENTES DE APOYO ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-4 transition-all ${active ? 'text-[#8B735B]' : 'text-[#4A443F]/40 hover:text-[#4A443F]'}`}
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
    Employment: 'bg-blue-100 text-blue-700',
    Utilities: 'bg-cyan-100 text-cyan-700',
    Transport: 'bg-orange-100 text-orange-700',
  };
  return <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${colors[label] || 'bg-gray-100 text-gray-700'}`}>{label}</span>;
};

// --- APP PRINCIPAL ---

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'ledger' | 'manager' | 'simulator' | 'nuevo-gasto'>('dashboard');
  const [activeMode, setActiveMode] = useState<'blindaje' | 'expansion' | 'disfrute'>('blindaje');
  
  const peacePoint = 820;

  return (
    <div className="min-h-screen bg-[#F2EDE4] text-[#4A443F] font-sans flex overflow-hidden">
      
      {/* SIDEBAR (Imagen 1) */}
      <aside className="w-24 bg-[#E8DFD1]/50 backdrop-blur-xl border-r border-white/20 flex flex-col items-center py-8 z-20">
        <div className="mb-12">
          <Menu size={28} className="opacity-40" />
        </div>
        <div className="flex-1 flex flex-col gap-4">
          <SidebarItem icon={LayoutDashboard} label="Resumen" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
          <SidebarItem icon={TrendingUp} label="Ledger" active={currentView === 'ledger'} onClick={() => setCurrentView('ledger')} />
          <SidebarItem icon={BarChart3} label="Manager" active={currentView === 'manager'} onClick={() => setCurrentView('manager')} />
          <SidebarItem icon={Target} label="Simulador" active={currentView === 'simulator'} onClick={() => setCurrentView('simulator')} />
        </div>
        <div className="mt-auto opacity-20 hover:opacity-100 transition-all cursor-pointer">
          <LogOut size={24} />
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 relative overflow-y-auto custom-scrollbar">
        
        {/* Header Universal */}
        <header className="px-8 py-6 flex justify-between items-center sticky top-0 bg-[#F2EDE4]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            {currentView === 'ledger' && <h1 className="text-xl font-bold uppercase tracking-widest opacity-80 font-serif">October 2023 - Financial Ledger</h1>}
            {currentView === 'manager' && <h1 className="text-xl font-bold opacity-80 font-serif">Financial Dashboard - Manager View</h1>}
            {currentView === 'dashboard' && <h1 className="text-3xl font-serif opacity-90">Command Center</h1>}
            {currentView === 'simulator' && <h1 className="text-xl font-bold opacity-80 font-serif">Capital Distribution Simulator</h1>}
          </div>
          <div className="flex items-center gap-6">
            {(currentView === 'ledger' || currentView === 'manager') && (
              <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-xl shadow-sm border border-white">
                <Search size={16} className="opacity-30" />
                <input type="text" placeholder="Search..." className="bg-transparent outline-none text-sm w-32" />
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="font-bold text-xs">Josein Poldea</p>
                <p className="text-[9px] opacity-40 uppercase font-bold tracking-widest">SW 7537</p>
              </div>
              <img src="https://i.pravatar.cc/150?u=josein" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="Profile" />
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {/* VISTA 1: COMMAND CENTER */}
          {currentView === 'dashboard' && (
            <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-8 pb-12 space-y-12">
              <section className="flex flex-col items-center justify-center relative pt-4">
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
                    { id: 'blindaje', label: 'Modo Blindaje', icon: ShieldCheck },
                    { id: 'expansion', label: 'Modo Expansión', icon: Zap },
                    { id: 'disfrute', label: 'Modo Disfrute', icon: Heart }
                  ].map(mode => (
                    <button key={mode.id} onClick={() => setActiveMode(mode.id as any)} className={`px-8 py-4 rounded-full flex items-center gap-3 transition-all duration-500 shadow-sm border ${activeMode === mode.id ? 'bg-white text-[#4A443F] border-[#8B735B]/20 scale-105' : 'bg-transparent text-[#4A443F]/40 border-transparent hover:border-[#8B735B]/10'}`}>
                      <mode.icon size={18} className={activeMode === mode.id ? 'text-[#8B735B]' : ''} />
                      <span className="text-xs font-bold">{mode.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-white/50">
                  <p className="text-[10px] uppercase font-bold opacity-30 tracking-widest mb-1">Total en Cuentas</p>
                  <p className="text-2xl font-bold">$ 117.364,00</p>
                  <div className="mt-4 flex items-center gap-1 text-[10px] text-green-600 font-bold"><span>+0,08%</span><ArrowUpRight size={12}/></div>
                </div>
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-white/50">
                  <p className="text-[10px] uppercase font-bold opacity-30 tracking-widest mb-1">Crecimiento de Cartera</p>
                  <p className="text-2xl font-bold text-green-600">+0,08% ↗</p>
                </div>
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-white/50 space-y-3">
                  <p className="text-[10px] uppercase font-bold opacity-30 tracking-widest">Próximos Pagos</p>
                  <div className="flex justify-between items-center text-xs">
                    <p className="font-bold">22 de poso</p>
                    <ChevronRight size={14} className="opacity-20" />
                  </div>
                  <hr className="opacity-5" />
                  <div className="flex justify-between items-center text-xs">
                    <p className="font-bold">25 de uso</p>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-white/50 flex flex-col justify-between">
                  <p className="text-[10px] uppercase font-bold opacity-30 tracking-widest">Alertas</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">#1</span>
                    <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold">!</div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {/* VISTA 2: FINANCIAL LEDGER */}
          {currentView === 'ledger' && (
            <motion.div key="ledger" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-8 flex gap-8">
              <div className="flex-1 bg-white/60 rounded-[32px] p-8 shadow-sm border border-white/50">
                <header className="flex justify-between items-center mb-8">
                  <h2 className="font-bold text-lg">Transactions</h2>
                  <div className="flex gap-2">
                    <button onClick={() => setCurrentView('nuevo-gasto')} className="bg-[#5D4D3F] text-white px-6 py-2 rounded-xl text-xs font-bold shadow-md">Add Transaction</button>
                    <button className="bg-white px-4 py-2 rounded-xl text-xs font-bold border border-black/5 flex items-center gap-2"><Filter size={14}/> Filters</button>
                  </div>
                </header>
                <table className="w-full text-left">
                  <thead className="text-[10px] uppercase tracking-widest font-bold opacity-30 border-b border-black/5">
                    <tr>
                      <th className="pb-4">Date</th>
                      <th className="pb-4">Description</th>
                      <th className="pb-4">Category</th>
                      <th className="pb-4">Amount</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium">
                    {[
                      { d: 'Oct 18', desc: 'Client Payment - Freelance', cat: 'Freelance', amt: '+$1,250.00', st: 'Income', bal: '$1,250.00', pos: true },
                      { d: 'Oct 18', desc: 'Grocery Trip - Groceries', cat: 'Groceries', amt: '-$168.42', st: 'Expense', bal: '$2,442.82', pos: false },
                      { d: 'Oct 17', desc: 'Rent Payment - Housing', cat: 'Housing', amt: '-$2,100.00', st: 'Expense', bal: '$3,657.00', pos: false },
                      { d: 'Oct 16', desc: 'Coffee Shop - Dining', cat: 'Dining', amt: '-$12.50', st: 'Expense', bal: '$3,657.14', pos: false },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-black/5 hover:bg-white/40 transition-colors">
                        <td className="py-6 opacity-60">{row.d}</td>
                        <td className="py-6 font-bold">{row.desc}</td>
                        <td className="py-6"><CategoryPill label={row.cat} /></td>
                        <td className={`py-6 font-bold ${row.pos ? 'text-green-600' : 'text-red-500'}`}>{row.amt}</td>
                        <td className="py-6"><span className={`px-3 py-1 rounded-full text-[10px] font-bold ${row.pos ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{row.st}</span></td>
                        <td className="py-6 font-bold opacity-80">{row.bal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <aside className="w-80 space-y-6">
                <div className="bg-white/80 rounded-[32px] p-8 shadow-sm border border-white">
                  <h3 className="font-bold mb-6 text-lg tracking-tight">Overview</h3>
                  <div className="space-y-6">
                    <div><p className="text-[10px] uppercase font-bold opacity-30 mb-1">Income</p><p className="text-2xl font-bold text-green-600">$6,100.00</p></div>
                    <div><p className="text-[10px] uppercase font-bold opacity-30 mb-1">Expenses</p><p className="text-2xl font-bold text-red-500">$2,442.86</p></div>
                    <hr className="opacity-10" />
                    <div><p className="text-[10px] uppercase font-bold opacity-30 mb-1">Net Balance</p><p className="text-3xl font-bold">$3,657.14</p></div>
                  </div>
                  <div className="mt-8 flex justify-center">
                    <div className="relative w-32 h-32">
                      <svg viewBox="0 0 36 36" className="w-full h-full transform rotate-90">
                        <path className="text-blue-100" strokeDasharray="30, 100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="text-orange-100" strokeDasharray="20, 100" strokeDashoffset="-30" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="text-green-200" strokeDasharray="50, 100" strokeDashoffset="-50" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                    </div>
                  </div>
                </div>
              </aside>
            </motion.div>
          )}

          {/* VISTA 3: MANAGER VIEW */}
          {currentView === 'manager' && (
            <motion.div key="manager" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-8 pb-12 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { l: 'Total Budget', v: '$3,500,000', p: '75%', c: 'bg-[#8B735B]' },
                  { l: 'Total Spending', v: '$2,625,000', p: '', c: '' },
                  { l: 'Remaining Budget', v: '$875,000', p: '-12%', c: 'bg-orange-100 text-orange-600' },
                  { l: 'Budget Progress', v: '75%', p: '', c: '' },
                ].map((s, i) => (
                  <div key={i} className="bg-white/80 rounded-3xl p-6 shadow-sm border border-white">
                    <p className="text-[10px] uppercase font-bold opacity-40 mb-1 tracking-widest">{s.l}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold">{s.v}</p>
                      {s.p && <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${s.c}`}>{s.p}</span>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-white">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="font-bold text-sm">Budget vs Actual Spending</h3>
                    <div className="text-[9px] font-bold opacity-30 flex gap-4 uppercase tracking-widest"><span>Budget: Cream</span><span>Actual: Brown</span></div>
                  </div>
                  <div className="h-48 flex items-end gap-2 relative border-b border-black/5">
                    <svg className="w-full h-full opacity-20" viewBox="0 0 400 100" preserveAspectRatio="none">
                      <path d="M0,80 Q50,20 100,50 T200,30 T300,60 T400,20" fill="none" stroke="#8B735B" strokeWidth="4" />
                      <path d="M0,90 Q50,40 100,70 T200,50 T300,80 T400,40" fill="none" stroke="#D9A852" strokeWidth="4" />
                    </svg>
                  </div>
                  <div className="flex justify-between mt-4 text-[9px] font-bold opacity-30">
                    <span>July</span><span>Aug</span><span>Sept</span>
                  </div>
                </div>
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-white">
                  <h3 className="font-bold text-sm mb-8">Department Spend Variance</h3>
                  <div className="h-48 flex items-end justify-around border-b border-black/5 pb-4">
                    {[
                      { l: 'Mkt', b: 40, a: 60 }, { l: 'Ops', b: 70, a: 50 }, { l: 'HR', b: 30, a: 40 }, { l: 'R&D', b: 90, a: 40 },
                    ].map((d, i) => (
                      <div key={i} className="flex flex-col items-center gap-2">
                        <div className="flex gap-1 h-32 items-end">
                          <div className="w-3 bg-orange-100/50 rounded-t-sm" style={{ height: `${d.b}%` }}></div>
                          <div className="w-3 bg-[#8B735B]/50 rounded-t-sm" style={{ height: `${d.a}%` }}></div>
                        </div>
                        <p className="text-[9px] font-bold opacity-40 uppercase">{d.l}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* VISTA 4: SIMULADOR */}
          {currentView === 'simulator' && (
            <motion.div key="sim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {[
                  { id: 'cons', label: 'Conservative Plan', color: '#D9A852', val: '30%' },
                  { id: 'growth', label: 'Growth Plan', color: '#9BB095', val: '50%' },
                  { id: 'aggr', label: 'Aggressive Plan', color: '#C88566', val: '20%' }
                ].map((plan) => (
                  <div key={plan.id} className="bg-white/40 rounded-[48px] p-10 flex flex-col items-center gap-10 shadow-sm border border-white">
                    <h3 className="font-bold text-xl text-center leading-tight">{plan.label}</h3>
                    <div className="h-[450px] w-28 bg-[#F2EDE4] rounded-full relative p-3 shadow-inner border border-black/5">
                      <div className="absolute inset-0 flex flex-col justify-between py-12 px-3 opacity-10 text-[9px] font-bold uppercase tracking-widest">
                        <span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span>
                      </div>
                      <motion.div initial={{ height: 0 }} animate={{ height: plan.val }} className="absolute bottom-3 left-3 right-3 rounded-full shadow-lg" style={{ backgroundColor: plan.color }} />
                      <div className="absolute w-14 h-14 bg-white rounded-3xl shadow-2xl left-1/2 -translate-x-1/2 flex items-center justify-center text-sm font-black border border-black/5" style={{ bottom: plan.val }}>{plan.val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* VISTA 5: NUEVO GASTO MOBILE */}
          {currentView === 'nuevo-gasto' && (
            <motion.div key="add" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-0 bg-[#F2EDE4] z-[100] flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-white rounded-[60px] p-12 shadow-2xl relative overflow-hidden space-y-12">
                <button onClick={() => setCurrentView('dashboard')} className="absolute top-10 left-10 text-3xl opacity-20 hover:opacity-100 transition-all">←</button>
                <header className="text-center pt-4">
                  <p className="text-sm font-bold opacity-60 flex items-center justify-center gap-2 tracking-tight">Añadir Gasto <span className="opacity-20 uppercase font-black text-[10px]">| Aura</span></p>
                  <div className="mt-8 py-8">
                    <h2 className="text-7xl font-light tracking-tighter text-[#4A443F]">€ 145.50</h2>
                    <p className="text-[10px] opacity-40 uppercase font-black tracking-[0.3em] mt-3">01 may 2024 • 14:32</p>
                  </div>
                </header>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { i: '📖', l: 'Educación' }, { i: '🏠', l: 'Hogar', a: true }, { i: '🚚', l: 'Logística' },
                    { i: '🌱', l: 'Sostenimiento' }, { i: '🍸', l: 'Ocio' }
                  ].map((c, i) => (
                    <button key={i} className={`p-5 rounded-[32px] flex flex-col items-center gap-2 transition-all ${c.a ? 'bg-white shadow-xl ring-2 ring-[#8B735B]/10' : 'bg-[#F2EDE4]/40 hover:bg-white'}`}>
                      <span className="text-3xl">{c.i}</span>
                      <span className="text-[8px] font-black uppercase tracking-tighter opacity-60 text-center leading-none">{c.l}</span>
                    </button>
                  ))}
                </div>
                <div className="space-y-6 pt-8 border-t border-black/5">
                  <div className="flex justify-between items-end gap-4">
                    <div className="flex-1"><p className="text-[9px] font-black uppercase opacity-20 mb-1 tracking-[0.2em]">Descripción</p><p className="text-sm font-bold">Alquiler mensual mayo</p></div>
                    <div className="text-right"><p className="text-[9px] font-black uppercase opacity-20 mb-1 tracking-[0.2em]">Fecha</p><p className="text-sm font-bold whitespace-nowrap">1 mayo 2024</p></div>
                  </div>
                  <div><p className="text-[9px] font-black uppercase opacity-20 mb-1 tracking-[0.2em]">Método</p><p className="text-sm font-bold">Visa **** 4902</p></div>
                </div>
                <button className="w-full py-6 rounded-full bg-[#E8DFD1] text-[#8B735B] font-black text-lg shadow-xl shadow-[#8B735B]/10 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest">Confirmar Gasto</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAB */}
        <button onClick={() => setCurrentView('nuevo-gasto')} className="fixed bottom-12 right-12 w-16 h-16 bg-[#8B735B] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-10"><Plus size={32} /></button>
      </main>
    </div>
  );
};

export default App;
