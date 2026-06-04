import { db } from '../firebase';

export interface EvaluacionInyeccion {
    esExtraordinario: boolean;
    monto: number;
    origen: string;
    destinoRecomendado: 'BLINDAJE' | 'BOLA_DE_NIEVE';
    mensajePropuesta: string;
    objetivoEspecifico?: string; // Nombre de la deuda o "Fondo de Emergencia"
    mesesAdelantados?: number;
}

export class MotorInyeccionExtraordinaria {
    /**
     * Evalúa un ingreso recién registrado.
     * @param monto El monto del ingreso
     * @param concepto El concepto o etiqueta ("Aguinaldo", "Bono", etc.)
     * @param ahorroActual El saldo actual del fondo de emergencia
     * @param metaBlindaje La meta u objetivo del fondo de emergencia
     * @param deudasActivas Array de deudas para ordenar por método Bola de Nieve
     */
    public evaluarIngreso(
        monto: number,
        concepto: string,
        ahorroActual: number,
        metaBlindaje: number,
        deudasActivas: any[] // Lista de deudas para analizar la Bola de Nieve
    ): EvaluacionInyeccion {
        const conceptoLower = concepto.toLowerCase();
        const esExtraordinario = 
            conceptoLower.includes('aguinaldo') || 
            conceptoLower.includes('bono') || 
            conceptoLower.includes('extraordinario');

        if (!esExtraordinario) {
            return {
                esExtraordinario: false,
                monto,
                origen: concepto,
                destinoRecomendado: 'BLINDAJE',
                mensajePropuesta: ''
            };
        }

        // Si el ahorro actual no cubre la meta de blindaje
        if (ahorroActual < metaBlindaje) {
            const diferencia = metaBlindaje - ahorroActual;
            return {
                esExtraordinario: true,
                monto,
                origen: concepto,
                destinoRecomendado: 'BLINDAJE',
                objetivoEspecifico: 'Fondo de Emergencia',
                mensajePropuesta: `El Cerebro Lógico sugiere inyectar el 100% al Fondo de Emergencia. Obtendrás un escudo protector sólido para tu familia.`
            };
        }

        // Si el blindaje está completo, aplicamos Bola de Nieve a la deuda más pequeña
        // Filtrar deudas activas y ordenarlas de menor a mayor capital
        const deudasOrdenadas = [...deudasActivas]
            .filter(d => !d.estaSaldada && Number(d.capitalOrig || d.cuotaMinima) > 0)
            .sort((a, b) => Number(a.capitalOrig || a.cuotaMinima) - Number(b.capitalOrig || b.cuotaMinima));

        if (deudasOrdenadas.length > 0) {
            const deudaObjetivo = deudasOrdenadas[0];
            const nombreDeuda = deudaObjetivo.nombreCompromiso || 'Deuda';
            
            // Simulación simple de meses adelantados (si es cuota)
            let mesesAdelantados = 0;
            if (deudaObjetivo.tipoLiquidacion === 'cuotas') {
                const cuotasRestantes = Number(deudaObjetivo.cuotasTotales) - Number(deudaObjetivo.cuotasPagadas);
                const valorCuota = Number(deudaObjetivo.capitalOrig) / Number(deudaObjetivo.cuotasTotales);
                mesesAdelantados = Math.floor(monto / valorCuota);
                if (mesesAdelantados > cuotasRestantes) mesesAdelantados = cuotasRestantes;
            } else {
                // Cálculo estimado para tarjeta/fija
                mesesAdelantados = Math.floor(monto / (Number(deudaObjetivo.cuotaMinima) || 1));
            }

            return {
                esExtraordinario: true,
                monto,
                origen: concepto,
                destinoRecomendado: 'BOLA_DE_NIEVE',
                objetivoEspecifico: nombreDeuda,
                mesesAdelantados,
                mensajePropuesta: `El Cerebro Lógico sugiere inyectar el 100% a la obligación: ${nombreDeuda}. Esto adelantará tu libertad financiera ${mesesAdelantados > 0 ? `en ${mesesAdelantados} meses` : 'significativamente'}.`
            };
        }

        // Si no hay deudas y el blindaje está listo, va al fondo pero como exceso/expansión
        return {
            esExtraordinario: true,
            monto,
            origen: concepto,
            destinoRecomendado: 'BLINDAJE',
            objetivoEspecifico: 'Fondo de Expansión',
            mensajePropuesta: `Blindaje al 100% y 0 deudas. El Cerebro Lógico sugiere inyectar el 100% al Fondo de Expansión para aceleración patrimonial.`
        };
    }
}
