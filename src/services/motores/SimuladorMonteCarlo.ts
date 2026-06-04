export interface Deuda {
  id: string;
  capitalOriginal: number;
  interesPorcentual: number;
  cuotaMinima: number;
}

export interface ParametrosSimulacion {
  ingresoBimont: number;
  gastosVitalesMensuales: number;
  ventasJanluMinimo: number;
  ventasJanluMaximo: number;
  alphaBetaVentas: number; // Parámetro Alpha para distribución Beta
  betaBetaVentas: number;  // Parámetro Beta para distribución Beta
  inflacionTendencia: number;
  inflacionVolatilidad: number;
  deudasSivas: Deuda[]; // Las deudas actuales a someter a la bola de nieve
}

export interface ResultadosSimulacion {
  probabilidadExito6Meses: number;
  probabilidadExito12Meses: number;
  probabilidadExito24Meses: number;
  ahorroInteresPromedio: number;
  mesesLibresDeDeudaPromedio: number;
}

export class SimuladorMonteCarlo {

  /**
   * Generador de números aleatorios con distribución Normal (Box-Muller)
   * Útil para generar ruido en la Caminata Aleatoria y para las Gammas de la distribución Beta.
   */
  private generarNormal(media: number, desviacion: number): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); 
    while (v === 0) v = Math.random();
    const zeta = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return zeta * desviacion + media;
  }

  /**
   * Generador aproximado de Distribución Gamma para construir la distribución Beta 
   * usando el algoritmo de la forma simplificada.
   */
  private generarGamma(alpha: number): number {
    let x = 0;
    if (alpha >= 1) {
        let d = alpha - 1/3;
        let c = 1 / Math.sqrt(9 * d);
        let flag = true;
        let v = -1;
        while(flag) {
            let z = this.generarNormal(0, 1);
            if (z > -1/c) {
                v = Math.pow(1 + c * z, 3);
                let u = Math.random();
                if (Math.log(u) < (0.5 * z * z + d - d * v + d * Math.log(v))) {
                    x = d * v;
                    flag = false;
                }
            }
        }
    } else {
        let u = Math.random();
        x = this.generarGamma(alpha + 1) * Math.pow(u, 1/alpha);
    }
    return x;
  }

  /**
   * Genera un valor con distribución Beta usando X / (X + Y) donde X~Gamma(alpha), Y~Gamma(beta)
   */
  private generarBeta(alpha: number, beta: number): number {
      const x = this.generarGamma(alpha);
      const y = this.generarGamma(beta);
      return x / (x + y);
  }

  /**
   * Simula escenarios "What-If" proyectando variables aleatorias complejas.
   */
  public ejecutarSimulacion(parametros: ParametrosSimulacion, iteraciones: number = 1000): ResultadosSimulacion {
    let sobrevivencia6Meses = 0;
    let sobrevivencia12Meses = 0;
    let sobrevivencia24Meses = 0;
    let totalAhorroIntereses = 0;
    let totalMesesLibertad = 0;

    for (let iteracion = 0; iteracion < iteraciones; iteracion++) {
        let capitalLiquidoTemporal = 0;
        let costoLogisticoAcumulado = parametros.gastosVitalesMensuales;
        
        let deudasIteracion = parametros.deudasSivas.map(d => ({
            restante: d.capitalOriginal,
            interesAnual: d.interesPorcentual,
            cuota: d.cuotaMinima
        }));

        let interesesSinAcelerar = 0;
        let interesesRealesSimulados = 0;
        let mesesParaLiberacion = 0;
        
        let estaViva6M = true;
        let estaViva12M = true;
        let estaViva24M = true;

        for (let mes = 1; mes <= 24; mes++) {
            // 1. Simulación Ventas de Janlu Velas (Distribución Beta entre un min y max)
            const proporcionBeta = this.generarBeta(parametros.alphaBetaVentas, parametros.betaBetaVentas);
            const ventasJanlu = parametros.ventasJanluMinimo + proporcionBeta * (parametros.ventasJanluMaximo - parametros.ventasJanluMinimo);

            // 2. Costos Logísticos / Inflación (Caminata aleatoria con tendencia)
            const ruidoInflacion = this.generarNormal(0, parametros.inflacionVolatilidad);
            costoLogisticoAcumulado = costoLogisticoAcumulado * (1 + parametros.inflacionTendencia + ruidoInflacion);

            // Ingreso base + Ventas Variables - Costos Simulados
            let saldoMes = parametros.ingresoBimont + ventasJanlu - costoLogisticoAcumulado;

            // 3. Estrategia de Bola de Nieve para deudas (Avalancha invertida/BolaNieve)
            deudasIteracion.sort((a, b) => b.interesAnual - a.interesAnual); 
            
            let tieneDeudas = false;
            for (let deuda of deudasIteracion) {
                if (deuda.restante > 0) {
                    tieneDeudas = true;
                    const interesGenerado = deuda.restante * (deuda.interesAnual / 12 / 100);
                    interesesSinAcelerar += interesGenerado;
                    interesesRealesSimulados += interesGenerado;
                    
                    let pagoDeuda = deuda.cuota;
                    // Aplicar Bola de Nieve con excedente
                    if (saldoMes > 0) {
                        pagoDeuda += saldoMes;
                        saldoMes = 0;
                    }

                    deuda.restante -= (pagoDeuda - interesGenerado);
                    if (deuda.restante < 0) {
                        saldoMes += Math.abs(deuda.restante);
                        deuda.restante = 0;
                    }
                }
            }

            if (tieneDeudas) {
                mesesParaLiberacion++;
            }

            capitalLiquidoTemporal += saldoMes;

            // Cortes de supervivencia
            if (capitalLiquidoTemporal < 0) {
                if (mes <= 6) estaViva6M = false;
                if (mes <= 12) estaViva12M = false;
                if (mes <= 24) estaViva24M = false;
            }
        }

        if (estaViva6M) sobrevivencia6Meses++;
        if (estaViva12M) sobrevivencia12Meses++;
        if (estaViva24M) {
            sobrevivencia24Meses++;
            totalAhorroIntereses += (interesesSinAcelerar - interesesRealesSimulados);
            totalMesesLibertad += mesesParaLiberacion;
        }
    }

    const divisorExitos24M = sobrevivencia24Meses > 0 ? sobrevivencia24Meses : 1;

    return {
        probabilidadExito6Meses: (sobrevivencia6Meses / iteraciones) * 100,
        probabilidadExito12Meses: (sobrevivencia12Meses / iteraciones) * 100,
        probabilidadExito24Meses: (sobrevivencia24Meses / iteraciones) * 100,
        ahorroInteresPromedio: totalAhorroIntereses / divisorExitos24M,
        mesesLibresDeDeudaPromedio: totalMesesLibertad / divisorExitos24M
    };
  }
}
