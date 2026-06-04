export interface GastoLogistica {
    id: string;
    monto: number;
    tipo: 'combustible' | 'peaje' | 'mantenimiento' | 'otro';
    fecha: Date;
}

export interface AlertaMantenimiento {
    necesitaService: boolean;
    kilometrosEstimados: number;
    kilometrosRestantes: number;
    mensajeAlerta: string;
    fondoSugerido: number;
}

export interface ResultadoAuditoriaLogistica {
    costoPromedioDiario: number;
    alertaMantenimiento: AlertaMantenimiento;
}

export class MotorLogistica {
    // Valores estimados configurables
    private static PRECIO_LITRO_COMBUSTIBLE = 1000; // $ por litro
    private static CONSUMO_PROMEDIO_100KM = 8; // Litros por cada 100km
    private static INTERVALO_SERVICE_KM = 10000; // Kilómetros para el service
    private static COSTO_ESTIMADO_SERVICE = 150000; // $ costo aproximado del service

    /**
     * Analiza el historial de gastos de logística laboral para calcular métricas
     * y predecir necesidades de mantenimiento.
     * 
     * @param gastos Arreglo de gastos clasificados como "Logística"
     * @returns Resultados de la auditoría con promedios y alertas
     */
    public static analizarLogistica(gastos: GastoLogistica[]): ResultadoAuditoriaLogistica {
        if (!gastos || gastos.length === 0) {
            return {
                costoPromedioDiario: 0,
                alertaMantenimiento: {
                    necesitaService: false,
                    kilometrosEstimados: 0,
                    kilometrosRestantes: this.INTERVALO_SERVICE_KM,
                    mensajeAlerta: "No hay datos suficientes para proyectar.",
                    fondoSugerido: 0
                }
            };
        }

        // 1. Cálculo de Costo Promedio Diario
        // Asumimos un mes estándar de 30 días o calculamos según las fechas
        const ahora = new Date();
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const diasTranscurridos = Math.max(1, ahora.getDate()); 
        
        // Filtramos para considerar los gastos del mes en curso
        const gastosMes = gastos.filter(g => g.fecha.getTime() >= inicioMes.getTime());
        const gastoTotalMes = gastosMes.reduce((acc, curr) => acc + curr.monto, 0);
        const costoPromedioDiario = Math.round(gastoTotalMes / diasTranscurridos);

        // 2. Estimación de Kilometraje y Alerta Preventiva
        // Histograma completo para calcular el kilometraje total desde el último service.
        // Asumiremos que el kilometraje actual está dictado por la suma histórica de combustible.
        // En una app real, esto podría reseterase al registrar un gasto de tipo 'mantenimiento'.
        
        let gastoTotalCombustible = 0;
        let ultimoServiceIndex = -1;

        // Buscar el último service para reiniciar el conteo
        for (let i = 0; i < gastos.length; i++) {
            if (gastos[i].tipo === 'mantenimiento') {
                ultimoServiceIndex = i;
                break; // Suponiendo el listado ordenado del más reciente al más antiguo
            }
        }

        let gastosAConsiderar = gastos;
        if (ultimoServiceIndex !== -1) {
            // Solo tomamos los gastos posteriores al último mantenimiento
            gastosAConsiderar = gastos.slice(0, ultimoServiceIndex);
        }

        gastoTotalCombustible = gastosAConsiderar
            .filter(g => g.tipo === 'combustible')
            .reduce((acc, curr) => acc + curr.monto, 0);

        // Algoritmo: (Total Gastado / Precio Litro) = Litros Consumidos
        // (Litros Consumidos / Consumo Promedio) * 100 = Kilometros Recorridos
        const litrosConsumidos = gastoTotalCombustible / this.PRECIO_LITRO_COMBUSTIBLE;
        const kilometrosEstimados = Math.round((litrosConsumidos / this.CONSUMO_PROMEDIO_100KM) * 100);
        
        const kilometrosRestantes = Math.max(0, this.INTERVALO_SERVICE_KM - kilometrosEstimados);
        
        // Activar alerta si quedan menos de 1500 km para el service
        const necesitaService = kilometrosRestantes < 1500;
        let mensajeAlerta = "Parámetros operativos normales.";
        let fondoSugerido = 0;

        if (necesitaService) {
            fondoSugerido = this.COSTO_ESTIMADO_SERVICE;
            mensajeAlerta = `Service próximo estimado en ${kilometrosRestantes.toLocaleString('es-AR')} kilómetros. Sugerencia: Reservar $${fondoSugerido.toLocaleString('es-AR')} en el presupuesto del mes que viene para proteger la Estabilidad.`;
        }

        return {
            costoPromedioDiario,
            alertaMantenimiento: {
                necesitaService,
                kilometrosEstimados,
                kilometrosRestantes,
                mensajeAlerta,
                fondoSugerido
            }
        };
    }
}
