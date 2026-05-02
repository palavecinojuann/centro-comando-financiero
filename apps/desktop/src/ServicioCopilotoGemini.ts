/**
 * ServicioCopilotoGemini.ts
 * Motor de análisis de lenguaje natural e insights financieros.
 */

export type TipoInsight = 'AHORRO' | 'ALERTA_TENDENCIA' | 'CONSEJO_ESTRATEGICO' | 'RESUMEN_NOTEBOOK';

export type InsightIA = {
  id: string;
  tipo: TipoInsight;
  mensaje: string;
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  sugerenciaAccion?: string;
};

export class ServicioCopilotoGemini {
  /**
   * Genera insights basados en los datos actuales del Búnker.
   * En una versión de producción, esto llamaría a la API de Google Gemini.
   */
  public async analizarPatrones(gastosRecientes: any[], presupuestoSobrante: number): Promise<InsightIA[]> {
    // Simulamos la latencia de la IA
    await new Promise(resolve => setTimeout(resolve, 1500));

    const insights: InsightIA[] = [];

    // Lógica de análisis simulada (Cerebro Gemini)
    if (presupuestoSobrante > 10000) {
      insights.push({
        id: '1',
        tipo: 'AHORRO',
        mensaje: `He detectado un excedente de $${presupuestoSobrante.toLocaleString()} en el presupuesto de Sostenimiento Vital.`,
        prioridad: 'ALTA',
        sugerenciaAccion: '¿Inyectamos este capital al Cofre "Viaje Sofi"?'
      });
    }

    insights.push({
      id: '2',
      tipo: 'ALERTA_TENDENCIA',
      mensaje: "Tu gasto en Logística Laboral (YPF) ha subido un 12% este mes respecto al promedio trimestral.",
      prioridad: 'MEDIA',
      sugerenciaAccion: "Revisar si hay desvíos en las rutas o aumentos no registrados."
    });

    insights.push({
      id: '3',
      tipo: 'CONSEJO_ESTRATEGICO',
      mensaje: "Basado en tu ritmo de gasto actual, alcanzarás el Punto de Paz 2 días antes de lo previsto.",
      prioridad: 'ALTA'
    });

    return insights;
  }

  /**
   * Procesa fuentes de datos al estilo NotebookLM
   */
  public procesarContextoNotebook(notas: string[]): InsightIA {
    return {
      id: 'notebook-1',
      tipo: 'RESUMEN_NOTEBOOK',
      mensaje: "Resumen de Notas de Sofi: 'Priorizar el fondo de emergencia antes de la compra de nuevos insumos de Janlu'.",
      prioridad: 'ALTA'
    };
  }
}
