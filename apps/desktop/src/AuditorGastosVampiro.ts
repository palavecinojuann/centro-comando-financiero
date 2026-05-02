/**
 * SERVICIO: Auditor de Gastos Vampiro
 * OBJETIVO: Detectar ineficiencias financieras, duplicados y aumentos silenciosos en gastos vitales.
 */

interface GastoVital {
  id: string;
  nombreComercio: string;
  montoTotal: number;
  fechaGasto: Date;
  categoria: string;
}

export type InterfazAlerta = {
  idGastoOriginal: string;
  tipoAnomalia: 'DUPLICADO_DETECTADO' | 'ANOMALIA_DE_PRECIO';
  comercio: string;
  montoActual: number;
  montoDiferencia?: number;
  mensajeAlerta: string;
  prioridad: 'ALTA' | 'MEDIA';
}

/**
 * Función principal que analiza los gastos en busca de "vampiros" financieros.
 * @param gastosArreglo Lista de gastos obtenidos de la subcolección gastos_vitales
 */
export const auditarGastosVampiro = (gastosArreglo: GastoVital[]): InterfazAlerta[] => {
  const alertasDetectadas: InterfazAlerta[] = [];

  // Ordenar por fecha para facilitar comparaciones temporales
  const gastosOrdenados = [...gastosArreglo].sort((a, b) => b.fechaGasto.getTime() - a.fechaGasto.getTime());

  for (let i = 0; i < gastosOrdenados.length; i++) {
    const gastoActual = gastosOrdenados[i];

    // --- 1. IDENTIFICACIÓN DE DUPLICADOS (MISMO MONTO, COMERCIO Y FECHA +/- 24H) ---
    const posibleDuplicado = gastosOrdenados.find((gastoComparar, indice) => {
      if (indice === i) return false;
      
      const mismaTienda = gastoComparar.nombreComercio.toLowerCase() === gastoActual.nombreComercio.toLowerCase();
      const mismoMonto = gastoComparar.montoTotal === gastoActual.montoTotal;
      
      // Diferencia de tiempo absoluta menor a 24 horas (en milisegundos)
      const diferenciaTiempo = Math.abs(gastoComparar.fechaGasto.getTime() - gastoActual.fechaGasto.getTime());
      const esMargen24Horas = diferenciaTiempo <= 24 * 60 * 60 * 1000;

      return mismaTienda && mismoMonto && esMargen24Horas;
    });

    if (posibleDuplicado) {
      alertasDetectadas.push({
        idGastoOriginal: gastoActual.id,
        tipoAnomalia: 'DUPLICADO_DETECTADO',
        comercio: gastoActual.nombreComercio,
        montoActual: gastoActual.montoTotal,
        mensajeAlerta: 'Posible cobro duplicado detectado en menos de 24 horas.',
        prioridad: 'ALTA'
      });
    }

    // --- 2. DETECCIÓN DE AUMENTOS SILENCIOSOS (> 5% SOBRE PROMEDIO 3 MESES) ---
    const gastosMismoComercio = gastosOrdenados.filter(g => 
      g.nombreComercio.toLowerCase() === gastoActual.nombreComercio.toLowerCase() &&
      g.id !== gastoActual.id
    );

    if (gastosMismoComercio.length >= 3) {
      // Obtener los últimos 3 meses de historia para este comercio
      const historialReciente = gastosMismoComercio.slice(0, 3);
      const sumaPromedio = historialReciente.reduce((acumulado, g) => acumulado + g.montoTotal, 0);
      const montoPromedio = sumaPromedio / historialReciente.length;

      const porcentajeAumento = ((gastoActual.montoTotal - montoPromedio) / montoPromedio) * 100;

      if (porcentajeAumento >= 5) {
        alertasDetectadas.push({
          idGastoOriginal: gastoActual.id,
          tipoAnomalia: 'ANOMALIA_DE_PRECIO',
          comercio: gastoActual.nombreComercio,
          montoActual: gastoActual.montoTotal,
          montoDiferencia: gastoActual.montoTotal - montoPromedio,
          mensajeAlerta: `Aumento silencioso del ${porcentajeAumento.toFixed(1)}% detectado respecto al promedio de 3 meses.`,
          prioridad: 'MEDIA'
        });
      }
    }
  }

  // Filtrar alertas duplicadas del resultado final (evitar redundancia)
  return alertasDetectadas.filter((alerta, indice, auto) => 
    auto.findIndex(a => a.idGastoOriginal === alerta.idGastoOriginal && a.tipoAnomalia === alerta.tipoAnomalia) === indice
  );
};
