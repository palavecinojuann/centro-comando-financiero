/**
 * MOTOR INTEGRAL — Adaptador / Puente
 * Conecta los datos crudos de Firebase con los 4 módulos del Motor Financiero.
 *
 * Importar en App.tsx y consumir via hook useMotorIntegral().
 *
 * Módulos integrados:
 *   1. motor-financiero-v3       → ejecutarCicloFinanciero
 *   2. motor-interes-compuesto   → calcularSaldoReal, calcularCostoDeEsperar, ejecutarBolaDeNieveV2
 *   3. motor-proyeccion-n-meses  → proyectarCiclos, compararEscenarios
 *   4. motor-alertas-tipadas     → generarAlertas
 */
 
import { useMemo } from "react";
 
// ─── Tipos Firebase (tal como llegan de Firestore) ───────────────────────────
 
export interface TransaccionFirebase {
  id: string;
  type: "ingreso" | "janlu" | "gasto" | "deuda";
  nivel?: number;
  montoNeto?: number;
  utilidad_neta?: number;
  montoTotal?: number;
  capitalOrig?: number;
  interesPorcentual?: number;
  cuotaMinima?: number;
  cuotasTotales?: number;
  nombreCompromiso?: string;
  descripcion?: string;
  categoria?: string;
  categoriaMacro?: "COMPROMISOS_INDISPENSABLES" | "GASTOS_VARIABLES";
  fechaIngreso?: any;
  fechaInyeccion?: any;
  fechaGasto?: any;
  fechaRegistro?: any;
  fechaVencimiento?: any;
}

// ─── Interfaces internas (espejo de los módulos) ─────────────────────────────

export enum PrioridadTriaje {
  Nivel1_Rojo    = 1,
  Nivel2_Naranja = 2,
  Nivel3_Amarillo = 3,
  Nivel4_Verde   = 4,
  Nivel5_Azul    = 5,
}

export interface Gasto {
  id: string;
  descripcion: string;
  monto: number;
  prioridad: PrioridadTriaje;
}

export interface DeudaConInteres {
  id: string;
  descripcion: string;
  saldoCapital: number;
  tasaInteresAnual: number;
  pagoMinimo: number;
  prioridad: 3;
  diasMora: number;
  penalidadMora?: number;
}

// ─── MAPPERS: Firebase → Interfaces ──────────────────────────────────────────

const mapearGastos = (transacciones: TransaccionFirebase[]): Gasto[] => {
  return transacciones
    .filter((t) => t.type === "gasto")
    .map((t) => {
      let prioridad = PrioridadTriaje.Nivel4_Verde;
      if (t.nivel === 1) prioridad = PrioridadTriaje.Nivel1_Rojo;
      else if (t.nivel === 2) prioridad = PrioridadTriaje.Nivel2_Naranja;
      else if (t.nivel === 3) prioridad = PrioridadTriaje.Nivel3_Amarillo;
      else if (t.nivel === 4) prioridad = PrioridadTriaje.Nivel4_Verde;
      else if (t.nivel === 5) prioridad = PrioridadTriaje.Nivel5_Azul;
      else if (t.categoriaMacro === "COMPROMISOS_INDISPENSABLES") prioridad = PrioridadTriaje.Nivel1_Rojo;

      return {
        id:          t.id,
        descripcion: t.categoria || t.descripcion || "Gasto",
        monto:       t.montoTotal || 0,
        prioridad,
      };
    });
};
 
const mapearDeudas = (transacciones: TransaccionFirebase[]): DeudaConInteres[] => {
  return transacciones
    .filter((t) => t.type === "deuda")
    .map((t) => {
      const capitalOrig  = t.capitalOrig || 0;
      const tasaAnual    = (t.interesPorcentual || 0) / 100;
      const cuotaMinima  = t.cuotaMinima || capitalOrig / (t.cuotasTotales || 12);
 
      // Estimamos días de mora: si no hay fecha de pago, asumimos 0
      const diasMora = 0;
 
      return {
        id:               t.id,
        descripcion:      t.nombreCompromiso || t.descripcion || "Deuda",
        saldoCapital:     capitalOrig,
        tasaInteresAnual: tasaAnual,
        pagoMinimo:       cuotaMinima,
        prioridad:        3 as const,
        diasMora,
      };
    });
};
 
