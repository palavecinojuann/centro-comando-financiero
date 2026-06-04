// ControlCentral.tsx - Orquestador Maestro Premium Restaurado // BÚNKER
import React, { useState, useMemo, useEffect } from 'react';
import { FinancialEngine, EstadoFinanciero, Gasto, DeudaAvanzada } from '../services/motores/FinancialEngine';
import { db, auth } from '../firebase';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { DashboardFinanciero } from './DashboardFinanciero';
import { OptimizadorPasivos } from './OptimizadorPasivos';
import { TerminalWebhooks } from './TerminalWebhooks';
import { AnalisisFlujos } from './AnalisisFlujos';
import { ProyeccionBoveda } from './ProyeccionBoveda';
import { ConfiguracionBunker } from './ConfiguracionBunker';
import { LibroDiario } from './LibroDiario';
import { ModalOperacion } from './ModalOperacion';
import { RadarFacturasService, FacturaDetectada } from '../services/RadarFacturasService';
import { Zap, Plus, RefreshCw, Bot, Check, AlertCircle, Loader2, Sparkles } from 'lucide-react';


import { PanelEstrategiasComparativas } from './PanelEstrategiasComparativas';
import { Inicio } from './Inicio';
import { VistaHoy } from './VistaHoy';
import { VistaSaldo } from './VistaSaldo';
import { VistaPresupuesto } from './VistaPresupuesto';
import { VistaInformes } from './VistaInformes';

// Importar los tres Simuladores requeridos
import { SimuladorExtincionDeudas } from './SimuladorExtincionDeudas';
import { SimuladorExcedentes } from './SimuladorExcedentes';
import { SimuladorWhatIf } from './SimuladorWhatIf';
import { useMotorIntegral } from '../services/motores/MotorIntegral';
import { CopilotoEstrategico } from './CopilotoEstrategico';
import { AuditorCognitivo } from '../services/motores/AuditorCognitivo';

type PilarBunker = 'OPERATIVO' | 'ESTABILIDAD' | 'EXTINCION' | 'PROYECCION';
type SubPilarOperativo = 'INICIO' | 'LIBRO_DIARIO';
type SubPilarEstabilidad = 'TABLERO' | 'CAUDALES' | 'ALERTAS';
type SubPilarExtincion = 'SIMULADOR' | 'OPTIMIZADOR' | 'COMPARATIVAS';
type SubPilarProyeccion = 'WHAT_IF' | 'BOVEDA' | 'CONFIGURACION';

const SectionHeader: React.FC<{ subtitle: string; title: string }> = ({ subtitle, title }) => (
  <header className="flex flex-col px-6 pt-10 pb-6 relative z-10 select-none animate-in fade-in duration-300">
    <div className="flex flex-col">
      <span className="text-bunker-limon text-xs font-black uppercase tracking-[0.3em] font-sans">{subtitle} // BÚNKER</span>
      <span className="text-bunker-texto text-4xl md:text-5xl font-black tracking-tight mt-1.5 font-sans uppercase">{title}</span>
    </div>
  </header>
);

type PestanaBunker = 'HOY' | 'SALDO' | 'PRESUPUESTO' | 'INFORMES' | 'MAS';

