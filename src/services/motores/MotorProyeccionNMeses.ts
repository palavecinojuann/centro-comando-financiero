/**
 * MÓDULO: PROYECCIÓN A N MESES — v1.0
 * Depende de: MotorInteligenciaFinanciera.ts
 *
 * Responde tres preguntas clave:
 *   1. ¿Cuándo queda saldada cada deuda?
 *   2. ¿En cuántos meses se completa el Fondo de Blindaje?
 *   3. ¿Cuál es el estado financiero mes a mes bajo distintos escenarios?
 */

import { DeudaConInteres } from './MotorInteligenciaFinanciera';

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

export type EscenarioIngreso = "pesimista" | "base" | "optimista";

export interface ConfiguracionEscenario {
  nombre: EscenarioIngreso;
  ingresoBimont: number;
  ingresoJanlu: number;
}

export interface EstadoMes {
  mes: number;                          // 1, 2, 3... N
  label: string;                        // "Mes 1 (Jun 2025)"
  ingresoBimont: number;
  ingresoJanlu: number;
  ingresoTotal: number;
  gastosVitales: number;
  ratioPP: number;
  estadoPP: string;
  ahorroAcumulado: number;
  metaBlindajeAlcanzada: boolean;
  deudasActivas: ResumenDeudaMes[];
  deudasSaldadasEsteMes: string[];
  distribucion: {
    blindaje: number;
    deudas: number;
    expansion: number;
    disfrute: number;
  };
  alertas: string[];
}

export interface ResumenDeudaMes {
  id: string;
  descripcion: string;
  saldoRestante: number;
  interesAcumulado: number;
  pagoEjecutado: number;
  diasMoraActualizados: number;
}

export interface ResultadoProyeccion {
  escenario: EscenarioIngreso;
  meses: EstadoMes[];
  resumenFinal: {
    totalMesesProyectados: number;
    mesBlindarjeCompleto: number | null;     // null si no se alcanza en el período
    deudasSaldadas: { id: string; descripcion: string; enMes: number }[];
    deudasNoSaldadas: { id: string; descripcion: string; saldoFinal: number }[];
    totalInteresesPagados: number;
    totalAhorradoEnIntereses: number;
    promedioRatioPP: number;
    mesesEnDeficit: number;
  };
}

// ─────────────────────────────────────────────
// HELPERS INTERNOS
// ─────────────────────────────────────────────

/**
 * Actualiza el saldo de una deuda después de aplicar un pago y sumar un mes de interés.
 * Devuelve el nuevo saldo de capital y los días de mora actualizados.
 */
const actualizarDeudaTrasUnMes = (
  saldoCapitalActual: number,
  tasaInteresAnual: number,
  pagoEjecutado: number,
  diasMoraActuales: number,
  penalidadMora: number = 0
): { nuevoSaldo: number; nuevosDiasMora: number; interesDelMes: number } => {
  const tasaDiaria    = (tasaInteresAnual / 365) + penalidadMora;
  const diasEnUnMes   = 30;
 
  // Interés generado en este mes sobre el saldo actual
  const interesDelMes = saldoCapitalActual * tasaDiaria * diasEnUnMes;
 
  // Saldo tras sumar interés y restar pago
  const saldoTrasInteres = saldoCapitalActual + interesDelMes;
  const nuevoSaldo       = Math.max(saldoTrasInteres - pagoEjecutado, 0);
 
  // Si se pagó algo, los días de mora se reinician; si no, siguen acumulando
  const nuevosDiasMora = pagoEjecutado >= saldoCapitalActual * (tasaDiaria * diasEnUnMes)
    ? 0
    : diasMoraActuales + diasEnUnMes;
 
  return {
    nuevoSaldo:      parseFloat(nuevoSaldo.toFixed(2)),
    nuevosDiasMora,
    interesDelMes:   parseFloat(interesDelMes.toFixed(2))
  };
};

/**
 * Genera el label legible de un mes a partir del mes actual.
 */
const generarLabelMes = (offsetMeses: number): string => {
  const fecha = new Date();
  fecha.setMonth(fecha.getMonth() + offsetMeses);
  return fecha.toLocaleDateString("es-AR", { month: "short", year: "numeric" });
};

// ─────────────────────────────────────────────
// FUNCIÓN PRINCIPAL
// ─────────────────────────────────────────────

/**
 * Proyecta el estado financiero completo a N meses.
 *
 * @param nMeses            - Cantidad de meses a proyectar (recomendado: 6–24)
 * @param escenario         - Configuración de ingresos del período
 * @param gastosVitalesMonto - Suma fija de gastos Nivel 1 + 2
 * @param gastosVariablesMonto - Suma fija de gastos Nivel 3–5 (sin deudas)
 * @param deudasIniciales   - Estado actual de las deudas con interés
 * @param ahorroInicial     - Saldo actual del Fondo de Blindaje
 * @param metaBlindaje      - Objetivo del fondo (PP_Real × 6)
 * @param config            - Parámetros de distribución (fraccionDeudas, splitExpansion)
 */
