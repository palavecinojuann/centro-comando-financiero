import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Gauge, Shield, Settings, User, 
  ChevronLeft, Bell, CheckCircle2, AlertTriangle, 
  Database, Users, Zap, TrendingUp, Search, Camera,
  Sparkles, Brain, Lightbulb, Wallet
} from 'lucide-react';

// Motores de Inteligencia
import { auditarGastosVampiro } from './AuditorGastosVampiro';
import type { InterfazAlerta as TipoAlerta } from './AuditorGastosVampiro';
import { ServicioLectorTickets } from './ServicioLectorTickets';
import type { GastoProcesado } from './ServicioLectorTickets';
import { ServicioCopilotoGemini } from './ServicioCopilotoGemini';
import type { InsightIA } from './ServicioCopilotoGemini';

// --- ESTILOS NEUMÓRFICOS ---
const NEU_SHADOW = "10px 10px 20px #DBCFBF, -10px -10px 20px #F5EFEB";
const NEU_INSET = "inset 5px 5px 10px #DBCFBF, inset -5px -5px 10px #F5EFEB";

// --- COMPONENTE: BOTÓN LATERAL ---
const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    style={{
      width: '100%',
      padding: '1.4rem 1.8rem',
      borderRadius: '2rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: active ? '#E8DFD1' : 'transparent',
      boxShadow: active ? NEU_INSET : 'none',
      color: active ? '#8B735B' : '#8B735B',
      transform: active ? 'scale(0.98)' : 'scale(1)'
    }}
  >
    <Icon size={22} style={{ opacity: active ? 1 : 0.4 }} />
    <span style={{ fontSize: '14px', fontWeight: active ? 900 : 600, opacity: active ? 1 : 0.6 }}>{label}</span>
  </button>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('Panel de Control');
  const [alertasVampiro, setAlertasVampiro] = useState<TipoAlerta[]>([]);
  const [insights, setInsights] = useState<InsightIA[]>([]);
  const [escaneando, setEscaneando] = useState(false);
  const [notificaciones, setNotificaciones] = useState([
    { id: 1, text: "Actualización de Core completada", type: 'success' },
    { id: 2, text: "Búnker sincronizado con Sofi", type: 'success' }
  ]);

  const lectorOCR = new ServicioLectorTickets();
  const copilotGemini = new ServicioCopilotoGemini();

  useEffect(() => {
    // Carga inicial de auditoría
    const gastosMock = [
        { id: '1', nombreComercio: 'Netflix', montoTotal: 15.99, fechaGasto: new Date(), categoria: 'Entretenimiento' },
        { id: '2', nombreComercio: 'Netflix', montoTotal: 15.99, fechaGasto: new Date(Date.now() - 1000 * 60 * 60), categoria: 'Entretenimiento' }
    ];
    setAlertasVampiro(auditarGastosVampiro(gastosMock as any));
    
    // Insights de Gemini
    copilotGemini.analizarPatrones([], 15000).then(setInsights);
  }, []);

  const dispararOCR = () => {
    setEscaneando(true);
    setTimeout(() => {
      const resultado = lectorOCR.procesarTexto("YPF ESTACION DE SERVICIO\nTOTAL: $45.800,00");
      setNotificaciones(prev => [{
        id: Date.now(),
        text: `Escaneo Exitoso: ${resultado.nombreComercio} $${resultado.montoTotal}`,
        type: 'success'
      }, ...prev]);
      setEscaneando(false);
    }, 2000);
  };

  return (
    <div style={{ height: '100vh', width: '100vw', backgroundColor: '#E8DFD1', color: '#8B735B', display: 'flex', padding: '2.5rem', gap: '2.5rem', overflow: 'hidden', boxSizing: 'border-box' }}>
      
      {/* 1. SIDEBAR (IZQUIERDA) */}
      <aside style={{ width: '320px', backgroundColor: '#E8DFD1', borderRadius: '3rem', boxShadow: NEU_SHADOW, padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '3rem', border: '1px solid rgba(255,255,255,0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem' }}>
          <div style={{ width: '48px', height: '48px', background: '#8B735B', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 10px 20px rgba(139,115,91,0.3)' }}>
            <Zap size={28} />
          </div>
          <button style={{ background: 'transparent', border: 'none', color: '#8B735B', opacity: 0.3 }}><ChevronLeft size={28} /></button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <SidebarItem icon={LayoutDashboard} label="Panel de Control" active={activeTab === 'Panel de Control'} onClick={() => setActiveTab('Panel de Control')} />
          <SidebarItem icon={Gauge} label="Rendimiento" active={activeTab === 'Rendimiento'} onClick={() => setActiveTab('Rendimiento')} />
          <SidebarItem icon={Shield} label="Seguridad" active={activeTab === 'Seguridad'} onClick={() => setActiveTab('Seguridad')} />
          <SidebarItem icon={Settings} label="Ajustes" active={activeTab === 'Ajustes'} onClick={() => setActiveTab('Ajustes')} />
          <SidebarItem icon={User} label="Perfil" active={activeTab === 'Perfil'} onClick={() => setActiveTab('Perfil')} />
        </nav>
      </aside>

      {/* 2. MAIN AREA */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5em', opacity: 0.5 }}>Performance Motor</h2>
        </div>

        {/* MOTOR CENTRAL */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10rem' }}>
          <div style={{ width: '480px', height: '480px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: NEU_SHADOW, backgroundColor: '#E8DFD1' }} />
             <div style={{ position: 'absolute', inset: '12%', borderRadius: '50%', boxShadow: NEU_INSET }} />
             
             <svg viewBox="0 0 500 500" style={{ position: 'absolute', width: '90%', height: '90%', transform: 'rotate(-90deg)' }}>
                <circle cx="250" cy="250" r="210" fill="transparent" stroke="rgba(139,115,91,0.04)" strokeWidth="40" />
                <motion.circle
                  cx="250" cy="250" r="210" fill="transparent" stroke="#D9A852" strokeWidth="40"
                  strokeDasharray="1320"
                  animate={{ strokeDashoffset: 1320 - (1320 * 85 / 100) }}
                  transition={{ duration: 2.5, ease: "easeOut" }}
                  strokeLinecap="round"
                />
                <circle cx="460" cy="250" r="10" fill="#D9A852" style={{ filter: 'drop-shadow(0 0 15px #D9A852)' }} transform="rotate(306 250 250)" />
             </svg>

             <div style={{ textAlign: 'center', zIndex: 10 }}>
                <h3 style={{ fontSize: '100px', fontWeight: 900, color: '#4A443F', margin: 0, letterSpacing: '-0.05em' }}>85%</h3>
                <p style={{ fontSize: '12px', fontWeight: 900, color: '#D9A852', letterSpacing: '0.4em', textTransform: 'uppercase', marginTop: '10px' }}>Punto de Paz</p>
             </div>
          </div>
        </div>

        {/* CONTROL CENTER (CONEXIÓN OCR) */}
        <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#E8DFD1', padding: '2.5rem 4rem', borderRadius: '3.5rem', boxShadow: NEU_SHADOW, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', minWidth: '600px', border: '1px solid rgba(255,255,255,0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Sparkles size={16} color="#D9A852" />
            <p style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', opacity: 0.6 }}>Control Center</p>
          </div>
          <div style={{ display: 'flex', gap: '3rem' }}>
             {[
               { label: 'Blindaje', icon: Shield, action: dispararOCR },
               { label: 'Expansión', icon: TrendingUp },
               { label: 'Disfrute', icon: Users }
             ].map((item, idx) => (
               <motion.div 
                 key={idx} 
                 whileTap={{ scale: 0.95 }}
                 onClick={item.action}
                 style={{ textAlign: 'center', cursor: 'pointer' }}
               >
                  <div style={{ width: '100px', height: '100px', backgroundColor: '#E8DFD1', borderRadius: '25px', boxShadow: NEU_SHADOW, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                    {escaneando && item.label === 'Blindaje' ? <Camera className="animate-pulse text-[#D9A852]" size={32} /> : <item.icon size={36} color="#8B735B" />}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 900, opacity: 0.8 }}>{item.label}</span>
               </motion.div>
             ))}
          </div>
        </div>
      </main>

      {/* 3. NOTIFICATION PANEL (INTELIGENCIA) */}
      <aside style={{ width: '380px', backgroundColor: '#E8DFD1', borderRadius: '3rem', boxShadow: NEU_SHADOW, padding: '3.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '2.5rem', border: '1px solid rgba(255,255,255,0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#8B735B' }}>Notification Panel</h2>
          <Bell size={20} style={{ opacity: 0.4 }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
          {/* ALERTAS DE AUDITOR (DINÁMICAS) */}
          {alertasVampiro.map((alerta, i) => (
            <div key={`alert-${i}`} style={{ padding: '1.8rem', borderRadius: '2rem', boxShadow: NEU_SHADOW, background: 'rgba(217,168,82,0.05)', border: '1px solid rgba(217,168,82,0.1)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: '#D9A852' }} />
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <AlertTriangle size={20} color="#D9A852" />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#D9A852', marginBottom: '4px' }}>Gasto Vampiro Detectado</p>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#4A443F', lineHeight: '1.3' }}>{alerta.comercio} duplicado</p>
                </div>
              </div>
            </div>
          ))}

          {/* NOTIFICACIONES DE SISTEMA */}
          {notificaciones.map((notif) => (
            <div key={notif.id} style={{ padding: '1.8rem', borderRadius: '2rem', boxShadow: NEU_SHADOW, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <CheckCircle2 size={20} color="#8B735B" style={{ opacity: 0.6 }} />
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#8B735B', lineHeight: '1.4', margin: 0 }}>{notif.text}</p>
            </div>
          ))}
          
          {/* INSIGHT DE GEMINI */}
          {insights.length > 0 && (
            <div style={{ padding: '2rem', borderRadius: '2rem', backgroundColor: 'rgba(255,255,255,0.4)', border: '1px solid white', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <Brain size={18} color="#D9A852" />
                    <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#D9A852' }}>IA Copilot</span>
                </div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#4A443F', fontStyle: 'italic', lineHeight: '1.5' }}>
                    "{insights[0].mensaje}"
                </p>
            </div>
          )}
        </div>
      </aside>

    </div>
  );
}
