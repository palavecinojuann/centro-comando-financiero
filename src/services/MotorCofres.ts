import { db } from '../firebase';

export interface CofreProposito {
    id: string;
    nombreMeta: string;
    montoObjetivo: number;
    montoActual: number;
    porcentajeCompletado: number;
}

export interface EscaneoResult {
    tieneSobrante: boolean;
    categoria: string;
    montoSobrante: number;
    mensajeAlerta: string;
}

export class MotorCofres {
    /**
     * Examina si hubo un ahorro táctico en una categoría específica
     * Si el gasto real es menor al presupuesto asignado, aísla el "sobrante táctico".
     * 
     * @param categoria Nombre de la categoría evaluada
     * @param presupuestoAsignado Monto máximo asignado a la categoría
     * @param gastoReal Dinero efectivamente desembolsado
     */
    public escanearSobrantesMes(categoria: string, presupuestoAsignado: number, gastoReal: number): EscaneoResult {
        if (gastoReal < presupuestoAsignado) {
            const sobrante = presupuestoAsignado - gastoReal;
            return {
                tieneSobrante: true,
                categoria,
                montoSobrante: sobrante,
                mensajeAlerta: `¡Bien jugado! Ahorraron $${new Intl.NumberFormat('es-AR').format(sobrante)} en ${categoria} este mes.`
            };
        }

        return {
            tieneSobrante: false,
            categoria,
            montoSobrante: 0,
            mensajeAlerta: ''
        };
    }

    /**
     * Recalcula el porcentaje de completitud de un cofre
     */
    public actualizarPorcentaje(montoActual: number, montoObjetivo: number): number {
        if (montoObjetivo <= 0) return 100;
        const porcentaje = (montoActual / montoObjetivo) * 100;
        return Math.min(Math.round(porcentaje), 100);
    }
}