// ─── MOTOR DE CÁLCULO ─────────────────────────────────────────────────────────
 
export const calcularSaldoReal = (deuda: DeudaConInteres) => {
  const tasaDiaria = (deuda.tasaInteresAnual / 365) + (deuda.penalidadMora ?? 0);
  const saldoConInteres   = deuda.saldoCapital * Math.pow(1 + tasaDiaria, deuda.diasMora);
  const interesAcumulado  = saldoConInteres - deuda.saldoCapital;
  const costoPorDia       = saldoConInteres * tasaDiaria;
 
  return {
    saldoTotal:           parseFloat(saldoConInteres.toFixed(2)),
    interesAcumulado:     parseFloat(interesAcumulado.toFixed(2)),
    costoPorDiaAdicional: parseFloat(costoPorDia.toFixed(2)),
    tasaDiariaPct:        parseFloat((tasaDiaria * 100).toFixed(4)),
  };
};
 
export const calcularCostoDeEsperar = (deuda: DeudaConInteres, diasDeEspera = 15) => {
  const hoy    = calcularSaldoReal(deuda);
  const futuro = calcularSaldoReal({ ...deuda, diasMora: deuda.diasMora + diasDeEspera });
  const extra  = futuro.saldoTotal - hoy.saldoTotal;
  const pct    = (extra / hoy.saldoTotal) * 100;
  return {
    costoHoy:              hoy.saldoTotal,
    costoFuturo:           futuro.saldoTotal,
    costoAdicional:        parseFloat(extra.toFixed(2)),
    porcentajeAumento:     parseFloat(pct.toFixed(2)),
    recomendacion:         pct > 2 ? "PAGAR_YA" : pct < 0.5 ? "PUEDE_ESPERAR" : "EVALUAR",
  };
};
 
export const ejecutarBolaDeNieveV2 = (
  excedente: number,
  deudas: DeudaConInteres[],
  estrategia: "snowball" | "avalanche" | "hibrida" = "hibrida"
) => {
  if (excedente <= 0 || deudas.length === 0) {
    return { planPagos: [], capitalSobrante: excedente, ahorroEnIntereses: 0 };
  }
 
  let capital = excedente;
  let ahorroEnIntereses = 0;
 
  const ordenadas = [...deudas].map(d => ({ ...d, saldoReal: calcularSaldoReal(d) }))
    .sort((a, b) => {
      if (estrategia === "snowball")  return a.saldoReal.saldoTotal - b.saldoReal.saldoTotal;
      if (estrategia === "avalanche") return b.tasaInteresAnual - a.tasaInteresAnual;
      return b.saldoReal.costoPorDiaAdicional - a.saldoReal.costoPorDiaAdicional;
    });
 
  const planPagos = ordenadas.map(deuda => {
    const saldoReal     = deuda.saldoReal.saldoTotal;
    const base          = Math.min(deuda.pagoMinimo, saldoReal);
    const extra         = Math.min(capital, Math.max(0, saldoReal - base));
    const pagoTotal     = Math.min(base + extra, saldoReal);
    const estaSaldada   = pagoTotal >= saldoReal;
 
    capital -= (Math.max(0, pagoTotal - base));
 
    if (estaSaldada) {
      ahorroEnIntereses += deuda.saldoReal.costoPorDiaAdicional * 30;
    }
 
    return {
      id:               deuda.id,
      descripcion:      deuda.descripcion,
      saldoCapital:     deuda.saldoCapital,
      interesAcumulado: deuda.saldoReal.interesAcumulado,
      saldoReal,
      pagoEjecutado:    parseFloat(pagoTotal.toFixed(2)),
      estaSaldada,
      costoPorDia:      deuda.saldoReal.costoPorDiaAdicional,
    };
  });
 
  return {
    planPagos,
    capitalSobrante:   parseFloat(capital.toFixed(2)),
    ahorroEnIntereses: parseFloat(ahorroEnIntereses.toFixed(2)),
  };
};
 
