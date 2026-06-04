import { GoogleGenAI } from "@google/genai";

export interface TransaccionSospechosa {
  id: string;
  categoria: string;
  referencia?: string;
  montoOriginal: number;
  fechaRegistro: Date;
  puntajeAnomalia: number; // Basado en profundidad media de Isolation Forest
}

export interface RecomendacionEstrategica {
  observacion: string;
  impacto: string;
  accion: string;
  resultadoEsperado: string;
}

export interface AnalisisDeuda {
  estrategiaOptima: "BOLA_DE_NIEVE" | "AVALANCHA";
  fundamento: string;
  acciones: {
    deudaId: string;
    nombre: string;
    sugerenciaTactica: string;
  }[];
}

export class AuditorCognitivo {
  private ai: GoogleGenAI | null;

  constructor() {
    const key = process.env.GEMINI_API_KEY;
    this.ai = key ? new GoogleGenAI({ apiKey: key }) : null;
  }

  /**
   * Invoca a Gemini para estructurar la respuesta en un plan táctico de 4 pasos
   * sobre una transacción vampiro o métricas de estado de Firebase.
   */
  public async invocarPromptGeminiNLP(datos: {
    gastoVampiro?: TransaccionSospechosa,
    contexto?: {
      ingresos: number;
      gastos: number;
      excedente: number;
      deuda: number;
    }
  }): Promise<RecomendacionEstrategica | null> {
    const prompt = `
      Actúa como un Auditor Cognitivo y Arquitecto Financiero. 
      Analiza los siguientes datos y proporciona una recomendación estratégica en formato JSON.
      
      Variables pasadas:
      - Gasto Sospechoso (Vampiro): ${datos.gastoVampiro ? JSON.stringify(datos.gastoVampiro) : 'No especificado'}
      - Contexto del Ecosistema Financiero: ${datos.contexto ? JSON.stringify(datos.contexto) : 'No especificado'}
      
      El resultado DEBE SER UN OBJETO JSON con las siguientes 4 claves exactas de tipo string (NO USES MARKDOWN):
      {
        "observacion": "Identifica qué anomalía o patrón clave has observado.",
        "impacto": "Explica el impacto directo en números o en metas sobre el patrimonio futuro.",
        "accion": "Instrucción de acción directa y táctica a ejecutar ahora.",
        "resultadoEsperado": "El resultado proyectado que ocurre si se aplica la acción"
      }
    `;

    if (!this.ai) {
      console.warn("AuditorCognitivo: GEMINI_API_KEY no detectada.");
      return null;
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3.0-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });
      
      const respuestaTexto = response.text;
      if (!respuestaTexto) return null;
      
