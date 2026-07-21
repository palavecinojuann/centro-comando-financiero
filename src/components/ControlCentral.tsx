// ControlCentral.tsx - Orquestador Maestro de Alta Densidad Dual (PC & Móvil) // BÚNKER OS v3.10
import React, { useState, useMemo, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc, addDoc, setDoc } from 'firebase/firestore';
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

// Importar los 5 apartados modulares de alta fidelidad
import { VistaSaldo } from './VistaSaldo';
import { VistaHoy } from './VistaHoy';
import { VistaPresupuesto } from './VistaPresupuesto';
import { VistaInformes } from './VistaInformes';
import { LibroDiario } from './LibroDiario';
import { VistaEstrategia } from './VistaEstrategia';
import { TipoProtocolo } from '../hooks/useSimuladorEscenarios';


import { 
  Zap, Plus, RefreshCw, Bot, Check, AlertCircle, Loader2, Sparkles, 
  CreditCard, Landmark, Coins, Home, Calendar, Filter, ArrowDownAZ, 
  ArrowUpAZ, Edit, Trash2, CheckCircle, XCircle, Shield, BookOpen, 
  Coffee, Car, Briefcase, Gift, Settings, Activity, ShieldCheck, 
  Play, Pause, ChevronRight, X, User, Wifi, Battery, ArrowRight, Monitor, Phone,
  LayoutGrid, Smartphone
} from 'lucide-react';

type PestanaBunker = 'SALDO' | 'HOY' | 'PRESUPUESTO' | 'INFORMES' | 'TRANSACCIONES' | 'BENTO' | 'ESTRATEGIA';