export const proyectarCiclos = (
  nMeses: number,
  ingresoBimont: number,
  ingresoJanlu: number,
  gastosVitalesMonto: number,
  gastosVariablesMonto: number,
  deudasIniciales: DeudaConInteres[],
  ahorroInicial: number,
  metaBlindaje: number,
  config: { fraccionDeudas?: number; splitExpansion?: number } = {}
) => {
  const fraccionDeudas = config.fraccionDeudas ?? 0.60;
  const splitExpansion = config.splitExpansion ?? 0.70;
 
  let ahorro      = ahorroInicial;
  let deudas      = deudasIniciales.map(d => ({ ...d }));
  const meses: any[] = [];
  const saldadas: { id: string; descripcion: string; enMes: number }[] = [];
  let mesBlindarje: number | null = null;
  let mesesEnDeficit = 0;
  let totalIntereses = 0;
 
  for (let mes = 1; mes <= nMeses; mes++) {
    const ingresoTotal   = ingresoBimont + ingresoJanlu;
    const gastosTotales  = gastosVitalesMonto + gastosVariablesMonto;
    const ratioPP        = gastosVitalesMonto > 0 ? ingresoBimont / gastosVitalesMonto : 0;
    const excedente      = Math.max(ingresoTotal - gastosTotales, 0);
 
    if (ingresoTotal < gastosTotales) mesesEnDeficit++;
 
    let saldo = excedente;
    const dist = { blindaje: 0, deudas: 0, expansion: 0, disfrute: 0 };
 
    // Fase 1 Blindaje
    if (ahorro < metaBlindaje && saldo > 0) {
      const aporte = Math.min(saldo, metaBlindaje - ahorro);
      dist.blindaje = aporte;
      ahorro += aporte;
      saldo  -= aporte;
    }
    if (ahorro >= metaBlindaje && mesBlindarje === null) mesBlindarje = mes;
 
    // Fase 2 Deudas
    let presupuestoDeudas = 0;
    if (saldo > 0 && deudas.length > 0) {
      presupuestoDeudas = saldo * fraccionDeudas;
      dist.deudas = presupuestoDeudas;
      saldo -= presupuestoDeudas;
    }
 
    // Fase 3 Libre
    if (saldo > 0) {
      dist.expansion = saldo * splitExpansion;
      dist.disfrute  = saldo * (1 - splitExpansion);
    }
 
    // Actualizar deudas
    let capExtra = presupuestoDeudas;
    const deudaSaldadaEsteMes: string[] = [];
 
    deudas = deudas
      .map(d => {
        const tasaDiaria   = d.tasaInteresAnual / 365;
        const interesDelMes = d.saldoCapital * tasaDiaria * 30;
        totalIntereses += interesDelMes;
        const saldoConInteres = d.saldoCapital + interesDelMes;
 
        const base    = Math.min(d.pagoMinimo, saldoConInteres);
        const extra   = Math.min(capExtra, Math.max(0, saldoConInteres - base));
        const pago    = Math.min(base + extra, saldoConInteres);
        capExtra      -= Math.max(0, (pago - base));
 
        const nuevoSaldo = Math.max(saldoConInteres - pago, 0);
        if (nuevoSaldo === 0) {
          deudaSaldadaEsteMes.push(d.descripcion);
          saldadas.push({ id: d.id, descripcion: d.descripcion, enMes: mes });
        }
        return { ...d, saldoCapital: parseFloat(nuevoSaldo.toFixed(2)) };
      })
      .filter(d => d.saldoCapital > 0);
 
    meses.push({
      mes,
      ratioPP:              parseFloat(ratioPP.toFixed(3)),
      estadoPP:             ratioPP > 1.15 ? "PAZ_EXCEDENTE"
                          : ratioPP >= 1.0 ? "PAZ_OPERATIVA"
                          : ratioPP > 0.85 ? "ALERTA_EROSION" : "DEFICIT_CRITICO",
      ahorroAcumulado:      parseFloat(ahorro.toFixed(2)),
      metaBlindajeAlcanzada: ahorro >= metaBlindaje,
      distribucion:         dist,
      deudasSaldadasEsteMes: deudaSaldadaEsteMes,
      deudasActivas:        deudas.map(d => ({ id: d.id, descripcion: d.descripcion, saldoRestante: d.saldoCapital })),
    });
  }
 
  return {
    meses,
    resumenFinal: {
      mesBlindarjeCompleto:  mesBlindarje,
      deudasSaldadas:        saldadas,
      deudasNoSaldadas:      deudas.map(d => ({ id: d.id, descripcion: d.descripcion, saldoFinal: d.saldoCapital })),
      totalInteresesPagados: parseFloat(totalIntereses.toFixed(2)),
      promedioRatioPP:       parseFloat((meses.reduce((a, m) => a + m.ratioPP, 0) / nMeses).toFixed(3)),
      mesesEnDeficit,
    },
  };
};
 
