import React, { useState } from 'react';
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
  Heart
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

const StatCard = ({ label, value, sub, trend }: any) => (
  <div className="bg-white rounded-[24px] p-6 shadow-sm border border-white/50 flex flex-col justify-between">
    <div>
      <p className="text-[10px] uppercase font-bold opacity-40 tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
    {sub && <p className="text-[10px] mt-2 opacity-60 font-medium">{sub} <span className="text-green-600">{trend}</span></p>}
  </div>
);

// --- APP PRINCIPAL ---

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'metas' | 'inversiones' | 'reportes' | 'nuevo-gasto'>('dashboard');
  const [activeMode, setActiveMode] = useState<'blindaje' | 'expansion' | 'disfrute'>('blindaje');
  
  // Datos simulados
  const peacePoint = 820; 

  return (
    <div className="min-h-screen bg-[#F2EDE4] text-[#4A443F] font-sans flex overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-24 bg-[#E8DFD1]/50 backdrop-blur-xl border-r border-white/20 flex flex-col items-center py-8 z-20">
        <div className="mb-12">
          <Menu size={28} className="opacity-40" />
        </div>
        <div className="flex-1 flex flex-col gap-4">
          <SidebarItem icon={LayoutDashboard} label="Mi Resumen" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
          <SidebarItem icon={Target} label="Metas" active={currentView === 'metas'} onClick={() => setCurrentView('metas')} />
          <SidebarItem icon={TrendingUp} label="Inversiones" active={currentView === 'inversiones'} onClick={() => setCurrentView('inversiones')} />
          <SidebarItem icon={BarChart3} label="Reportes" active={currentView === 'reportes'} onClick={() => setCurrentView('reportes')} />
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 relative overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <header className="p-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-serif text-[#4A443F] opacity-90">Command Center</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-bold text-sm">Josein Poldea</p>
              <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold">SW 7537</p>
            </div>
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
              <img src="https://i.pravatar.cc/150?u=josein" alt="Perfil" />
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-8 pb-12 space-y-12"
            >
              {/* METER CENTRAL */}
              <section className="flex flex-col items-center justify-center relative">
                <div className="relative w-[400px] h-[400px] flex items-center justify-center">
                  <svg width="400" height="400" className="transform -rotate-90">
                    <circle cx="200" cy="200" r="160" fill="transparent" stroke="rgba(139, 115, 91, 0.1)" strokeWidth="40" />
                    <circle cx="200" cy="200" r="160" fill="transparent" stroke="#9BB095" strokeWidth="40" strokeDasharray="100 900" strokeDashoffset="0" strokeLinecap="round" />
                    <circle cx="200" cy="200" r="160" fill="transparent" stroke="#C88566" strokeWidth="40" strokeDasharray="200 800" strokeDashoffset="-110" strokeLinecap="round" />
                    <circle cx="200" cy="200" r="160" fill="transparent" stroke="#D9A852" strokeWidth="40" strokeDasharray="150 850" strokeDashoffset="-320" strokeLinecap="round" />
                  </svg>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <p className="text-sm opacity-60 font-medium">Peace Point</p>
                    <h2 className="text-9xl font-bold tracking-tighter leading-none">{peacePoint}</h2>
                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40 mt-2">Financial Security Score</p>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  {[
                    { id: 'blindaje', label: 'Modo Blindaje', icon: ShieldCheck },
                    { id: 'expansion', label: 'Modo Expansión', icon: Zap },
                    { id: 'disfrute', label: 'Modo Disfrute', icon: Heart }
                  ].map(mode => (
                    <button 
                      key={mode.id}
                      onClick={() => setActiveMode(mode.id as any)}
                      className={`px-8 py-4 rounded-full flex items-center gap-3 transition-all duration-500 shadow-sm border ${
                        activeMode === mode.id 
                          ? 'bg-white text-[#4A443F] border-[#8B735B]/20 scale-105' 
                          : 'bg-transparent text-[#4A443F]/40 border-transparent hover:border-[#8B735B]/10'
                      }`}
                    >
                      <div className={`p-1 rounded-full border ${activeMode === mode.id ? 'border-[#8B735B]/30' : 'border-transparent'}`}>
                        <mode.icon size={18} />
                      </div>
                      <span className="text-xs font-bold">{mode.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="Total en Cuentas" value="$ 117.364,00" sub="Crecimiento de Cartera" trend="+0,08% ↗" />
                <StatCard label="Inversiones" value="$ 2.366,00" sub="Crecimiento de Cartera" />
                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-white/50 space-y-4">
                  <p className="text-[10px] uppercase font-bold opacity-40 tracking-widest">Próximos Pagos</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold">22 de poso</p>
                      <p className="text-[10px] opacity-40">Próximos en hacho</p>
                    </div>
                    <ChevronRight size={16} className="opacity-40" />
                  </div>
                  <hr className="opacity-10" />
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold">25 de uso</p>
                      <p className="text-[10px] opacity-40">Próximo sw ahoro</p>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-green-600/10 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-white/50 flex flex-col justify-between">
                  <p className="text-[10px] uppercase font-bold opacity-40 tracking-widest">Alertas</p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold">#1</span>
                    <Bell size={20} className="text-orange-500 animate-pulse" />
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {currentView === 'metas' && (
            <motion.div 
              key="metas"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 max-w-5xl mx-auto"
            >
              <h2 className="text-4xl font-serif mb-12">Capital Distribution Simulator</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {[
                  { id: 'cons', label: 'Conservative Plan', color: '#D9A852' },
                  { id: 'growth', label: 'Growth Plan', color: '#9BB095' },
                  { id: 'aggr', label: 'Aggressive Plan', color: '#C88566' }
                ].map((plan) => (
                  <div key={plan.id} className="bg-[#E8DFD1]/30 rounded-[40px] p-8 flex flex-col items-center gap-8 shadow-inner">
                    <h3 className="font-bold text-lg text-center leading-tight">{plan.label}</h3>
                    <div className="h-[400px] w-24 bg-[#F2EDE4] rounded-full relative p-2 shadow-inner">
                      <div className="absolute inset-0 flex flex-col justify-between py-8 px-2 opacity-20 text-[10px] font-bold">
                        <span>100%</span>
                        <span>75%</span>
                        <span>50%</span>
                        <span>25%</span>
                        <span>0%</span>
                      </div>
                      <div 
                        className="absolute bottom-2 left-2 right-2 rounded-full transition-all duration-1000"
                        style={{ height: plan.id === 'cons' ? '30%' : plan.id === 'growth' ? '50%' : '20%', backgroundColor: plan.color }}
                      ></div>
                      <div 
                        className="absolute w-12 h-12 bg-white rounded-2xl shadow-xl left-1/2 -translate-x-1/2 flex items-center justify-center text-xs font-bold"
                        style={{ bottom: plan.id === 'cons' ? '30%' : plan.id === 'growth' ? '50%' : '20%' }}
                      >
                        {plan.id === 'cons' ? '30%' : plan.id === 'growth' ? '50%' : '20%'}
                      </div>
                    </div>
                    <span className="text-4xl font-bold opacity-80">{plan.id === 'cons' ? '30%' : plan.id === 'growth' ? '50%' : '20%'}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {currentView === 'nuevo-gasto' && (
            <motion.div 
              key="nuevo-gasto"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="fixed inset-0 bg-[#F2EDE4] z-50 flex items-center justify-center p-4"
            >
              <div className="max-w-sm w-full bg-white rounded-[48px] p-10 shadow-2xl space-y-10 relative overflow-hidden">
                <button onClick={() => setCurrentView('dashboard')} className="absolute top-8 left-8 text-2xl opacity-20 hover:opacity-100 transition-all">←</button>
                
                <header className="text-center pt-4">
                  <p className="text-sm font-medium opacity-60">Añadir Gasto <span className="opacity-30">| Aura</span></p>
                  <div className="mt-6">
                    <h2 className="text-6xl font-light tracking-tighter">€ 145.50</h2>
                    <p className="text-[10px] opacity-40 uppercase font-bold tracking-widest mt-2">01 may 2024 • 14:32</p>
                  </div>
                </header>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'edu', icon: '📖', label: 'Educación' },
                    { id: 'hogar', icon: '🏠', label: 'Hogar', active: true },
                    { id: 'log', icon: '🚚', label: 'Logística' },
                    { id: 'vit', icon: '🌱', label: 'Sostenimiento Vital' },
                    { id: 'ocio', icon: '🍸', label: 'Ocio' }
                  ].map(cat => (
                    <button key={cat.id} className={`p-4 rounded-3xl flex flex-col items-center gap-2 transition-all ${cat.active ? 'bg-[#F2EDE4] shadow-inner' : 'bg-white hover:bg-[#F2EDE4]/20'}`}>
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="text-[8px] font-bold uppercase tracking-tight opacity-60">{cat.label}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-4 pt-6 border-t border-black/5">
                  <div className="flex justify-between items-center text-[10px] font-bold opacity-20 uppercase tracking-widest">
                    <span>Descripción</span>
                    <span>Fecha</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-bold">Alquiler mensual mayo</p>
                    <p className="text-sm font-bold">1 mayo 2024</p>
                  </div>
                </div>

                <button className="w-full py-5 rounded-full bg-[#E8DFD1] text-[#8B735B] font-bold shadow-sm hover:shadow-md transition-all">
                  Confirmar Gasto
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setCurrentView('nuevo-gasto')}
          className="fixed bottom-12 right-12 w-16 h-16 bg-[#8B735B] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-10"
        >
          <Plus size={32} />
        </button>

      </main>
    </div>
  );
};

export default App;