export const proyectarCiclos = (
  nMeses: number,
  escenario: ConfiguracionEscenario,
  gastosVitalesMonto: number,
  gastosVariablesMonto: number,
  deudasIniciales: DeudaConInteres[],
  ahorroInicial: number,
  metaBlindaje: number,
  config: { fraccionDeudas?: number; splitExpansion?: number } = {}
): ResultadoProyeccion => {
 
  const fraccionDeudas = config.fraccionDeudas ?? 0.60;
  const splitExpansion = config.splitExpansion ?? 0.70;
 
  // Estado mutable a lo largo de la proyección
  let ahorroAcumulado  = ahorroInicial;
  let deudasActivas    = deudasIniciales.map(d => ({ ...d })); // copia profunda
  
  const meses: EstadoMes[] = [];
  const deudasSaldadasRegistro: { id: string; descripcion: string; enMes: number }[] = [];
  let totalInteresesPagados  = 0;
  let totalAhorradoIntereses = 0;
  let mesesEnDeficit         = 0;
  let mesBlindarjeCompleto: number | null = null;
 
  for (let mes = 1; mes <= nMeses; mes++) {
    const alertas: string[] = [];
    const deudasSaldadasEsteMes: string[] = [];
    const ingresoTotal = escenario.ingresoBimont + escenario.ingresoJanlu;
 
    // ── Punto de Paz ──
    const ratioPP = gastosVitalesMonto > 0
      ? escenario.ingresoBimont / gastosVitalesMonto
      : 0;
 
    let estadoPP: string;
    if      (ratioPP > 1.15) estadoPP = "PAZ_EXCEDENTE";
    else if (ratioPP >= 1.0) estadoPP = "PAZ_OPERATIVA";
    else if (ratioPP > 0.85) estadoPP = "ALERTA_EROSION";
    else { estadoPP = "DEFICIT_CRITICO"; mesesEnDeficit++; }
 
    // ── Excedente disponible para distribuir ──
    const gastosTotalesFijos = gastosVitalesMonto + gastosVariablesMonto;
    const excedente = Math.max(ingresoTotal - gastosTotalesFijos, 0);
 
    if (ingresoTotal < gastosTotalesFijos) {
      alertas.push(`⚠️ Déficit de $${(gastosTotalesFijos - ingresoTotal).toFixed(0)} — revisar gastos variables`);
    }
 
    // ── Distribución del excedente ──
    let saldo = excedente;
    const distribucion = { blindaje: 0, deudas: 0, expansion: 0, disfrute: 0 };
 
    // Fase 1: Blindaje
    if (ahorroAcumulado < metaBlindaje && saldo > 0) {
      const aporte = Math.min(saldo, metaBlindaje - ahorroAcumulado);
      distribucion.blindaje  = aporte;
      ahorroAcumulado       += aporte;
      saldo                 -= aporte;
    }
 
    if (ahorroAcumulado >= metaBlindaje && mesBlindarjeCompleto === null) {
      mesBlindarjeCompleto = mes;
      alertas.push(`🛡️ ¡Fondo de Blindaje completado en el Mes ${mes}!`);
    }
 
    // Fase 2: Deudas
    let presupuestoDeudas = 0;
    if (saldo > 0 && deudasActivas.length > 0) {
      presupuestoDeudas      = saldo * fraccionDeudas;
      distribucion.deudas    = presupuestoDeudas;
      saldo                 -= presupuestoDeudas;
    }
 
    // Fase 3: Libre
    if (saldo > 0) {
      distribucion.expansion = saldo * splitExpansion;
      distribucion.disfrute  = saldo * (1 - splitExpansion);
    }
 
    // ── Actualizar deudas con interés + pagos ──
    // Ordenar por costo diario descendente (estrategia híbrida)
    const deudasOrdenadas = [...deudasActivas].sort((a, b) => {
      const tasaA = (a.tasaInteresAnual / 365) + (a.penalidadMora ?? 0);
      const tasaB = (b.tasaInteresAnual / 365) + (b.penalidadMora ?? 0);
      return (b.saldoCapital * tasaB) - (a.saldoCapital * tasaA);
    });
 
    let capitalExtraDeudas = presupuestoDeudas;
    const resumenDeudasMes: ResumenDeudaMes[] = [];
 
    for (const deuda of deudasOrdenadas) {
      const pagoBase  = Math.min(deuda.pagoMinimo, deuda.saldoCapital);
      const pagoExtra = Math.min(capitalExtraDeudas, deuda.saldoCapital - pagoBase);
      const pagoTotal = Math.min(pagoBase + pagoExtra, deuda.saldoCapital);
 
      capitalExtraDeudas -= pagoExtra;
      totalInteresesPagados += deuda.saldoCapital *
        ((deuda.tasaInteresAnual / 365) + (deuda.penalidadMora ?? 0)) * 30;
 
      const { nuevoSaldo, nuevosDiasMora, interesDelMes } = actualizarDeudaTrasUnMes(
        deuda.saldoCapital,
        deuda.tasaInteresAnual,
        pagoTotal,
        deuda.diasMora,
        deuda.penalidadMora
      );
 
      if (nuevoSaldo === 0) {
        deudasSaldadasEsteMes.push(deuda.descripcion);
        deudasSaldadasRegistro.push({ id: deuda.id, descripcion: deuda.descripcion, enMes: mes });
        // Ahorro: interés que YA no vamos a pagar en los meses restantes
        const mesesRestantes = nMeses - mes;
        totalAhorradoIntereses += deuda.saldoCapital *
          ((deuda.tasaInteresAnual / 365) + (deuda.penalidadMora ?? 0)) * 30 * mesesRestantes;
        alertas.push(`✅ Deuda "${deuda.descripcion}" SALDADA en Mes ${mes}`);
      }
 
      resumenDeudasMes.push({
        id:                   deuda.id,
        descripcion:          deuda.descripcion,
        saldoRestante:        nuevoSaldo,
        interesAcumulado:     interesDelMes,
        pagoEjecutado:        parseFloat(pagoTotal.toFixed(2)),
        diasMoraActualizados: nuevosDiasMora
      });
 
      // Actualizar el estado mutable
      deuda.saldoCapital = nuevoSaldo;
      deuda.diasMora     = nuevosDiasMora;
    }
 
    // Remover deudas saldadas para el siguiente ciclo
    deudasActivas = deudasActivas.filter(d => d.saldoCapital > 0);
 
    meses.push({
      mes,
      label:                  `Mes ${mes} (${generarLabelMes(mes - 1)})`,
      ingresoBimont:          escenario.ingresoBimont,
      ingresoJanlu:           escenario.ingresoJanlu,
      ingresoTotal,
      gastosVitales:          gastosVitalesMonto,
      ratioPP:                parseFloat(ratioPP.toFixed(3)),
      estadoPP,
      ahorroAcumulado:        parseFloat(ahorroAcumulado.toFixed(2)),
      metaBlindajeAlcanzada:  ahorroAcumulado >= metaBlindaje,
      deudasActivas:          resumenDeudasMes.filter(d => d.saldoRestante > 0),
      deudasSaldadasEsteMes,
      distribucion: {
        blindaje:   parseFloat(distribucion.blindaje.toFixed(2)),
        deudas:     parseFloat(distribucion.deudas.toFixed(2)),
        expansion:  parseFloat(distribucion.expansion.toFixed(2)),
        disfrute:   parseFloat(distribucion.disfrute.toFixed(2))
      },
      alertas
    });
  }
 
  return {
    escenario: escenario.nombre,
    meses,
    resumenFinal: {
      totalMesesProyectados:   nMeses,
      mesBlindarjeCompleto,
      deudasSaldadas:          deudasSaldadasRegistro,
      deudasNoSaldadas:        deudasActivas.map(d => ({
        id:           d.id,
        descripcion:  d.descripcion,
        saldoFinal:   d.saldoCapital
      })),
      totalInteresesPagados:   parseFloat(totalInteresesPagados.toFixed(2)),
      totalAhorradoEnIntereses: parseFloat(totalAhorradoIntereses.toFixed(2)),
      promedioRatioPP:         parseFloat(
        (meses.reduce((acc, m) => acc + m.ratioPP, 0) / nMeses).toFixed(3)
      ),
      mesesEnDeficit
    }
  };
};
 
// ─────────────────────────────────────────────
// COMPARADOR DE ESCENARIOS
// ─────────────────────────────────────────────
 
/**
 * Corre la proyección en paralelo para los 3 escenarios y devuelve la comparativa.
 * Ideal para tomar decisiones ante meses de incertidumbre en Janlu Velas.
 */
export const compararEscenarios = (
  nMeses: number,
  escenarios: ConfiguracionEscenario[],   // pesimista, base, optimista
  gastosVitalesMonto: number,
  gastosVariablesMonto: number,
  deudasIniciales: DeudaConInteres[],
  ahorroInicial: number,
  metaBlindaje: number,
  config: { fraccionDeudas?: number; splitExpansion?: number } = {}
) => {
  return escenarios.map(escenario =>
    proyectarCiclos(
      nMeses,
      escenario,
      gastosVitalesMonto,
      gastosVariablesMonto,
      // Copia profunda para que cada escenario parta del mismo estado
      deudasIniciales.map(d => ({ ...d })),
      ahorroInicial,
      metaBlindaje,
      config
    )
  );
};
