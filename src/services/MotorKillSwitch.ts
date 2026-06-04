import { db } from '../firebase';

export interface EvaluacionKillSwitch {
    transaccionBloqueada: boolean;
    mensajeAlerta: string;
    nivelGasto: number;
}

export class MotorKillSwitch {
    /**
     * Evalúa una transacción nueva antes de insertarla o procesarla
     * @param monto El monto del nuevo gasto
     * @param nivelSupervivencia El nivel de supervivencia (1-5) donde 4-5 es ocio
     * @param saldoCimientoActual El saldo actual (Excedente) antes del gasto
     */
    public evaluarTransaccion(
        monto: number, 
        nivelSupervivencia: number, 
        saldoCimientoActual: number
    ): EvaluacionKillSwitch {
        // Solo aplica a gastos no esenciales (Nivel 4 o 5)
        if (nivelSupervivencia >= 4) {
             // Si el monto del gasto es mayor al saldo cimiento, erosiona el punto de paz
            if (monto > saldoCimientoActual) {
                return {
                    transaccionBloqueada: true,
                    mensajeAlerta: `OPERACIÓN DENEGADA. Este gasto de Nivel ${nivelSupervivencia} (Ocio) erosiona tu Punto de Paz por debajo del 100%. Supervivencia familiar en riesgo.`,
                    nivelGasto: nivelSupervivencia
                };
            }
        }

        return {
            transaccionBloqueada: false,
            mensajeAlerta: '',
            nivelGasto: nivelSupervivencia
        };
    }
}