export const generarAlertas = (params: {
  gastosSuspendidos?: { descripcion: string; monto: number; prioridad: number }[];
  ratioPP?: number;
  ingresoBimont?: number;
  gastosVitales?: number;
  ahorroActual?: number;
  metaBlindaje?: number;
  blindajeCompletoEsteMes?: boolean;
  mesActual?: number;
  deudasConMora?: DeudaConInteres[];
  deudasSaldadasEsteMes?: string[];
  proyeccion?: ReturnType<typeof proyectarCiclos>;
}) => {
  const alertas: {
    id: string;
    categoria: string;
    severidad: "CRITICA" | "ALTA" | "MEDIA" | "INFO";
    titulo: string;
    mensaje: string;
    accion: string;
  }[] = [];
 
  let counter = 0;
  const id = (cat: string) => `ALT-${cat}-${Date.now()}-${++counter}`;
 
  // Gastos suspendidos
  params.gastosSuspendidos?.forEach(g => {
    alertas.push({
      id: id("SURV"),
      categoria: "SUPERVIVENCIA",
      severidad: g.prioridad === 1 ? "CRITICA" : "ALTA",
      titulo: `Sin fondos: ${g.descripcion}`,
      mensaje: `El pago de "${g.descripcion}" ($${g.monto.toLocaleString("es-AR")}) no pudo ejecutarse.`,
      accion: "Reasignar capital de gastos variables para cubrir este pago.",
    });
  });
 
  // Ratio PP
  if (params.ratioPP !== undefined && params.ratioPP < 1.0) {
    const deficit = (params.gastosVitales || 0) - (params.ingresoBimont || 0);
    alertas.push({
      id: id("FLUJO"),
      categoria: "FLUJO",
      severidad: params.ratioPP <= 0.85 ? "CRITICA" : "ALTA",
      titulo: params.ratioPP <= 0.85 ? "Déficit crítico de flujo" : "Erosión del Punto de Paz",
      mensaje: `Bimont cubre el ${(params.ratioPP * 100).toFixed(1)}% de los gastos vitales. Déficit: $${deficit.toLocaleString("es-AR")}/mes.`,
      accion: params.ratioPP <= 0.85
        ? "Suspender TODO lo que no sea Nivel 1/2 inmediatamente."
        : "Revisar gastos variables y evaluar cuáles diferir.",
    });
  }
 
  // Blindaje
  if (params.ahorroActual !== undefined && params.metaBlindaje) {
    if (params.blindajeCompletoEsteMes) {
      alertas.push({
        id: id("LOGRO"),
        categoria: "LOGRO",
        severidad: "INFO",
        titulo: "🛡️ ¡Fondo de Blindaje completado!",
        mensaje: `Alcanzaste $${params.ahorroActual.toLocaleString("es-AR")}. Tenés 6 meses de cobertura.`,
        accion: "Redirigir el flujo de Blindaje a Expansión (70%) y Disfrute (30%).",
      });
    } else if (params.ahorroActual < params.metaBlindaje) {
      const pct = (params.ahorroActual / params.metaBlindaje) * 100;
      alertas.push({
        id: id("BLIND"),
        categoria: "BLINDAJE",
        severidad: pct < 25 ? "ALTA" : "MEDIA",
        titulo: `Blindaje al ${pct.toFixed(0)}% de la meta`,
        mensaje: `$${params.ahorroActual.toLocaleString("es-AR")} de $${params.metaBlindaje.toLocaleString("es-AR")} (${pct.toFixed(1)}%).`,
        accion: pct < 25
          ? "Priorizar el 100% del excedente al Blindaje hasta superar el 50%."
          : "Mantener aportes mensuales según la Cascada.",
      });
    }
  }
 
  // Deudas con mora alta
  params.deudasConMora?.filter(d => d.diasMora > 30).forEach(d => {
    alertas.push({
      id: id("DEUDA"),
      categoria: "DEUDA",
      severidad: "ALTA",
      titulo: `Mora en "${d.descripcion}": ${d.diasMora} días`,
      mensaje: `Saldo: $${d.saldoCapital.toLocaleString("es-AR")}. Costo diario estimado por interés.`,
      accion: "Contactar al acreedor para renegociar antes de cobro judicial.",
    });
  });
 
  // Deudas saldadas
  params.deudasSaldadasEsteMes?.forEach(desc => {
    alertas.push({
      id: id("LOGRO"),
      categoria: "LOGRO",
      severidad: "INFO",
      titulo: `✅ Deuda saldada: "${desc}"`,
      mensaje: `Eliminaste esta deuda del sistema. El pago mínimo liberado suma a tu excedente.`,
      accion: "Redirigir ese monto a la próxima deuda en la Bola de Nieve.",
    });
  });
 
  // Alertas de proyección
  params.proyeccion?.resumenFinal.deudasNoSaldadas.forEach(d => {
    alertas.push({
      id: id("PROY"),
      categoria: "PROYECCION",
      severidad: "MEDIA",
      titulo: `"${d.descripcion}" no se salda en 12 meses`,
      mensaje: `Saldo proyectado al final: $${d.saldoFinal.toLocaleString("es-AR")}.`,
      accion: "Aumentar fracción de deudas o renegociar tasa de interés.",
    });
  });
 
  if ((params.proyeccion?.resumenFinal.mesesEnDeficit ?? 0) > 0) {
    const n = params.proyeccion!.resumenFinal.mesesEnDeficit;
    alertas.push({
      id: id("PROY"),
      categoria: "PROYECCION",
      severidad: n > 6 ? "ALTA" : "MEDIA",
      titulo: `${n} meses en déficit proyectados`,
      mensaje: `En ${n} de los próximos 12 meses, Bimont no alcanza para cubrir los gastos vitales.`,
      accion: "Revisar estructura de gastos fijos o aumentar el ingreso base.",
    });
  }
 
  // Ordenar por severidad
  const orden: Record<string, number> = { CRITICA: 0, ALTA: 1, MEDIA: 2, INFO: 3 };
  alertas.sort((a, b) => orden[a.severidad] - orden[b.severidad]);
 
  return {
    alertas,
    resumen: {
      criticas:      alertas.filter(a => a.severidad === "CRITICA").length,
      altas:         alertas.filter(a => a.severidad === "ALTA").length,
      medias:        alertas.filter(a => a.severidad === "MEDIA").length,
      bajas:         0,
      info:          alertas.filter(a => a.severidad === "INFO").length,
      hayEmergencia: alertas.some(a => a.severidad === "CRITICA"),
    },
  };
};
 
