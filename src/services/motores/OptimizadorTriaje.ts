export interface DeudaPendiente {
  id: string;
  nivelSupervivencia: 1 | 2 | 3 | 4 | 5; // 1: Inmediato/Rojo, 5: No Urgente/Azul
  montoDeuda: number; // B_j
  tasaPenalidad: number; // i_{p,j}
  diasAtraso: number; // Δt
  costoSustitucion: number; // Ω_j
  factorRiesgoSupervivencia: number; // Γ_j
}

export class OptimizadorTriaje {
  /**
   * Evalúa el daño total de impago usando la función: 
   * L_j = (B_j * i_{p,j} * Δt) + Ω_j + Γ_j
   */
  public calcularPerdida(deuda: DeudaPendiente): number {
    // Cálculo del impacto financiero directo
    const impactoFinanciero = deuda.montoDeuda * deuda.tasaPenalidad * deuda.diasAtraso;
    
    // Penalización estructural: Inversión del nivel de supervivencia 
    // (Nivel 1 es altamente crítico y genera mayor peso algorítmico)
    const penalidadNivel = (6 - deuda.nivelSupervivencia) * 10000; 
    
    // Función de Pérdida
    return impactoFinanciero + deuda.costoSustitucion + (deuda.factorRiesgoSupervivencia * penalidadNivel);
  }

  /**
   * Prioriza los pagos que minimicen el daño global (L_j) bajo restricción de liquidez.
   */
  public optimizarPagos(deudas: DeudaPendiente[], capitalDisponible: number): DeudaPendiente[] {
    // 1. Clasificar de mayor pérdida potencial a menor
    const deudasOrdenadas = [...deudas].sort((a, b) => this.calcularPerdida(b) - this.calcularPerdida(a));
    
    const pagosSugeridos: DeudaPendiente[] = [];
    let capitalRestante = capitalDisponible;

    // 2. Minimización de daños mediante asignación en cascada
    for (const deuda of deudasOrdenadas) {
      if (capitalRestante >= deuda.montoDeuda) {
        pagosSugeridos.push(deuda);
        capitalRestante -= deuda.montoDeuda;
      }
    }

    return pagosSugeridos;
  }
}