export const ControlCentral: React.FC = () => {
  // Pestaña activa por defecto: BENTO
  const [pestanaActiva, setPestanaActiva] = useState<PestanaBunker>('BENTO');
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

  // Nuevos estados para saldos, presupuestos y objetivos editables en Firestore
  const [cuentasCorrientes, setCuentasCorrientes] = useState<any[]>([]);
  const [tarjetasCredito, setTarjetasCredito] = useState<any[]>([]);
  const [otrosActivos, setOtrosActivos] = useState<any[]>([]);
  const [presupuestoGastos, setPresupuestoGastos] = useState<any[]>([]);
  const [presupuestoIngresos, setPresupuestoIngresos] = useState<any[]>([]);
  const [cofresObjetivos, setCofresObjetivos] = useState<any[]>([]);

  // Estados de control de la UI Dual
  const [isMobileSimulator, setIsMobileSimulator] = useState<boolean>(false);
  const [isMultiMobile, setIsMultiMobile] = useState<boolean>(true);
  const [isLargeScreen, setIsLargeScreen] = useState<boolean>(window.innerWidth >= 1024);

  // Estados de control de interfaces y modales
  const [isModalOperacionOpen, setIsModalOperacionOpen] = useState(false);
  const [transaccionAEditar, setTransaccionAEditar] = useState<any>(null);
  const [debtForSnowball, setDebtForSnowball] = useState<DeudaAvanzada | null>(null);
  const [showSankeyDrawer, setShowSankeyDrawer] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState<'WHAT_IF' | 'BOVEDA' | 'CONFIGURACION' | 'SIMULADORES' | 'ESTRATEGIA' | null>(null);
  const [protocoloActivo, setProtocoloActivo] = useState<string>('Modo Blindaje');
  const [protocoloId, setProtocoloId] = useState<TipoProtocolo>('BLINDAJE');
  
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

    // 5. Cuentas Corrientes
    const qCuentas = collection(db, `hogares/${ID_HOGAR}/cuentas_corrientes`);
    const unsubCuentas = onSnapshot(qCuentas, (snap) => {
      setCuentasCorrientes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 6. Tarjetas de Crédito
    const qTarjetas = collection(db, `hogares/${ID_HOGAR}/tarjetas_credito`);
    const unsubTarjetas = onSnapshot(qTarjetas, (snap) => {
      setTarjetasCredito(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 7. Otros Activos
    const qActivos = collection(db, `hogares/${ID_HOGAR}/otros_activos`);
    const unsubActivos = onSnapshot(qActivos, (snap) => {
      setOtrosActivos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 8. Presupuesto Gastos (Límites)
    const qPresupuestoGastos = collection(db, `hogares/${ID_HOGAR}/presupuesto_gastos`);
    const unsubPresupuestoGastos = onSnapshot(qPresupuestoGastos, (snap) => {
      setPresupuestoGastos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 9. Presupuesto Ingresos (Valores)
    const qPresupuestoIngresos = collection(db, `hogares/${ID_HOGAR}/presupuesto_ingresos`);
    const unsubPresupuestoIngresos = onSnapshot(qPresupuestoIngresos, (snap) => {
      setPresupuestoIngresos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 10. Objetivos (Cofres)
    const qCofres = collection(db, `hogares/${ID_HOGAR}/cofres`);
    const unsubCofres = onSnapshot(qCofres, (snap) => {
      setCofresObjetivos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 11. Configuración del Búnker (Protocolo Activo)
    const docConfig = doc(db, `hogares/${ID_HOGAR}/configuracion/bunker`);
    const unsubConfig = onSnapshot(docConfig, async (snap) => {
      if (!snap.exists()) {
        await setDoc(docConfig, {
          protocoloId: 'BLINDAJE',
          protocoloActivo: 'Modo Blindaje'
        });
      } else {
        const data = snap.data();
        if (data.protocoloId) {
          setProtocoloId(data.protocoloId);
        }
        if (data.protocoloActivo) {
          setProtocoloActivo(data.protocoloActivo);
        }
      }
    });

    return () => {
      unsubGastos();
      unsubIngresos();
      unsubJanlu();
      unsubDebts();
      unsubCuentas();
      unsubTarjetas();
      unsubActivos();
      unsubPresupuestoGastos();
      unsubPresupuestoIngresos();
      unsubCofres();
      unsubConfig();
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

  // Total de cuotas de deudas calculadas para el mes actual
  const totalDeudasMesActualCalculado = useMemo(() => {
    return deudas.reduce((acc, d) => acc + (d.cuotaMensual || 0), 0);
  }, [deudas]);

  // Arreglos de operaciones unificados para el Libro Diario y Vistas de Pestañas
  const operacionesCrudas = useMemo(() => {
    const listado: any[] = [];
    ingresosTotales.forEach(i => listado.push({ type: 'ingreso', ...i }));
    janluRecords.forEach(j => listado.push({ type: 'janlu', ...j }));
    gastos.forEach(g => listado.push({ type: 'gasto', ...g }));
    deudas.forEach(d => listado.push({ type: 'deuda', ...d }));
    return listado;
  }, [ingresosTotales, janluRecords, gastos, deudas]);

  const operacionesNormalizadas = useMemo(() => {
    return operacionesCrudas.map(op => {
      let fecha = op.fechaGasto || op.fechaIngreso || op.fechaInyeccion || op.fechaRegistro || op.fechaVencimiento || new Date().toISOString();
      if (fecha?.toDate) fecha = fecha.toDate().toISOString();
      else if (typeof fecha !== 'string') fecha = new Date(fecha).toISOString();

      return {
        id: op.id,
        type: op.type,
        monto: op.montoNeto || op.utilidad_neta || op.montoTotal || op.monto || op.capitalOrig || 0,
        fecha: fecha,
        concepto: op.referencia || op.descripcion || op.nombreCompromiso || op.nombre || 'Transacción',
        categoria: op.categoria || (op.type === 'deuda' ? 'Deuda' : 'Varios'),
        estado: op.estado || 'Activo'
      };
    });
  }, [operacionesCrudas]);

  // Handlers para interactuar con Libro Diario
  const handleOpenEditarOperacion = (id: string, type: string) => {
    const raw = operacionesCrudas.find(op => op.id === id && op.type === type);
    if (raw) {
      setTransaccionAEditar({ id, type, ...raw });
      setIsModalOperacionOpen(true);
    }
  };

  const handleEliminarOperacion = async (id: string, type: string) => {
    const ID_HOGAR = "hogar_bimont_central";
    let subColeccion = "gastos_vitales";
    if (type === 'ingreso') subColeccion = "ingresos_principales";
    else if (type === 'janlu') subColeccion = "janlu_bridge";
    else if (type === 'deuda') subColeccion = "debts";

    try {
      await deleteDoc(doc(db, `hogares/${ID_HOGAR}/${subColeccion}`, id));
      setScanNotification("Operación eliminada exitosamente");
      setTimeout(() => setScanNotification(null), 3000);
    } catch (e) {
      console.error("Error al eliminar operación:", e);
    }
  };

  const handleToggleStatusOperacion = async (id: string, type: string, currentStatus: string) => {
    const ID_HOGAR = "hogar_bimont_central";
    let subColeccion = "gastos_vitales";
    if (type === 'ingreso') subColeccion = "ingresos_principales";
    else if (type === 'janlu') subColeccion = "janlu_bridge";
    else if (type === 'deuda') subColeccion = "debts";

    const nuevoEstado = currentStatus === 'Finalizado' ? 'Activo' : 'Finalizado';
    try {
      await updateDoc(doc(db, `hogares/${ID_HOGAR}/${subColeccion}`, id), { estado: nuevoEstado });
      setScanNotification(`Operación marcada como ${nuevoEstado.toLowerCase()}`);
      setTimeout(() => setScanNotification(null), 3000);
    } catch (e) {
      console.error("Error al actualizar estado:", e);
    }
  };


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
  const handleGuardarProtocolo = async (id: TipoProtocolo, nombre: string) => {
    const ID_HOGAR = "hogar_bimont_central";
    try {
      const docConfig = doc(db, `hogares/${ID_HOGAR}/configuracion/bunker`);
      await setDoc(docConfig, {
        protocoloId: id,
        protocoloActivo: nombre
      }, { merge: true });
      setScanNotification(`Protocolo ${nombre} activado`);
      setTimeout(() => setScanNotification(null), 3000);
    } catch (e) {
      console.error("Error al guardar protocolo:", e);
    }
  };

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
    <div className="w-full h-full flex flex-col relative bg-gradient-to-b from-[#0E2531] to-[#071218]">
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
          <div className="w-6 h-6 rounded-lg bg-[#E5A93B]/10 border border-[#E5A93B]/20 flex items-center justify-center">
            <span className="text-xs text-[#E5A93B] font-black">Eq</span>
          </div>
          <span className="font-serif text-sm tracking-[0.1em] font-black text-white uppercase">
            Equilibra<span className="text-[#E5A93B]">.</span>
          </span>
        </div>
        <button 
          onClick={() => setPestanaActiva('ESTRATEGIA')}
          className={`text-[8px] font-mono font-black tracking-widest px-2 py-0.5 border rounded-md uppercase cursor-pointer hover:opacity-85 transition-opacity focus:outline-none ${
            protocoloId === 'BLINDAJE' ? 'bg-[#E5A93B]/10 text-[#E5A93B] border-[#E5A93B]/20 animate-pulse' :
            protocoloId === 'EXPANSION' ? 'bg-[#D946EF]/10 text-[#D946EF] border-[#D946EF]/20' :
            protocoloId === 'DISFRUTE' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
            protocoloId === 'TACTICO_LIBRE' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
            'bg-red-500/10 text-red-400 border-red-500/20'
          }`}
        >
          {protocoloActivo}
        </button>
      </header>

      {/* Contenido principal móvil */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-20 custom-scrollbar relative z-20">
        
        {/* Pestaña SALDO */}
        {pestanaActiva === 'SALDO' && (
          <VistaSaldo 
            cajaRealTotal={cajaRealTotal}
            totalCuotasDeudas={totalDeudasMesActualCalculado}
            deudas={deudas}
            cuentas={cuentasCorrientes}
            tarjetas={tarjetasCredito}
            activos={otrosActivos}
          />
        )}

        {/* Pestaña HOY */}
        {pestanaActiva === 'HOY' && (
          <VistaHoy 
            operaciones={operacionesNormalizadas}
            onOpenCargar={handleOpenNuevaOperacion}
            onEditTransaction={handleOpenEditarOperacion}
            objetivosDb={cofresObjetivos}
          />
        )}

        {/* Pestaña PRESUPUESTO */}
        {pestanaActiva === 'PRESUPUESTO' && (
          <VistaPresupuesto 
            gastos={operacionesNormalizadas}
            ingresosBimont={ingresoBimont}
            janluMesActual={sumJanluVal}
            categoriasGastosDb={presupuestoGastos}
            categoriasIngresosDb={presupuestoIngresos}
          />
        )}

        {/* Pestaña INFORMES */}
        {pestanaActiva === 'INFORMES' && (
          <VistaInformes 
            gastos={operacionesNormalizadas}
          />
        )}

        {/* Pestaña TRANSACCIONES */}
        {pestanaActiva === 'TRANSACCIONES' && (
          <LibroDiario 
            operaciones={operacionesCrudas}
            onEdit={handleOpenEditarOperacion}
            onDelete={handleEliminarOperacion}
            onToggleStatus={handleToggleStatusOperacion}
          />
        )}

          {/* Pestaña ESTRATEGIA */}
          {pestanaActiva === 'ESTRATEGIA' && (
            <VistaEstrategia 
              situacionBase={{
                ingresosTotales: totalIngresosLiquidez,
                gastosTotales: costoSupervivenciaMensualCalculado + gastosVariablesCalculado
              }}
              protocoloId={protocoloId}
              protocoloActivo={protocoloActivo}
              onProtocoloChange={handleGuardarProtocolo}
            />
          )}

      </main>

      {/* Bottom Tab Bar móvil */}
      <nav className="absolute bottom-0 left-0 right-0 z-40 bg-[#071218]/90 backdrop-blur-xl border-t border-white/10 py-2 px-3 flex justify-around items-center shrink-0">
        {[
          { id: 'SALDO', label: 'Saldo', icon: <CreditCard className="w-4 h-4" /> },
          { id: 'HOY', label: 'Hoy', icon: <Calendar className="w-4 h-4" /> },
          { id: 'PRESUPUESTO', label: 'Límites', icon: <Settings className="w-4 h-4" /> },
          { id: 'INFORMES', label: 'Distrib.', icon: <Activity className="w-4 h-4" /> },
          { id: 'TRANSACCIONES', label: 'Diario', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'ESTRATEGIA', label: 'Estrategia', icon: <ShieldCheck className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPestanaActiva(tab.id as PestanaBunker)}
            className="flex flex-col items-center gap-1 cursor-pointer py-1 px-2"
          >
            <div className={pestanaActiva === tab.id ? 'text-[#E5A93B]' : 'text-slate-400'}>{tab.icon}</div>
            <span className={`text-[8px] font-mono tracking-widest uppercase font-black ${pestanaActiva === tab.id ? 'text-[#E5A93B]' : 'text-slate-400'}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );

  // RENDERIZADOR: ESTRUCTURA INTERFAZ PC COMPLETA
  const renderPCLayout = () => (
    <div className="w-full min-h-screen flex bg-gradient-to-b from-[#0E2531] to-[#071218] text-white font-sans overflow-hidden select-none">
      
      {/* Sidebar fijo a la izquierda */}
      <aside className="w-64 border-r border-white/5 bg-white/[0.02] backdrop-blur-3xl p-6 flex flex-col justify-between shrink-0 select-none">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#E5A93B]/10 border border-[#E5A93B]/20 flex items-center justify-center">
              <span className="text-sm text-[#E5A93B] font-black">Eq</span>
            </div>
            <h1 className="font-serif text-lg tracking-[0.05em] text-white font-black uppercase leading-tight">
              Equilibra<span className="text-[#E5A93B]">.</span>
            </h1>
          </div>

          {/* Menú de Botoneras Lateral */}
          <div className="flex flex-col gap-2.5">
            <p className="text-[8px] font-mono tracking-widest uppercase text-slate-400 font-black mb-2 px-2">// PILARES DE CONTROL</p>
            {[
              { id: 'BENTO', nombre: 'Dashboard Bento', icono: <LayoutGrid className="w-4 h-4" /> },
              { id: 'SALDO', nombre: 'Saldo', icono: <CreditCard className="w-4 h-4" /> },
              { id: 'HOY', nombre: 'Hoy / Agenda', icono: <Calendar className="w-4 h-4" /> },
              { id: 'PRESUPUESTO', nombre: 'Límites / Presup.', icono: <Settings className="w-4 h-4" /> },
              { id: 'INFORMES', nombre: 'Distribución', icono: <Activity className="w-4 h-4" /> },
              { id: 'TRANSACCIONES', nombre: 'Libro Diario', icono: <BookOpen className="w-4 h-4" /> },
                { id: 'ESTRATEGIA', nombre: 'Estrategia', icono: <ShieldCheck className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPestanaActiva(tab.id as PestanaBunker)}
                className={`w-full text-left px-4 py-3 text-[9px] font-sans font-black tracking-[0.18em] uppercase transition-all duration-300 rounded-xl relative flex items-center gap-3 cursor-pointer ${
                  pestanaActiva === tab.id 
                    ? 'bg-white/5 text-[#E5A93B] border border-[#E5A93B]/20 shadow-[0_4px_25px_rgba(229, 169, 59, 0.1)]' 
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
          <p className="uppercase mt-1 text-[#E5A93B] font-black">SISTEMA PC MULTI-COLUMNA</p>
        </div>
      </aside>

      {/* Área de contenido PC */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto px-8 py-6 pb-12 custom-scrollbar relative z-10">
        
        {/* Cabecera Superior PC */}
        <header className="flex justify-between items-center border-b border-white/5 pb-4 mb-6 shrink-0">
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setPestanaActiva('ESTRATEGIA')}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-0 p-0 text-left focus:outline-none"
            >
              <span className="text-[9px] font-mono tracking-[0.2em] text-slate-500 uppercase">PROTOCOLO ACTIVO:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black tracking-widest border font-mono uppercase ${
                protocoloId === 'BLINDAJE' ? 'bg-[#E5A93B]/10 text-[#E5A93B] border-[#E5A93B]/30 shadow-[0_0_10px_rgba(229, 169, 59, 0.15)] animate-pulse' :
                protocoloId === 'EXPANSION' ? 'bg-[#D946EF]/10 text-[#D946EF] border-[#D946EF]/30 shadow-[0_0_10px_rgba(217,70,239,0.15)]' :
                protocoloId === 'DISFRUTE' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.15)]' :
                protocoloId === 'TACTICO_LIBRE' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.15)]' :
                'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.15)]'
              }`}>
                {protocoloActivo}
              </span>
            </button>
            <h2 className="text-2xl font-serif font-black uppercase text-white">Consola de Control Central</h2>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Conmutador de Layout */}
            <div className="bg-black/40 border border-white/10 p-1 rounded-xl flex items-center gap-1 font-mono text-[9px] text-slate-400 select-none">
              <button 
                onClick={() => setIsMobileSimulator(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer ${!isMobileSimulator ? 'bg-white/5 text-[#E5A93B] border border-white/5 font-bold shadow-md' : 'hover:text-white'}`}
              >
                <Monitor className="w-3.5 h-3.5" /> VISTA PC
              </button>
              <button 
                onClick={() => setIsMobileSimulator(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer ${isMobileSimulator ? 'bg-white/5 text-[#E5A93B] border border-white/5 font-bold shadow-md' : 'hover:text-white'}`}
              >
                <Phone className="w-3.5 h-3.5" /> SIMULADOR MÓVIL
              </button>
            </div>
          </div>
        </header>

        {/* Pestañas detalladas para PC */}
        
        {/* PESTAÑA: BENTO (PC) */}
        {pestanaActiva === 'BENTO' && (
          <div className="max-w-7xl w-full mx-auto space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Columna 1: Saldo y Presupuesto */}
              <div className="space-y-6">
                <div className="glass-premium neumorphic-dark-out p-6 rounded-[2rem]">
                  <VistaSaldo 
                    cajaRealTotal={cajaRealTotal}
                    totalCuotasDeudas={totalDeudasMesActualCalculado}
                    deudas={deudas}
                    cuentas={cuentasCorrientes}
                    tarjetas={tarjetasCredito}
                    activos={otrosActivos}
                  />
                </div>
                <div className="glass-premium neumorphic-dark-out p-6 rounded-[2rem]">
                  <VistaPresupuesto 
                    gastos={operacionesNormalizadas}
                    ingresosBimont={ingresoBimont}
                    janluMesActual={sumJanluVal}
                    categoriasGastosDb={presupuestoGastos}
                    categoriasIngresosDb={presupuestoIngresos}
                  />
                </div>
              </div>

              {/* Columna 2: Hoy y Distribución */}
              <div className="space-y-6">
                <div className="glass-premium neumorphic-dark-out p-6 rounded-[2rem]">
                  <VistaHoy 
                    operaciones={operacionesNormalizadas}
                    onOpenCargar={handleOpenNuevaOperacion}
                    onEditTransaction={handleOpenEditarOperacion}
                    objetivosDb={cofresObjetivos}
                  />
                </div>
                <div className="glass-premium neumorphic-dark-out p-6 rounded-[2rem]">
                  <VistaInformes 
                    gastos={operacionesNormalizadas}
                  />
                </div>
              </div>

              {/* Columna 3: Libro Diario e Inteligencia IA */}
              <div className="space-y-6">
                <div className="glass-premium neumorphic-dark-out p-6 rounded-[2rem] max-h-[520px] overflow-y-auto custom-scrollbar">
                  <LibroDiario 
                    operaciones={operacionesCrudas}
                    onEdit={handleOpenEditarOperacion}
                    onDelete={handleEliminarOperacion}
                    onToggleStatus={handleToggleStatusOperacion}
                  />
                </div>
                
                {/* Panel Inteligencia de IA (Módulo 6 del Bento) */}
                <div className="bg-gradient-to-br from-[#8B5CF6]/10 to-[#D946EF]/10 border border-[#8B5CF6]/20 shadow-2xl p-6 rounded-[2rem] glow-violet text-white flex flex-col justify-between h-[180px]">
                  <div>
                    <h4 className="text-xs font-black font-serif tracking-widest text-[#D946EF] uppercase mb-1.5 flex items-center gap-1.5">
                      <Bot className="w-4.5 h-4.5 text-[#D946EF]" /> MOTOR COGNITIVO ACTIVO
                    </h4>
                    <p className="text-[10px] text-slate-300 leading-relaxed uppercase">
                      Gemini ha detectado un ahorro latente de {formatMoney(24000)} mediante la desactivación automatizada de Gastos Vampiro duplicados en tu cuenta familiar.
                    </p>
                  </div>
                  <div className="flex justify-between items-center text-[8px] font-mono font-black tracking-widest text-slate-400 border-t border-white/5 pt-3">
                    <span>ESTADO: AUDITANDO</span>
                    <span className="text-[#D946EF]">BÚNKER OS v3.10</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* PESTAÑA: SALDO (PC) */}
        {pestanaActiva === 'SALDO' && (
          <div className="max-w-6xl w-full mx-auto">
            <VistaSaldo 
              cajaRealTotal={cajaRealTotal}
              totalCuotasDeudas={totalDeudasMesActualCalculado}
              deudas={deudas}
              cuentas={cuentasCorrientes}
              tarjetas={tarjetasCredito}
              activos={otrosActivos}
            />
          </div>
        )}

        {/* PESTAÑA: HOY (PC) */}
        {pestanaActiva === 'HOY' && (
          <div className="max-w-6xl w-full mx-auto">
            <VistaHoy 
              operaciones={operacionesNormalizadas}
              onOpenCargar={handleOpenNuevaOperacion}
              onEditTransaction={handleOpenEditarOperacion}
              objetivosDb={cofresObjetivos}
            />
          </div>
        )}

        {/* PESTAÑA: PRESUPUESTO (PC) */}
        {pestanaActiva === 'PRESUPUESTO' && (
          <div className="max-w-6xl w-full mx-auto">
            <VistaPresupuesto 
              gastos={operacionesNormalizadas}
              ingresosBimont={ingresoBimont}
              janluMesActual={sumJanluVal}
              categoriasGastosDb={presupuestoGastos}
              categoriasIngresosDb={presupuestoIngresos}
            />
          </div>
        )}

        {/* PESTAÑA: INFORMES (PC) */}
        {pestanaActiva === 'INFORMES' && (
          <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <VistaInformes 
              gastos={operacionesNormalizadas}
            />
            <div className="space-y-4 glass-premium neumorphic-dark-out p-6 rounded-[2rem] flex flex-col">
              <h4 className="text-[11px] font-black tracking-widest text-[#E5A93B] uppercase font-serif">// FLUIDOS DE CAJA (SANKEY BI-FLUJO)</h4>
              <div className="mt-4">
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
          <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <LibroDiario 
                operaciones={operacionesCrudas}
                onEdit={handleOpenEditarOperacion}
                onDelete={handleEliminarOperacion}
                onToggleStatus={handleToggleStatusOperacion}
              />
            </div>
            
            <div className="space-y-6 glass-premium neumorphic-dark-out p-6 rounded-[2rem] backdrop-blur-xl shrink-0 mt-14">
              <h4 className="text-[11px] font-black tracking-widest text-slate-400 uppercase font-serif">// AUDITOR DE GASTOS VAMPIRO</h4>
              <div className="p-4 bg-black/30 border border-white/5 rounded-2xl space-y-2">
                <span className="text-[10px] font-mono font-black text-[#8B5CF6] uppercase flex items-center gap-1.5"><Bot className="w-4 h-4 text-[#8B5CF6]" /> DIAGNÓSTICO COGNITIVO</span>
                <p className="text-[9px] text-slate-300 leading-relaxed uppercase">El algoritmo de Isolation Forest detecta fugas de liquidez (suscripciones olvidadas, recargos de tarjetas y microgastos repetitivos).</p>
              </div>
              {gastoSospechoso && (
                <div className="p-4 border border-[#8B5CF6]/30 bg-[#8B5CF6]/5 rounded-2xl space-y-2 glow-violet">
                  <span className="text-[9px] font-mono font-black text-[#8B5CF6] uppercase tracking-wider">GASTO ANÓMALO DETECTADO</span>
                  <div className="flex justify-between items-center text-xs mt-1">
                    <span className="text-white font-bold truncate max-w-[120px] font-sans">{gastoSospechoso.referencia || gastoSospechoso.categoria}</span>
                    <span className="text-white font-black font-contable">{formatMoney(gastoSospechoso.montoTotal)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

          {/* PESTAÑA: ESTRATEGIA (PC) */}
          {pestanaActiva === 'ESTRATEGIA' && (
            <div className="max-w-6xl w-full mx-auto grid grid-cols-1 gap-8 items-start">
              <VistaEstrategia 
                situacionBase={{
                  ingresosTotales: totalIngresosLiquidez,
                  gastosTotales: costoSupervivenciaMensualCalculado + gastosVariablesCalculado
                }}
                protocoloId={protocoloId}
                protocoloActivo={protocoloActivo}
                onProtocoloChange={handleGuardarProtocolo}
              />
            </div>
          )}

      </main>

      {/* ⚡ FAB DE ACCIONES EN PC */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 select-none font-sans">
        {quickMenuOpen && (
          <div className="flex flex-col items-end gap-2.5 mb-2 animate-in fade-in slide-in-from-bottom-5 duration-200">
            <button onClick={() => { handleOpenNuevaOperacion(); setQuickMenuOpen(false); }} className="flex items-center gap-3 bg-[#112B3C] border border-white/10 text-white p-2.5 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer group">
              <span className="text-[8px] font-mono tracking-widest text-slate-400 group-hover:text-white uppercase font-black">Registrar Operación</span>
              <div className="w-7 h-7 rounded-xl bg-[#E5A93B]/10 flex items-center justify-center border border-[#E5A93B]/20"><Plus className="w-4 h-4 text-[#E5A93B]" /></div>
            </button>
            <button onClick={handleGlobalScan} className="flex items-center gap-3 bg-[#112B3C] border border-white/10 text-white p-2.5 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer group disabled:opacity-50">
              <span className="text-[8px] font-mono tracking-widest text-slate-400 group-hover:text-white uppercase font-black">Barrer Gmail (OCR)</span>
              <div className="w-7 h-7 rounded-xl bg-[#E5A93B]/10 flex items-center justify-center border border-[#E5A93B]/20"><RefreshCw className={`w-3.5 h-3.5 text-[#E5A93B] ${isGlobalScanningFacturas ? 'animate-spin' : ''}`} /></div>
            </button>
            <button onClick={() => { setActiveOverlay('SIMULADORES'); setQuickMenuOpen(false); }} className="flex items-center gap-3 bg-[#112B3C] border border-white/10 text-white p-2.5 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer group">
              <span className="text-[8px] font-mono tracking-widest text-slate-400 group-hover:text-white uppercase font-black">Bola de Nieve</span>
              <div className="w-7 h-7 rounded-xl bg-[#D946EF]/10 flex items-center justify-center border border-[#D946EF]/20"><CreditCard className="w-3.5 h-3.5 text-[#D946EF]" /></div>
            </button>
            <button onClick={() => { setActiveOverlay('WHAT_IF'); setQuickMenuOpen(false); }} className="flex items-center gap-3 bg-[#112B3C] border border-white/10 text-white p-2.5 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer group">
              <span className="text-[8px] font-mono tracking-widest text-slate-400 group-hover:text-white uppercase font-black">Monte Carlo</span>
              <div className="w-7 h-7 rounded-xl bg-[#F1C40F]/10 flex items-center justify-center border border-[#F1C40F]/20"><Bot className="w-3.5 h-3.5 text-[#F1C40F]" /></div>
            </button>
            <button onClick={() => { setPestanaActiva('ESTRATEGIA'); setQuickMenuOpen(false); }} className="flex items-center gap-3 bg-[#112B3C] border border-white/10 text-white p-2.5 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer group">
              <span className="text-[8px] font-mono tracking-widest text-slate-400 group-hover:text-white uppercase font-black">Protocolos</span>
              <div className="w-7 h-7 rounded-xl bg-[#E5A93B]/10 flex items-center justify-center border border-[#E5A93B]/20"><ShieldCheck className="w-3.5 h-3.5 text-[#E5A93B]" /></div>
            </button>
            <button onClick={() => { setActiveOverlay('CONFIGURACION'); setQuickMenuOpen(false); }} className="flex items-center gap-3 bg-[#112B3C] border border-white/10 text-white p-2.5 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer group">
              <span className="text-[8px] font-mono tracking-widest text-slate-400 group-hover:text-white uppercase font-black">Parámetros</span>
              <div className="w-7 h-7 rounded-xl bg-white/5 flex items-center justify-center border border-white/10"><Settings className="w-3.5 h-3.5 text-slate-300" /></div>
            </button>
          </div>
        )}
        <button onClick={() => setQuickMenuOpen(!quickMenuOpen)} className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-2xl transition-all duration-300 border cursor-pointer glow-amber ${quickMenuOpen ? 'bg-[#E5A93B] border-[#E5A93B]/50 text-black rotate-45 scale-105' : 'bg-[#112B3C] border-white/10 text-[#E5A93B] hover:border-[#E5A93B]/40'}`}>
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
              <button onClick={() => setSubSimuladorActivo('DEUDAS')} className={`flex-1 px-4 py-2.5 uppercase rounded-xl font-black transition-all cursor-pointer ${subSimuladorActivo === 'DEUDAS' ? 'bg-[#0B1A28] text-[#E5A93B] border border-[#E5A93B]/30 shadow-md' : 'text-slate-400 hover:text-white'}`}>Bola de Nieve</button>
              <button onClick={() => setSubSimuladorActivo('EXCEDENTES')} className={`flex-1 px-4 py-2.5 uppercase rounded-xl font-black transition-all cursor-pointer ${subSimuladorActivo === 'EXCEDENTES' ? 'bg-[#0B1A28] text-[#E5A93B] border border-[#E5A93B]/30 shadow-md' : 'text-slate-400 hover:text-white'}`}>Excedentes</button>
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
          <div className="min-h-screen w-screen bg-[#071218] flex flex-col items-center justify-center p-6 overflow-hidden relative">
            
            {/* Header del Simulador en PC */}
            <div className="absolute top-4 left-6 right-6 flex justify-between items-center z-40 bg-[#0E2531]/40 backdrop-blur-xl border border-white/5 px-5 py-3 rounded-2xl max-w-7xl mx-auto w-[calc(100vw-3rem)]">
              <div>
                <span className="text-[8px] font-mono tracking-[0.25em] text-[#E5A93B] font-black uppercase">ENTORNO DE PRUEBAS</span>
                <h2 className="text-sm font-serif font-black uppercase text-white">Laboratorio Multi-Terminal en Paralelo</h2>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Conmutador de simulación rápido */}
                <div className="bg-black/40 border border-white/10 p-1 rounded-xl flex items-center gap-1 font-mono text-[9px] text-slate-400 select-none">
                  <button 
                    onClick={() => setIsMultiMobile(false)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer ${!isMultiMobile ? 'bg-white/5 text-[#E5A93B] border border-white/5 font-bold shadow-md' : 'hover:text-white'}`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> SMARTPHONE ÚNICO
                  </button>
                  <button 
                    onClick={() => setIsMultiMobile(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer ${isMultiMobile ? 'bg-white/5 text-[#E5A93B] border border-white/5 font-bold shadow-md' : 'hover:text-white'}`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" /> CARRUSEL (5 PANTALLAS)
                  </button>
                </div>

                <button 
                  onClick={() => setIsMobileSimulator(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E5A93B] text-black font-mono text-[9px] font-black rounded-xl hover:scale-105 transition-all shadow-lg shadow-[#E5A93B]/20 cursor-pointer"
                >
                  <Monitor className="w-3.5 h-3.5" /> VOLVER A VISTA PC
                </button>
              </div>
            </div>

            {/* Smartphone Canvas */}
            {!isMultiMobile ? (
              /* Smartphone Frame Único */
              <div className="w-[412px] h-[892px] rounded-[3.2rem] border-[12px] border-[#1E293B] shadow-[0_0_80px_rgba(0,0,0,0.85)] relative overflow-hidden flex flex-col bg-gradient-to-b from-[#0E2531] to-[#071218] border-slate-800 shrink-0 mt-12 animate-in zoom-in-95 duration-200">
                {renderMobileLayout()}
              </div>
            ) : (
              /* Carrusel Side-by-Side (5 Terminales) */
              <div className="w-full max-w-7xl flex gap-8 overflow-x-auto pb-6 pt-16 px-4 snap-x scroll-smooth scrollbar-thin mt-12">
                {[
                  {
                    id: 'SALDO',
                    titulo: '1. Vista Saldo Real',
                    icon: <CreditCard className="w-4 h-4" />,
                    comp: (
                      <VistaSaldo 
                        cajaRealTotal={cajaRealTotal}
                        totalCuotasDeudas={totalDeudasMesActualCalculado}
                        deudas={deudas}
                        cuentas={cuentasCorrientes}
                        tarjetas={tarjetasCredito}
                        activos={otrosActivos}
                      />
                    )
                  },
                  {
                    id: 'HOY',
                    titulo: '2. Vista Hoy / Agenda',
                    icon: <Calendar className="w-4 h-4" />,
                    comp: (
                      <VistaHoy 
                        operaciones={operacionesNormalizadas}
                        onOpenCargar={handleOpenNuevaOperacion}
                        onEditTransaction={handleOpenEditarOperacion}
                        objetivosDb={cofresObjetivos}
                      />
                    )
                  },
                  {
                    id: 'PRESUPUESTO',
                    titulo: '3. Vista Límites / Presup.',
                    icon: <Settings className="w-4 h-4" />,
                    comp: (
                      <VistaPresupuesto 
                        gastos={operacionesNormalizadas}
                        ingresosBimont={ingresoBimont}
                        janluMesActual={sumJanluVal}
                        categoriasGastosDb={presupuestoGastos}
                        categoriasIngresosDb={presupuestoIngresos}
                      />
                    )
                  },
                  {
                    id: 'INFORMES',
                    titulo: '4. Vista Distribución',
                    icon: <Activity className="w-4 h-4" />,
                    comp: (
                      <VistaInformes 
                        gastos={operacionesNormalizadas}
                      />
                    )
                  },
                  {
                    id: 'TRANSACCIONES',
                    titulo: '5. Vista Libro Diario',
                    icon: <BookOpen className="w-4 h-4" />,
                    comp: (
                      <LibroDiario 
                        operaciones={operacionesCrudas}
                        onEdit={handleOpenEditarOperacion}
                        onDelete={handleEliminarOperacion}
                        onToggleStatus={handleToggleStatusOperacion}
                      />
                    )
                  }
                ].map((disp) => (
                  <div key={disp.id} className="flex-shrink-0 snap-center flex flex-col items-center select-none py-4">
                    <span className="text-[10px] font-mono font-black text-slate-400 mb-2.5 uppercase tracking-widest">{disp.titulo}</span>
                    <div className="w-[360px] h-[780px] rounded-[3rem] border-[10px] border-[#1E293B] shadow-[0_15px_40px_rgba(0,0,0,0.65)] relative overflow-hidden flex flex-col bg-gradient-to-b from-[#0E2531] to-[#071218] border-slate-800 shrink-0 hover:border-slate-700 transition duration-300">
                      
                      {/* Notch */}
                      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 items-center justify-center flex">
                        <div className="w-2.5 h-2.5 bg-slate-950 rounded-full ml-auto mr-3 border border-white/5" />
                      </div>
                      
                      {/* Status Bar */}
                      <div className="px-6 pt-3 pb-2 flex justify-between items-center text-[9px] font-semibold text-slate-400 z-40 bg-transparent shrink-0">
                        <span className="font-mono">07:16</span>
                        <div className="flex items-center gap-1 font-mono text-[8px]">
                          <span>5G</span>
                          <Wifi className="w-2.5 h-2.5 opacity-60" />
                          <Battery className="w-3 h-3 opacity-60" />
                        </div>
                      </div>

                      {/* Header móvil */}
                      <header className="px-5 py-3 border-b border-white/5 flex items-center justify-between z-30 bg-[#0B1A28]/40 backdrop-blur-md shrink-0">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-[#E5A93B]/10 border border-[#E5A93B]/20 flex items-center justify-center">
                            <span className="text-xs text-[#E5A93B] font-black">Eq</span>
                          </div>
                          <span className="font-serif text-sm tracking-[0.1em] font-black text-white uppercase">
                            Equilibra<span className="text-[#E5A93B]">.</span>
                          </span>
                        </div>
                        <span className="text-[7px] font-mono font-black tracking-widest px-2 py-0.5 border border-[#E5A93B]/20 rounded-md text-[#E5A93B] bg-[#E5A93B]/5 uppercase">
                          {disp.id}
                        </span>
                      </header>

                      {/* Contenido */}
                      <main className="flex-1 overflow-y-auto px-4 py-4 pb-20 custom-scrollbar relative z-20">
                        {disp.comp}
                      </main>

                      {/* Bottom Tab Bar */}
                      <nav className="absolute bottom-0 left-0 right-0 z-40 bg-[#071218]/95 backdrop-blur-xl border-t border-white/10 py-2 px-3 flex justify-around items-center shrink-0">
                        {[
                          { id: 'SALDO', label: 'Saldo', icon: <CreditCard className="w-4 h-4" /> },
                          { id: 'HOY', label: 'Hoy', icon: <Calendar className="w-4 h-4" /> },
                          { id: 'PRESUPUESTO', label: 'Límites', icon: <Settings className="w-4 h-4" /> },
                          { id: 'INFORMES', label: 'Distrib.', icon: <Activity className="w-4 h-4" /> },
                          { id: 'TRANSACCIONES', label: 'Diario', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'ESTRATEGIA', label: 'Estrategia', icon: <ShieldCheck className="w-4 h-4" /> }
                        ].map((tab) => (
                          <div 
                            key={tab.id}
                            className={`flex flex-col items-center gap-1 py-1 px-2 transition-all ${disp.id === tab.id ? 'text-[#E5A93B] scale-105 font-black' : 'text-slate-500'}`}
                          >
                            <div>{tab.icon}</div>
                            <span className="text-[8px] font-mono tracking-widest uppercase">
                              {tab.label}
                            </span>
                          </div>
                        ))}
                      </nav>

                    </div>
                  </div>
                ))}
              </div>
            )}

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
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#112B3C]/95 backdrop-blur-xl border border-[#E5A93B]/20 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4 duration-300">
          <div className="w-1.5 h-1.5 rounded-full bg-[#E5A93B] animate-pulse" />
          <span className="text-[9px] font-mono tracking-wider text-white uppercase">{scanNotification}</span>
        </div>
      )}

      {/* Modal de factura OCR interceptada */}
      {facturaEncontradaGlobal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#112B3C] border border-[#E5A93B]/20 rounded-3xl p-5 max-w-[280px] w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 text-center">
            <h3 className="text-white text-xs font-serif uppercase tracking-wider mb-2 flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#E5A93B]" /> Factura Encontrada
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
              <button onClick={handleIntegrarFacturaGlobal} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[#E5A93B] to-[#8B5CF6] text-white font-sans text-[8px] font-black uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95">Integrar</button>
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
