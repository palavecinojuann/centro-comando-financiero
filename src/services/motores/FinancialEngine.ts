// FinancialEngine.ts - El Cerebro Lógico de Equilibra

export interface Gasto {
  id: string;
  descripcion: string;
  monto: number;
  nivel: 1 | 2 | 3 | 4 | 5; // 1 y 2 (Cimiento) impactan directamente en el Punto de Estabilidad
  esEstacional: boolean;    // Para amortizar gastos anuales (Ej: Matrículas, patentes)
  mesesProrrateo?: number;  // Generalmente 12 para gastos anuales
  fecha?: string;
}

export interface Deuda {
  id: string;
  nombre: string;
  saldoPendiente: number;
  cuotaMensual: number;
  tasaInteres: number; // Porcentaje anual
}

export type EstrategiaPasivos = 'BOLA_NIEVE' | 'AVALANCHA' | 'ANILLO_SEGURIDAD' | 'TSUNAMI';

export interface DeudaAvanzada extends Deuda {
  factorFriccion: number; // Escala 1-10 para la estrategia Tsunami (Estrés percibido)
}

export interface EstadoFinanciero {
  ingresoBimont: number;
  excedenteJanlu?: number;
  gastos: Gasto[];
  deudas: Deuda[];
  factorInflacionReal: number; // Coeficiente para indexar la canasta familiar
  diaDelMesActual: number;     // 1 al 30, para el cálculo de velocidad de gasto
  gastoAcumuladoAlDia: number; // Cuánto se ejecutó realmente de Nivel 4 y 5
  ingresosPrincipales?: any[];
  inyeccionesJanlu?: any[];
  totalCuotasDeudas?: number;
}

export class FinancialEngine {

  /**
   * 1. PUNTO DE ESTABILIDAD (P.E.) - DINÁMICO E INDEXADO
   * Calcula si el sueldo fijo de Bimont S.A. cubre los gastos vitales (Nivel 4 y 5),
   * aplicando el prorrateo de gastos estacionales y el factor inflacionario real.
   */
  public static calcularPuntoDeEstabilidad(estado: EstadoFinanciero): number {
    const totalGastosVitales = estado.gastos.reduce((total, gasto) => {
      if (gasto.nivel === 1 || gasto.nivel === 2) {
        // Amortización de Gastos Anuales (Aplanamiento de Curvas Estacionales)
        const cuotaMensual = gasto.esEstacional && gasto.mesesProrrateo && gasto.mesesProrrateo > 0
          ? gasto.monto / gasto.mesesProrrateo
          : gasto.monto;
        return total + cuotaMensual;
      }
      return total;
    }, 0);

    if (totalGastosVitales === 0) return 0;

    // Indexación Inflacionaria Dinámica de la canasta real de consumo
    const gastosAjustados = totalGastosVitales * estado.factorInflacionReal;

    // Fórmula del Punto de Estabilidad (P.E.)
    return (estado.ingresoBimont / gastosAjustados) * 100;
  }

  /**
   * 2. METEO FINANCIERA (ALERTAS TEMPRANAS DE RITMO DE GASTO)
   * Evalúa la velocidad con la que se consume el presupuesto (Burn Rate) antes de que termine el mes.
   */
  public static evaluarMeteoFinanciera(estado: EstadoFinanciero): { 
    estadoRadar: 'ESTABLE' | 'PRECAUCION' | 'TORMENTA'; 
    mensaje: string; 
  } {
    if (estado.diaDelMesActual <= 0 || estado.gastoAcumuladoAlDia === 0) {
      return { estadoRadar: 'ESTABLE', mensaje: "Radar barométrico inicializando." };
    }

    const diasDelMes = 30;
    // Proyección lineal de consumo en base al ritmo actual de gasto diario
    const gastoProyectadoFinDeMes = (estado.gastoAcumuladoAlDia / estado.diaDelMesActual) * diasDelMes;
    
    if (gastoProyectadoFinDeMes > estado.ingresoBimont) {
      const diaQuiebreEstimado = Math.floor(estado.ingresoBimont / (estado.gastoAcumuladoAlDia / estado.diaDelMesActual));
      return {
        estadoRadar: 'TORMENTA',
        mensaje: `Viento en contra detectado. Al ritmo actual, los gastos de supervivencia quebrarán tu Punto de Estabilidad el día ${diaQuiebreEstimado} del mes. Se sugiere congelar Modo Disfrute urgentemente.`
      };
    }

    if (gastoProyectadoFinDeMes > estado.ingresoBimont * 0.9) {
      return {
        estadoRadar: 'PRECAUCION',
        mensaje: "Presión financiera en aumento. Margen de maniobra estrecho para el Punto de Estabilidad. Modera gastos variables."
      };
    }

    return { 
      estadoRadar: 'ESTABLE', 
      mensaje: "Flujo barométrico estable. Ritmo de gasto alineado con tu Punto de Estabilidad." 
    };
  }

