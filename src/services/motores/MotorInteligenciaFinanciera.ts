/**
 * MOTOR DE INTELIGENCIA FINANCIERA INTEGRAL — v3.0
 * Correcciones aplicadas:
 *   1. Techo de pago en ejecutarBolaDeNieve (evita pagar de más)
 *   2. Orquestador único (ejecutarCicloFinanciero) que conecta todas las fases
 *   3. Split configurable en Fase 2 (deudas vs expansión)
 */
 
// ─────────────────────────────────────────────
// 1. ESTRUCTURAS
// ─────────────────────────────────────────────
 
export enum PrioridadTriaje {
  Nivel1_Rojo    = 1, // Supervivencia (Alquiler, Alimento)
  Nivel2_Naranja = 2, // Operatividad  (Luz, Agua, Salud)
  Nivel3_Amarillo = 3, // Deudas        (Bola de Nieve)
  Nivel4_Verde   = 4, // Eficiencia    (Internet, Mantenimiento)
  Nivel5_Azul    = 5  // Ocio          (Suscripciones, Gastos Hormiga)
}
 
export interface Gasto {
  id: string;
  descripcion: string;
  monto: number;
  prioridad: PrioridadTriaje;
  penalidadMora?: number;    // ip,j — interés punitorio diario
  costoReconexion?: number;  // Omega
  factorRiesgo?: number;     // Gamma — riesgo de supervivencia
}
 
export interface DeudaConInteres extends Omit<Gasto, 'monto'> {
  saldoCapital: number;         // Capital original pendiente (sin interés acumulado)
  tasaInteresAnual: number;     // TNA en decimal. Ej: 0.60 = 60% anual
  pagoMinimo: number;
  diasMora: number;             // Días que lleva sin pagar (0 si está al día)
}

export interface ResultadoSaldoReal {
  id: string;
  descripcion: string;
  saldoCapital: number;
  interesAcumulado: number;
  punitorioAcumulado: number;
  saldoTotal: number;           // Lo que realmente debés hoy
  tasaDiaria: number;
  costoPorDiaAdicional: number; // Cuánto crece la deuda por cada día que pasa
}

export interface ResultadoCostoEspera {
  id: string;
  descripcion: string;
  costoSiPagasHoy: number;
  costoSiEsperasDias: number;
  costoAdicionalDeEsperar: number;
  porcentajeAumento: number;
  recomendacion: "PAGAR_YA" | "PUEDE_ESPERAR" | "EVALUAR";
}

export interface ConfiguracionDistribucion {
  /**
   * Fracción del saldo post-blindaje que va a deudas (0–1).
   * El resto se reparte entre expansión y disfrute según splitExpansion.
   * Por defecto: 0.6 (60% deudas, 40% restante)
   */
  fraccionDeudas?: number;
  /**
   * Del remanente libre, fracción para expansión (0–1).
   * Por defecto: 0.70 (70% expansión, 30% disfrute)
   */
  splitExpansion?: number;
}
 
// ─────────────────────────────────────────────
// 2. PUNTO DE PAZ
// ─────────────────────────────────────────────
 
export const calcularPuntoDePaz = (ingresoBimont: number, gastos: Gasto[]) => {
  const gastosVitales = gastos
    .filter(g => g.prioridad <= PrioridadTriaje.Nivel2_Naranja)
    .reduce((acc, g) => acc + g.monto, 0);
 
  if (gastosVitales === 0) {
    throw new Error("No hay gastos vitales definidos (Nivel 1 y 2). Revisá la configuración.");
  }
 
  const ratioPP = ingresoBimont / gastosVitales;
 
  type EstadoPP = "PAZ_EXCEDENTE" | "PAZ_OPERATIVA" | "ALERTA_EROSION" | "DEFICIT_CRITICO";
  let estado: EstadoPP;
  if      (ratioPP > 1.15) estado = "PAZ_EXCEDENTE";
  else if (ratioPP >= 1.0) estado = "PAZ_OPERATIVA";
  else if (ratioPP > 0.85) estado = "ALERTA_EROSION";
  else                     estado = "DEFICIT_CRITICO";
 
  return { ratioPP, estado, gastosVitales };
};
 
// ─────────────────────────────────────────────
// 3. TRIAJE AMD
// ─────────────────────────────────────────────
 
