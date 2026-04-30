import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ServicioLectorTickets } from './ServicioLectorTickets';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'scanner' | 'janlu' | 'settings'>('dashboard');
  const [peacePoint, setPeacePoint] = useState(78);
  const [janluIncome, setJanluIncome] = useState(156000);
  const [bimontIncome] = useState(1240000);
  const [vitalExpenses] = useState(845000);
  const [scanner] = useState(new ServicioLectorTickets());
  const [scannedResult, setScannedResult] = useState<any>(null);

  const handleJanluInjection = () => {
    const amount = 15000; // Simulación
    setJanluIncome(prev => prev + amount);
    // El punto de paz se recalcula (simplificado)
    setPeacePoint(prev => Math.min(100, prev + 2));
  };

  const handleSimulatedScan = () => {
    const mockText = "YPF GASOLINERA\nFECHA: 29/04/2026\nTOTAL: $45.200,00\nGRACIAS POR SU COMPRA";
    const result = scanner.procesarTexto(mockText);
    setScannedResult(result);
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'scanner', label: 'Escanear Ticket', icon: '📸' },
    { id: 'janlu', label: 'Inyección Janlu', icon: '🕯️' },
    { id: 'settings', label: 'Configuración', icon: '⚙️' },
  ];

  return (
    <div className="flex h-screen bg-irish-cream-bg text-irish-cream-dark font-sans overflow-hidden">
      
      {/* SIDEBAR NATIVO (App Feel) */}
      <aside className="w-64 bg-irish-cream-dark text-white flex flex-col p-6 shadow-2xl z-20">
        <div className="mb-12">
          <h1 className="text-xl font-bold tracking-tighter leading-tight">
            BÚNKER <span className="text-irish-cream-accent font-light italic">BIMONT</span>
          </h1>
          <p className="text-[9px] uppercase tracking-[0.3em] opacity-40 font-bold mt-1">Centro de Comando</p>
        </div>

        <nav className="flex-1 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium ${
                activeTab === item.id 
                  ? 'bg-irish-cream-accent text-white shadow-lg translate-x-2' 
                  : 'hover:bg-white/10 opacity-60 hover:opacity-100'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-white/10">
          <div className="glass bg-white/5 p-4 rounded-2xl">
            <p className="text-[10px] uppercase opacity-40 font-bold mb-2">Punto de Paz</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-irish-cream-accent" style={{ width: `${peacePoint}%` }}></div>
              </div>
              <span className="text-xs font-bold">{peacePoint}%</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative flex flex-col overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="h-16 flex items-center justify-between px-10 border-b border-irish-cream-accent/10 bg-irish-cream-bg/50 backdrop-blur-sm z-10">
          <h2 className="text-sm font-bold uppercase tracking-widest opacity-60">
            {sidebarItems.find(i => i.id === activeTab)?.label}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-700 rounded-full text-[10px] font-bold border border-green-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              Bimont Secured
            </div>
            <div className="w-8 h-8 rounded-full bg-irish-cream-accent/20 flex items-center justify-center text-xs font-bold border border-irish-cream-accent/30">
              JP
            </div>
          </div>
        </header>

        {/* Dynamic Content View */}
        <div className="flex-1 overflow-y-auto p-10">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Main Stats Card */}
                <div className="lg:col-span-2 glass p-10 wood-shadow relative overflow-hidden group">
                  <div className="relative z-10">
                    <h3 className="text-3xl font-bold text-irish-cream-accent mb-2">Estado Global</h3>
                    <p className="opacity-60 text-sm mb-10">Resumen de ingresos unificados y gastos del hogar.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-2">Ingreso Total Unificado</p>
                        <p className="text-5xl font-bold tracking-tight">${(bimontIncome + janluIncome).toLocaleString()}</p>
                        <p className="text-xs mt-2 text-green-600 font-semibold">↑ 12% vs mes pasado</p>
                      </div>
                      <div className="flex flex-col justify-end">
                        <div className="space-y-3">
                          <div className="flex justify-between text-xs">
                            <span className="opacity-60">Bimont S.A. (Cimiento)</span>
                            <span className="font-bold">${bimontIncome.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-irish-cream-accent font-semibold">Janlu Velas (Acelerador)</span>
                            <span className="font-bold text-irish-cream-accent">${janluIncome.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-16 -top-16 w-64 h-64 border-[30px] border-irish-cream-accent/5 rounded-full"></div>
                </div>

                {/* Quick Actions */}
                <div className="glass p-8 wood-shadow flex flex-col gap-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-2">Inyectar Capital</h4>
                  <button 
                    onClick={handleJanluInjection}
                    className="w-full py-4 bg-irish-cream-accent text-white rounded-2xl font-bold text-sm hover:bg-irish-cream-dark transition-all wood-shadow flex items-center justify-center gap-3"
                  >
                    <span>🕯️</span> + $15.000 (Janlu)
                  </button>
                  <button 
                    onClick={() => setActiveTab('scanner')}
                    className="w-full py-4 border-2 border-irish-cream-accent/20 text-irish-cream-accent rounded-2xl font-bold text-sm hover:bg-irish-cream-accent/5 transition-all flex items-center justify-center gap-3"
                  >
                    <span>📸</span> Escanear Ticket
                  </button>
                </div>

                {/* Triage Summary */}
                <div className="lg:col-span-3 glass p-10 wood-shadow">
                  <h4 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-8">Triaje Financiero Actual</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    {[
                      { l: 5, t: 'Vital', c: 'bg-red-500', p: '100%' },
                      { l: 4, t: 'Logística', c: 'bg-orange-500', p: '100%' },
                      { l: 3, t: 'Crecimiento', c: 'bg-amber-500', p: '85%' },
                      { l: 2, t: 'Confort', c: 'bg-blue-500', p: '40%' },
                      { l: 1, t: 'Extras', c: 'bg-slate-400', p: '10%' },
                    ].map(item => (
                      <div key={item.l} className="p-4 rounded-2xl border border-irish-cream-accent/10">
                        <div className={`w-6 h-6 ${item.c} rounded flex items-center justify-center text-[10px] text-white font-bold mb-3`}>L{item.l}</div>
                        <p className="font-bold text-xs mb-1">{item.t}</p>
                        <p className="text-[10px] opacity-50">{item.p} Cubierto</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'scanner' && (
              <motion.div
                key="scanner"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10"
              >
                <div className="glass p-12 wood-shadow flex flex-col items-center justify-center border-2 border-dashed border-irish-cream-accent/30 hover:border-irish-cream-accent transition-all cursor-pointer group">
                  <div className="w-24 h-24 bg-irish-cream-accent/10 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <span className="text-4xl">📸</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Escanear Nuevo Gasto</h3>
                  <p className="text-center opacity-60 text-sm mb-10 max-w-xs">Arrastra aquí el ticket o usa la cámara para procesar el gasto automáticamente.</p>
                  <button 
                    onClick={handleSimulatedScan}
                    className="px-12 py-4 bg-irish-cream-accent text-white rounded-2xl font-bold text-xs tracking-widest hover:bg-irish-cream-dark transition-all"
                  >
                    INICIAR ESCANEO
                  </button>
                </div>

                <div className="glass p-10 wood-shadow">
                  <h4 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-8">Vista Previa de Lectura</h4>
                  {scannedResult ? (
                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-4xl font-bold text-irish-cream-accent">${scannedResult.montoTotal.toLocaleString()}</p>
                          <p className="text-xs font-bold uppercase opacity-40 tracking-[0.2em]">{scannedResult.nombreComercio}</p>
                        </div>
                        <div className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-[10px] font-bold shadow-lg shadow-orange-500/20">
                          {scannedResult.categoriaSugerida}
                        </div>
                      </div>
                      <div className="bg-irish-cream-bg/50 p-6 rounded-3xl border border-irish-cream-accent/10">
                        <p className="text-[10px] italic opacity-70 leading-relaxed">
                          "Se ha detectado una carga de combustible. Clasificación automática L4 (Logística Laboral). El saldo unificado se actualizará al confirmar."
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <button className="py-4 rounded-2xl border-2 border-irish-cream-accent/20 text-xs font-bold tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all">DESCARTAR</button>
                        <button className="py-4 rounded-2xl bg-irish-cream-accent text-white text-xs font-bold tracking-widest hover:bg-irish-cream-dark transition-all wood-shadow">CONFIRMAR</button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center border-2 border-dotted border-irish-cream-accent/10 rounded-3xl text-sm opacity-20 italic">
                      Esperando escaneo...
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'janlu' && (
              <motion.div
                key="janlu"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="max-w-2xl mx-auto glass p-12 wood-shadow"
              >
                <h3 className="text-2xl font-bold mb-2">Inyección de Capital Janlu</h3>
                <p className="opacity-60 text-sm mb-10">Suma las ventas de tus velas al flujo de caja familiar.</p>
                
                <div className="space-y-8">
                  <div className="p-8 bg-irish-cream-accent text-white rounded-3xl wood-shadow relative overflow-hidden">
                    <p className="text-[10px] uppercase opacity-60 font-bold mb-2">Total Inyectado este Mes</p>
                    <p className="text-5xl font-bold tracking-tight">${janluIncome.toLocaleString()}</p>
                    <div className="absolute -right-4 -bottom-4 text-7xl opacity-10 rotate-12">🕯️</div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-40">Monto a Inyectar</label>
                    <div className="flex gap-4">
                      <div className="flex-1 glass bg-white/40 p-4 rounded-2xl border-2 border-irish-cream-accent/20">
                        <span className="text-xl font-bold opacity-30 mr-2">$</span>
                        <input type="number" placeholder="0.00" className="bg-transparent border-none outline-none text-xl font-bold w-32" />
                      </div>
                      <button 
                        onClick={handleJanluInjection}
                        className="px-8 bg-irish-cream-accent text-white rounded-2xl font-bold hover:bg-irish-cream-dark transition-all wood-shadow"
                      >
                        INYECTAR
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Status Bar */}
        <footer className="h-8 bg-irish-cream-dark/5 border-t border-irish-cream-accent/10 flex items-center px-10 justify-between text-[9px] uppercase tracking-[0.2em] font-bold opacity-40">
          <div>Firebase Database: Online</div>
          <div>Bimont Command System v1.0.5</div>
          <div>All assets secured</div>
        </footer>
      </main>
    </div>
  );
};

export default App;