      return JSON.parse(respuestaTexto) as RecomendacionEstrategica;
    } catch (e) {
      console.error("Error consultando a Gemini:", e);
      return null;
    }
  }

  /**
   * Invoca a Gemini para determinar la mejor estrategia de deudas basada en el costo de espera.
   */
  public async analizarEstrategiaDeudas(deudasInfo: any[]): Promise<AnalisisDeuda | null> {
      if (!this.ai) return null;

      const prompt = `
        Actúa como un Arquitecto Financiero experto en tácticas de extinción de deuda. 
        Analiza el siguiente pool de pasivos de este hogar, que incluye costos diarios adicionales si se pospone el pago.
        
        Variables:
        ${JSON.stringify(deudasInfo, null, 2)}
        
        Determina cuál es la estrategia matemáticamente y psicológicamente óptima para este caso:
        - BOLA_DE_NIEVE (Snowball): Priorizar extinguir los saldos más bajos rápido para liberar capital (Dinero Comprometido) para el próximo ataque, generando momentum.
        - AVALANCHA (Avalanche): Priorizar saldos con la TNA / Costo de Espera más alto, reduciendo el daño compuesto.
        
        El resultado DEBE SER UN OBJETO JSON con la siguiente estructura (NO USES MARKDOWN Y USA LLAVES):
        {
          "estrategiaOptima": "BOLA_DE_NIEVE" o "AVALANCHA",
          "fundamento": "Explicación directa de 2 oraciones del porqué de la estrategia basada en el daño de espera y saldos.",
          "acciones": [
            {
               "deudaId": "ID_DE_LA_DEUDA",
               "nombre": "Nombre original",
               "sugerenciaTactica": "Recomendación táctica para esta deuda específica (Ej: Atacar con todo el excedente, o, Mantener solo pago mínimo y congelar)."
            }
          ]
        }
      `;

      try {
        const response = await this.ai.models.generateContent({
          model: 'gemini-3.0-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          }
        });

        const respuestaTexto = response.text;
        if (!respuestaTexto) return null;

        return JSON.parse(respuestaTexto) as AnalisisDeuda;
      } catch (error) {
        console.error("Error en analizarEstrategiaDeudas:", error);
        return null;
      }
  }

  /**
   * Implementación de Bosque de Aislamiento (Isolation Forest) Conceptual.
   * Particiona aleatoriamente los datos. Anomalías requieren menos particiones (poca profundidad)
   * para quedar completamente aisladas del resto de observaciones.
   */
  public ejecutarBosqueDeAislamiento(transacciones: any[], numeroArboles: number = 100, limiteProfundidad: number = 10): TransaccionSospechosa[] {
      if (transacciones.length < 5) return [];

      const puntajes = new Map<string, { transaccion: any, sumaProfundidades: number }>();
      
      transacciones.forEach(t => {
          puntajes.set(t.id, { transaccion: t, sumaProfundidades: 0 });
      });

      // Construcción del bosque y aislamiento
      for (let i = 0; i < numeroArboles; i++) {
          this.construirArbolDeAislamiento(transacciones, 0, limiteProfundidad, puntajes);
      }

      const anomaliasDetectadas: TransaccionSospechosa[] = [];
      const constanteNormalizacion = 2 * (Math.log(transacciones.length - 1) + 0.5772156649) - (2 * (transacciones.length - 1) / transacciones.length);

      puntajes.forEach((dato, id) => {
          const profundidadPromedio = dato.sumaProfundidades / numeroArboles;
          const puntajeAnomalia = Math.pow(2, - (profundidadPromedio / constanteNormalizacion));

          // Si el puntaje es mayor a 0.6, lo definimos como anomalía estructural (Gasto Vampiro)
          if (puntajeAnomalia > 0.6) {
              const valorMonto = dato.transaccion.montoTotal !== undefined ? dato.transaccion.montoTotal : (dato.transaccion.montoNeto || 0);
              const fechaReg = dato.transaccion.fechaGasto?.toDate ? dato.transaccion.fechaGasto.toDate() : (dato.transaccion.fechaRegistro?.toDate ? dato.transaccion.fechaRegistro.toDate() : new Date());
              
              anomaliasDetectadas.push({
                  id: dato.transaccion.id,
                  categoria: dato.transaccion.categoria || dato.transaccion.origen || "Operación Desconocida",
                  referencia: dato.transaccion.referencia,
                  montoOriginal: valorMonto,
                  fechaRegistro: fechaReg,
                  puntajeAnomalia: puntajeAnomalia
              });
          }
      });

      return anomaliasDetectadas.sort((a, b) => b.puntajeAnomalia - a.puntajeAnomalia);
  }

  /**
   * Función recursiva que divide el vector de transacciones de manera completamente aleatoria.
   */
  private construirArbolDeAislamiento(datos: any[], profundidadActual: number, profundidadMaxima: number, registroPuntajes: Map<string, any>) {
      if (datos.length <= 1 || profundidadActual >= profundidadMaxima) {
          datos.forEach(d => {
              const registro = registroPuntajes.get(d.id);
              if (registro) {
                  const constanteAjuste = datos.length > 2 ? (2 * (Math.log(datos.length - 1) + 0.5772156649)) : (datos.length === 2 ? 1 : 0);
                  registro.sumaProfundidades += (profundidadActual + constanteAjuste);
              }
          });
          return;
      }

      let minMonto = Infinity;
      let maxMonto = -Infinity;
      datos.forEach(d => {
          const valor = d.montoTotal !== undefined ? d.montoTotal : (d.montoNeto || 0);
          if (valor < minMonto) minMonto = valor;
          if (valor > maxMonto) maxMonto = valor;
      });

      if (minMonto === maxMonto) {
          datos.forEach(d => {
              const registro = registroPuntajes.get(d.id);
              if (registro) registro.sumaProfundidades += profundidadActual;
          });
          return;
      }

      const puntoCorteRandom = Math.random() * (maxMonto - minMonto) + minMonto;

      const ramaIzquierda = datos.filter(d => {
          const val = d.montoTotal !== undefined ? d.montoTotal : (d.montoNeto || 0);
          return val < puntoCorteRandom;
      });
      const ramaDerecha = datos.filter(d => {
          const val = d.montoTotal !== undefined ? d.montoTotal : (d.montoNeto || 0);
          return val >= puntoCorteRandom;
      });

      this.construirArbolDeAislamiento(ramaIzquierda, profundidadActual + 1, profundidadMaxima, registroPuntajes);
      this.construirArbolDeAislamiento(ramaDerecha, profundidadActual + 1, profundidadMaxima, registroPuntajes);
  }
}
