export interface AlertaEstacional {
    hayPeligro: boolean;
    nivelBloqueado: number | null;
    mensajeEstrategico: string;
}

export class MotorEstacional {

    /**
     * Evalúa si las fechas actuales amenazan el punto de paz basado en patrones estacionales agresivos
     * del calendario (ej. Ciclo Lectivo, Fiestas).
     */
    public evaluarRiesgoYKillSwitch(mesActual: number, ratioPuntoPaz: number): AlertaEstacional {
        // Marzo (índice 2 como Date o mes natural 3). Consideraremos mes natural de 1 a 12.
        const esTemporadaEscolar = mesActual === 3;
        const esTemporadaFiestas = mesActual === 12;

        if (!esTemporadaEscolar && !esTemporadaFiestas) {
            return {
                hayPeligro: false,
                nivelBloqueado: null,
                mensajeEstrategico: "Entorno Operativo Estable. El calendario no presenta amenazas climáticas agudas."
            };
        }

        // Si existe amenaza estacional y el ratio no está en Paz Excedente (ej. < 115%)
        if (ratioPuntoPaz < 115) { 
            const evento = esTemporadaEscolar ? 'Gasto de Ciclo Lectivo' : 'Estrés de Fiestas de Fin de Año';
            
            return {
                hayPeligro: true,
                nivelBloqueado: 5, // Bloquear nivel de Ocio/Disfrute preventivamente
                mensajeEstrategico: `ALERTA ESTACIONAL: Se ha detectado amenaza de ${evento}. Tu Estabilidad (${ratioPuntoPaz}%) no es suficiente para absorber el impacto con total seguridad. KILL SWITCH ACTIVADO: Prohibición temporal de Gastos Nivel 5. Sugerencia Táctica: Destina inmediatamente todo capital líquido a la composición de una 'Reserva Escolar / Fiestas'.`
            };
        }

        return {
            hayPeligro: false,
            nivelBloqueado: null,
            mensajeEstrategico: "La fuerza estacional está en curso, pero el blindaje matriz soporta la presión sin necesidad de recurrir a bloqueos tácticos o kill switches."
        };
    }
}