// ─── HOOK PRINCIPAL ───────────────────────────────────────────────────────────
 
export interface ResultadoMotorIntegral {
  // Datos base (compatibles con los valores que ya usa App.tsx)
  gastosVitales:        number;
  ratioPP:              number;
  estadoPP:             string;
  metaBlindaje:         number;
 
  // Bola de Nieve con interés real
  bolaDeNieve:          ReturnType<typeof ejecutarBolaDeNieveV2>;
 
  // Proyección 12 meses (escenario base)
  proyeccion:           ReturnType<typeof proyectarCiclos>;
 
  // Proyección 3 escenarios
  escenarios: {
    pesimista: ReturnType<typeof proyectarCiclos>;
    base:      ReturnType<typeof proyectarCiclos>;
    optimista: ReturnType<typeof proyectarCiclos>;
  };
 
  // Detalle por deuda (saldo real + costo de esperar)
  detalleDeudas: {
    id:             string;
    descripcion:    string;
    saldoReal:      ReturnType<typeof calcularSaldoReal>;
    costoDeEsperar: ReturnType<typeof calcularCostoDeEsperar>;
  }[];
 
  // Alertas tipadas
  alertas: ReturnType<typeof generarAlertas>;
}
 
export const useMotorIntegral = (
  transaccionesDelMes: TransaccionFirebase[],
  totalBimont:  number,
  totalJanlu:   number,
  ahorroActual: number = 0,
): ResultadoMotorIntegral => {
 
  return useMemo(() => {
    const gastos        = mapearGastos(transaccionesDelMes);
    const deudas        = mapearDeudas(transaccionesDelMes);
    const gastosVitales = gastos
      .filter(g => g.prioridad <= PrioridadTriaje.Nivel2_Naranja)
      .reduce((acc, g) => acc + g.monto, 0) || 1;
    const gastosVariables = gastos
      .filter(g => g.prioridad > PrioridadTriaje.Nivel2_Naranja)
      .reduce((acc, g) => acc + g.monto, 0);
 
    const ratioPP    = totalBimont / gastosVitales;
    const estadoPP   = ratioPP > 1.15 ? "PAZ_EXCEDENTE"
                     : ratioPP >= 1.0 ? "PAZ_OPERATIVA"
                     : ratioPP > 0.85 ? "ALERTA_EROSION" : "DEFICIT_CRITICO";
    const metaBlindaje = gastosVitales * 6;
 
    // Bola de nieve con excedente disponible
    const excedente   = Math.max(totalBimont + totalJanlu - gastosVitales - gastosVariables, 0);
    const bolaDeNieve = ejecutarBolaDeNieveV2(excedente * 0.6, deudas);
 
    // Detalle por deuda
    const detalleDeudas = deudas.map(d => ({
      id:             d.id,
      descripcion:    d.descripcion,
      saldoReal:      calcularSaldoReal(d),
      costoDeEsperar: calcularCostoDeEsperar(d, 15),
    }));
 
    // Proyección escenario base (12 meses)
    const proyeccionBase = proyectarCiclos(
      12, totalBimont, totalJanlu,
      gastosVitales, gastosVariables,
      deudas, ahorroActual, metaBlindaje
    );
 
    // 3 escenarios
    const escenarios = {
      pesimista: proyectarCiclos(12, totalBimont, totalJanlu * 0.5, gastosVitales, gastosVariables, deudas, ahorroActual, metaBlindaje),
      base:      proyeccionBase,
      optimista: proyectarCiclos(12, totalBimont, totalJanlu * 1.5, gastosVitales, gastosVariables, deudas, ahorroActual, metaBlindaje),
    };
 
    // Alertas
    const alertas = generarAlertas({
      ratioPP,
      ingresoBimont:  totalBimont,
      gastosVitales,
      ahorroActual,
      metaBlindaje,
      deudasConMora:  deudas.filter(d => d.diasMora > 0),
      deudasSaldadasEsteMes: bolaDeNieve.planPagos.filter(p => p.estaSaldada).map(p => p.descripcion),
      proyeccion:     proyeccionBase,
    });
 
    return {
      gastosVitales,
      ratioPP,
      estadoPP,
      metaBlindaje,
      bolaDeNieve,
      proyeccion:    proyeccionBase,
      escenarios,
      detalleDeudas,
      alertas,
    };
  }, [transaccionesDelMes, totalBimont, totalJanlu, ahorroActual]);
};