export const ejecutarTriaje = (capitalDisponible: number, todosLosGastos: Gasto[]) => {
  if (capitalDisponible < 0) {
    throw new Error("El capital disponible no puede ser negativo.");
  }
 
  let capitalRestante = capitalDisponible;
  const pagosRealizados:  Gasto[] = [];
  const pagosSuspendidos: Gasto[] = [];
 
  const gastosOrdenados = [...todosLosGastos].sort((a, b) => a.prioridad - b.prioridad);
 
  for (const gasto of gastosOrdenados) {
    if (capitalRestante >= gasto.monto) {
      pagosRealizados.push(gasto);
      capitalRestante -= gasto.monto;
    } else {
      pagosSuspendidos.push(gasto);
      // Alerta crítica si cae un gasto de supervivencia
      if (gasto.prioridad <= PrioridadTriaje.Nivel2_Naranja) {
        console.warn(`⚠️  ALERTA CRÍTICA: No hay fondos para "${gasto.descripcion}" (Nivel ${gasto.prioridad})`);
      }
    }
  }
 
  return { pagosRealizados, pagosSuspendidos, capitalRestante };
};
 
// ─────────────────────────────────────────────
// 3.5. CÁLCULOS DE INTERÉS Y COSTO
// ─────────────────────────────────────────────

export const calcularSaldoReal = (deuda: DeudaConInteres): ResultadoSaldoReal => {
  const tasaDiaria = (deuda.tasaInteresAnual / 365) + (deuda.penalidadMora ?? 0);
 
  // Interés compuesto acumulado en los días de mora
  const saldoConInteres   = deuda.saldoCapital * Math.pow(1 + tasaDiaria, deuda.diasMora);
  const interesAcumulado  = saldoConInteres - deuda.saldoCapital;
 
  // Punitorio separado si existe (sobre el capital, no compuesto)
  const punitorioAcumulado = deuda.penalidadMora
    ? deuda.saldoCapital * deuda.penalidadMora * deuda.diasMora
    : 0;
 
  const saldoTotal = saldoConInteres;
 
  // Cuánto crece la deuda por cada día adicional que pasa
  const costoPorDiaAdicional = saldoTotal * tasaDiaria;
 
  return {
    id:                   deuda.id,
    descripcion:          deuda.descripcion,
    saldoCapital:         deuda.saldoCapital,
    interesAcumulado:     parseFloat(interesAcumulado.toFixed(2)),
    punitorioAcumulado:   parseFloat(punitorioAcumulado.toFixed(2)),
    saldoTotal:           parseFloat(saldoTotal.toFixed(2)),
    tasaDiaria:           parseFloat((tasaDiaria * 100).toFixed(4)), // en %
    costoPorDiaAdicional: parseFloat(costoPorDiaAdicional.toFixed(2))
  };
};

export const calcularCostoDeEsperar = (
  deuda: DeudaConInteres,
  diasDeEspera: number = 15 // una quincena por defecto
): ResultadoCostoEspera => {
  const saldoHoy    = calcularSaldoReal(deuda);
 
  // Proyectamos el saldo si esperamos N días más
  const deudaFutura: DeudaConInteres = {
    ...deuda,
    diasMora: deuda.diasMora + diasDeEspera
  };
  const saldoFuturo = calcularSaldoReal(deudaFutura);
 
  const costoAdicional  = saldoFuturo.saldoTotal - saldoHoy.saldoTotal;
  const porcentajeAumento = (costoAdicional / saldoHoy.saldoTotal) * 100;
 
  // Umbral de decisión: si esperar cuesta más del 2% del saldo → pagar ya
  let recomendacion: "PAGAR_YA" | "PUEDE_ESPERAR" | "EVALUAR";
  if (porcentajeAumento > 2)    recomendacion = "PAGAR_YA";
  else if (porcentajeAumento < 0.5) recomendacion = "PUEDE_ESPERAR";
  else                          recomendacion = "EVALUAR";
 
  return {
    id:                      deuda.id,
    descripcion:             deuda.descripcion,
    costoSiPagasHoy:         saldoHoy.saldoTotal,
    costoSiEsperasDias:      parseFloat(saldoFuturo.saldoTotal.toFixed(2)),
    costoAdicionalDeEsperar: parseFloat(costoAdicional.toFixed(2)),
    porcentajeAumento:       parseFloat(porcentajeAumento.toFixed(2)),
    recomendacion
  };
};

// ─────────────────────────────────────────────
// 3.6. ORDENAR DEUDAS POR DAÑO REAL
// ─────────────────────────────────────────────
 