export const ControlCentral: React.FC = () => {
  const [pestanaActiva, setPestanaActiva] = useState<PestanaBunker>('HOY');
  const [pilarActivo, setPilarActivo] = useState<PilarBunker>('OPERATIVO');
  const [subPilarOperativo, setSubPilarOperativo] = useState<SubPilarOperativo>('LIBRO_DIARIO');
  const [subPilarEstabilidad, setSubPilarEstabilidad] = useState<SubPilarEstabilidad>('TABLERO');
  const [subPilarExtincion, setSubPilarExtincion] = useState<SubPilarExtincion>('SIMULADOR');
  const [subPilarProyeccion, setSubPilarProyeccion] = useState<SubPilarProyeccion>('WHAT_IF');
  
  // Parámetros e Historiales (Sincronizados con tu motor local)
  const [ingresoBimont, setIngresoBimont] = useState<number>(0);
  const [factorInflacion, setFactorInflacion] = useState<number>(1.06);
  const [diaDelMes, setDiaDelMes] = useState<number>(new Date().getDate());
  const [gastoAcumulado, setGastoAcumulado] = useState<number>(0);

  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [janluRecords, setJanluRecords] = useState<any[]>([]);
  const [deudasFirestore, setDeudasFirestore] = useState<any[]>([]);
  const [ingresosTotales, setIngresosTotales] = useState<any[]>([]);

  const [deudas, setDeudas] = useState<DeudaAvanzada[]>([]);

  // Sincronización con Firestore
  useEffect(() => {
    const ID_HOGAR = "hogar_bimont_central";
    const hoy = new Date();
    const esteMes = hoy.getMonth();
    const esteAnio = hoy.getFullYear();
    
    // 1. Listen to Gastos
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
          nivel: data.categoriaMacro === 'COMPROMISOS_INDISPENSABLES' ? 1 : 5,
          esEstacional: data.recurrente || false,
          fecha: fecha,
          categoria: data.categoria,
          categoriaMacro: data.categoriaMacro
        } as Gasto;
      });
      
      setGastos(g);
      
      // Acumulado del mes actual (Gastos + Deudas que representen egreso)
      const acumulado = g.reduce((total, x) => {
        const f = new Date(x.fecha || '');
        if (f.getMonth() === esteMes && f.getFullYear() === esteAnio) {
          return total + x.monto;
        }
        return total;
      }, 0);
      
      // Sumar deudas del mes actual que no estén en la lista de gastos
      const deudasActualRes = deudasFirestore.reduce((acc, d) => {
        let f: Date | null = null;
        if (d.fechaVencimiento?.toDate) f = d.fechaVencimiento.toDate();
        else if (d.fechaVencimiento) f = new Date(d.fechaVencimiento);
        
        if (f && f.getMonth() === esteMes && f.getFullYear() === esteAnio) {
          return acc + (d.capitalOrig || d.montoTotal || d.saldoPendiente || 0);
        }
        return acc;
      }, 0);

      setGastoAcumulado(acumulado + deudasActualRes);
    });

    // 2. Listen to Ingresos
    const qIngresos = query(collection(db, `hogares/${ID_HOGAR}/ingresos_principales`), orderBy('fechaIngreso', 'desc'));
    const unsubIngresos = onSnapshot(qIngresos, (snap) => {
      const ing = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setIngresosTotales(ing);
      
      // Ingreso total del mes actual
      const totalMes = ing.reduce((acc, item: any) => {
        let f: Date | null = null;
        if (item.fechaIngreso?.toDate) f = item.fechaIngreso.toDate();
        else if (item.fechaIngreso) f = new Date(item.fechaIngreso);
        
        if (f && f.getMonth() === esteMes && f.getFullYear() === esteAnio) {
          return acc + (item.montoNeto || 0);
        }
        return acc;
      }, 0);

      // Si no hay ingresos cargados para este mes, usamos 0
      setIngresoBimont(totalMes);
    });

    // 3. Listen to Janlu
    const qJanlu = query(collection(db, `hogares/${ID_HOGAR}/janlu_bridge`), orderBy('fechaInyeccion', 'desc'));
    const unsubJanlu = onSnapshot(qJanlu, (snap) => {
      const j = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJanluRecords(j);
    });

    // 4. Listen to Debts
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

  // ⌨️ ATAJOS DE TECLADO GLOBALES PARA PC (BÚNKER OS ACCESIBILIDAD)
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

      if (key === 'n') {
        e.preventDefault();
        handleOpenNuevaOperacion();
      }

      if (key === 'c') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('toggle-copiloto'));
      }

      if (key === '1') {
        e.preventDefault();
        setPestanaActiva('HOY');
      } else if (key === '2') {
        e.preventDefault();
        setPestanaActiva('SALDO');
      } else if (key === '3') {
        e.preventDefault();
        setPestanaActiva('PRESUPUESTO');
      } else if (key === '4') {
        e.preventDefault();
        setPestanaActiva('INFORMES');
      } else if (key === '5') {
        e.preventDefault();
        setPestanaActiva('MAS');
      }

      if (e.key === 'Escape') {
        setIsModalOperacionOpen(false);
        setSidebarOpen(false);
        window.dispatchEvent(new CustomEvent('close-copiloto'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const gastosMesActual = useMemo(() => {
    const hoy = new Date();
    const esteMes = hoy.getMonth();
    const esteAnio = hoy.getFullYear();
    return gastos.filter(x => {
      const f = new Date(x.fecha || '');
      return f.getMonth() === esteMes && f.getFullYear() === esteAnio;
    });
  }, [gastos]);

  const ingresosMesActual = useMemo(() => {
    const hoy = new Date();
    const esteMes = hoy.getMonth();
    const esteAnio = hoy.getFullYear();
    return ingresosTotales.filter(item => {
      let f: Date | null = null;
      if (item.fechaIngreso?.toDate) f = item.fechaIngreso.toDate();
      else if (item.fechaIngreso) f = new Date(item.fechaIngreso);
      return f && f.getMonth() === esteMes && f.getFullYear() === esteAnio;
    });
  }, [ingresosTotales]);

  const janluMesActual = useMemo(() => {
    const hoy = new Date();
    const esteMes = hoy.getMonth();
    const esteAnio = hoy.getFullYear();
    return janluRecords.filter(item => {
      let f: Date | null = null;
      if (item.fechaInyeccion?.toDate) f = item.fechaInyeccion.toDate();
      else if (item.fechaInyeccion) f = new Date(item.fechaInyeccion);
      return f && f.getMonth() === esteMes && f.getFullYear() === esteAnio;
    });
  }, [janluRecords]);

  const totalIngresosLiquidez = useMemo(() => {
    const sumJanlu = janluMesActual.reduce((acc, item) => acc + (item.utilidad_neta || item.monto || 0), 0);
    return ingresoBimont + sumJanlu;
  }, [ingresoBimont, janluMesActual]);

  const totalCuotasDeudas = useMemo(() => {
    return deudas.reduce((acc, d) => acc + (d.cuotaMensual || 0), 0);
  }, [deudas]);

  const cajaRealTotal = useMemo(() => {
    const totalIngresos = ingresosTotales.reduce((acc, i) => acc + (i.montoNeto || 0), 0) + 
                          janluRecords.reduce((acc, j) => acc + (j.utilidad_neta || j.monto || 0), 0);
    
    const totalEgresos = gastos.reduce((acc, g) => acc + (g.monto || 0), 0) +
                         deudasFirestore.reduce((acc, d) => acc + (d.capitalOrig || d.montoTotal || d.saldoPendiente || 0), 0);

    return totalIngresos - totalEgresos;
  }, [ingresosTotales, janluRecords, gastos, deudasFirestore]);

  const sumJanluVal = useMemo(() => {
    const val = janluMesActual.reduce((acc, item) => acc + (item.utilidad_neta || item.monto || 0), 0);
    return val > 0 ? val : 350000;
  }, [janluMesActual]);

  const macroEstado: EstadoFinanciero = useMemo(() => ({
    ingresoBimont: ingresoBimont || 1400000, 
    excedenteJanlu: sumJanluVal,
    gastos: gastosMesActual, 
    deudas, 
    factorInflacionReal: factorInflacion, 
    diaDelMesActual: diaDelMes, 
    gastoAcumuladoAlDia: gastoAcumulado,
    ingresosPrincipales: ingresosMesActual,
    inyeccionesJanlu: janluMesActual,
    totalCuotasDeudas
  }), [ingresoBimont, sumJanluVal, gastosMesActual, deudas, factorInflacion, diaDelMes, gastoAcumulado, ingresosMesActual, janluMesActual, totalCuotasDeudas]);


  const puntoEstabilidad = useMemo(() => FinancialEngine.calcularPuntoDeEstabilidad(macroEstado), [macroEstado]);
  const meteo = useMemo(() => FinancialEngine.evaluarMeteoFinanciera(macroEstado), [macroEstado]);

  const costoSupervivenciaMensualCalculado = useMemo(() => {
    return gastosMesActual
      .filter(g => g.nivel === 1 || g.nivel === 2)
      .reduce((sum, g) => sum + (g.esEstacional && g.mesesProrrateo ? (g.monto / g.mesesProrrateo) : g.monto), 0) + totalCuotasDeudas;
  }, [gastosMesActual, totalCuotasDeudas]);

  const gastosVariablesCalculado = useMemo(() => {
    return gastosMesActual
      .filter(g => g.nivel !== 1 && g.nivel !== 2)
      .reduce((sum, g) => sum + g.monto, 0);
  }, [gastosMesActual]);

  const excedenteCalculado = useMemo(() => {
    return Math.max(0, totalIngresosLiquidez - (costoSupervivenciaMensualCalculado + gastosVariablesCalculado));
  }, [totalIngresosLiquidez, costoSupervivenciaMensualCalculado, gastosVariablesCalculado]);

  const transaccionesTotalesParaMotor = useMemo(() => {
    return [
      ...gastosMesActual.map(g => ({
        id: g.id,
        type: 'gasto' as const,
        montoTotal: g.monto,
        descripcion: g.descripcion,
        nivel: g.nivel as any,
        categoria: g.categoria,
        categoriaMacro: g.categoriaMacro as any,
        fechaGasto: g.fecha
      })),
      ...ingresosMesActual.map(i => ({
        id: i.id,
        type: 'ingreso' as const,
        montoNeto: i.montoNeto,
        fechaIngreso: i.fechaIngreso
      })),
      ...janluMesActual.map(j => ({
        id: j.id,
        type: 'janlu' as const,
        utilidad_neta: j.utilidad_neta || j.monto,
        fechaInyeccion: j.fechaInyeccion
      })),
      ...deudas.map(d => ({
        id: d.id,
        type: 'deuda' as const,
        nombreCompromiso: d.nombre,
        capitalOrig: d.saldoPendiente,
        cuotaMinima: d.cuotaMensual,
        interesPorcentual: d.tasaInteres,
        fechaVencimiento: d.fechaVencimiento
      }))
    ];
  }, [gastosMesActual, ingresosMesActual, janluMesActual, deudas]);

  const motorIntegral = useMotorIntegral(
    transaccionesTotalesParaMotor,
    ingresoBimont,
    sumJanluVal,
    Math.max(cajaRealTotal, 0)
  );

  const auditor = useMemo(() => new AuditorCognitivo(), []);

  const gastoSospechoso = useMemo(() => {
    const listado = [
      ...gastosMesActual.map(g => ({
        id: g.id,
        montoTotal: g.monto,
        categoria: g.categoria || 'Gasto General',
        referencia: g.descripcion,
        fechaGasto: g.fecha ? { toDate: () => new Date(g.fecha!) } : undefined
      })),
      ...deudas.map(d => ({
        id: d.id,
        montoTotal: d.saldoPendiente,
        categoria: 'Deuda',
        referencia: d.nombre,
        fechaRegistro: d.fechaVencimiento ? { toDate: () => new Date(d.fechaVencimiento!) } : undefined
      }))
    ];
    if (listado.length < 5) return undefined;
    try {
      const anomalias = auditor.ejecutarBosqueDeAislamiento(listado);
      return anomalias.length > 0 ? anomalias[0] : undefined;
    } catch (err) {
      console.error("Error al ejecutar Isolation Forest:", err);
      return undefined;
    }
  }, [gastosMesActual, deudas, auditor]);


  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isModalOperacionOpen, setIsModalOperacionOpen] = useState(false);
  const [transaccionAEditar, setTransaccionAEditar] = useState<any>(null);

  // ⚡ HUB DE ACCIONES RÁPIDAS (ACCESIBILIDAD GLOBAL v3.7)
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const [isGlobalScanningFacturas, setIsGlobalScanningFacturas] = useState(false);
  const [facturaEncontradaGlobal, setFacturaEncontradaGlobal] = useState<FacturaDetectada | null>(null);
  const [scanNotification, setScanNotification] = useState<string | null>(null);

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
    } catch (err: any) {
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
    } catch (err) {
      setScanNotification("Error al integrar factura.");
      setTimeout(() => setScanNotification(null), 3000);
    }
  };

  const handleOpenNuevaOperacion = () => {
    setTransaccionAEditar(null);
    setIsModalOperacionOpen(true);
  };

  const handleEditOperacion = (id: string, type: string) => {
    if (type === 'gasto') {
      const g = gastos.find(x => x.id === id);
      if (g) {
        setTransaccionAEditar({
          id: g.id,
          type: 'gasto',
          montoTotal: g.monto,
          categoria: g.categoria || 'Gasto Vital',
          referencia: g.descripcion,
          categoriaMacro: g.categoriaMacro || (g.nivel && g.nivel <= 2 ? 'COMPROMISOS_INDISPENSABLES' : 'GASTOS_VARIABLES'),
          nivel: g.nivel,
          fechaGasto: g.fecha ? new Date(g.fecha) : new Date()
        });
        setIsModalOperacionOpen(true);
      }
    } else if (type === 'ingreso') {
       const item = ingresosTotales.find(x => x.id === id);
       if (item) {
         setTransaccionAEditar({
           ...item,
           type: 'ingreso'
         });
         setIsModalOperacionOpen(true);
       }
    } else if (type === 'janlu') {
       const item = janluRecords.find(x => x.id === id);
       if (item) {
         setTransaccionAEditar({
           ...item,
           type: 'janlu'
         });
         setIsModalOperacionOpen(true);
       }
    } else if (type === 'deuda') {
       const item = deudasFirestore.find(x => x.id === id);
       if (item) {
         setTransaccionAEditar({
           ...item,
           type: 'deuda'
         });
         setIsModalOperacionOpen(true);
       }
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-bunker-bg text-bunker-texto font-sans overflow-x-hidden md:overflow-hidden select-none antialiased relative p-2 md:p-4 gap-2 md:gap-4">
      
      {/* 🌌 ILUMINACIÓN HOLOGRÁFICA LEMON */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-bunker-limonDim blur-[150px]" />
      </div>
 
      {/* 📱 PORTAL / TOP BAR INTERACTIVO PARA MÓVILES */}
      <div className="md:hidden flex items-center justify-between bg-bunker-panel/90 border border-white/5 p-3.5 relative z-30 w-full shadow-lg backdrop-blur-md rounded-2xl">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-2 border border-white/5 bg-black/40 hover:bg-white/5 active:scale-95 text-bunker-limon flex items-center justify-center transition-all focus:outline-none rounded-xl"
          title="Abrir Menú"
        >
          <svg className="w-5 h-5 text-bunker-limon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        <span className="font-serif text-sm tracking-[0.2em] font-black text-white uppercase">
          Equilibra<span className="text-bunker-limon">.</span>
        </span>
        <div className="px-2 py-1 border border-bunker-limon/30 bg-black/50 text-[8px] text-bunker-limon font-mono tracking-widest font-black uppercase rounded-lg">
          LEMON OS
        </div>
      </div>
 
      {/* 🌫️ BACKDROP OSCURO DE SEGURIDAD PARA MÓVILES */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
 
      {/* 🧭 PANEL LATERAL DE NAVEGACIÓN DUAL */}
      <aside className={`
        fixed inset-y-4 left-4 z-50 w-72 bg-bunker-panel border border-white/5 backdrop-blur-3xl p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out
        md:sticky md:top-4 md:translate-x-0 md:bg-bunker-panel/50 md:h-[calc(100vh-2rem)] md:rounded-3xl md:z-20 shrink-0 shadow-2xl md:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-[110%] md:translate-x-0'}
      `}>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="font-serif text-2xl tracking-[0.05em] text-white font-black uppercase leading-tight">
              Equilibra<span className="text-bunker-limon">.</span>
            </h1>
            {/* Botón de cierre para móviles */}
            <button 
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-2 border border-white/5 hover:bg-white/10 text-bunker-mutado hover:text-white transition-all uppercase text-[8px] font-mono tracking-widest rounded-xl"
              title="Cerrar Menú"
            >
              [X]
            </button>
          </div>
 
          {/* Menú de Botoneras con Transición Dinámica */}
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[60vh] md:max-h-none pr-1 custom-scrollbar">
            <p className="text-[9px] font-mono tracking-widest uppercase text-bunker-limon/80 font-black mb-2 px-2">// PILARES DE CONTROL</p>
            {[
              { id: 'HOY', nombre: 'HOY', icono: '📅' },
              { id: 'SALDO', nombre: 'SALDO', icono: '💳' },
              { id: 'PRESUPUESTO', nombre: 'PRESUPUESTO', icono: '📊' },
              { id: 'INFORMES', nombre: 'INFORMES', icono: '🍩' },
              { id: 'MAS', nombre: 'MÁS', icono: '⚙️' }
            ].map((pestaña) => (
              <button
                key={pestaña.id}
                onClick={() => {
                  setPestanaActiva(pestaña.id as PestanaBunker);
                  setSidebarOpen(false); // Cierre automático al seleccionar en móvil
                }}
                className={`w-full text-left px-4 py-3 text-[10px] font-sans font-black tracking-[0.18em] uppercase transition-all duration-300 rounded-2xl relative ${
                  pestanaActiva === pestaña.id 
                    ? 'bg-bunker-panel text-bunker-limon border border-bunker-limon/20 shadow-[0_4px_25px_rgba(0,229,255,0.15)] translate-x-1' 
                    : 'text-bunker-mutado hover:text-white hover:bg-white/5 hover:translate-x-1'
                }`}
              >
                {pestanaActiva === pestaña.id && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/4 bg-bunker-limon rounded-r-md shadow-[0_0_8px_#00E5FF]" />
                )}
                <span className={`pl-1 ${pestanaActiva === pestaña.id ? 'text-bunker-limon' : ''}`}>
                  {pestaña.icono} &nbsp; {pestaña.nombre}
                </span>
              </button>
            ))}
          </div>
        </div>
 
        <div className="font-mono text-[8px] text-bunker-mutado tracking-widest border-t border-white/5 pt-4">
          <p>[ BÚNKER OS v3.5 ]</p>
          <p className="uppercase mt-1 text-bunker-limon font-black">SISTEMA LEMON BI-FLUJO</p>
        </div>
      </aside>

      {/* 📊 SECTOR DE RENDERIZADO INTERACTIVO */}
      <main className="flex-1 max-h-screen md:h-[calc(100vh-2rem)] overflow-y-auto bg-transparent relative z-10 px-1 sm:px-6 lg:px-8 mt-2 md:mt-0">
        <div className="max-w-5xl mx-auto w-full py-2">
          
          {/* RENDERIZADO CONDICIONAL DE PESTAÑAS (FIELES A LA REFERENCIA) */}
          
          {pestanaActiva === 'HOY' && (
            <VistaHoy 
              operaciones={[
                ...gastos.map(g => ({ ...g, type: 'gasto' as const, fecha: g.fecha || new Date().toISOString(), concepto: g.descripcion, categoria: g.categoria || 'Gasto' })),
                ...ingresosTotales.map(i => ({ ...i, type: 'ingreso' as const, fecha: i.fechaIngreso || new Date().toISOString(), concepto: 'Sueldo', categoria: 'Ingreso', monto: i.montoNeto || 0 })),
                ...janluRecords.map(j => ({ ...j, type: 'janlu' as const, fecha: j.fechaInyeccion || new Date().toISOString(), concepto: 'Inyección Janlu', categoria: 'Janlu', monto: j.utilidad_neta || j.monto || 0 })),
                ...deudasFirestore.map(d => ({ ...d, type: 'deuda' as const, fecha: d.fechaVencimiento || new Date().toISOString(), concepto: d.nombre || 'Deuda', categoria: 'Deuda', monto: d.saldoPendiente || 0 }))
              ]} 
              onOpenCargar={handleOpenNuevaOperacion} 
              onEditTransaction={handleEditOperacion} 
            />
          )}

          {pestanaActiva === 'SALDO' && (
            <VistaSaldo 
              cajaRealTotal={cajaRealTotal} 
              totalCuotasDeudas={totalCuotasDeudas} 
              deudas={deudas} 
            />
          )}

          {pestanaActiva === 'PRESUPUESTO' && (
            <VistaPresupuesto 
              gastos={gastosMesActual} 
              ingresosBimont={ingresoBimont} 
              janluMesActual={janluMesActual.reduce((acc, item) => acc + (item.utilidad_neta || item.monto || 0), 0) || sumJanluVal} 
            />
          )}

          {pestanaActiva === 'INFORMES' && (
            <VistaInformes 
              gastos={gastos} 
            />
          )}

          {pestanaActiva === 'MAS' && (
            <>
              {/* 🎛️ SELECTOR DE SUB-PILAR CONTEXTUAL (SWITCHER TÁCTICO) */}
              <div className="mb-6 bg-bunker-panel/40 border border-white/5 p-2 rounded-2xl backdrop-blur-xl flex flex-wrap gap-2 select-none relative z-20">
                {pilarActivo === 'OPERATIVO' && (
                  <>
                    <button
                      onClick={() => setSubPilarOperativo('LIBRO_DIARIO')}
                      className={`px-4 py-2 text-[9px] font-mono tracking-widest font-black uppercase rounded-xl transition-all cursor-pointer ${
                        subPilarOperativo === 'LIBRO_DIARIO' 
                          ? 'bg-bunker-limon text-black shadow-[0_0_15px_rgba(0,229,255,0.4)] font-bold' 
                          : 'text-bunker-mutado hover:text-white'
                      }`}
                    >
                      📖 Libro Diario
                    </button>
                  </>
                )}

                {pilarActivo === 'ESTABILIDAD' && (
                  <>
                    <button
                      onClick={() => setSubPilarEstabilidad('TABLERO')}
                      className={`px-4 py-2 text-[9px] font-mono tracking-widest font-black uppercase rounded-xl transition-all cursor-pointer ${
                        subPilarEstabilidad === 'TABLERO' 
                          ? 'bg-bunker-limon text-black shadow-[0_0_15px_rgba(0,229,255,0.4)] font-bold' 
                          : 'text-bunker-mutado hover:text-white'
                      }`}
                    >
                      🧠 Diagnóstico C.L.
                    </button>
                    <button
                      onClick={() => setSubPilarEstabilidad('CAUDALES')}
                      className={`px-4 py-2 text-[9px] font-mono tracking-widest font-black uppercase rounded-xl transition-all cursor-pointer ${
                        subPilarEstabilidad === 'CAUDALES' 
                          ? 'bg-bunker-limon text-black shadow-[0_0_15px_rgba(0,229,255,0.4)] font-bold' 
                          : 'text-bunker-mutado hover:text-white'
                      }`}
                    >
                      🌊 Caudales (Sankey)
                    </button>
                    <button
                      onClick={() => setSubPilarEstabilidad('ALERTAS')}
                      className={`px-4 py-2 text-[9px] font-mono tracking-widest font-black uppercase rounded-xl transition-all cursor-pointer ${
                        subPilarEstabilidad === 'ALERTAS' 
                          ? 'bg-bunker-limon text-black shadow-[0_0_15px_rgba(0,229,255,0.4)]' 
                          : 'text-bunker-mutado hover:text-white'
                      }`}
                    >
                      📟 Logger de Alertas
                    </button>
                  </>
                )}

                {pilarActivo === 'EXTINCION' && (
                  <>
                    <button
                      onClick={() => setSubPilarExtincion('SIMULADOR')}
                      className={`px-4 py-2 text-[9px] font-mono tracking-widest font-black uppercase rounded-xl transition-all cursor-pointer ${
                        subPilarExtincion === 'SIMULADOR' 
                          ? 'bg-bunker-limon text-black shadow-[0_0_15px_rgba(0,229,255,0.4)] font-bold' 
                          : 'text-bunker-mutado hover:text-white'
                      }`}
                    >
                      ❄️ Plan Amortización
                    </button>
                    <button
                      onClick={() => setSubPilarExtincion('OPTIMIZADOR')}
                      className={`px-4 py-2 text-[9px] font-mono tracking-widest font-black uppercase rounded-xl transition-all cursor-pointer ${
                        subPilarExtincion === 'OPTIMIZADOR' 
                          ? 'bg-bunker-limon text-black shadow-[0_0_15px_rgba(0,229,255,0.4)] font-bold' 
                          : 'text-bunker-mutado hover:text-white'
                      }`}
                    >
                      🌀 Optimizador Pasivos
                    </button>
                    <button
                      onClick={() => setSubPilarExtincion('COMPARATIVAS')}
                      className={`px-4 py-2 text-[9px] font-mono tracking-widest font-black uppercase rounded-xl transition-all cursor-pointer ${
                        subPilarExtincion === 'COMPARATIVAS' 
                          ? 'bg-bunker-limon text-black shadow-[0_0_15px_rgba(0,229,255,0.4)] font-bold' 
                          : 'text-bunker-mutado hover:text-white'
                      }`}
                    >
                      ⚖️ Comparativa Táctica
                    </button>
                  </>
                )}

                {pilarActivo === 'PROYECCION' && (
                  <>
                    <button
                      onClick={() => setSubPilarProyeccion('WHAT_IF')}
                      className={`px-4 py-2 text-[9px] font-mono tracking-widest font-black uppercase rounded-xl transition-all cursor-pointer ${
                        subPilarProyeccion === 'WHAT_IF' 
                          ? 'bg-bunker-limon text-black shadow-[0_0_15px_rgba(0,229,255,0.4)] font-bold' 
                          : 'text-bunker-mutado hover:text-white'
                      }`}
                    >
                      🔮 Escenarios What-If
                    </button>
                    <button
                      onClick={() => setSubPilarProyeccion('BOVEDA')}
                      className={`px-4 py-2 text-[9px] font-mono tracking-widest font-black uppercase rounded-xl transition-all cursor-pointer ${
                        subPilarProyeccion === 'BOVEDA' 
                          ? 'bg-bunker-limon text-black shadow-[0_0_15px_rgba(0,229,255,0.4)] font-bold' 
                          : 'text-bunker-mutado hover:text-white'
                      }`}
                    >
                      🛡️ Bóveda Blindada
                    </button>
                    <button
                      onClick={() => setSubPilarProyeccion('CONFIGURACION')}
                      className={`px-4 py-2 text-[9px] font-mono tracking-widest font-black uppercase rounded-xl transition-all cursor-pointer ${
                        subPilarProyeccion === 'CONFIGURACION' 
                          ? 'bg-bunker-limon text-black shadow-[0_0_15px_rgba(0,229,255,0.4)] font-bold' 
                          : 'text-bunker-mutado hover:text-white'
                      }`}
                    >
                      ⚙️ Parámetros Búnker
                    </button>
                  </>
                )}
              </div>

              {/* RENDERIZADO CONDICIONAL DE PILARES Y SUB-PILARES */}
          
          {/* PILAR OPERATIVO */}
          {pilarActivo === 'OPERATIVO' && subPilarOperativo === 'INICIO' && (
            <Inicio
              nombreUsuario="Operaciones"
              excedenteAFavor={cajaRealTotal}
              estadoMesAsegurado={puntoEstabilidad >= 100}
              transaccionesRecientes={gastos.slice(0, 5).map(g => ({
                id: g.id,
                comercio: g.descripcion,
                fecha: g.fecha ? new Date(g.fecha).toLocaleDateString() : 'HOY',
                hora: g.fecha ? new Date(g.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
                monto: g.monto,
                tipo: 'egreso' as const,
                realType: 'gasto'
              }))}
              transaccionesTotales={[
                ...gastos.map(g => ({ ...g, type: 'gasto' })),
                ...ingresosTotales.map(i => ({ ...i, type: 'ingreso' })),
                ...janluRecords.map(j => ({ ...j, type: 'janlu' })),
                ...deudasFirestore.map(d => ({ ...d, type: 'deuda' }))
              ]}
              onOpenEstrategia={() => {
                setPilarActivo('EXTINCION');
                setSubPilarExtincion('SIMULADOR');
                setSubSimuladorActivo('DEUDAS');
              }}
              onOpenCalendario={() => {
                setPilarActivo('OPERATIVO');
                setSubPilarOperativo('INICIO');
              }}
              onOpenReportes={() => {
                setPilarActivo('ESTABILIDAD');
                setSubPilarEstabilidad('CAUDALES');
              }}
              onOpenCargar={handleOpenNuevaOperacion}
              onVerTodo={() => {
                setPilarActivo('OPERATIVO');
                setSubPilarOperativo('LIBRO_DIARIO');
              }}
              onEditTransaction={handleEditOperacion}
            />
          )}

          {pilarActivo === 'OPERATIVO' && subPilarOperativo === 'LIBRO_DIARIO' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex justify-between items-end">
                <SectionHeader subtitle="Registro Civil de Transacciones" title="Libro Diario" />
                <button 
                  onClick={handleOpenNuevaOperacion}
                  className="mb-8 mr-6 bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] text-white px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all outline-none"
                >
                  + Nueva Registro
                </button>
              </div>
              
              <LibroDiario 
                operaciones={[
                  ...gastos.map(g => ({
                    ...g,
                    type: 'gasto' as const,
                    montoTotal: g.monto,
                    fechaGasto: g.fecha || new Date().toISOString(),
                    referencia: g.descripcion
                  })),
                  ...ingresosTotales.map(i => ({
                    ...i,
                    type: 'ingreso' as const
                  })),
                  ...janluRecords.map(j => ({
                    ...j,
                    type: 'janlu' as const
                  })),
                  ...deudasFirestore.map(d => ({
                    ...d,
                    type: 'deuda' as const
                  }))
                ]}
                onEdit={handleEditOperacion}
                onDelete={async (id, type) => {
                  const ID_HOGAR = "hogar_bimont_central";
                  let path = "";
                  if (type === 'gasto') path = `hogares/${ID_HOGAR}/gastos_vitales`;
                  if (type === 'ingreso') path = `hogares/${ID_HOGAR}/ingresos_principales`;
                  if (type === 'janlu') path = `hogares/${ID_HOGAR}/janlu_bridge`;
                  if (type === 'deuda') path = `hogares/${ID_HOGAR}/debts`;
                  
                  if (path && confirm('¿Confirmas la eliminación definitiva de esta operación?')) {
                    try {
                      await deleteDoc(doc(db, path, id));
                    } catch (e) {
                      console.error("Error deleting doc", e);
                    }
                  }
                }}
              />
            </div>
          )}

          {/* PILAR RADAR DE ESTABILIDAD */}
          {pilarActivo === 'ESTABILIDAD' && subPilarEstabilidad === 'TABLERO' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <SectionHeader subtitle="Ecosistema Bi-Flujo" title="Consola de Control" />
              <DashboardFinanciero 
                macroEstado={macroEstado} 
                puntoEstabilidad={puntoEstabilidad} 
                meteo={meteo}
                alertasCL={motorIntegral.alertas.alertas}
                onGastoAdicionado={(nuevoGasto, nuevoAcumulado) => {
                  setGastos(prev => [nuevoGasto, ...prev]);
                  setGastoAcumulado(nuevoAcumulado);
                }}
                onOpenCargar={handleOpenNuevaOperacion}
                onOpenTriaje={() => {
                  setPilarActivo('EXTINCION');
                  setSubPilarExtincion('SIMULADOR');
                }}
                onOpenDeudas={() => {
                  setPilarActivo('EXTINCION');
                  setSubPilarExtincion('OPTIMIZADOR');
                }}
              />
            </div>
          )}

          {pilarActivo === 'ESTABILIDAD' && subPilarEstabilidad === 'CAUDALES' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <SectionHeader subtitle="Distribución y Nivel Crítico" title="Análisis de Flujos" />
              <AnalisisFlujos 
                gastos={gastosMesActual} 
                bimont={ingresoBimont}
                janlu={janluMesActual.reduce((acc, item) => acc + (item.utilidad_neta || item.monto || 0), 0) || sumJanluVal}
                vitales={costoSupervivenciaMensualCalculado}
                variables={gastosVariablesCalculado}
                excedente={excedenteCalculado}
              />
            </div>
          )}

          {pilarActivo === 'ESTABILIDAD' && subPilarEstabilidad === 'ALERTAS' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <SectionHeader subtitle="Terminal e Ingesta de Datos" title="Webhooks Integrales" />
              <TerminalWebhooks alertasCL={motorIntegral.alertas.alertas} />
            </div>
          )}

          {/* PILAR MOTOR DE EXTINCIÓN */}
          {pilarActivo === 'EXTINCION' && subPilarExtincion === 'SIMULADOR' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <SectionHeader subtitle="Modelos de Planificación" title="Simulación Táctica" />
              
              <div className="bg-bunker-panel border border-white/5 p-6 rounded-3xl backdrop-blur-md shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="font-sans text-lg text-white font-black tracking-widest uppercase mb-1">🖥️ SIMULACIÓN DE EXCEDENTES Y AMORTIZACIÓN</h2>
                  <p className="text-[9px] font-mono text-bunker-mutado uppercase tracking-widest">// MODELACIÓN DE FLUJOS EXCEDENTES Y PLANES DE AMORTIZACIÓN</p>
                </div>
                
                {/* Switcher simplificado para deudas y excedentes */}
                <div className="flex bg-black/60 p-1 border border-white/5 rounded-2xl font-mono text-[9px] w-full md:w-auto">
                  <button 
                    onClick={() => setSubSimuladorActivo('DEUDAS')}
                    className={`flex-1 md:flex-initial px-4 py-3 uppercase rounded-xl font-black transition-all cursor-pointer ${subSimuladorActivo === 'DEUDAS' ? 'bg-bunker-bg text-bunker-limon border border-bunker-limon/30 shadow-md' : 'text-bunker-mutado hover:text-slate-200'}`}
                  >
                    ❄️ BOLA DE NIEVE
                  </button>
                  <button 
                    onClick={() => setSubSimuladorActivo('EXCEDENTES')}
                    className={`flex-1 md:flex-initial px-4 py-3 uppercase rounded-xl font-black transition-all cursor-pointer ${subSimuladorActivo === 'EXCEDENTES' ? 'bg-bunker-bg text-bunker-limon border border-bunker-limon/30 shadow-md' : 'text-bunker-mutado hover:text-slate-200'}`}
                  >
                    📊 EXCEDENTES
                  </button>
                </div>
              </div>

              <div className="w-full">
                {subSimuladorActivo === 'DEUDAS' ? (
                  <SimuladorExtincionDeudas deudas={deudas} />
                ) : (
                  <SimuladorExcedentes excedenteBase={ingresoBimont - costoSupervivenciaMensualCalculado} />
                )}
              </div>
            </div>
          )}

          {pilarActivo === 'EXTINCION' && subPilarExtincion === 'OPTIMIZADOR' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <SectionHeader subtitle="Tratamiento de Deuda Avanzada" title="Extinción Pasivos" />
              <OptimizadorPasivos />
            </div>
          )}

          {pilarActivo === 'EXTINCION' && subPilarExtincion === 'COMPARATIVAS' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <SectionHeader subtitle="Modelos Estratégicos Comparativos" title="Estrategias Duales" />
              <PanelEstrategiasComparativas />
            </div>
          )}

          {/* PILAR PROYECCIÓN Y BLINDAJE */}
          {pilarActivo === 'PROYECCION' && subPilarProyeccion === 'WHAT_IF' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <SectionHeader subtitle="Modelos Estocásticos" title="Simulación Monte Carlo" />
              <SimuladorWhatIf puntoEstabilidad={puntoEstabilidad} />
            </div>
          )}

          {pilarActivo === 'PROYECCION' && subPilarProyeccion === 'BOVEDA' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <SectionHeader subtitle="Proyección Dinámica Indexada" title="Metas y Bóveda" />
              <ProyeccionBoveda costoSupervivenciaMensual={costoSupervivenciaMensualCalculado} />
            </div>
          )}

          {pilarActivo === 'PROYECCION' && subPilarProyeccion === 'CONFIGURACION' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <SectionHeader subtitle="Parámetros y Claves del Búnker" title="Configuración Búnker" />
              <ConfiguracionBunker 
                ingresoBimontActual={ingresoBimont}
                factorInflacionActual={factorInflacion}
                diaSimuladoActual={diaDelMes}
                onGuardarParametros={(ingreso, inflacion, dia) => {
                  setIngresoBimont(ingreso);
                  setFactorInflacion(inflacion);
                  setDiaDelMes(dia);
                }}
              />
            </div>
          )}

            </>
          )}
          
        </div>
      </main>

      {/* Modal de Operación Global */}
      <ModalOperacion 
        isOpen={isModalOperacionOpen}
        onClose={() => {
          setIsModalOperacionOpen(false);
          setTransaccionAEditar(null);
        }}
        transactionToEdit={transaccionAEditar}
      />

      {/* 🤖 Copiloto Estratégico IA */}
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

      {/* 📱 BARRA DE NAVEGACIÓN INFERIOR FIJA PARA MÓVILES (ESTILO PWA REFERENCIA) */}
      <div className="h-16 md:hidden pointer-events-none" /> {/* Espaciador para evitar solapamientos */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0C1A20]/90 backdrop-blur-xl border-t border-white/10 px-4 py-3 flex justify-around items-center shadow-lg">
        {[
          { id: 'HOY', nombre: 'Hoy', icono: '📅' },
          { id: 'SALDO', nombre: 'Saldo', icono: '💳' },
          { id: 'PRESUPUESTO', nombre: 'Presupuesto', icono: '📊' },
          { id: 'INFORMES', nombre: 'Informes', icono: '🍩' },
          { id: 'MAS', nombre: 'Más', icono: '⚙️' }
        ].map((pestaña) => (
          <button
            key={pestaña.id}
            onClick={() => setPestanaActiva(pestaña.id as PestanaBunker)}
            className="flex flex-col items-center gap-1 cursor-pointer focus:outline-none"
          >
            <span className="text-lg leading-none">{pestaña.icono}</span>
            <span className={`text-[8px] font-mono tracking-wider uppercase font-black ${
              pestanaActiva === pestaña.id ? 'text-[#00E5FF] font-bold' : 'text-bunker-mutado'
            }`}>
              {pestaña.nombre}
            </span>
          </button>
        ))}
      </nav>

      {/* ⚡ HUB DE ACCIONES RÁPIDAS FLOTANTE (GLOBAL QUICK-ACTION HUB v3.7) */}
      <div className="fixed bottom-20 right-6 md:bottom-6 md:right-6 z-40 flex flex-col items-end gap-3 select-none font-sans">
        {quickMenuOpen && (
          <div className="flex flex-col items-end gap-2.5 mb-2 animate-in fade-in slide-in-from-bottom-5 duration-200">
            {/* Punto Estabilidad Status Badge */}
            <div className="flex items-center gap-3 bg-black/80 backdrop-blur-md px-3.5 py-2 border border-[#00E5FF]/20 rounded-2xl shadow-xl">
              <span className="text-[8px] font-mono tracking-widest text-[#00E5FF] uppercase font-black">
                ESTABILIDAD: {puntoEstabilidad.toFixed(0)}%
              </span>
            </div>

            {/* Acción 1: Registrar Operación */}
            <button
              onClick={() => {
                handleOpenNuevaOperacion();
                setQuickMenuOpen(false);
              }}
              className="flex items-center gap-3 bg-[#132730] border border-white/10 text-white hover:border-[#00E5FF]/30 p-3.5 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer group"
            >
              <span className="text-[9px] font-mono tracking-widest text-bunker-mutado group-hover:text-white uppercase font-black">Registrar Operación</span>
              <div className="w-8 h-8 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center border border-[#00E5FF]/20">
                <Plus className="w-4 h-4 text-[#00E5FF]" />
              </div>
            </button>

            {/* Acción 2: Barrer Gmail */}
            <button
              onClick={handleGlobalScan}
              disabled={isGlobalScanningFacturas}
              className="flex items-center gap-3 bg-[#132730] border border-white/10 text-white hover:border-[#00E5FF]/30 p-3.5 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer group disabled:opacity-50"
            >
              <span className="text-[9px] font-mono tracking-widest text-bunker-mutado group-hover:text-white uppercase font-black">Barrer Gmail (OCR)</span>
              <div className="w-8 h-8 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center border border-[#00E5FF]/20">
                <RefreshCw className={`w-4 h-4 text-[#00E5FF] ${isGlobalScanningFacturas ? 'animate-spin' : ''}`} />
              </div>
            </button>

            {/* Acción 3: Copiloto IA */}
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('toggle-copiloto'));
                setQuickMenuOpen(false);
              }}
              className="flex items-center gap-3 bg-[#132730] border border-white/10 text-white hover:border-[#FFD500]/30 p-3.5 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer group"
            >
              <span className="text-[9px] font-mono tracking-widest text-bunker-mutado group-hover:text-white uppercase font-black">Copiloto IA</span>
              <div className="w-8 h-8 rounded-xl bg-[#FFD500]/10 flex items-center justify-center border border-[#FFD500]/20">
                <Bot className="w-4 h-4 text-[#FFD500]" />
              </div>
            </button>
          </div>
        )}

        {/* Botón Disparador Principal (FAB) */}
        <button
          onClick={() => setQuickMenuOpen(!quickMenuOpen)}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 border cursor-pointer ${
            quickMenuOpen 
              ? 'bg-[#00E5FF] border-[#00E5FF]/50 text-black rotate-45 scale-105 shadow-[0_0_15px_rgba(0,229,255,0.4)]' 
              : 'bg-[#132730] border-white/10 text-[#00E5FF] hover:border-[#00E5FF]/40 hover:scale-105 active:scale-95'
          }`}
          title="Acciones Rápidas"
        >
          <Zap className="w-6 h-6" />
        </button>
      </div>

      {/* 🔔 TOAST DE NOTIFICACIONES DE ESCANEO */}
      {scanNotification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#132730]/90 backdrop-blur-xl border border-[#00E5FF]/20 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <div className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
          <span className="text-[10px] font-mono tracking-wider text-white uppercase">{scanNotification}</span>
        </div>
      )}

      {/* 🗳️ POPUP DE FACTURA DETECTADA */}
      {facturaEncontradaGlobal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#132730] border border-[#00E5FF]/20 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute top-[-20%] right-[-20%] w-[120px] h-[120px] rounded-full bg-[#00E5FF]/10 blur-xl animate-pulse" />
            <h3 className="text-white text-base font-serif uppercase tracking-wider mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#00E5FF]" /> Factura Interceptada
            </h3>
            <p className="text-[9px] font-mono text-bunker-mutado uppercase tracking-widest mb-4">// DETECTOR GMAIL OCR</p>
            
            <div className="space-y-3 bg-black/40 border border-white/5 p-4 rounded-2xl mb-6">
              <div className="flex justify-between items-center text-xs">
                <span className="text-bunker-mutado font-mono">PROVEEDOR:</span>
                <span className="text-white font-black uppercase">{facturaEncontradaGlobal.proveedor}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-bunker-mutado font-mono">VENCE EL:</span>
                <span className="text-white font-semibold font-mono">{facturaEncontradaGlobal.fechaVencimiento}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-white/5 pt-2">
                <span className="text-[#FFD500] font-black font-mono">TOTAL:</span>
                <span className="text-[#FFD500] text-sm font-black font-mono">
                  {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(facturaEncontradaGlobal.montoTotal)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setFacturaEncontradaGlobal(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white font-sans text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all cursor-pointer"
              >
                Ignorar
              </button>
              <button
                onClick={handleIntegrarFacturaGlobal}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-white font-sans text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                Integrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
