/**
 * MÓDULO: ALERTAS TIPADAS — v1.0
 * Depende de: MotorInteligenciaFinanciera.ts + MotorProyeccionNMeses.ts
 *
 * Reemplaza todos los console.warn() del sistema por un array de alertas
 * estructuradas, accionables y con severidad. La UI puede consumirlas directamente.
 *
 * Tipos de alerta:
 *   SUPERVIVENCIA  — Nivel 1/2 en riesgo. Acción inmediata.
 *   DEUDA          — Deuda creciendo peligrosamente o mora activa.
 *   BLINDAJE       — Estado del Fondo de Blindaje.
 *   FLUJO          — Ratio PP fuera de rango.
 *   LOGRO          — Evento positivo (deuda saldada, meta alcanzada).
 *   PROYECCION     — Advertencia anticipada basada en tendencia futura.
 */
 
// ─────────────────────────────────────────────
// TIPOS BASE
// ─────────────────────────────────────────────
 
export type CategoriaAlerta =
  | "SUPERVIVENCIA"
  | "DEUDA"
  | "BLINDAJE"
  | "FLUJO"
  | "LOGRO"
  | "PROYECCION";
 
export type SeveridadAlerta = "CRITICA" | "ALTA" | "MEDIA" | "BAJA" | "INFO";
 
export type AccionRequerida =
  | "PAGAR_INMEDIATO"
  | "RENEGOCIAR_DEUDA"
  | "SUSPENDER_OCIO"
  | "REVISAR_GASTOS"
  | "ACELERAR_BLINDAJE"
  | "NINGUNA";
 
export interface Alerta {
  id: string;                        // UUID generado por el motor
  timestamp: string;                 // ISO 8601
  categoria: CategoriaAlerta;
  severidad: SeveridadAlerta;
  titulo: string;                    // Corto, para notificación push / badge
  mensaje: string;                   // Descripción completa
  accion: AccionRequerida;
  accionDescripcion: string;         // Texto legible de qué hacer
  metadatos: Record<string, unknown>; // Datos adicionales para la UI
  resuelta: boolean;                 // El usuario puede marcarla como resuelta
}
 
export interface ResultadoAlertas {
  alertas: Alerta[];
  resumen: {
    criticas:     number;
    altas:        number;
    medias:       number;
    bajas:        number;
    info:         number;
    hayEmergencia: boolean;   // true si existe al menos una CRITICA
  };
}
 
// ─────────────────────────────────────────────
// HELPER: GENERADOR DE ID Y TIMESTAMP
// ─────────────────────────────────────────────
 
let _alertaCounter = 0;
 
const generarIdAlerta = (categoria: CategoriaAlerta): string => {
  _alertaCounter++;
  return `ALT-${categoria.substring(0, 3).toUpperCase()}-${Date.now()}-${_alertaCounter}`;
};
 
const ahora = (): string => new Date().toISOString();
 
// ─────────────────────────────────────────────
// FÁBRICA DE ALERTAS — funciones especializadas
// ─────────────────────────────────────────────
 
/**
 * 1. ALERTAS DE SUPERVIVENCIA
 * Se generan cuando un gasto Nivel 1 o 2 queda suspendido en el triaje.
 */
export const alertaGastoSuspendido = (gasto: {
  descripcion: string;
  monto: number;
  prioridad: number;
}): Alerta => ({
  id:        generarIdAlerta("SUPERVIVENCIA"),
  timestamp: ahora(),
  categoria: "SUPERVIVENCIA",
  severidad: gasto.prioridad === 1 ? "CRITICA" : "ALTA",
  titulo:    `Sin fondos: ${gasto.descripcion}`,
  mensaje:   `El pago de "${gasto.descripcion}" ($${gasto.monto.toLocaleString("es-AR")}) no pudo ejecutarse. `
           + `Es un gasto de Nivel ${gasto.prioridad} — su suspensión tiene consecuencias inmediatas.`,
  accion:    "PAGAR_INMEDIATO",
  accionDescripcion: "Reasignar capital de gastos Nivel 4 y 5 para cubrir este pago antes de fin de día.",
  metadatos: { gastoId: gasto.descripcion, monto: gasto.monto, nivel: gasto.prioridad },
  resuelta:  false
});
 