export type EstrategiaDeuda = "snowball" | "avalanche" | "hibrida";
 
export const ordenarDeudasPorDanio = (
  deudas: DeudaConInteres[],
  estrategia: EstrategiaDeuda = "hibrida"
): (DeudaConInteres & { saldoReal: ResultadoSaldoReal })[] => {
 
  const deudasConSaldo = deudas.map(d => ({
    ...d,
    saldoReal: calcularSaldoReal(d)
  }));
 
  switch (estrategia) {
    case "snowball":
      return deudasConSaldo.sort((a, b) => a.saldoReal.saldoTotal - b.saldoReal.saldoTotal);
 
    case "avalanche":
      return deudasConSaldo.sort((a, b) => b.tasaInteresAnual - a.tasaInteresAnual);
 
    case "hibrida":
    default:
      // Ordena por costo diario absoluto (cuántos pesos pierde por día)
      return deudasConSaldo.sort(
        (a, b) => b.saldoReal.costoPorDiaAdicional - a.saldoReal.costoPorDiaAdicional
      );
  }
};

// ─────────────────────────────────────────────
// 4. BOLA DE NIEVE V2 — CON INTERÉS REAL
// ─────────────────────────────────────────────
 
export const ejecutarBolaDeNieveV2 = (
  excedenteParaDeudas: number,
  deudas: DeudaConInteres[],
  estrategia: EstrategiaDeuda = "hibrida"
) => {
  if (excedenteParaDeudas <= 0 || deudas.length === 0) {
    return { planPagos: [], capitalSobrante: excedenteParaDeudas, ahorroEnIntereses: 0 };
  }
 
  let capitalExtra      = excedenteParaDeudas;
  let ahorroEnIntereses = 0;
 
  const deudasOrdenadas = ordenarDeudasPorDanio(deudas, estrategia);
 
  const planPagos = deudasOrdenadas.map(deuda => {
    const saldoReal   = deuda.saldoReal.saldoTotal;
    const baseMinima  = Math.min(deuda.pagoMinimo, saldoReal);
    // Si la deuda exigía un pago mínimo mayor al saldo real, liberamos ese remanente
    // Gatillo de Extinción inmediato para redirigir a la siguiente deuda:
    const remanenteMinimo = deuda.pagoMinimo > saldoReal ? deuda.pagoMinimo - saldoReal : 0;
    capitalExtra += remanenteMinimo; // Se convierte en "Dinero Comprometido" para la próxima
    
    let extraDisp   = Math.min(capitalExtra, Math.max(0, saldoReal - baseMinima));
    const pagoTotal   = Math.min(baseMinima + extraDisp, saldoReal); // techo
    const esExtra     = pagoTotal - baseMinima;
    const estaSaldada = pagoTotal >= saldoReal;
 
    capitalExtra -= esExtra;
 
    // Si saldamos la deuda, calculamos el interés futuro que nos ahorramos
    // y aplicamos el Gatillo de Extinción para reportarlo
    if (estaSaldada) {
      const costoMesQueNoPagaremos = calcularCostoDeEsperar(deuda, 30).costoAdicionalDeEsperar;
      ahorroEnIntereses += costoMesQueNoPagaremos;
    }
 
    return {
      id:               deuda.id,
      descripcion:      deuda.descripcion,
      saldoCapital:     deuda.saldoCapital,
      interesAcumulado: deuda.saldoReal.interesAcumulado,
      saldoReal,
      pagoEjecutado:    parseFloat(pagoTotal.toFixed(2)),
      estaSaldada,
      dineroComprometidoLiberado: remanenteMinimo + (estaSaldada ? deuda.pagoMinimo : 0), // Este valor marca lo que pasará al mes siguiente a la próxima deuda
      costoPorDia:      deuda.saldoReal.costoPorDiaAdicional
    };
  });
 
  return {
    planPagos,
    capitalSobrante:  parseFloat(capitalExtra.toFixed(2)),
    ahorroEnIntereses: parseFloat(ahorroEnIntereses.toFixed(2))
  };
};

// ─────────────────────────────────────────────
// 5. DISTRIBUCIÓN GREEDY — SPLIT CONFIGURABLE
// ─────────────────────────────────────────────
 
