import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ServicioLectorTickets } from './ServicioLectorTickets';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'scanner'>('dashboard');
  const [peacePoint] = useState(78);
  const [scanner] = useState(new ServicioLectorTickets());
  const [scannedResult, setScannedResult] = useState<any>(null);

  const handleSimulatedScan = () => {
    const mockText = "YPF GASOLINERA\nFECHA: 29/04/2026\nTOTAL: $45.200,00\nGRACIAS POR SU COMPRA";
    const result = scanner.procesarTexto(mockText);
    setScannedResult(result);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans bg-irish-cream-bg text-irish-cream-dark selection:bg-irish-cream-accent selection:text-white">
      {/* Header Premium */}
      <header className="max-w-6xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-bold tracking-tight">
            CENTRO DE <span className="text-irish-cream-accent font-light italic">COMANDO</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="h-[1px] w-8 bg-irish-cream-accent/40"></span>
            <p className="text-[10px] uppercase tracking-[0.3em] opacity-50 font-semibold">Bunker Bimont v1.0</p>
          </div>
        </motion.div>

        <nav className="glass wood-shadow p-1.5 flex gap-2">
          <button 
            onClick={() => setView('dashboard')}
            className={`px-8 py-2.5 rounded-[18px] text-sm font-semibold transition-all duration-500 ${
              view === 'dashboard' 
                ? 'bg-irish-cream-accent text-white wood-shadow' 
                : 'hover:bg-irish-cream-accent/10'
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setView('scanner')}
            className={`px-8 py-2.5 rounded-[18px] text-sm font-semibold transition-all duration-500 ${
              view === 'scanner' 
                ? 'bg-irish-cream-accent text-white wood-shadow' 
                : 'hover:bg-irish-cream-accent/10'
            }`}
          >
            Scanner
          </button>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto pb-24">
        <AnimatePresence mode="wait">
          {view === 'dashboard' ? (
            <motion.div 
              key="dash"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Peace Point Card */}
              <div className="lg:col-span-8 glass p-10 wood-shadow relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">Punto de Paz Financiera</h2>
                      <p className="text-sm opacity-60">Objetivo: Sustento familiar garantizado</p>
                    </div>
                    <div className="bg-green-500/10 text-green-700 px-4 py-1 rounded-full text-xs font-bold border border-green-500/20">
                      ESTADO: SEGURO
                    </div>
                  </div>
                  
                  <div className="flex items-baseline gap-4 mb-8">
                    <span className="text-8xl font-bold text-irish-cream-accent tracking-tighter">{peacePoint}%</span>
                    <div className="flex flex-col">
                      <span className="text-green-600 font-bold">+$12.500 vs ayer</span>
                      <span className="text-xs opacity-50 uppercase tracking-wider">Actualizado hace 2h</span>
                    </div>
                  </div>

                  <div className="w-full bg-irish-cream-dark/10 h-6 rounded-full p-1 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${peacePoint}%` }}
                      transition={{ duration: 2, ease: "circOut" }}
                      className="h-full peace-gradient rounded-full relative group"
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform"></div>
                    </motion.div>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-[10px] uppercase opacity-40 font-bold mb-1">Ingresos Bimont</p>
                      <p className="text-xl font-bold">$1.240.000</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase opacity-40 font-bold mb-1">Gastos Vitales</p>
                      <p className="text-xl font-bold">$845.000</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase opacity-40 font-bold mb-1">Excedente Janlu</p>
                      <p className="text-xl font-bold text-irish-cream-accent">+$156.000</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase opacity-40 font-bold mb-1">Días p/ Cierre</p>
                      <p className="text-xl font-bold">12</p>
                    </div>
                  </div>
                </div>
                {/* Decorative Pattern */}
                <div className="absolute -right-20 -top-20 w-64 h-64 border-[40px] border-irish-cream-accent/5 rounded-full"></div>
              </div>

              {/* Sidebar Cards */}
              <div className="lg:col-span-4 space-y-8">
                <div className="glass p-8 wood-shadow border-t-4 border-t-irish-cream-accent">
                  <h3 className="text-sm uppercase tracking-widest font-bold opacity-40 mb-6">Janlu Velas Bridge</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Ventas Pendientes</span>
                      <span className="font-bold">14</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Stock Crítico</span>
                      <span className="font-bold text-red-500">3 items</span>
                    </div>
                    <div className="pt-4 mt-4 border-t border-irish-cream-accent/10">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold">Inyección Neta</span>
                        <span className="text-lg font-bold text-irish-cream-accent">$45.000</span>
                      </div>
                    </div>
                  </div>
                  <button className="w-full mt-8 py-3 bg-irish-cream-dark text-white rounded-xl text-xs font-bold tracking-[0.2em] hover:bg-irish-cream-accent transition-all">
                    GESTIONAR JANLU
                  </button>
                </div>

                <div className="bg-irish-cream-accent p-8 rounded-[24px] text-white wood-shadow relative overflow-hidden">
                  <h3 className="text-sm uppercase tracking-widest font-bold opacity-60 mb-2">Recordatorio</h3>
                  <p className="text-lg font-medium leading-tight relative z-10">
                    Priorizar compra de cera de soja hoy para mantener stock L4.
                  </p>
                  <div className="absolute bottom-4 right-4 opacity-20 text-4xl">🕯️</div>
                </div>
              </div>

              {/* Triage Grid */}
              <div className="lg:col-span-12 glass p-10 wood-shadow">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Triaje Financiero</h2>
                    <p className="text-sm opacity-60">Jerarquía de supervivencia y crecimiento</p>
                  </div>
                  <div className="text-[10px] font-bold opacity-40">DESLIZAR PARA DETALLES →</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  {[
                    { l: 5, t: 'INTOCABLES', d: 'Sustento Vital', c: 'bg-red-500', p: '100%' },
                    { l: 4, t: 'LOGÍSTICA', d: 'Movilidad/Coms', c: 'bg-orange-500', p: '100%' },
                    { l: 3, t: 'CRECIMIENTO', d: 'Educación/Janlu', c: 'bg-amber-500', p: '85%' },
                    { l: 2, t: 'CONFORT', d: 'Calidad de Vida', c: 'bg-blue-500', p: '40%' },
                    { l: 1, t: 'CONGELABLES', d: 'Opcionales', c: 'bg-slate-400', p: '0%' },
                  ].map((item, i) => (
                    <motion.div 
                      key={item.l}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-6 rounded-3xl border border-irish-cream-accent/10 hover:border-irish-cream-accent/30 transition-all group cursor-pointer"
                    >
                      <div className={`w-8 h-8 ${item.c} rounded-lg mb-4 flex items-center justify-center text-white text-xs font-bold`}>
                        L{item.l}
                      </div>
                      <h4 className="font-bold text-xs tracking-widest mb-1">{item.t}</h4>
                      <p className="text-[10px] opacity-50 mb-4">{item.d}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-irish-cream-dark/5 rounded-full overflow-hidden">
                          <div className={`h-full ${item.c}`} style={{ width: item.p }}></div>
                        </div>
                        <span className="text-[9px] font-bold opacity-70">{item.p}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="scan"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <div className="glass p-10 wood-shadow text-center flex flex-col items-center justify-center border-2 border-dashed border-irish-cream-accent/30 hover:border-irish-cream-accent transition-all cursor-pointer group bg-white/40">
                <div className="w-20 h-20 bg-irish-cream-accent/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-irish-cream-accent" strokeWidth="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">Inyector de Gastos OCR</h2>
                <p className="text-sm opacity-50 mb-8 max-w-xs">Sube una foto de tu ticket para clasificarlo automáticamente en el búnker.</p>
                <button 
                  onClick={handleSimulatedScan}
                  className="px-10 py-4 bg-irish-cream-accent text-white rounded-2xl font-bold text-sm tracking-widest hover:bg-irish-cream-dark transition-all wood-shadow"
                >
                  SIMULAR ESCANEO
                </button>
                <p className="text-[10px] opacity-30 mt-6 uppercase tracking-widest font-bold italic">Bimont Intelligence Powered</p>
              </div>

              <div className="space-y-6">
                <div className="glass p-8 wood-shadow h-full flex flex-col">
                  <h3 className="text-sm uppercase tracking-widest font-bold opacity-40 mb-6">Resultado del Procesamiento</h3>
                  
                  {scannedResult ? (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6 flex-1"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-3xl font-bold text-irish-cream-accent">${scannedResult.montoTotal.toLocaleString()}</p>
                          <p className="text-xs font-bold uppercase opacity-40 tracking-wider">{scannedResult.nombreComercio}</p>
                        </div>
                        <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-bold">
                          {scannedResult.categoriaSugerida}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-irish-cream-bg/50 p-4 rounded-2xl border border-irish-cream-accent/10">
                          <p className="text-[9px] uppercase opacity-40 font-bold mb-1">Fecha Detectada</p>
                          <p className="text-sm font-bold">{scannedResult.fechaGasto}</p>
                        </div>
                        <div className="bg-irish-cream-bg/50 p-4 rounded-2xl border border-irish-cream-accent/10">
                          <p className="text-[9px] uppercase opacity-40 font-bold mb-1">Confianza OCR</p>
                          <p className="text-sm font-bold text-green-600">Alta (94%)</p>
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col justify-end">
                        <div className="bg-irish-cream-accent/5 p-4 rounded-2xl border border-irish-cream-accent/20 mb-6">
                          <p className="text-[10px] italic opacity-60">"Este gasto corresponde a Logística (L4). Se descontará del presupuesto mensual de Bimont S.A."</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <button className="py-3 rounded-xl border border-irish-cream-accent/30 text-[10px] font-bold tracking-widest hover:bg-irish-cream-accent/5">RECHAZAR</button>
                          <button className="py-3 rounded-xl bg-irish-cream-accent text-white text-[10px] font-bold tracking-widest hover:bg-irish-cream-dark transition-all wood-shadow">CONFIRMAR</button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-20 italic text-sm">
                      <p>Esperando datos del scanner...</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer / Status Bar */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="glass px-8 py-3 wood-shadow flex items-center gap-8 text-[10px] uppercase tracking-[0.2em] font-bold border-t-2 border-t-irish-cream-accent/20">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
            <span>Firebase Online</span>
          </div>
          <div className="w-px h-4 bg-irish-cream-accent/20"></div>
          <div className="text-irish-cream-accent">Vault Bimont Secured</div>
          <div className="w-px h-4 bg-irish-cream-accent/20"></div>
          <div className="opacity-40">v1.0.4 - 2026</div>
        </div>
      </footer>
    </div>
  );
};

export default App;