  /**
   * 3. GATILLO DE EXTINCIÓN AUTOMÁTICO (EFECTO ARRASTRE - BOLA DE NIEVE)
   * Procesa la extinción de deudas y bloquea el capital liberado redirigiéndolo a la siguiente.
   */
  public static procesarBolaDeNieveDeudas(deudas: Deuda[], inyeccionExtra: number): {
    planAtaque: Array<{ deudaiId: string; nombre: string; pagoTotalEsteMes: number; saldoRestante: number }>;
    capitalBloqueadoParaProximoMes: number;
  } {
    // Ordenamos las deudas de menor a mayor saldo (Estrategia clásica Bola de Nieve)
    const deudasOrdenadas = [...deudas].sort((a, b) => a.saldoPendiente - b.saldoPendiente);
    
    let bolaDeNieveAcumulada = inyeccionExtra;
    let capitalBloqueadoParaProximoMes = 0;
    
    const planAtaque = deudasOrdenadas.map((deuda) => {
      // El pago base obligatorio que ya venías haciendo
      let pagoDestinado = deuda.cuotaMensual + bolaDeNieveAcumulada;
      
      // Si el pago supera el saldo total, extinguimos la deuda
      if (pagoDestinado >= deuda.saldoPendiente) {
        const excedenteLiberado = pagoDestinado - deuda.saldoPendiente;
        const saldoFinal = 0;
        
        // El excedente y la cuota que YA NO EXISTE se suman a la bola de nieve para la siguiente deuda
        bolaDeNieveAcumulada = excedenteLiberado + deuda.cuotaMensual;
        capitalBloqueadoParaProximoMes += deuda.cuotaMensual; // Dinero protegido que queda secuestrado por el sistema

        return {
          deudaiId: deuda.id,
          nombre: deuda.nombre,
          pagoTotalEsteMes: deuda.saldoPendiente, // Pagamos el total exacto
          saldoRestante: saldoFinal
        };
      } else {
        // La deuda sobrevive, se absorbió toda la bola de nieve de este mes acá
        const saldoFinal = deuda.saldoPendiente - pagoDestinado;
        bolaDeNieveAcumulada = 0; 

        return {
          deudaiId: deuda.id,
          nombre: deuda.nombre,
          pagoTotalEsteMes: pagoDestinado,
          saldoRestante: saldoFinal
        };
      }
    });

    return {
      planAtaque,
      capitalBloqueadoParaProximoMes
    };
  }

  /**
   * 4. OPTIMIZADOR DINÁMICO DE PASIVOS (VECTOR 1)
   * Ordena y estructura el plan de ataque según la estrategia táctica seleccionada
   * sin destruir la lógica base.
   */
  public static optimizarPasivosDinamico(
    deudas: DeudaAvanzada[],
    inyeccionExtra: number,
    estrategia: EstrategiaPasivos
  ): {
    ordenAtaque: Array<{ id: string; nombre: string; cuota: number; saldo: number; prioridad: number }>;
    veredictoIA: string;
    capitalLiberadoProximoMes: number;
  } {
    // Clonamos para no mutar el estado original directamente
    let deudasOrdenadas = [...deudas];

    // Aplicamos el criterio de ordenamiento según la estrategia seleccionada
    switch (estrategia) {
      case 'AVALANCHA':
        // Mayor tasa de interés primero
        deudasOrdenadas.sort((a, b) => b.tasaInteres - a.tasaInteres);
        break;
      case 'ANILLO_SEGURIDAD':
        // Mayor cuota mensual primero para liberar flujo de caja rápido
        deudasOrdenadas.sort((a, b) => b.cuotaMensual - a.cuotaMensual);
        break;
      case 'TSUNAMI':
        // Mayor factor de fricción/estrés psicológico primero
        deudasOrdenadas.sort((a, b) => b.factorFriccion - a.factorFriccion);
        break;
      case 'BOLA_NIEVE':
      default:
        // Menor saldo pendiente primero (Clásico)
        deudasOrdenadas.sort((a, b) => a.saldoPendiente - b.saldoPendiente);
        break;
    }

    let bolaDeNieveAcumulada = inyeccionExtra;
    let capitalLiberadoProximoMes = 0;

    const ordenAtaque = deudasOrdenadas.map((deuda, index) => {
      let pagoDestinado = deuda.cuotaMensual + bolaDeNieveAcumulada;
      let saldoFinal = deuda.saldoPendiente - pagoDestinado;

      if (pagoDestinado >= deuda.saldoPendiente) {
        const excedente = pagoDestinado - deuda.saldoPendiente;
        bolaDeNieveAcumulada = excedente + deuda.cuotaMensual;
        capitalLiberadoProximoMes += deuda.cuotaMensual;
        saldoFinal = 0;
      } else {
        bolaDeNieveAcumulada = 0;
      }

      return {
        id: deuda.id,
        nombre: deuda.nombre,
        cuota: deuda.cuotaMensual,
        saldo: Math.max(saldoFinal, 0), // Prevenir saldos negativos
        prioridad: index + 1
      };
    });

    // Generador de Veredicto Cognitivo de IA (Violeta Neón Semántico)
    let veredictoIA = "";
    if (estrategia === 'ANILLO_SEGURIDAD') {
      veredictoIA = `CRITERIO ACTIVO: OPTIMIZACIÓN DE FLUJO. Priorizando la extinción de las cuotas más pesadas para devolver oxígeno al Punto de Estabilidad (P.E.). Ideal si la Meteo Financiera marca presión en el Cimiento.`;
    } else if (estrategia === 'AVALANCHA') {
      veredictoIA = `CRITERIO ACTIVO: EFICIENCIA MATEMÁTICA. Minimizando el drenaje de capital por tasas de interés nominales altas. Ahorra la mayor cantidad de dinero técnico a largo plazo.`;
    } else if (estrategia === 'TSUNAMI') {
      veredictoIA = `CRITERIO ACTIVO: MITIGACIÓN DE FRICCIÓN PSICOLÓGICA. Atacando los pasivos que generan mayor estrés relacional o mental, liberando ancho de banda cognitivo para la gestión del búnker.`;
    } else {
      veredictoIA = `CRITERIO ACTIVO: EFECTO MOMENTUM. Consiguiendo victorias rápidas al eliminar los saldos más bajos. Excelente para generar impacto motivacional inmediato.`;
    }

    return {
      ordenAtaque,
      veredictoIA,
      capitalLiberadoProximoMes
    };
  }
}
