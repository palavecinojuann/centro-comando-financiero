export interface ProyectoExpansion {
  id: string;
  costo: number;
  roiProyectado: number; // ROI porcentual esperado
}

export interface DeudaActual {
  id: string;
  monto: number;
  pagoMinimo: number;
}

export interface EstadoFinanciero {
  excedenteJanlu: number;
  gastoMensualVital: number;
  fondoEmergenciaActual: number;
  proyectosJanlu: ProyectoExpansion[];
  deudas: DeudaActual[];
}

export interface ConfigDistribucion {
  porcentajeDeudas: number; // Ej: 0.6 para 60%
  porcentajeExpansion: number; // Ej: 0.4 para 40%
}

export interface PagoDeuda {
  deudaId: string;
  pagoTotal: number;
  esLiquidacionFinal: boolean;
}

export interface ResultadoDistribucion {
  inversionBlindaje: number;
  pagosDeudas: PagoDeuda[];
  inversionExpansiones: ProyectoExpansion[];
  bolsaDisfrute: number;
  fondoResultanteMeses: number;
}

export class DistribuidorGreedy {
  // Tasa de mercado de referencia
  private readonly TASA_MERCADO = 0.05; // 5% libre de riesgo

  /**
   * Ejecuta el plan de pagos de deudas (Estrategia Bola de Nieve)
   */
  private ejecutarBolaDeNieve(
    deudas: DeudaActual[],
    capitalExtraDeudas: number
  ): { pagosPlaneados: PagoDeuda[]; capitalSobrante: number } {
    let capitalDisponible = capitalExtraDeudas;
    const pagosPlaneados: PagoDeuda[] = [];

    // Estrategia Bola de Nieve: atacar primero las deudas de menor monto
    const deudasOrdenadas = [...deudas]
      .filter((d) => d.monto > 0)
      .sort((a, b) => a.monto - b.monto);

    for (const deuda of deudasOrdenadas) {
      if (capitalDisponible <= 0) {
        // Aún así marcamos el pago mínimo si no hay capital extra para inyectar
        pagosPlaneados.push({
          deudaId: deuda.id,
          pagoTotal: Math.min(deuda.pagoMinimo, deuda.monto),
          esLiquidacionFinal: deuda.pagoMinimo >= deuda.monto
        });
        continue;
      }

      // Bug corregido: aplicar techo al pago total para no exceder la deuda
      const pagoBruto = deuda.pagoMinimo + Math.min(capitalDisponible, Math.max(0, deuda.monto - deuda.pagoMinimo));
      const pagoTotal = Math.min(pagoBruto, deuda.monto);
      
      // Consideramos que el "extra" usado fue la parte que excede el pago mínimo
      const extraUsado = Math.max(0, pagoTotal - deuda.pagoMinimo);
      capitalDisponible -= extraUsado;

      pagosPlaneados.push({
        deudaId: deuda.id,
        pagoTotal,
        esLiquidacionFinal: pagoTotal >= deuda.monto,
      });
    }

    return { pagosPlaneados, capitalSobrante: capitalDisponible };
  }

  /**
   * Algoritmo principal para distribuir excedentes.
   * Ahora orquesta todas las funciones.
   */
  public distribuir(
    estado: EstadoFinanciero,
    config: ConfigDistribucion = { porcentajeDeudas: 0.6, porcentajeExpansion: 0.4 }
  ): ResultadoDistribucion {
    let capitalRestante = estado.excedenteJanlu;
    let blindajeInvertido = 0;
    let disfruteAsignado = 0;
    const expansionesFinanciadas: ProyectoExpansion[] = [];
    let pagosDeudas: PagoDeuda[] = [];

    // Validación de seguridad para evitar distribuciones negativas (Bug resuelto)
    if (capitalRestante <= 0) {
      return {
        inversionBlindaje: 0,
        pagosDeudas: [],
        inversionExpansiones: [],
        bolsaDisfrute: 0,
        fondoResultanteMeses: estado.gastoMensualVital > 0 ? estado.fondoEmergenciaActual / estado.gastoMensualVital : 0,
      };
    }

    // === FASE 1: BLINDAJE ===
    // Retener hasta lograr 6 meses de Estabilidad Real.
    const objetivoFondo = estado.gastoMensualVital * 6;
    const deficitFondo = Math.max(0, objetivoFondo - estado.fondoEmergenciaActual);

    if (deficitFondo > 0) {
      const asignarAFondo = Math.min(capitalRestante, deficitFondo);
      blindajeInvertido = asignarAFondo;
      capitalRestante -= asignarAFondo;
    }

    const mesesFondoResultante = estado.gastoMensualVital > 0 ? 
      (estado.fondoEmergenciaActual + blindajeInvertido) / estado.gastoMensualVital : 0;

    // === FASE 2: DEUDAS Y EXPANSIÓN (Split Configurable) ===
    // Si hay deudas, realizamos el split de capitalRestante. Si no hay, todo va a expansión.
    const sumaDeudas = estado.deudas.reduce((acc, current) => acc + current.monto, 0);
    let capitalParaDeudas = 0;
    let capitalParaExpansion = 0;

    if (sumaDeudas > 0) {
      capitalParaDeudas = capitalRestante * config.porcentajeDeudas;
      capitalParaExpansion = capitalRestante * config.porcentajeExpansion;
    } else {
      capitalParaExpansion = capitalRestante;
    }

    if (capitalParaDeudas > 0 || sumaDeudas > 0) {
      // Llamada directa a ejecutarBolaDeNieve para conectar y automatizar (Punto de dolor resuelto)
      const resultadoNieve = this.ejecutarBolaDeNieve(estado.deudas, capitalParaDeudas);
      pagosDeudas = resultadoNieve.pagosPlaneados;
      // Cualquier capital sobrante de la deuda que ya se liquidó fluye de vuelta
      capitalParaExpansion += resultadoNieve.capitalSobrante;
    }

    // Procesar Expansión (ROI > Tasa del mercado)
    if (capitalParaExpansion > 0) {
      const proyectosRentables = estado.proyectosJanlu
        .filter((p) => p.roiProyectado > this.TASA_MERCADO)
        .sort((a, b) => b.roiProyectado - a.roiProyectado);

      for (const proyecto of proyectosRentables) {
        if (capitalParaExpansion >= proyecto.costo) {
          expansionesFinanciadas.push(proyecto);
          capitalParaExpansion -= proyecto.costo;
        }
      }
    }

    // === FASE 3: DISFRUTE ===
    // Remanente para bienestar familiar, disfrute o recarga psicológica.
    if (capitalParaExpansion > 0) {
      disfruteAsignado = capitalParaExpansion;
      capitalParaExpansion = 0;
    }

    return {
      inversionBlindaje: blindajeInvertido,
      pagosDeudas,
      inversionExpansiones: expansionesFinanciadas,
      bolsaDisfrute: disfruteAsignado,
      fondoResultanteMeses: mesesFondoResultante,
    };
  }
}