export const distribuirExcedente = (
  excedente:       number,
  ahorroActual:    number,
  metaBlindaje:    number,
  deudasNivel3:    DeudaConInteres[],
  config:          ConfiguracionDistribucion = {}
) => {
  // ✅ FIX: validación de entrada
  if (excedente <= 0) {
    return {
      distribucion: { blindaje: 0, deudas: 0, expansion: 0, disfrute: 0 },
      planBolaDeNieve: [],
      capitalSobrante: 0
    };
  }
 
  // Parámetros con valores por defecto
  const fraccionDeudas  = config.fraccionDeudas  ?? 0.60; // 60% a deudas
  const splitExpansion  = config.splitExpansion  ?? 0.70; // 70% expansión del libre
 
  let saldo = excedente;
  const distribucion = { blindaje: 0, deudas: 0, expansion: 0, disfrute: 0 };
 
  // Fase 1 — Blindaje (100% hasta completar 6 meses de P.P.)
  if (ahorroActual < metaBlindaje) {
    const aporte = Math.min(saldo, metaBlindaje - ahorroActual);
    distribucion.blindaje = aporte;
    saldo -= aporte;
  }
 
  // Fase 2 — Bola de Nieve (fracción configurable)
  let planBolaDeNieve: ReturnType<typeof ejecutarBolaDeNieveV2>["planPagos"] = [];
  if (saldo > 0 && deudasNivel3.length > 0) {
    // ✅ FIX: split configurable — no consume el 100% del saldo
    const aporteDeuda = saldo * fraccionDeudas;
    distribucion.deudas = aporteDeuda;
    saldo -= aporteDeuda;
 
    // ✅ FIX: llamada real a ejecutarBolaDeNieveV2
    const resultado = ejecutarBolaDeNieveV2(aporteDeuda, deudasNivel3, "hibrida");
    planBolaDeNieve = resultado.planPagos;
    // Si la bola de nieve no consume todo el capital asignado a deuda, lo devolvemos al libre
    saldo += resultado.capitalSobrante;
  }
 
  // Fase 3 — Libre: Expansión y Disfrute
  if (saldo > 0) {
    distribucion.expansion = saldo * splitExpansion;
    distribucion.disfrute  = saldo * (1 - splitExpansion);
  }
 
  return { distribucion, planBolaDeNieve, capitalSobrante: saldo };
};
 
// ─────────────────────────────────────────────
// 6. ORQUESTADOR ÚNICO — ejecutarCicloFinanciero
//    ✅ FIX: conecta todas las fases en un flujo único
// ─────────────────────────────────────────────
 
export interface EntradaCiclo {
  // Ingresos del período
  ingresoBimont:    number; // ingreso fijo (cimiento)
  ingresoJanlu:     number; // ingreso variable (acelerador)
 
  // Estado actual
  gastos:           Gasto[];
  deudasNivel3:     DeudaConInteres[];
  ahorroActual:     number;
  metaBlindaje:     number; // P.P. * 6
 
  // Configuración opcional
  config?:          ConfiguracionDistribucion;
}
 
export const ejecutarCicloFinanciero = (entrada: EntradaCiclo) => {
  const {
    ingresoBimont, ingresoJanlu,
    gastos, deudasNivel3,
    ahorroActual, metaBlindaje,
    config = {}
  } = entrada;
 
  // Paso 1: Estado de Punto de Paz
  const estadoPP = calcularPuntoDePaz(ingresoBimont, gastos);
 
  // Paso 2: Triaje con el capital total disponible
  const capitalTotal = ingresoBimont + ingresoJanlu;
  const resultadoTriaje = ejecutarTriaje(capitalTotal, gastos);
 
  // Paso 3: Si hay excedente de Janlu, distribuirlo
  const excedente = ingresoJanlu - gastos
    .filter(g => g.prioridad >= PrioridadTriaje.Nivel3_Amarillo)
    .reduce((acc, g) => acc + g.monto, 0);
 
  const resultadoDistribucion = distribuirExcedente(
    Math.max(excedente, 0),
    ahorroActual,
    metaBlindaje,
    deudasNivel3,
    config
  );
 
  return {
    estadoPP,
    triaje:       resultadoTriaje,
    distribucion: resultadoDistribucion,
    resumen: {
      capitalTotal,
      capitalUsado:    capitalTotal - resultadoTriaje.capitalRestante,
      excedente:       Math.max(excedente, 0),
      gastosEnRiesgo:  resultadoTriaje.pagosSuspendidos.map(g => g.descripcion)
    }
  };
};
