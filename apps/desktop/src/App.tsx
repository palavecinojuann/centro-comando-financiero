import React, { useState, useMemo, useEffect } from 'react';
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
  LogOut,
  Camera,
  Edit3
} from 'lucide-react';

// --- UTILIDADES ---

// Función para obtener el 4to día hábil del mes actual o próximo
const getCuartoDiaHabil = (date: Date) => {
  let count = 0;
  let d = new Date(date.getFullYear(), date.getMonth(), 1);
  while (count < 4) {
    let dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
    if (count < 4) d.setDate(d.getDate() + 1);
  }
  return d;
};

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
    Educación: 'bg-blue-100 text-blue-700',
    Hogar: 'bg-purple-100 text-purple-700',
    Logística: 'bg-orange-100 text-orange-700',
    Sostenimiento: 'bg-green-100 text-green-700',
    Ocio: 'bg-orange-100 text-orange-700',
  };
  return <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${colors[label] || 'bg-gray-100 text-gray-700'}`}>{label}</span>;
};

// --- APP PRINCIPAL ---

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'ledger' | 'manager' | 'simulator' | 'nuevo-gasto'>('dashboard');
  const [activeMode, setActiveMode] = useState<'blindaje' | 'expansion' | 'disfrute'>('blindaje');
  
  // Estados de Finanzas
  const [saldoTotal, setSaldoTotal] = useState(117364);
  const [gastosComprometidos, setGastosComprometidos] = useState([
    { id: 1, desc: 'Alquiler', monto: 45000, fecha: '2026-05-05' },
    { id: 2, desc: 'Colegio', monto: 25000, fecha: '2026-05-10' }
  ]);
  
  // Sliders del Simulador
  const [sliderBlindaje, setSliderBlindaje] = useState(30);
  const [sliderExpansion, setSliderExpansion] = useState(50);

  // Cálculos Dinámicos
  const hoy = new Date();
  const fechaCobro = useMemo(() => getCuartoDiaHabil(hoy), [hoy.getMonth()]);
  const diasFaltantes = useMemo(() => {
    const diff = fechaCobro.getTime() - hoy.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [fechaCobro]);

  const disponibleHoy = useMemo(() => {
    const totalComprometido = gastosComprometidos.reduce((acc, g) => acc + g.monto, 0);
    const disponibleReal = saldoTotal - totalComprometido;
    return Math.max(0, Math.floor(disponibleReal / diasFaltantes));
  }, [saldoTotal, gastosComprometidos, diasFaltantes]);

  const peacePointPercentage = useMemo(() => {
    const sueldoBimont = 150000; // Mock
    const gastosVitales = 85000; // Mock
    return Math.round((sueldoBimont / gastosVitales) * 100);
  }, []);

  return (
    <div className="min-h-screen bg-[#F2EDE4] text-[#4A443F] font-sans flex overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-24 bg-[#E8DFD1]/50 backdrop-blur-xl border-r border-white/20 flex flex-col items-center py-8 z-20">
        <div className="mb-12 cursor-pointer">
          <Menu size={28} className="opacity-40" />
        </div>
        <div className="flex-1 flex flex-col gap-4">
          <SidebarItem icon={LayoutDashboard} label="Búnker" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
          <SidebarItem icon={TrendingUp} label="Caja" active={currentView === 'ledger'} onClick={() => setCurrentView('ledger')} />
          <SidebarItem icon={Target} label="Simular" active={currentView === 'simulator'} onClick={() => setCurrentView('simulator')} />
          <SidebarItem icon={BarChart3} label="Reporte" active={currentView === 'manager'} onClick={() => setCurrentView('manager')} />
        </div>
        <div className="mt-auto opacity-20 hover:opacity-100 transition-all cursor-pointer">
          <LogOut size={24} />
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 relative overflow-y-auto custom-scrollbar">
        
        <header className="px-8 py-6 flex justify-between items-center sticky top-0 bg-[#F2EDE4]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-serif opacity-90">
              {currentView === 'dashboard' ? 'Centro de Mando' : 
               currentView === 'simulator' ? 'Simulador de Capital' : 
               currentView === 'ledger' ? 'Libro Diario' : 'Análisis Gerencial'}
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-white/40 px-4 py-2 rounded-2xl border border-white/50">
              <Calendar size={16} className="text-[#8B735B]" />
              <span className="text-xs font-bold opacity-60">Próximo Cobro: {fechaCobro.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="font-bold text-xs">Familia Bimont</p>
                <p className="text-[9px] opacity-40 uppercase font-bold tracking-widest">SW 7537 Cream</p>
              </div>
              <img src="https://i.pravatar.cc/150?u=bimont" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="Profile" />
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          
          {/* DASHBOARD */}
          {currentView === 'dashboard' && (
            <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-8 pb-12 space-y-12">
              <section className="flex flex-col items-center justify-center relative pt-4">
                <div className="relative w-[380px] h-[380px] flex items-center justify-center">
                  <svg width="380" height="380" className="transform -rotate-90">
                    <circle cx="190" cy="190" r="160" fill="transparent" stroke="rgba(139, 115, 91, 0.05)" strokeWidth="40" />
                    <circle cx="190" cy="190" r="160" fill="transparent" stroke="#8B735B" strokeWidth="40" strokeDasharray="1005" strokeDashoffset={1005 - (1005 * peacePointPercentage / 100)} strokeLinecap="round" className="transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest mb-2">Punto de Paz (Bimont)</p>
                    <h2 className="text-7xl font-bold tracking-tighter leading-none">{peacePointPercentage}%</h2>
                    <div className="mt-8 bg-white/60 backdrop-blur-md px-6 py-4 rounded-[32px] border border-white shadow-xl">
                      <p className="text-[9px] uppercase font-bold tracking-[0.2em] opacity-40 mb-1">Disponible para Hoy</p>
                      <p className="text-3xl font-black text-[#8B735B]">$ {disponibleHoy.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 mt-8">
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
                  <p className="text-2xl font-bold">$ {saldoTotal.toLocaleString()}</p>
                  <div className="mt-4 flex items-center gap-1 text-[10px] text-green-600 font-bold"><span>+1.2%</span><ArrowUpRight size={12}/></div>
                </div>
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-white/50">
                  <p className="text-[10px] uppercase font-bold opacity-30 tracking-widest mb-1">Días para el Cobro</p>
                  <p className="text-2xl font-bold">{diasFaltantes} días</p>
                  <p className="text-[9px] opacity-40 mt-1 font-bold">Meta: 4to día hábil</p>
                </div>
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-white/50 space-y-3 col-span-2">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] uppercase font-bold opacity-30 tracking-widest">Próximos Compromisos</p>
                    <button className="text-[9px] font-bold text-[#8B735B] uppercase">+ Agregar</button>
                  </div>
                  {gastosComprometidos.map(g => (
                    <div key={g.id} className="flex justify-between items-center text-xs group">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#8B735B]"></div>
                        <p className="font-bold opacity-80">{g.desc}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="opacity-40 font-mono">{g.fecha}</span>
                        <span className="font-black">$ {g.monto.toLocaleString()}</span>
                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-20 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {/* SIMULADOR DINÁMICO */}
          {currentView === 'simulator' && (
            <motion.div key="sim" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-12 max-w-5xl mx-auto space-y-12">
              <header className="text-center space-y-2">
                <h2 className="text-4xl font-serif">Simulación de Excedentes</h2>
                <p className="text-sm opacity-50">Ajusta los sliders para decidir el destino de tu capital de crecimiento.</p>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                
                {/* Sliders */}
                <div className="space-y-12 bg-white/40 p-10 rounded-[48px] border border-white">
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <div>
                        <h4 className="font-bold text-lg">Blindaje Personal</h4>
                        <p className="text-xs opacity-50">Fondo de Emergencia (Meta: 3 meses)</p>
                      </div>
                      <span className="text-2xl font-black text-[#8B735B]">{sliderBlindaje}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" value={sliderBlindaje}
                      onChange={(e) => setSliderBlindaje(parseInt(e.target.value))}
                      className="w-full h-2 bg-[#E8DFD1] rounded-lg appearance-none cursor-pointer accent-[#8B735B]"
                    />
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <div>
                        <h4 className="font-bold text-lg">Expansión Janlu</h4>
                        <p className="text-xs opacity-50">Showroom e Insumos (SW 7537)</p>
                      </div>
                      <span className="text-2xl font-black text-[#8B735B]">{sliderExpansion}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" value={sliderExpansion}
                      onChange={(e) => setSliderExpansion(parseInt(e.target.value))}
                      className="w-full h-2 bg-[#E8DFD1] rounded-lg appearance-none cursor-pointer accent-[#8B735B]"
                    />
                  </div>
                </div>

                {/* Visualización de Impacto */}
                <div className="flex items-center justify-center">
                  <div className="relative w-72 h-72">
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="4" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#9BB095" strokeWidth="4" strokeDasharray={`${sliderExpansion} 100`} />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#8B735B" strokeWidth="4" strokeDasharray={`${sliderBlindaje} 100`} strokeDashoffset={`-${sliderExpansion}`} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Inyección Total</p>
                      <p className="text-4xl font-black">$ {((sliderBlindaje + sliderExpansion) * 500).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* NUEVO GASTO CON OCR */}
          {currentView === 'nuevo-gasto' && (
            <motion.div key="add" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-0 bg-[#F2EDE4] z-[100] flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-white rounded-[60px] p-12 shadow-2xl relative overflow-hidden space-y-8">
                <button onClick={() => setCurrentView('dashboard')} className="absolute top-10 left-10 text-3xl opacity-20 hover:opacity-100 transition-all">←</button>
                <header className="text-center">
                  <div className="flex justify-center mb-4">
                    <button className="p-4 bg-[#8B735B]/10 rounded-full text-[#8B735B] hover:bg-[#8B735B]/20 transition-all">
                      <Camera size={32} />
                    </button>
                  </div>
                  <p className="text-sm font-bold opacity-60">Escanear Ticket o Cargar Manual</p>
                  <div className="mt-6">
                    <h2 className="text-6xl font-light tracking-tighter text-[#4A443F]">$ 0.00</h2>
                  </div>
                </header>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <p className="text-[10px] font-bold uppercase opacity-30">Categoría</p>
                    <button className="text-[10px] font-bold text-[#8B735B] uppercase flex items-center gap-1">
                      <Edit3 size={10} /> Gestionar
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {['Edu', 'Hogar', 'Log', 'Super', 'Ocio', 'Salud'].map((c, i) => (
                      <button key={i} className={`p-4 rounded-[24px] bg-[#F2EDE4]/40 hover:bg-white border border-transparent hover:border-[#8B735B]/20 transition-all flex flex-col items-center gap-1`}>
                        <span className="text-[9px] font-bold uppercase opacity-60">{c}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-black/5">
                  <div className="flex items-center gap-3 bg-[#F2EDE4]/30 p-4 rounded-2xl">
                    <Calendar size={18} className="opacity-30" />
                    <input type="date" className="bg-transparent outline-none text-sm font-bold w-full" defaultValue={hoy.toISOString().split('T')[0]} />
                  </div>
                  <input type="text" placeholder="Descripción..." className="w-full bg-[#F2EDE4]/30 p-4 rounded-2xl outline-none text-sm font-bold" />
                </div>

                <button className="w-full py-6 rounded-full bg-[#8B735B] text-white font-black text-lg shadow-xl shadow-[#8B735B]/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest">
                  Confirmar Gasto
                </button>
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