/**
 * 2. ALERTAS DE DEUDA
 * a) Mora activa y creciendo
 * b) Deuda cuyo costo diario supera umbral crítico
 * c) Deuda saldada (LOGRO)
 */
export const alertaMoraActiva = (deuda: {
  id: string;
  descripcion: string;
  saldoCapital: number;
  diasMora: number;
  costoPorDiaAdicional: number;
}): Alerta => {
  const esUrgente = deuda.diasMora > 30 || deuda.costoPorDiaAdicional > 500;
  return {
    id:        generarIdAlerta("DEUDA"),
    timestamp: ahora(),
    categoria: "DEUDA",
    severidad: esUrgente ? "ALTA" : "MEDIA",
    titulo:    `Mora en "${deuda.descripcion}": ${deuda.diasMora} días`,
    mensaje:   `La deuda "${deuda.descripcion}" lleva ${deuda.diasMora} días en mora. `
             + `Costo actual por día: $${deuda.costoPorDiaAdicional.toLocaleString("es-AR")}. `
             + `Saldo total: $${deuda.saldoCapital.toLocaleString("es-AR")}.`,
    accion:    deuda.diasMora > 30 ? "RENEGOCIAR_DEUDA" : "PAGAR_INMEDIATO",
    accionDescripcion: deuda.diasMora > 30
      ? "Contactar al acreedor para renegociar plan de pagos antes de que active cobro judicial."
      : "Incluir esta deuda en la próxima ejecución de Bola de Nieve.",
    metadatos: {
      deudaId:              deuda.id,
      diasMora:             deuda.diasMora,
      costoDiario:          deuda.costoPorDiaAdicional,
      costoMensualEstimado: deuda.costoPorDiaAdicional * 30
    },
    resuelta: false
  };
};
 
export const alertaDeudaSaldada = (deuda: {
  id: string;
  descripcion: string;
  saldoOriginal: number;
  interesesTotalesPagados: number;
}): Alerta => ({
  id:        generarIdAlerta("LOGRO"),
  timestamp: ahora(),
  categoria: "LOGRO",
  severidad: "INFO",
  titulo:    `✅ Deuda saldada: "${deuda.descripcion}"`,
  mensaje:   `¡Eliminaste la deuda "${deuda.descripcion}"! `
           + `Capital original: $${deuda.saldoOriginal.toLocaleString("es-AR")}. `
           + `Intereses totales pagados: $${deuda.interesesTotalesPagados.toLocaleString("es-AR")}.`,
  accion:    "NINGUNA",
  accionDescripcion: "Redirigir el pago mínimo liberado a la siguiente deuda en la Bola de Nieve.",
  metadatos: { deudaId: deuda.id, saldoOriginal: deuda.saldoOriginal },
  resuelta:  true // Los logros se marcan resueltos automáticamente
});
 
/**
 * 3. ALERTAS DE BLINDAJE
 */
export const alertaBlindajeBajo = (
  ahorroActual: number,
  metaBlindaje: number
): Alerta => {
  const porcentaje    = (ahorroActual / metaBlindaje) * 100;
  const esCritico     = porcentaje < 25;
 
  return {
    id:        generarIdAlerta("BLINDAJE"),
    timestamp: ahora(),
    categoria: "BLINDAJE",
    severidad: esCritico ? "ALTA" : "MEDIA",
    titulo:    `Blindaje al ${porcentaje.toFixed(0)}% de la meta`,
    mensaje:   `El Fondo de Blindaje tiene $${ahorroActual.toLocaleString("es-AR")} `
             + `de los $${metaBlindaje.toLocaleString("es-AR")} necesarios (${porcentaje.toFixed(1)}%). `
             + `${esCritico ? "Estás expuesto ante cualquier imprevisto." : "Seguir aportando mensualmente."}`,
    accion:    esCritico ? "ACELERAR_BLINDAJE" : "NINGUNA",
    accionDescripcion: esCritico
      ? "Priorizar el 100% del excedente al Blindaje hasta superar el 50% de la meta."
      : "Mantener los aportes mensuales según la Cascada Greedy.",
    metadatos: { ahorroActual, metaBlindaje, porcentaje },
    resuelta:  false
  };
};
 
