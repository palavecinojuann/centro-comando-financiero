import { db } from '../firebase';

export interface AlertaEstacional {
    id: string;
    mesObjetivo: number;
    nombreEvento: string;
    montoProyectado: number;
    nivelImpacto: number; // 1 a 5
    mesesRestantes: number;
    sugerenciaAhorroMensual: number;
}

export class MotorEstacionalidad {
    // Definimos los picos estacionales
    private picosEstacionales = [
        // Empieza a avisar en Ene (1) y Feb (2)
        { 
            id: 'vuelta_cole', 
            mesObjetivo: 3, 
            nombreEvento: 'Vuelta al Cole (Lauty y Martu)', 
            montoProyectado: 150000, 
            nivelImpacto: 5, 
            mesesAnticipacion: 2 
        }, 
        // Empieza a avisar en Oct (10) y Nov (11)
        { 
            id: 'fiestas_dic', 
            mesObjetivo: 12, 
            nombreEvento: 'Fiestas y Fin de Año', 
            montoProyectado: 250000, 
            nivelImpacto: 5, 
            mesesAnticipacion: 2 
        }, 
        // Agregamos Julio (7) para que avise en Mayo (5) y Junio (6) y el widget sea visible al probarlo ahora
        { 
            id: 'vacaciones_invierno', 
            mesObjetivo: 7, 
            nombreEvento: 'Vacaciones de Invierno', 
            montoProyectado: 180000, 
            nivelImpacto: 4, 
            mesesAnticipacion: 2 
        } 
    ];

    public evaluarEstacionalidad(fechaActual: Date = new Date()): AlertaEstacional | null {
        const mesActual = fechaActual.getMonth() + 1; // 1 a 12

        // Buscar si hay un evento estacional próximo
        for (const pico of this.picosEstacionales) {
            let mesesRestantes = pico.mesObjetivo - mesActual;
            
            // Si el objetivo es al principio del año que viene y estamos a fin de año
            if (mesesRestantes < 0) {
                 mesesRestantes += 12;
            }

            if (mesesRestantes > 0 && mesesRestantes <= pico.mesesAnticipacion) {
                return {
                    id: pico.id,
                    mesObjetivo: pico.mesObjetivo,
                    nombreEvento: pico.nombreEvento,
                    montoProyectado: pico.montoProyectado,
                    nivelImpacto: pico.nivelImpacto,
                    mesesRestantes: mesesRestantes,
                    // Se divide entre los meses restantes + el mes actual
                    sugerenciaAhorroMensual: pico.montoProyectado / (mesesRestantes + 1) 
                };
            }
        }

        return null;
    }

    public simularAprobacionReserva(alerta: AlertaEstacional): Promise<boolean> {
        // En una implementación real, aquí ajustaríamos el presupuesto/firestore 
        // transfiriendo este dinero a una subcolección de "Fondo de Reserva".
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`[MotorEstacionalidad] Reserva aprobada para ${alerta.nombreEvento}: $${alerta.sugerenciaAhorroMensual}`);
                resolve(true);
            }, 1800);
        });
    }
}
