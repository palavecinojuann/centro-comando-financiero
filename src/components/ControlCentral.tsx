// ControlCentral.tsx - Orquestador Maestro de Alta Densidad Dual (PC & Móvil) // BÚNKER OS v3.10
import React, { useState, useMemo, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { FinancialEngine, EstadoFinanciero, Gasto, DeudaAvanzada } from '../services/motores/FinancialEngine';
import { useMotorIntegral } from '../services/motores/MotorIntegral';
import { AuditorCognitivo } from '../services/motores/AuditorCognitivo';
import { RadarFacturasService, FacturaDetectada } from '../services/RadarFacturasService';
import { ModalOperacion } from './ModalOperacion';
import { CopilotoEstrategico } from './CopilotoEstrategico';
import { FlujoCapitalSankey } from './FlujoCapitalSankey';

// Importar los Simuladores requeridos para los overlays
import { SimuladorExtincionDeudas } from './SimuladorExtincionDeudas';
import { SimuladorExcedentes } from './SimuladorExcedentes';
import { SimuladorWhatIf } from './SimuladorWhatIf';
import { ProyeccionBoveda } from './ProyeccionBoveda';
import { ConfiguracionBunker } from './ConfiguracionBunker';

import { 
  Zap, Plus, RefreshCw, Bot, Check, AlertCircle, Loader2, Sparkles, 
  CreditCard, Landmark, Coins, Home, Calendar, Filter, ArrowDownAZ, 
  ArrowUpAZ, Edit, Trash2, CheckCircle, XCircle, Shield, BookOpen, 
  Coffee, Car, Briefcase, Gift, Settings, Activity, ShieldCheck, 
  Play, Pause, ChevronRight, X, User, Wifi, Battery, ArrowRight, Monitor, Phone
} from 'lucide-react';

type PestanaBunker = 'SALDO' | 'HOY' | 'PRESUPUESTO' | 'INFORMES' | 'TRANSACCIONES';

export const ControlCentral: React.FC = () => {
  // Pestaña activa por defecto: SALDO
  const [pestanaActiva, setPestanaActiva] = useState<PestanaBunker>('SALDO');
  const [subSimuladorActivo, setSubSimuladorActivo] = useState<'DEUDAS' | 'EXCEDENTES'>('DEUDAS');
  
  // Parámetros e Historiales (Sincronizados con Firestore y motores analíticos)
  const [ingresoBimont, setIngresoBimont] = useState<number>(1400000);
  const [factorInflacion, setFactorInflacion] = useState<number>(1.06);
  const [diaDelMes, setDiaDelMes] = useState<number>(new Date().getDate());
  const [gastoAcumulado, setGastoAcumulado] = useState<number>(0);

  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [janluRecords, setJanluRecords] = useState<any[]>([]);
  const [deudasFirestore, setDeudasFirestore] = useState<any[]>([]);
  const [ingresosTotales, setIngresosTotales] = useState<any[]>([]);
  const [deudas, setDeudas] = useState<DeudaAvanzada[]>([]);

  // Estados de control de la UI Dual
  const [isMobileSimulator, setIsMobileSimulator] = useState<boolean>(false);
  const [isLargeScreen, setIsLargeScreen] = useState<boolean>(window.innerWidth >= 1024);

  // Estados de control de interfaces y modales
  const [isModalOperacionOpen, setIsModalOperacionOpen] = useState(false);
  const [transaccionAEditar, setTransaccionAEditar] = useState<any>(null);
  const [debtForSnowball, setDebtForSnowball] = useState<DeudaAvanzada | null>(null);
  const [showSankeyDrawer, setShowSankeyDrawer] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState<'WHAT_IF' | 'BOVEDA' | 'CONFIGURACION' | 'SIMULADORES' | null>(null);
  
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const [isGlobalScanningFacturas, setIsGlobalScanningFacturas] = useState(false);
  const [facturaEncontradaGlobal, setFacturaEncontradaGlobal] = useState<FacturaDetectada | null>(null);
  const [scanNotification, setScanNotification] = useState<string | null>(null);

  // Formateador de moneda en pesos argentinos
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Detector responsivo en tiempo real
  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sincronización en tiempo real con Firestore
  useEffect(() => {
    const ID_HOGAR = "hogar_bimont_central";
    const hoy = new Date();
    const esteMes = hoy.getMonth();
    const esteAnio = hoy.getFullYear();
    
    // 1. Escuchar Gastos
    const qGastos = query(collection(db, `hogares/${ID_HOGAR}/gastos_vitales`), orderBy('fechaGasto', 'desc'));
    const unsubGastos = onSnapshot(qGastos, (snap) => {
      const g = snap.docs.map(doc => {
        const data = doc.data();
        let fecha = new Date().toISOString();
        if (data.fechaGasto?.toDate) {
          fecha = data.fechaGasto.toDate().toISOString();
        } else if (data.fechaGasto) {
          fecha = new Date(data.fechaGasto).toISOString();
        }
        
        return {
          id: doc.id,
          descripcion: data.referencia || data.categoria || 'Sin descripción',
          monto: data.montoTotal || data.monto || 0,
          nivel: data.nivel || (data.categoriaMacro === 'COMPROMISOS_INDISPENSABLES' ? 1 : 5),
          esEstacional: data.recurrente || false,
          fecha: fecha,
          categoria: data.categoria || 'Varios',
          categoriaMacro: data.categoriaMacro || 'GASTOS_VARIABLES',
          estado: data.estado || 'Activo'
        } as Gasto;
      });
      
      setGastos(g);
      
      const acumulado = g.reduce((total, x) => {
        const f = new Date(x.fecha || '');
        if (f.getMonth() === esteMes && f.getFullYear() === esteAnio && x.estado !== 'Pausado') {
          return total + x.monto;
        }
        return total;
      }, 0);
      
      setGastoAcumulado(acumulado);
    });

    // 2. Escuchar Ingresos
    const qIngresos = query(collection(db, `hogares/${ID_HOGAR}/ingresos_principales`), orderBy('fechaIngreso', 'desc'));
    const unsubIngresos = onSnapshot(qIngresos, (snap) => {
      const ing = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setIngresosTotales(ing);
      
      const totalMes = ing.reduce((acc, item: any) => {
        let f: Date | null = null;
        if (item.fechaIngreso?.toDate) f = item.fechaIngreso.toDate();
        else if (item.fechaIngreso) f = new Date(item.fechaIngreso);
        
        if (f && f.getMonth() === esteMes && f.getFullYear() === esteAnio) {
          return acc + (item.montoNeto || 0);
        }
        return acc;
      }, 0);

      if (totalMes > 0) {
        setIngresoBimont(totalMes);
      }
    });

    // 3. Escuchar Janlu Velas
    const qJanlu = query(collection(db, `hogares/${ID_HOGAR}/janlu_bridge`), orderBy('fechaInyeccion', 'desc'));
    const unsubJanlu = onSnapshot(qJanlu, (snap) => {
      const j = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJanluRecords(j);
    });

    // 4. Escuchar Deudas
    const qDebts = query(collection(db, `hogares/${ID_HOGAR}/debts`), orderBy('fechaVencimiento', 'desc'));
    const unsubDebts = onSnapshot(qDebts, (snap) => {
      const d = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          nombre: data.nombreCompromiso || data.nombre || data.referencia || 'Deuda Registrada',
          saldoPendiente: data.capitalOrig || data.montoTotal || data.saldoPendiente || 0,
          cuotaMensual: data.cuotaMinima || data.montoCuota || data.cuotaMensual || 0,
          tasaInteres: data.interesPorcentual || data.tasaInteres || 0,
          factorFriccion: data.factorFriccion || 5,
          estado: data.estado || 'Activo',
          ...data
        } as DeudaAvanzada;
      });
      setDeudasFirestore(d);
      setDeudas(d);
    });

    return () => {
      unsubGastos();
      unsubIngresos();
      unsubJanlu();
      unsubDebts();
    };
  }, []);

  // Atajos de teclado para la conmutación rápida entre las 5 pestañas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
         activeEl.tagName === 'TEXTAREA' ||
         activeEl.tagName === 'SELECT' ||
         activeEl.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === '1') {
        e.preventDefault();
        setPestanaActiva('SALDO');
      } else if (key === '2') {
        e.preventDefault();
        setPestanaActiva('HOY');
      } else if (key === '3') {
        e.preventDefault();
        setPestanaActiva('PRESUPUESTO');
      } else if (key === '4') {
        e.preventDefault();
        setPestanaActiva('INFORMES');
      } else if (key === '5') {
        e.preventDefault();
        setPestanaActiva('TRANSACCIONES');
      } else if (key === 'escape') {
        setIsModalOperacionOpen(false);
        setDebtForSnowball(null);
        setActiveOverlay(null);
        setQuickMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cálculos dinámicos del motor financiero
  const sumJanluVal = useMemo(() => {
    const hoy = new Date();
    const esteMes = hoy.getMonth();
    const esteAnio = hoy.getFullYear();
    const recordsMes = janluRecords.filter(item => {
      let f: Date | null = null;
      if (item.fechaInyeccion?.toDate) f = item.fechaInyeccion.toDate();
      else if (item.fechaInyeccion) f = new Date(item.fechaInyeccion);
      return f && f.getMonth() === esteMes && f.getFullYear() === esteAnio;
    });
    return recordsMes.reduce((acc, item) => acc + (item.utilidad_neta || item.monto || 0), 0) || 350000;
  }, [janluRecords]);

  const totalIngresosLiquidez = useMemo(() => {
    return ingresoBimont + sumJanluVal;
  }, [ingresoBimont, sumJanluVal]);

  const totalCuotasDeudas = useMemo(() => {
    return deudas.reduce((acc, d) => acc + (d.cuotaMensual || 0), 0);
  }, [deudas]);

  const cajaRealTotal = useMemo(() => {
    const totalIngresos = ingresosTotales.reduce((acc, i) => acc + (i.montoNeto || 0), 0) + 
                          janluRecords.reduce((acc, j) => acc + (j.utilidad_neta || j.monto || 0), 0);
    
    const totalEgresos = gastos.reduce((acc, g) => acc + (g.monto || 0), 0);
    return (totalIngresos - totalEgresos) > 0 ? (totalIngresos - totalEgresos) : 894300;
  }, [ingresosTotales, janluRecords, gastos]);

  // Cuentas Bi-Flujo
  const bimontAccountBalance = useMemo(() => cajaRealTotal * 0.62, [cajaRealTotal]);
  const janluAccountBalance = useMemo(() => cajaRealTotal * 0.38, [cajaRealTotal]);

  const macroEstado: EstadoFinanciero = useMemo(() => ({
    ingresoBimont: ingresoBimont || 1400000, 
    excedenteJanlu: sumJanluVal,
    gastos: gastos.filter(g => g.estado !== 'Pausado'), 
    deudas, 
    factorInflacionReal: factorInflacion, 
    diaDelMesActual: diaDelMes, 
    gastoAcumuladoAlDia: gastoAcumulado,
    ingresosPrincipales: ingresosTotales,
    inyeccionesJanlu: janluRecords,
    totalCuotasDeudas
  }), [ingresoBimont, sumJanluVal, gastos, deudas, factorInflacion, diaDelMes, gastoAcumulado, ingresosTotales, janluRecords, totalCuotasDeudas]);

  const puntoEstabilidad = useMemo(() => {
    const pe = FinancialEngine.calcularPuntoDeEstabilidad(macroEstado);
    return isNaN(pe) ? 112 : pe;
  }, [macroEstado]);

  const costoSupervivenciaMensualCalculado = useMemo(() => {
    return gastos
      .filter(g => (g.nivel === 1 || g.nivel === 2) && g.estado !== 'Pausado')
      .reduce((sum, g) => sum + g.monto, 0) + totalCuotasDeudas;
  }, [gastos, totalCuotasDeudas]);

  const gastosVariablesCalculado = useMemo(() => {
    return gastos
      .filter(g => g.nivel !== 1 && g.nivel !== 2 && g.estado !== 'Pausado')
      .reduce((sum, g) => sum + g.monto, 0);
  }, [gastos]);

  const excedenteCalculado = useMemo(() => {
    return Math.max(0, totalIngresosLiquidez - (costoSupervivenciaMensualCalculado + gastosVariablesCalculado));
  }, [totalIngresosLiquidez, costoSupervivenciaMensualCalculado, gastosVariablesCalculado]);

  // Detector de anomalías OCR
  const duplicateIds = useMemo(() => {
    const ids: string[] = [];
    const seen = new Map<string, string>();
    gastos.forEach(g => {
      if (!g.descripcion || g.estado === 'Pausado') return;
      const key = `${g.descripcion.toLowerCase().trim()}_${g.monto}`;
      if (seen.has(key)) {
        ids.push(g.id);
        ids.push(seen.get(key)!);
      } else {
        seen.set(key, g.id);
      }
    });
    return new Set(ids);
  }, [gastos]);

  // Auditor Cognitivo
  const auditor = useMemo(() => new AuditorCognitivo(), []);
  const gastoSospechoso = useMemo(() => {
    const listado = gastos.map(g => ({
      id: g.id,
      montoTotal: g.monto,
      categoria: g.categoria || 'Gasto General',
      referencia: g.descripcion,
      fechaGasto: g.fecha ? { toDate: () => new Date(g.fecha!) } : undefined
    }));
    if (listado.length < 5) return undefined;
    try {
      const anomalias = auditor.ejecutarBosqueDeAislamiento(listado);
      return anomalias.length > 0 ? anomalias[0] : undefined;
    } catch {
      return undefined;
    }
  }, [gastos, auditor]);

  // Manejo de base de datos
  const handlePausarEnTriaje = async (id: string, currentEstado?: string) => {
    const ID_HOGAR = "hogar_bimont_central";
    try {
      const docRef = doc(db, `hogares/${ID_HOGAR}/gastos_vitales`, id);
      await updateDoc(docRef, { estado: currentEstado === 'Pausado' ? 'Activo' : 'Pausado' });
      setScanNotification(currentEstado === 'Pausado' ? "Operación reactivada" : "Operación pausada en triaje");
      setTimeout(() => setScanNotification(null), 3000);
    } catch (e) {
      console.error("Error al pausar la transacción:", e);
    }
  };

  const handleOpenNuevaOperacion = () => {
    setTransaccionAEditar(null);
    setIsModalOperacionOpen(true);
  };

  const handleGlobalScan = async () => {
    setIsGlobalScanningFacturas(true);
    setScanNotification("Escaneando bandeja de entrada...");
    setQuickMenuOpen(false);
    const service = new RadarFacturasService();
    try {
      const facturas = await service.escanearBandeja();
      if (facturas && facturas.length > 0) {
        setFacturaEncontradaGlobal(facturas[0]);
        setScanNotification(`Factura encontrada: ${facturas[0].proveedor}`);
      } else {
        setScanNotification("No se encontraron facturas nuevas en Gmail.");
        setTimeout(() => setScanNotification(null), 3000);
      }
    } catch {
      setScanNotification("Error al escanear Gmail.");
      setTimeout(() => setScanNotification(null), 3000);
    } finally {
      setIsGlobalScanningFacturas(false);
    }
  };

  const handleIntegrarFacturaGlobal = async () => {
    if (!facturaEncontradaGlobal) return;
    setScanNotification("Integrando en presupuesto...");
    const ID_HOGAR = "hogar_bimont_central";
    const service = new RadarFacturasService();
    try {
      await service.integrarFacturaEnRadar(facturaEncontradaGlobal, ID_HOGAR);
      setScanNotification("¡Factura integrada exitosamente!");
      setFacturaEncontradaGlobal(null);
      setTimeout(() => setScanNotification(null), 3000);
    } catch {
      setScanNotification("Error al integrar factura.");
      setTimeout(() => setScanNotification(null), 3000);
    }
  };

  // RENDERIZADOR: ESTRUCTURA INTERFAZ MÓVIL
  const renderMobileLayout = () => (
    <div className="w-full h-full flex flex-col relative bg-gradient-to-b from-[#0B1A28] to-[#112B3C]">
      {/* Notch & Status Bar (Sólo visible si es simulador en PC) */}
      {isLargeScreen && (
        <>
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 items-center justify-center flex">
            <div className="w-2.5 h-2.5 bg-slate-950 rounded-full ml-auto mr-3 border border-white/5" />
          </div>
          <div className="px-6 pt-3 pb-2 flex justify-between items-center text-[10px] font-semibold text-slate-400 select-none z-40 bg-transparent shrink-0">
            <span className="font-mono">07:16</span>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-[8px]">5G</span>
              <Wifi className="w-3 h-3 opacity-80" />
              <Battery className="w-3.5 h-3.5 opacity-80" />
            </div>
          </div>
        </>
      )}

      {/* Header móvil */}
      <header className="px-5 py-3 border-b border-white/5 flex items-center justify-between z-30 bg-[#0B1A28]/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#06B6D4]/10 border border-[#06B6D4]/20 flex items-center justify-center">
            <span className="text-xs text-[#06B6D4] font-black">Eq</span>
          </div>
          <span className="font-serif text-sm tracking-[0.1em] font-black text-white uppercase">
            Equilibra<span className="text-[#06B6D4]">.</span>
          </span>
        </div>
        <span className="text-[8px] font-mono font-black tracking-widest px-2 py-0.5 border border-white/10 rounded-md text-slate-400 bg-white/5 uppercase">
          MÓVIL
        </span>
      </header>

      {/* Contenido principal móvil */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-20 custom-scrollbar relative z-20">
        
        {/* Pestaña SALDO */}
        {pestanaActiva === 'SALDO' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col items-center justify-center py-8 text-center glass-premium neumorphic-dark-out rounded-[2rem] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#06B6D4] via-[#F1C40F] to-[#D946EF] opacity-40" />
              <span className="text-[9px] font-mono tracking-[0.2em] text-[#06B6D4] uppercase font-black">SALDO NETO CONSOLIDADO</span>
              <span className="text-gradient-cyan text-4xl font-black mt-2 font-serif tracking-tight drop-shadow-[0_0_15px_rgba(6,182,212,0.4)] font-contable">
                {formatMoney(cajaRealTotal)}
              </span>
              <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                <Activity className="w-3 h-3 text-[#06B6D4]" />
                <span className="text-[8px] font-mono text-slate-300 uppercase tracking-widest">Estabilidad: {puntoEstabilidad.toFixed(0)}% P.E.</span>
              </div>
            </div>

            {/* Cuentas Corrientes */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">// CUENTAS CORRIENTES (BI-FLUJO)</h4>
              <div className="p-4 glass-premium neumorphic-dark-out rounded-2xl flex justify-between items-center hover:border-[#F1C40F]/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F1C40F]/10 border border-[#F1C40F]/20 flex items-center justify-center text-[#F1C40F]"><Briefcase className="w-4 h-4" /></div>
                  <div className="flex flex-col">
                    <span className="text-xs text-white font-bold tracking-wide">Bimont S.A.</span>
                    <span className="text-[8px] font-mono text-[#F1C40F] uppercase tracking-widest font-black">Cimiento (Fijo)</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-white font-black font-contable">{formatMoney(bimontAccountBalance)}</span>
                </div>
              </div>
              <div className="p-4 glass-premium neumorphic-dark-out rounded-2xl flex justify-between items-center hover:border-[#06B6D4]/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/20 flex items-center justify-center text-[#06B6D4]"><Zap className="w-4 h-4" /></div>
                  <div className="flex flex-col">
                    <span className="text-xs text-white font-bold tracking-wide">Janlu Velas</span>
                    <span className="text-[8px] font-mono text-[#06B6D4] uppercase tracking-widest font-black">Acelerador (Ventas)</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-white font-black font-contable">{formatMoney(janluAccountBalance)}</span>
                </div>
              </div>
            </div>

            {/* Tarjetas y Pasivos */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">// TARJETAS Y PASIVOS (NIVEL 3)</h4>
              <div className="space-y-2">
                {deudas.map(d => (
                  <div 
                    key={d.id} 
                    onClick={() => setDebtForSnowball(d)}
                    className="p-3.5 glass-premium neumorphic-dark-out rounded-2xl flex justify-between items-center cursor-pointer hover:border-[#D946EF]/30 hover:bg-white/[0.07] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#D946EF]/10 border border-[#D946EF]/20 flex items-center justify-center text-[#D946EF]"><CreditCard className="w-4 h-4" /></div>
                      <div className="flex flex-col">
                        <span className="text-xs text-white font-bold uppercase tracking-wide">{d.nombre}</span>
                        <span className="text-[8px] font-mono text-[#D946EF] uppercase tracking-widest">Cuota: <span className="font-contable">{formatMoney(d.cuotaMensual)}</span></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[#D946EF] font-black font-contable">{formatMoney(d.saldoPendiente)}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Otros Activos */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">// COFRES DE PROPÓSITO</h4>
              <div className="space-y-3 glass-premium neumorphic-dark-out p-4 rounded-2xl">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white font-bold text-[10px] uppercase">Fondo de Emergencia</span>
                    <span className="text-[#F1C40F] font-mono text-[10px] font-black font-contable">{formatMoney(480000)} / {formatMoney(600000)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#F1C40F] to-[#06B6D4] rounded-full" style={{ width: '80%' }} /></div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white font-bold text-[10px] uppercase">Meta Expansión</span>
                    <span className="text-[#06B6D4] font-mono text-[10px] font-black font-contable">{formatMoney(89000)} / {formatMoney(150000)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] rounded-full" style={{ width: '59%' }} /></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pestaña HOY */}
        {pestanaActiva === 'HOY' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-white text-lg font-serif font-black uppercase tracking-wider">Hoy</h3>
                <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">// TRIAJE DIARIO</p>
              </div>
            </div>
            <div className="space-y-2.5">
              <div className="p-3 glass-premium neumorphic-dark-out rounded-2xl flex justify-between items-center">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-white font-bold uppercase tracking-wide">Alquiler & Expensas (N1)</span>
                  <span className="text-[8px] font-mono text-[#F1C40F] uppercase tracking-widest font-black">Planificado // Cimiento</span>
                </div>
                <span className="text-xs font-black font-mono text-[#F1C40F] font-contable">{formatMoney(225000)}</span>
              </div>
              <div className="p-3 glass-premium neumorphic-dark-out rounded-2xl flex justify-between items-center">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-white font-bold uppercase tracking-wide">Supermercado (N2)</span>
                  <span className="text-[8px] font-mono text-[#F1C40F] uppercase tracking-widest font-black">Planificado // Flexible</span>
                </div>
                <span className="text-xs font-black font-mono text-[#F1C40F] font-contable">{formatMoney(95000)}</span>
              </div>
              <div className={`p-3 glass-premium rounded-2xl flex justify-between items-center transition-all ${
                cajaRealTotal < 1000000 ? 'border-[#D946EF]/30 bg-[#D946EF]/5 glow-fuchsia' : 'neumorphic-dark-out'
              }`}>
                <div className="flex flex-col gap-0.5">
                  <span className={`text-xs font-bold uppercase tracking-wide ${cajaRealTotal < 1000000 ? 'line-through text-[#D946EF] opacity-60' : 'text-white'}`}>Restaurantes & Salidas (N5)</span>
                  <span className="text-[8px] font-mono text-[#D946EF] uppercase tracking-widest font-black">{cajaRealTotal < 1000000 ? 'CONGELADO' : 'Planificado'}</span>
                </div>
                <span className={`text-xs font-black font-mono font-contable ${cajaRealTotal < 1000000 ? 'text-[#D946EF]' : 'text-[#06B6D4]'}`}>{formatMoney(65000)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Pestaña PRESUPUESTO */}
        {pestanaActiva === 'PRESUPUESTO' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div>
              <h3 className="text-white text-lg font-serif font-black uppercase tracking-wider">Límites</h3>
              <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">// RITMO DE CONSUMO</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white font-bold text-[10px] uppercase">Supermercado (N2)</span>
                  <span className="text-[#F1C40F] font-mono text-[9px] font-black font-contable">{formatMoney(127500)} / {formatMoney(150000)} (85%)</span>
                </div>
                <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden"><div className="h-full bg-[#F1C40F] rounded-full shadow-[0_0_10px_rgba(241,196,15,0.4)]" style={{ width: '85%' }} /></div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white font-bold text-[10px] uppercase">Ocio & Salidas (N5)</span>
                  <span className="text-[#D946EF] font-mono text-[9px] font-black font-contable">{formatMoney(68000)} / {formatMoney(80000)} (85%)</span>
                </div>
                <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden"><div className="h-full bg-[#D946EF] rounded-full shadow-[0_0_10px_rgba(217,70,239,0.4)]" style={{ width: '85%' }} /></div>
              </div>
            </div>
          </div>
        )}

        {/* Pestaña INFORMES */}
        {pestanaActiva === 'INFORMES' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div>
              <h3 className="text-white text-lg font-serif font-black uppercase tracking-wider">Distribución</h3>
              <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">// GRÁFICOS Y CAUDALES</p>
            </div>
            <div className="flex flex-col items-center justify-center p-6 glass-premium neumorphic-dark-out rounded-3xl">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F1C40F" strokeWidth="11" strokeDasharray="238.76" strokeDashoffset="119.38" />
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#06B6D4" strokeWidth="11" strokeDasharray="238.76" strokeDashoffset="191.01" className="origin-center" style={{ transform: 'rotate(180deg)' }} />
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#D946EF" strokeWidth="11" strokeDasharray="238.76" strokeDashoffset="214.88" className="origin-center" style={{ transform: 'rotate(288deg)' }} />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-white text-sm font-black font-mono font-contable">100%</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowSankeyDrawer(true)}
              className="w-full py-4 glass-premium neumorphic-dark-out rounded-2xl flex items-center justify-between px-5 hover:bg-white/[0.08] transition-all cursor-pointer"
            >
              <span className="text-xs text-white font-bold uppercase">Ver Flujo de Sankey</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        )}

        {/* Pestaña TRANSACCIONES */}
        {pestanaActiva === 'TRANSACCIONES' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-white text-lg font-serif font-black uppercase tracking-wider">Libro Diario</h3>
                <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">// HISTORIAL OCR</p>
              </div>
            </div>
            <div className="space-y-3">
              {gastos.map(g => {
                const isVampiro = duplicateIds.has(g.id);
                const isPaused = g.estado === 'Pausado';
                return (
                  <div 
                    key={g.id}
                    className={`p-3 glass-premium border rounded-2xl flex flex-col gap-2.5 transition-all ${
                      isVampiro ? 'border-[#8B5CF6] bg-[#8B5CF6]/5 glow-violet' : 'border-white/5 neumorphic-dark-out'
                    } ${isPaused ? 'opacity-40 grayscale' : ''}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white font-bold uppercase">{g.descripcion}</span>
                      <span className="text-xs font-black font-mono text-white font-contable">-{formatMoney(g.monto)}</span>
                    </div>
                    {isVampiro && (
                      <div className="flex items-center justify-between border-t border-[#8B5CF6]/20 pt-2 text-[8px] font-mono">
                        <span className="text-[#8B5CF6] uppercase font-black tracking-widest flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> DUPLICADA
                        </span>
                        <button
                          onClick={() => handlePausarEnTriaje(g.id, g.estado)}
                          className="px-2.5 py-1 rounded bg-[#8B5CF6] text-black font-sans font-black uppercase tracking-wider text-[8px] cursor-pointer"
                        >
                          {isPaused ? 'Reactivar' : 'Pausar'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* Bottom Tab Bar móvil */}
      <nav className="absolute bottom-0 left-0 right-0 z-40 bg-[#0B1A28]/90 backdrop-blur-xl border-t border-white/10 py-2 px-3 flex justify-around items-center shrink-0">
        {[
          { id: 'SALDO', label: 'Saldo', icon: <CreditCard className="w-4 h-4" /> },
          { id: 'HOY', label: 'Hoy', icon: <Calendar className="w-4 h-4" /> },
          { id: 'PRESUPUESTO', label: 'Límites', icon: <Settings className="w-4 h-4" /> },
          { id: 'INFORMES', label: 'Distrib.', icon: <Activity className="w-4 h-4" /> },
          { id: 'TRANSACCIONES', label: 'Diario', icon: <BookOpen className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPestanaActiva(tab.id as PestanaBunker)}
            className="flex flex-col items-center gap-1 cursor-pointer py-1 px-2"
          >
            <div className={pestanaActiva === tab.id ? 'text-[#06B6D4]' : 'text-slate-400'}>{tab.icon}</div>
            <span className={`text-[8px] font-mono tracking-widest uppercase font-black ${pestanaActiva === tab.id ? 'text-[#06B6D4]' : 'text-slate-400'}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );

  // RENDERIZADOR: ESTRUCTURA INTERFAZ PC COMPLETA
  const renderPCLayout = () => (
    <div className="w-full min-h-screen flex bg-gradient-to-b from-[#0B1A28] to-[#112B3C] text-white font-sans overflow-hidden select-none">
      
      {/* Sidebar fijo a la izquierda */}
      <aside className="w-64 border-r border-white/5 bg-white/[0.02] backdrop-blur-3xl p-6 flex flex-col justify-between shrink-0 select-none">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#06B6D4]/10 border border-[#06B6D4]/20 flex items-center justify-center">
              <span className="text-sm text-[#06B6D4] font-black">Eq</span>
            </div>
            <h1 className="font-serif text-lg tracking-[0.05em] text-white font-black uppercase leading-tight">
              Equilibra<span className="text-[#06B6D4]">.</span>
            </h1>
          </div>

          {/* Menú de Botoneras Lateral */}
          <div className="flex flex-col gap-2.5">
            <p className="text-[8px] font-mono tracking-widest uppercase text-slate-400 font-black mb-2 px-2">// PILARES DE CONTROL</p>
            {[
              { id: 'SALDO', nombre: 'Saldo', icono: <CreditCard className="w-4 h-4" /> },
              { id: 'HOY', nombre: 'Hoy / Agenda', icono: <Calendar className="w-4 h-4" /> },
              { id: 'PRESUPUESTO', nombre: 'Límites / Presup.', icono: <Settings className="w-4 h-4" /> },
              { id: 'INFORMES', nombre: 'Distribución', icono: <Activity className="w-4 h-4" /> },
              { id: 'TRANSACCIONES', nombre: 'Libro Diario', icono: <BookOpen className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPestanaActiva(tab.id as PestanaBunker)}
                className={`w-full text-left px-4 py-3 text-[9px] font-sans font-black tracking-[0.18em] uppercase transition-all duration-300 rounded-xl relative flex items-center gap-3 cursor-pointer ${
                  pestanaActiva === tab.id 
                    ? 'bg-white/5 text-[#06B6D4] border border-[#06B6D4]/20 shadow-[0_4px_25px_rgba(6,182,212,0.1)]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                {tab.icono}
                <span>{tab.nombre}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="font-mono text-[8px] text-slate-500 tracking-widest border-t border-white/5 pt-4">
          <p>[ BÚNKER OS v3.10 ]</p>
          <p className="uppercase mt-1 text-[#06B6D4] font-black">SISTEMA PC MULTI-COLUMNA</p>
        </div>
      </aside>

      {/* Área de contenido PC */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto px-8 py-6 pb-12 custom-scrollbar relative z-10">
        
        {/* Cabecera Superior PC */}
        <header className="flex justify-between items-center border-b border-white/5 pb-4 mb-6 shrink-0">
          <div>
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#06B6D4] font-black uppercase">SISTEMA DUAL ANALÍTICO</span>
            <h2 className="text-2xl font-serif font-black uppercase text-white mt-1">Consola de Control Central</h2>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Conmutador de Layout */}
            <div className="bg-black/40 border border-white/10 p-1 rounded-xl flex items-center gap-1 font-mono text-[9px] text-slate-400 select-none">
              <button 
                onClick={() => setIsMobileSimulator(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer ${!isMobileSimulator ? 'bg-white/5 text-[#06B6D4] border border-white/5 font-bold shadow-md' : 'hover:text-white'}`}
              >
                <Monitor className="w-3.5 h-3.5" /> VISTA PC
              </button>
              <button 
                onClick={() => setIsMobileSimulator(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer ${isMobileSimulator ? 'bg-white/5 text-[#06B6D4] border border-white/5 font-bold shadow-md' : 'hover:text-white'}`}
              >
                <Phone className="w-3.5 h-3.5" /> SIMULADOR MÓVIL
              </button>
            </div>
          </div>
        </header>

        {/* Pestañas detalladas para PC */}
        
        {/* PESTAÑA: SALDO (PC) */}
        {pestanaActiva === 'SALDO' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {/* Col 1: Balance y Ledger */}
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center py-8 text-center glass-premium neumorphic-dark-out rounded-[2rem] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#06B6D4] via-[#F1C40F] to-[#D946EF] opacity-40" />
                <span className="text-[10px] font-mono tracking-[0.2em] text-[#06B6D4] uppercase font-black">SALDO NETO CONSOLIDADO</span>
                <span className="text-gradient-cyan text-4xl font-black mt-2 font-serif tracking-tight drop-shadow-[0_0_15px_rgba(6,182,212,0.4)] font-contable">{formatMoney(cajaRealTotal)}</span>
                <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                  <Activity className="w-3 h-3 text-[#06B6D4]" />
                  <span className="text-[8px] font-mono text-slate-300 uppercase tracking-widest">Estabilidad: {puntoEstabilidad.toFixed(0)}% P.E.</span>
                </div>
              </div>
              
              <div className="space-y-3 glass-premium neumorphic-dark-out p-5 rounded-3xl">
                <h4 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">// CUENTAS CORRIENTES (BI-FLUJO)</h4>
                <div className="p-4 bg-black/35 border border-white/5 rounded-2xl flex justify-between items-center hover:border-[#F1C40F]/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#F1C40F]/10 border border-[#F1C40F]/20 flex items-center justify-center text-[#F1C40F]"><Briefcase className="w-4 h-4" /></div>
                    <div className="flex flex-col">
                      <span className="text-xs text-white font-bold tracking-wide">Bimont S.A.</span>
                      <span className="text-[8px] font-mono text-[#F1C40F] uppercase tracking-widest font-black">Cimiento (Fijo)</span>
                    </div>
                  </div>
                  <span className="text-sm text-white font-black font-contable">{formatMoney(bimontAccountBalance)}</span>
                </div>
                <div className="p-4 bg-black/35 border border-white/5 rounded-2xl flex justify-between items-center hover:border-[#06B6D4]/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/20 flex items-center justify-center text-[#06B6D4]"><Zap className="w-4 h-4" /></div>
                    <div className="flex flex-col">
                      <span className="text-xs text-white font-bold tracking-wide">Janlu Velas</span>
                      <span className="text-[8px] font-mono text-[#06B6D4] uppercase tracking-widest font-black">Acelerador (Ventas)</span>
                    </div>
                  </div>
                  <span className="text-sm text-white font-black font-contable">{formatMoney(janluAccountBalance)}</span>
                </div>
              </div>
            </div>

            {/* Col 2: Tarjetas y Pasivos */}
            <div className="space-y-3 glass-premium neumorphic-dark-out p-5 rounded-3xl">
              <h4 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">// TARJETAS Y PASIVOS (NIVEL 3)</h4>
              <div className="space-y-3">
                {deudas.map(d => (
                  <div 
                    key={d.id} 
                    onClick={() => setDebtForSnowball(d)}
                    className="p-4 bg-black/35 border border-white/5 rounded-2xl flex justify-between items-center cursor-pointer hover:border-[#D946EF]/30 hover:bg-white/[0.04] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#D946EF]/10 border border-[#D946EF]/20 flex items-center justify-center text-[#D946EF]"><CreditCard className="w-4 h-4" /></div>
                      <div className="flex flex-col">
                        <span className="text-xs text-white font-bold uppercase tracking-wide uppercase">{d.nombre}</span>
                        <span className="text-[8px] font-mono text-[#D946EF] uppercase tracking-widest">Cuota: <span className="font-contable">{formatMoney(d.cuotaMensual)}</span> • Tasa: {d.tasaInteres}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-[#D946EF] font-black font-contable">{formatMoney(d.saldoPendiente)}</span>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Col 3: Otros Activos / Cofres */}
            <div className="space-y-3 glass-premium neumorphic-dark-out p-5 rounded-3xl">
              <h4 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">// COFRES DE PROPÓSITO</h4>
              <div className="space-y-4">
                <div className="space-y-1.5 p-3.5 bg-black/20 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white font-bold text-[10px] uppercase">Fondo de Emergencia</span>
                    <span className="text-[#F1C40F] font-mono text-[10px] font-black font-contable">{formatMoney(480000)} / {formatMoney(600000)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mt-1"><div className="h-full bg-gradient-to-r from-[#F1C40F] to-[#06B6D4] rounded-full" style={{ width: '80%' }} /></div>
                </div>
                <div className="space-y-1.5 p-3.5 bg-black/20 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white font-bold text-[10px] uppercase">Meta Expansión</span>
                    <span className="text-[#06B6D4] font-mono text-[10px] font-black font-contable">{formatMoney(89000)} / {formatMoney(150000)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mt-1"><div className="h-full bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] rounded-full" style={{ width: '59%' }} /></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: HOY (PC) */}
        {pestanaActiva === 'HOY' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
            <div className="space-y-4 glass-premium neumorphic-dark-out p-6 rounded-3xl">
              <h4 className="text-[11px] font-black tracking-widest text-[#F1C40F] uppercase">// GASTOS PLANIFICADOS (CIMIENTO N1/N2)</h4>
              <div className="space-y-2.5">
                <div className="p-4 bg-black/20 border border-white/5 rounded-2xl flex justify-between items-center">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-white font-bold uppercase tracking-wide">Alquiler & Expensas (N1)</span>
                    <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">Planificado // Cimiento</span>
                  </div>
                  <span className="text-sm font-black font-mono text-[#F1C40F] font-contable">{formatMoney(225000)}</span>
                </div>
                <div className="p-4 bg-black/20 border border-white/5 rounded-2xl flex justify-between items-center">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-white font-bold uppercase tracking-wide">Supermercado Quincenal (N2)</span>
                    <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">Planificado // Flexible</span>
                  </div>
                  <span className="text-sm font-black font-mono text-[#F1C40F] font-contable">{formatMoney(95000)}</span>
                </div>
                <div className="p-4 bg-black/20 border border-white/5 rounded-2xl flex justify-between items-center">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-white font-bold uppercase tracking-wide">Colegio Lauty & Martu (N1)</span>
                    <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">Planificado // Cimiento</span>
                  </div>
                  <span className="text-sm font-black font-mono text-[#F1C40F] font-contable">{formatMoney(120000)}</span>
                </div>
              </div>
            </div>
            <div className="space-y-4 glass-premium neumorphic-dark-out p-6 rounded-3xl">
              <h4 className="text-[11px] font-black tracking-widest text-[#D946EF] uppercase">// GASTOS DISCRECIONALES (ACELERADOR N4/N5)</h4>
              <div className="space-y-2.5">
                <div className={`p-4 bg-black/20 border rounded-2xl flex justify-between items-center ${
                  cajaRealTotal < 1000000 ? 'border-[#D946EF]/20 bg-[#D946EF]/5 glow-fuchsia' : 'border-white/5'
                }`}>
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-xs font-bold uppercase tracking-wide ${cajaRealTotal < 1000000 ? 'line-through text-[#D946EF] opacity-60' : 'text-white'}`}>Restaurantes & Salidas (N5)</span>
                    <span className="text-[8px] font-mono text-[#D946EF] uppercase tracking-widest font-black">{cajaRealTotal < 1000000 ? 'CONGELADO POR ALGORITMO' : 'Planificado'}</span>
                  </div>
                  <span className={`text-sm font-black font-mono font-contable ${cajaRealTotal < 1000000 ? 'text-[#D946EF]' : 'text-[#06B6D4]'}`}>{formatMoney(65000)}</span>
                </div>
                <div className={`p-4 bg-black/20 border rounded-2xl flex justify-between items-center ${
                  cajaRealTotal < 1000000 ? 'border-[#D946EF]/20 bg-[#D946EF]/5 glow-fuchsia' : 'border-white/5'
                }`}>
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-xs font-bold uppercase tracking-wide ${cajaRealTotal < 1000000 ? 'line-through text-[#D946EF] opacity-60' : 'text-white'}`}>Suscripciones Streaming (N4)</span>
                    <span className="text-[8px] font-mono text-[#D946EF] uppercase tracking-widest font-black">{cajaRealTotal < 1000000 ? 'CONGELADO POR ALGORITMO' : 'Planificado'}</span>
                  </div>
                  <span className={`text-sm font-black font-mono font-contable ${cajaRealTotal < 1000000 ? 'text-[#D946EF]' : 'text-[#06B6D4]'}`}>{formatMoney(15000)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: PRESUPUESTO (PC) */}
        {pestanaActiva === 'PRESUPUESTO' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="space-y-4 glass-premium neumorphic-dark-out p-6 rounded-3xl">
              <h4 className="text-[11px] font-black tracking-widest text-[#06B6D4] uppercase">// CLIMA PRESUPUESTARIO</h4>
              <div className="p-4 bg-black/30 border border-white/5 rounded-2xl">
                <span className="text-white text-xs font-bold uppercase block mb-1">Supermercado (N2)</span>
                <span className="text-[9px] font-mono text-[#F1C40F] font-contable">Ritmo Acelerado (85%)</span>
              </div>
              <div className="p-4 bg-black/30 border border-white/5 rounded-2xl">
                <span className="text-white text-xs font-bold uppercase block mb-1">Ocio (N5)</span>
                <span className="text-[9px] font-mono text-[#D946EF] font-contable">Peligro Desborde (85%)</span>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-4 glass-premium neumorphic-dark-out p-6 rounded-3xl">
              <h4 className="text-[11px] font-black tracking-widest text-slate-400 uppercase">// AVANCE POR CATEGORÍAS</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 p-3.5 bg-black/20 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white font-bold text-[10px] uppercase">Supermercado (N2)</span>
                    <span className="text-[#F1C40F] font-mono text-[9px] font-black font-contable">{formatMoney(127500)} / {formatMoney(150000)}</span>
                  </div>
                  <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden mt-1"><div className="h-full bg-[#F1C40F] rounded-full shadow-[0_0_10px_rgba(241,196,15,0.4)]" style={{ width: '85%' }} /></div>
                </div>
                <div className="space-y-1.5 p-3.5 bg-black/20 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white font-bold text-[10px] uppercase">Ocio & Salidas (N5)</span>
                    <span className="text-[#D946EF] font-mono text-[9px] font-black font-contable">{formatMoney(68000)} / {formatMoney(80000)}</span>
                  </div>
                  <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden mt-1"><div className="h-full bg-[#D946EF] rounded-full shadow-[0_0_10px_rgba(217,70,239,0.4)]" style={{ width: '85%' }} /></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: INFORMES (PC) */}
        {pestanaActiva === 'INFORMES' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
            <div className="space-y-6 glass-premium neumorphic-dark-out p-6 rounded-3xl">
              <h4 className="text-[11px] font-black tracking-widest text-slate-400 uppercase">// REPARTO GENERAL DE EGRESOS</h4>
              <div className="flex flex-col items-center justify-center p-6 bg-black/20 rounded-2xl">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F1C40F" strokeWidth="11" strokeDasharray="238.76" strokeDashoffset="119.38" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#06B6D4" strokeWidth="11" strokeDasharray="238.76" strokeDashoffset="191.01" className="origin-center" style={{ transform: 'rotate(180deg)' }} />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#D946EF" strokeWidth="11" strokeDasharray="238.76" strokeDashoffset="214.88" className="origin-center" style={{ transform: 'rotate(288deg)' }} />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-white text-lg font-black font-mono font-contable">100%</span>
                    <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">Egreso Total</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 w-full mt-6 text-center border-t border-white/5 pt-4">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#F1C40F]" /><span className="text-[9px] font-mono font-bold text-white uppercase">Cimiento</span></div>
                    <span className="text-xs font-black font-mono text-[#F1C40F] mt-0.5 font-contable">50%</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" /><span className="text-[9px] font-mono font-bold text-white uppercase">Acelerador</span></div>
                    <span className="text-xs font-black font-mono text-[#06B6D4] mt-0.5 font-contable">30%</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#D946EF]" /><span className="text-[9px] font-mono font-bold text-white uppercase">Deudas</span></div>
                    <span className="text-xs font-black font-mono text-[#D946EF] mt-0.5 font-contable">20%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4 glass-premium neumorphic-dark-out p-6 rounded-3xl flex flex-col h-[480px]">
              <h4 className="text-[11px] font-black tracking-widest text-[#06B6D4] uppercase">// FLUIDOS DE CAJA (SANKEY)</h4>
              <div className="flex-1 overflow-y-auto">
                <FlujoCapitalSankey 
                  bimont={ingresoBimont}
                  janlu={sumJanluVal}
                  vitales={costoSupervivenciaMensualCalculado}
                  variables={gastosVariablesCalculado}
                  excedente={excedenteCalculado}
                />
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: TRANSACCIONES (PC) */}
        {pestanaActiva === 'TRANSACCIONES' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="lg:col-span-2 space-y-4 glass-premium neumorphic-dark-out p-6 rounded-3xl flex flex-col min-h-[500px]">
              <div className="flex justify-between items-center shrink-0">
                <h4 className="text-[11px] font-black tracking-widest text-slate-400 uppercase">// REGISTRO DE TRANSACCIONES OCR</h4>
                <button 
                  onClick={handleOpenNuevaOperacion}
                  className="px-4 py-2 bg-[#06B6D4] text-black text-[10px] font-black uppercase tracking-widest font-sans rounded-xl hover:scale-105 active:scale-95 transition-all outline-none"
                >
                  + Nuevo Registro
                </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                {gastos.map(g => {
                  const isVampiro = duplicateIds.has(g.id);
                  const isPaused = g.estado === 'Pausado';
                  return (
                    <div 
                      key={g.id}
                      className={`p-4 bg-black/20 border rounded-2xl flex justify-between items-center transition-all ${
                        isVampiro ? 'border-[#8B5CF6] shadow-[0_0_12px_rgba(139,92,246,0.3)] bg-[#8B5CF6]/5 glow-violet' : 'border-white/5'
                      } ${isPaused ? 'opacity-40 grayscale' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${isVampiro ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' : 'bg-white/5 text-slate-400'}`}><BookOpen className="w-4 h-4" /></div>
                        <div className="flex flex-col">
                          <span className="text-xs text-white font-bold uppercase tracking-wide">{g.descripcion}</span>
                          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">Nivel {g.nivel} • {g.categoria} • {new Date(g.fecha).toLocaleDateString('es-AR')}</span>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <span className="text-sm font-black font-mono text-white font-contable">-{formatMoney(g.monto)}</span>
                        {isVampiro && (
                          <button
                            onClick={() => handlePausarEnTriaje(g.id, g.estado)}
                            className="px-3 py-1.5 rounded bg-[#8B5CF6] text-black font-sans font-black text-[9px] uppercase tracking-wider hover:scale-105 active:scale-95 transition-all cursor-pointer"
                          >
                            {isPaused ? 'Reactivar' : 'Pausar'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="space-y-4 glass-premium neumorphic-dark-out p-6 rounded-3xl backdrop-blur-xl">
              <h4 className="text-[11px] font-black tracking-widest text-slate-400 uppercase">// AUDITOR DE GASTOS VAMPIRO</h4>
              <div className="p-4 bg-black/30 border border-white/5 rounded-2xl space-y-2">
                <span className="text-[10px] font-mono font-black text-[#8B5CF6] uppercase flex items-center gap-1.5"><Bot className="w-4 h-4 text-[#8B5CF6]" /> DIAGNÓSTICO COGNITIVO</span>
                <p className="text-[9px] text-slate-300 leading-relaxed uppercase">El algoritmo de Isolation Forest detecta fugas de liquidez (suscripciones olvidadas, recargos de tarjetas y microgastos repetitivos).</p>
              </div>
              {gastoSospechoso && (
                <div className="p-4 border border-[#8B5CF6]/30 bg-[#8B5CF6]/5 rounded-2xl space-y-2 glow-violet">
                  <span className="text-[9px] font-mono font-black text-[#8B5CF6] uppercase tracking-wider">GASTO ANÓMALO DETECTADO</span>
                  <div className="flex justify-between items-center text-xs mt-1">
                    <span className="text-white font-bold truncate max-w-[120px]">{gastoSospechoso.referencia || gastoSospechoso.categoria}</span>
                    <span className="text-white font-black font-contable">{formatMoney(gastoSospechoso.montoTotal)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* ⚡ FAB DE ACCIONES EN PC */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 select-none font-sans">
        {quickMenuOpen && (
          <div className="flex flex-col items-end gap-2.5 mb-2 animate-in fade-in slide-in-from-bottom-5 duration-200">
            <button onClick={() => { handleOpenNuevaOperacion(); setQuickMenuOpen(false); }} className="flex items-center gap-3 bg-[#112B3C] border border-white/10 text-white p-2.5 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer group">
              <span className="text-[8px] font-mono tracking-widest text-slate-400 group-hover:text-white uppercase font-black">Registrar Operación</span>
              <div className="w-7 h-7 rounded-xl bg-[#06B6D4]/10 flex items-center justify-center border border-[#06B6D4]/20"><Plus className="w-4 h-4 text-[#06B6D4]" /></div>
            </button>
            <button onClick={handleGlobalScan} className="flex items-center gap-3 bg-[#112B3C] border border-white/10 text-white p-2.5 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer group disabled:opacity-50">
              <span className="text-[8px] font-mono tracking-widest text-slate-400 group-hover:text-white uppercase font-black">Barrer Gmail (OCR)</span>
              <div className="w-7 h-7 rounded-xl bg-[#06B6D4]/10 flex items-center justify-center border border-[#06B6D4]/20"><RefreshCw className={`w-3.5 h-3.5 text-[#06B6D4] ${isGlobalScanningFacturas ? 'animate-spin' : ''}`} /></div>
            </button>
            <button onClick={() => { setActiveOverlay('SIMULADORES'); setQuickMenuOpen(false); }} className="flex items-center gap-3 bg-[#112B3C] border border-white/10 text-white p-2.5 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer group">
              <span className="text-[8px] font-mono tracking-widest text-slate-400 group-hover:text-white uppercase font-black">Bola de Nieve</span>
              <div className="w-7 h-7 rounded-xl bg-[#D946EF]/10 flex items-center justify-center border border-[#D946EF]/20"><CreditCard className="w-3.5 h-3.5 text-[#D946EF]" /></div>
            </button>
            <button onClick={() => { setActiveOverlay('WHAT_IF'); setQuickMenuOpen(false); }} className="flex items-center gap-3 bg-[#112B3C] border border-white/10 text-white p-2.5 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer group">
              <span className="text-[8px] font-mono tracking-widest text-slate-400 group-hover:text-white uppercase font-black">Monte Carlo</span>
              <div className="w-7 h-7 rounded-xl bg-[#F1C40F]/10 flex items-center justify-center border border-[#F1C40F]/20"><Bot className="w-3.5 h-3.5 text-[#F1C40F]" /></div>
            </button>
            <button onClick={() => { setActiveOverlay('CONFIGURACION'); setQuickMenuOpen(false); }} className="flex items-center gap-3 bg-[#112B3C] border border-white/10 text-white p-2.5 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer group">
              <span className="text-[8px] font-mono tracking-widest text-slate-400 group-hover:text-white uppercase font-black">Parámetros</span>
              <div className="w-7 h-7 rounded-xl bg-white/5 flex items-center justify-center border border-white/10"><Settings className="w-3.5 h-3.5 text-slate-300" /></div>
            </button>
          </div>
        )}
        <button onClick={() => setQuickMenuOpen(!quickMenuOpen)} className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-2xl transition-all duration-300 border cursor-pointer glow-cyan ${quickMenuOpen ? 'bg-[#06B6D4] border-[#06B6D4]/50 text-black rotate-45 scale-105' : 'bg-[#112B3C] border-white/10 text-[#06B6D4] hover:border-[#06B6D4]/40'}`}>
          <Zap className="w-5 h-5" />
        </button>
      </div>

      {/* Overlays en PC */}
      {activeOverlay === 'SIMULADORES' && (
        <div className="fixed inset-0 z-50 bg-[#0B1A28]/95 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[#0B1A28] border border-white/10 w-full max-w-xl p-6 rounded-3xl space-y-4 shadow-2xl relative">
            <header className="flex items-center justify-between border-b border-white/5 pb-3 shrink-0">
              <span className="text-white font-serif text-sm font-bold uppercase">Simuladores Estratégicos</span>
              <button onClick={() => setActiveOverlay(null)} className="p-1.5 border border-white/5 rounded-full text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </header>
            <div className="flex bg-black/60 p-1 border border-white/5 rounded-2xl font-mono text-[9px] w-full mb-4">
              <button onClick={() => setSubSimuladorActivo('DEUDAS')} className={`flex-1 px-4 py-2.5 uppercase rounded-xl font-black transition-all cursor-pointer ${subSimuladorActivo === 'DEUDAS' ? 'bg-[#0B1A28] text-[#06B6D4] border border-[#06B6D4]/30 shadow-md' : 'text-slate-400 hover:text-white'}`}>Bola de Nieve</button>
              <button onClick={() => setSubSimuladorActivo('EXCEDENTES')} className={`flex-1 px-4 py-2.5 uppercase rounded-xl font-black transition-all cursor-pointer ${subSimuladorActivo === 'EXCEDENTES' ? 'bg-[#0B1A28] text-[#06B6D4] border border-[#06B6D4]/30 shadow-md' : 'text-slate-400 hover:text-white'}`}>Excedentes</button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
              {subSimuladorActivo === 'DEUDAS' ? <SimuladorExtincionDeudas deudas={deudas} /> : <SimuladorExcedentes excedenteBase={ingresoBimont - costoSupervivenciaMensualCalculado} />}
            </div>
          </div>
        </div>
      )}

      {activeOverlay === 'WHAT_IF' && (
        <div className="fixed inset-0 z-50 bg-[#0B1A28]/95 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[#0B1A28] border border-white/10 w-full max-w-xl p-6 rounded-3xl space-y-4 shadow-2xl relative">
            <header className="flex items-center justify-between border-b border-white/5 pb-3 shrink-0">
              <span className="text-white font-serif text-sm font-bold uppercase">Simulación Monte Carlo (What-If)</span>
              <button onClick={() => setActiveOverlay(null)} className="p-1.5 border border-white/5 rounded-full text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </header>
            <div className="max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
              <SimuladorWhatIf puntoEstabilidad={puntoEstabilidad} />
            </div>
          </div>
        </div>
      )}

      {activeOverlay === 'CONFIGURACION' && (
        <div className="fixed inset-0 z-50 bg-[#0B1A28]/95 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[#0B1A28] border border-white/10 w-full max-w-md p-6 rounded-3xl space-y-4 shadow-2xl relative">
            <header className="flex items-center justify-between border-b border-white/5 pb-3 shrink-0">
              <span className="text-white font-serif text-sm font-bold uppercase">Parámetros del Búnker</span>
              <button onClick={() => setActiveOverlay(null)} className="p-1.5 border border-white/5 rounded-full text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </header>
            <ConfiguracionBunker 
              ingresoBimontActual={ingresoBimont}
              factorInflacionActual={factorInflacion}
              diaSimuladoActual={diaDelMes}
              onGuardarParametros={(ingreso, inflacion, dia) => {
                setIngresoBimont(ingreso);
                setFactorInflacion(inflacion);
                setDiaDelMes(dia);
                setActiveOverlay(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* 1. Responsividad Automática: Si es pantalla móvil, renderiza el layout móvil directamente */}
      {!isLargeScreen ? (
        renderMobileLayout()
      ) : (
        /* 2. Pantalla Grande (PC) */
        isMobileSimulator ? (
          /* Modo Simulador de Smartphone */
          <div className="min-h-screen w-screen bg-[#070E16] flex flex-col items-center justify-center p-6 overflow-hidden relative">
            
            {/* Header del Simulador en PC */}
            <div className="absolute top-4 left-6 right-6 flex justify-between items-center z-40 bg-[#112B3C]/40 backdrop-blur-xl border border-white/5 px-5 py-3 rounded-2xl max-w-7xl mx-auto w-[calc(100vw-3rem)]">
              <div>
                <span className="text-[8px] font-mono tracking-[0.25em] text-[#06B6D4] font-black uppercase">ENTORNO DE PRUEBAS</span>
                <h2 className="text-sm font-serif font-black uppercase text-white">Simulador de Smartphone</h2>
              </div>
              <button 
                onClick={() => setIsMobileSimulator(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#06B6D4] text-black font-mono text-[9px] font-black rounded-xl hover:scale-105 transition-all shadow-lg shadow-[#06B6D4]/20 cursor-pointer"
              >
                <Monitor className="w-3.5 h-3.5" /> VOLVER A VISTA PC
              </button>
            </div>

            {/* Smartphone Frame */}
            <div className="w-[412px] h-[892px] rounded-[3.2rem] border-[12px] border-[#1E293B] shadow-[0_0_80px_rgba(0,0,0,0.85)] relative overflow-hidden flex flex-col bg-gradient-to-b from-[#0B1A28] to-[#112B3C] border-slate-800 shrink-0 mt-12">
              {renderMobileLayout()}
            </div>
          </div>
        ) : (
          /* Modo Escritorio Completo */
          renderPCLayout()
        )
      )}

      {/* Modales Compartidos */}

      {/* Modal de Operación Global */}
      <ModalOperacion 
        isOpen={isModalOperacionOpen}
        onClose={() => {
          setIsModalOperacionOpen(false);
          setTransaccionAEditar(null);
        }}
        transactionToEdit={transaccionAEditar}
      />

      {/* Modal interactivo de Bola de Nieve en SALDO */}
      {debtForSnowball && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B1A28] border border-[#D946EF]/20 w-full max-w-sm p-6 rounded-[2rem] space-y-4 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 glow-fuchsia">
            <button 
              onClick={() => setDebtForSnowball(null)}
              className="absolute top-4 right-4 p-1.5 border border-white/5 rounded-full text-slate-400 hover:text-white hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#D946EF]/10 border border-[#D946EF]/20 flex items-center justify-center text-[#D946EF]">
                <CreditCard className="w-5 h-5 animate-bounce" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono font-black text-[#D946EF] tracking-widest uppercase">BOLA DE NIEVE // MOTOR TÁCTICO</span>
                <span className="text-white font-serif text-sm font-bold uppercase tracking-wide">{debtForSnowball.nombre}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-white/5 border border-white/5 p-4 rounded-2xl">
              <div className="flex flex-col">
                <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">Saldo Pendiente</span>
                <span className="text-white text-sm font-bold mt-0.5 font-contable">{formatMoney(debtForSnowball.saldoPendiente)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">Cuota Mínima</span>
                <span className="text-[#D946EF] text-sm font-bold mt-0.5 font-contable">{formatMoney(debtForSnowball.cuotaMensual)}</span>
              </div>
            </div>

            <div className="p-4 bg-[#D946EF]/5 border border-[#D946EF]/20 rounded-2xl space-y-2">
              <span className="text-[9px] font-mono font-black text-[#D946EF] uppercase tracking-wider flex items-center gap-1"><Sparkles className="w-4 h-4" /> GATILLO DE EXTINCIÓN AUTOMÁTICO</span>
              <p className="text-[9px] text-slate-300 leading-relaxed uppercase">Al extinguirse este saldo, la cuota de {formatMoney(debtForSnowball.cuotaMensual)} se consolida en el presupuesto como "Dinero Comprometido" y ataca automáticamente el siguiente pasivo de mayor daño.</p>
            </div>

            <div className="space-y-2.5">
              <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">// TIEMPO DE EXPANSIÓN</span>
              <div className="flex justify-between items-center text-xs p-3 bg-black/30 border border-white/5 rounded-xl">
                <span className="text-slate-300 uppercase">Amortización Ordinaria:</span>
                <span className="text-white font-bold">18 Meses</span>
              </div>
              <div className="flex justify-between items-center text-xs p-3 bg-[#D946EF]/10 border border-[#D946EF]/20 rounded-xl">
                <span className="text-white font-bold uppercase">Con Aceleración Bola de Nieve:</span>
                <span className="text-[#D946EF] font-black font-mono">11 Meses</span>
              </div>
            </div>

            <button 
              onClick={() => {
                setScanNotification("Plan Bola de Nieve inyectado");
                setDebtForSnowball(null);
                setTimeout(() => setScanNotification(null), 3000);
              }}
              className="w-full py-3 bg-[#D946EF] text-black font-sans font-black text-[10px] tracking-wider uppercase rounded-xl hover:scale-105 transition-all cursor-pointer"
            >
              Inyectar Plan de Aceleración
            </button>
          </div>
        </div>
      )}

      {/* Toast de notificaciones de OCR */}
      {scanNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#112B3C]/95 backdrop-blur-xl border border-[#06B6D4]/20 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4 duration-300">
          <div className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-pulse" />
          <span className="text-[9px] font-mono tracking-wider text-white uppercase">{scanNotification}</span>
        </div>
      )}

      {/* Modal de factura OCR interceptada */}
      {facturaEncontradaGlobal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#112B3C] border border-[#06B6D4]/20 rounded-3xl p-5 max-w-[280px] w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 text-center">
            <h3 className="text-white text-xs font-serif uppercase tracking-wider mb-2 flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#06B6D4]" /> Factura Encontrada
            </h3>
            <p className="text-[7px] font-mono text-slate-400 uppercase tracking-widest mb-4">// DETECTOR GMAIL OCR</p>
            
            <div className="space-y-2 bg-black/40 border border-white/5 p-3 rounded-xl mb-4 text-[10px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-mono">PROVEEDOR:</span>
                <span className="text-white font-black uppercase">{facturaEncontradaGlobal.proveedor}</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/5 pt-1.5">
                <span className="text-[#F1C40F] font-black font-mono">TOTAL:</span>
                <span className="text-[#F1C40F] font-black font-mono font-contable">{formatMoney(facturaEncontradaGlobal.montoTotal)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setFacturaEncontradaGlobal(null)} className="flex-1 py-2 rounded-lg border border-white/10 text-white font-sans text-[8px] font-black uppercase tracking-widest hover:bg-white/5">Ignorar</button>
              <button onClick={handleIntegrarFacturaGlobal} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] text-white font-sans text-[8px] font-black uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95">Integrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Copiloto Estratégico IA */}
      <CopilotoEstrategico 
        contexto={{
          ingresos: totalIngresosLiquidez,
          gastos: gastoAcumulado,
          excedente: cajaRealTotal,
          deuda: deudas.reduce((acc, d) => acc + d.saldoPendiente, 0)
        }}
        gastoSospechoso={gastoSospechoso}
        hideFloatingButton={true}
      />
    </>
  );
};