export const alertaBlindajeCompleto = (
  ahorroAcumulado: number,
  enMes: number
): Alerta => ({
  id:        generarIdAlerta("LOGRO"),
  timestamp: ahora(),
  categoria: "LOGRO",
  severidad: "INFO",
  titulo:    "🛡️ ¡Fondo de Blindaje completado!",
  mensaje:   `Alcanzaste la meta de $${ahorroAcumulado.toLocaleString("es-AR")} en el Mes ${enMes}. `
           + `Tenés 6 meses de cobertura ante cualquier interrupción de ingresos.`,
  accion:    "NINGUNA",
  accionDescripcion: "Redirigir el flujo de Blindaje a Expansión (70%) y Disfrute (30%).",
  metadatos: { ahorroFinal: ahorroAcumulado, mesDeLogro: enMes },
  resuelta:  true
});
 
/**
 * 4. ALERTAS DE FLUJO (Ratio PP)
 */
export const alertaRatioPP = (
  ratioPP: number,
  ingresoBimont: number,
  gastosVitales: number
): Alerta | null => {
  if (ratioPP > 1.0) return null; // No hay alerta si está en paz
 
  const deficit       = gastosVitales - ingresoBimont;
  const esCritico     = ratioPP <= 0.85;
 
  return {
    id:        generarIdAlerta("FLUJO"),
    timestamp: ahora(),
    categoria: "FLUJO",
    severidad: esCritico ? "CRITICA" : "ALTA",
    titulo:    esCritico ? "Déficit crítico de flujo" : "Erosión del Punto de Paz",
    mensaje:   `El ingreso fijo (Bimont) cubre solo el ${(ratioPP * 100).toFixed(1)}% de los gastos vitales. `
             + `Déficit: $${deficit.toLocaleString("es-AR")} mensuales. `
             + `${esCritico ? "En modo supervivencia: suspender TODO lo que no sea Nivel 1/2." : "Activar triaje preventivo."}`,
    accion:    esCritico ? "SUSPENDER_OCIO" : "REVISAR_GASTOS",
    accionDescripcion: esCritico
      ? "Suspender inmediatamente todos los gastos Nivel 4 y 5 hasta que el ratio supere 1.0."
      : "Revisar gastos Nivel 4/5 y evaluar cuáles pueden reducirse o diferirse.",
    metadatos: { ratioPP, ingresoBimont, gastosVitales, deficit },
    resuelta:  false
  };
};
 
/**
 * 5. ALERTAS DE PROYECCIÓN
 * Anticipa problemas detectados en la proyección a N meses.
 */
export const alertaDeudaNoSeSaldaraEnPeriodo = (deuda: {
  id: string;
  descripcion: string;
  saldoFinal: number;
  nMeses: number;
}): Alerta => ({
  id:        generarIdAlerta("PROYECCION"),
  timestamp: ahora(),
  categoria: "PROYECCION",
  severidad: "MEDIA",
  titulo:    `"${deuda.descripcion}" no se salda en ${deuda.nMeses} meses`,
  mensaje:   `Con la configuración actual, la deuda "${deuda.descripcion}" tendrá un saldo de `
           + `$${deuda.saldoFinal.toLocaleString("es-AR")} al finalizar el período proyectado. `
           + `Considerá aumentar el presupuesto de deudas o renegociar la tasa.`,
  accion:    "RENEGOCIAR_DEUDA",
  accionDescripcion: "Aumentar fraccionDeudas o negociar con el acreedor una tasa menor o cuota fija.",
  metadatos: { deudaId: deuda.id, saldoFinal: deuda.saldoFinal, mesesProyectados: deuda.nMeses },
  resuelta:  false
});
 
export const alertaMesesEnDeficit = (
  mesesEnDeficit: number,
  totalMeses: number
): Alerta | null => {
  if (mesesEnDeficit === 0) return null;
  const porcentaje = (mesesEnDeficit / totalMeses) * 100;
 
  return {
    id:        generarIdAlerta("PROYECCION"),
    timestamp: ahora(),
    categoria: "PROYECCION",
    severidad: porcentaje > 50 ? "ALTA" : "MEDIA",
    titulo:    `${mesesEnDeficit} de ${totalMeses} meses proyectados en déficit`,
    mensaje:   `La proyección detecta ${mesesEnDeficit} meses donde el ingreso de Bimont no cubre `
             + `los gastos vitales (${porcentaje.toFixed(0)}% del período). `
             + `Revisá la estructura de gastos fijos o buscá incrementar el ingreso base.`,
    accion:    "REVISAR_GASTOS",
    accionDescripcion: "Identificar qué gastos Nivel 2 pueden renegociarse (planes de salud, servicios) para bajar el umbral vital.",
    metadatos: { mesesEnDeficit, totalMeses, porcentaje },
    resuelta:  false
  };
};
 
