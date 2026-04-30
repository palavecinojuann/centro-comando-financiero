import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'resumen' | 'metas' | 'inversiones' | 'reportes'>('resumen');
  const [peacePoint] = useState(820);
  const [totalAccounts] = useState(117364.00);

  const sidebarItems = [
    { id: 'resumen', label: 'Mi Resumen', icon: '📝' },
    { id: 'metas', label: 'Metas', icon: '🎯' },
    { id: 'inversiones', label: 'Inversiones', icon: '📈' },
    { id: 'reportes', label: 'Reportes', icon: '📊' },
  ];

  return (
    <div className="flex h-screen bg-[#F5F1E9] text-[#4A3F35] font-sans overflow-hidden">
      
      {/* SIDEBAR MINIMALISTA */}
      <aside className="w-28 flex flex-col items-center py-10 border-r border-[#8B735B]/10 z-20">
        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-16">
          <div className="w-6 h-1 bg-[#8B735B] rounded-full mb-1"></div>
          <div className="w-4 h-1 bg-[#8B735B]/60 rounded-full"></div>
        </div>

        <nav className="flex-1 space-y-8">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className="group flex flex-col items-center gap-2 relative"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                activeTab === item.id 
                  ? 'neumo-button text-xl' 
                  : 'opacity-40 group-hover:opacity-100 text-lg'
              }`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-tighter transition-opacity duration-500 ${
                activeTab === item.id ? 'opacity-100' : 'opacity-0'
              }`}>
                {item.label}
              </span>
              {activeTab === item.id && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute -left-6 w-1 h-8 bg-[#8B735B] rounded-r-full"
                />
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col relative overflow-hidden p-8">
        
        {/* TOP BAR */}
        <header className="flex justify-between items-center mb-10 px-4">
          <h1 className="text-4xl font-serif tracking-tight text-[#4A3F35]">Command Center</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold">Joseim Poldaa</p>
              <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold">SW 7537</p>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-white shadow-lg overflow-hidden">
              <img src="https://i.pravatar.cc/150?u=joseim" alt="User" />
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-4 pb-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'resumen' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-5xl mx-auto space-y-12"
              >
                {/* CENTRAL PEACE POINT CHART */}
                <div className="flex justify-center relative py-10">
                  <div className="relative w-80 h-80 flex items-center justify-center">
                    {/* SVG DONUT CHART (Simplified representation of the mockup) */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="160" cy="160" r="140" fill="transparent" stroke="white" strokeWidth="30" />
                      <circle cx="160" cy="160" r="140" fill="transparent" stroke="#A8BC9F" strokeWidth="30" strokeDasharray="880" strokeDashoffset="200" strokeLinecap="round" />
                      <circle cx="160" cy="160" r="140" fill="transparent" stroke="#D98B6B" strokeWidth="30" strokeDasharray="880" strokeDashoffset="750" strokeLinecap="round" />
                      <circle cx="160" cy="160" r="140" fill="transparent" stroke="#C8A155" strokeWidth="30" strokeDasharray="880" strokeDashoffset="450" strokeLinecap="round" />
                    </svg>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <p className="text-sm font-medium opacity-60">Peace Point</p>
                      <h2 className="text-8xl font-serif tracking-tighter my-2">{peacePoint}</h2>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 max-w-[120px]">Financial Security Score</p>
                    </div>
                  </div>
                  {/* Glass Card behind chart effect */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/20 blur-[80px] rounded-full -z-10"></div>
                </div>

                {/* MODE BUTTONS */}
                <div className="flex justify-center gap-10">
                  {[
                    { label: 'Modo Blindaje', icon: '🛡️' },
                    { label: 'Modo Expansión', icon: '🚀' },
                    { label: 'Modo Disfrute', icon: '✨' }
                  ].map((mode, i) => (
                    <button 
                      key={i}
                      className="neumo-button px-8 py-5 rounded-[30px] flex items-center gap-4 hover:scale-105 transition-transform group"
                    >
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-sm opacity-60 group-hover:opacity-100 transition-opacity">
                        {mode.icon}
                      </div>
                      <span className="font-bold text-sm tracking-tight">{mode.label}</span>
                    </button>
                  ))}
                </div>

                {/* BOTTOM STATS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-[32px] card-shadow">
                    <p className="text-[10px] uppercase font-bold opacity-30 mb-2">Total en Cuentas</p>
                    <p className="text-2xl font-bold font-serif">$ {totalAccounts.toLocaleString('es-AR')}</p>
                    <div className="mt-4 flex justify-end">
                      <span className="text-[10px] bg-[#8B735B]/10 px-2 py-1 rounded-full">👆</span>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-[32px] card-shadow">
                    <p className="text-[10px] uppercase font-bold opacity-30 mb-2">Crecimiento Cartera</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-green-600">+0,08%</p>
                      <span className="text-lg">↗</span>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-[32px] card-shadow col-span-1 md:col-span-1">
                    <p className="text-[10px] uppercase font-bold opacity-30 mb-4">Próximos Pagos</p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold">22 de poso</span>
                        <span className="opacity-40">Próximos en hacho</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold">25 de uso</span>
                        <div className="w-5 h-5 bg-[#8B735B] rounded-full flex items-center justify-center text-[10px] text-white">→</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-[32px] card-shadow">
                    <p className="text-[10px] uppercase font-bold opacity-30 mb-2">Alertas</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">#1</span>
                      <span className="text-lg text-orange-500">⚠️</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      
      {/* DECORATIVE WOOD ELEMENT (Simulating the mockup sidebar) */}
      <div className="w-40 bg-[#D2B48C]/20 border-l border-[#8B735B]/5 relative overflow-hidden hidden xl:block">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
        <div className="absolute top-20 -right-20 w-80 h-[800px] bg-[#8B735B]/5 rotate-12 blur-3xl"></div>
      </div>
    </div>
  );
};

export default App;