// ─────────────────────────────────────────────
// MOTOR DE ALERTAS — función principal
// Analiza el estado del sistema y genera todas las alertas pertinentes.
// ─────────────────────────────────────────────
 
export interface EntradaMotorAlertas {
  // Del triaje
  gastosSuspendidos?: { descripcion: string; monto: number; prioridad: number }[];
  // Del PP
  ratioPP?: number;
  ingresoBimont?: number;
  gastosVitales?: number;
  // Del blindaje
  ahorroActual?: number;
  metaBlindaje?: number;
  blindajeCompletoEsteMes?: boolean;
  mesActual?: number;
  // De deudas
  deudasConMora?: {
    id: string;
    descripcion: string;
    saldoCapital: number;
    diasMora: number;
    costoPorDiaAdicional: number;
  }[];
  deudasSaldadasEsteMes?: {
    id: string;
    descripcion: string;
    saldoOriginal: number;
    interesesTotalesPagados: number;
  }[];
  // De proyección
  deudasNoSaldadasEnPeriodo?: { id: string; descripcion: string; saldoFinal: number; nMeses: number }[];
  mesesEnDeficit?: number;
  totalMesesProyectados?: number;
}
 
export const generarAlertas = (entrada: EntradaMotorAlertas): ResultadoAlertas => {
  const alertas: Alerta[] = [];
 
  // Supervivencia
  entrada.gastosSuspendidos?.forEach(g => alertas.push(alertaGastoSuspendido(g)));
 
  // Flujo / PP
  if (entrada.ratioPP !== undefined && entrada.ingresoBimont && entrada.gastosVitales) {
    const alerta = alertaRatioPP(entrada.ratioPP, entrada.ingresoBimont, entrada.gastosVitales);
    if (alerta) alertas.push(alerta);
  }
 
  // Blindaje
  if (entrada.ahorroActual !== undefined && entrada.metaBlindaje) {
    if (entrada.blindajeCompletoEsteMes && entrada.mesActual) {
      alertas.push(alertaBlindajeCompleto(entrada.ahorroActual, entrada.mesActual));
    } else if (entrada.ahorroActual < entrada.metaBlindaje) {
      alertas.push(alertaBlindajeBajo(entrada.ahorroActual, entrada.metaBlindaje));
    }
  }
 
  // Deudas con mora
  entrada.deudasConMora?.forEach(d => alertas.push(alertaMoraActiva(d)));
 
  // Deudas saldadas (logros)
  entrada.deudasSaldadasEsteMes?.forEach(d => alertas.push(alertaDeudaSaldada(d)));
 
  // Proyección
  entrada.deudasNoSaldadasEnPeriodo?.forEach(d => alertas.push(alertaDeudaNoSeSaldaraEnPeriodo(d)));
 
  if (entrada.mesesEnDeficit !== undefined && entrada.totalMesesProyectados) {
    const alerta = alertaMesesEnDeficit(entrada.mesesEnDeficit, entrada.totalMesesProyectados);
    if (alerta) alertas.push(alerta);
  }
 
  // Ordenar por severidad: CRITICA primero
  const orden: Record<SeveridadAlerta, number> = {
    CRITICA: 0, ALTA: 1, MEDIA: 2, BAJA: 3, INFO: 4
  };
  alertas.sort((a, b) => orden[a.severidad] - orden[b.severidad]);
 
  const resumen = {
    criticas:      alertas.filter(a => a.severidad === "CRITICA").length,
    altas:         alertas.filter(a => a.severidad === "ALTA").length,
    medias:        alertas.filter(a => a.severidad === "MEDIA").length,
    bajas:         alertas.filter(a => a.severidad === "BAJA").length,
    info:          alertas.filter(a => a.severidad === "INFO").length,
    hayEmergencia: alertas.some(a => a.severidad === "CRITICA")
  };
 
  return { alertas, resumen };
};
