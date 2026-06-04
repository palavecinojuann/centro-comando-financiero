import { GoogleGenAI } from '@google/genai';

export interface ConsejoEstructurado {
    observacion: string;
    impacto: string;
    accion: string;
    resultadoEsperado: string;
}

export interface SplitTicketResult {
    montoTotal: number;
    nombreComercio: string;
    porcionCimiento: number; // Porción asignada a Supervivencia (Nivel 1 y 2)
    porcionAcelerador: number; // Porción asignada a Disfrute/Expansión
    justificacion: string;
}

export class IntervencionGemini {
    private ai: GoogleGenAI;

    constructor() {
        // En un entorno de frontend gestionado por Vite, accedemos a import.meta.env
        // y contemplamos process.env en caso de ejecución server-side si fuere necesario.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const globalEnv = typeof process !== "undefined" ? process.env : {};
        const apiKey = globalEnv.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY || "SIN_CLAVE_API";
        
        this.ai = new GoogleGenAI({ apiKey });
    }

    /**
     * Invoca al copiloto de Gemini usando métricas matemáticas y datos crudos para emitir
     * una orden táctica centralizada. Posee formato estricto y bloquea alusinaciones.
     */
    public async solicitarConsejoTactico(contextoFinanciero: any): Promise<ConsejoEstructurado | null> {
        try {
            const promptMilitar = `
                ROL: Eres el Cerebro Lógico del Búnker, un Científico de Datos e Ingeniero Financiero Senior de Equilibra.
                Tu prioridad absoluta es auditar, predecir y optimizar el flujo de caja bajo la estructura Bi-Flujo (Cimiento y Acelerador).
                Utiliza siempre el concepto de 'Punto de Estabilidad (P.E.)', evalúa el 'Burn Rate' (Meteo Financiera),
                identifica el 'Gatillo de Extinción' en deudas ("Dinero Comprometido") y recomienda blindar mediante 'Fondo de Provisiones Estacionales'.
                
                REGLA ESTRICTA DE IDIOMA: Absolutamente todo tu output (incluyendo propiedades JSON), sin excepciones, debe estar estrictamente en Español.
                PROHIBIDO: Divagar, saludar, disculparse, agregar textos introductorios, conversar o generar markdown externo.
                Tono: Analítico, sofisticado y preciso.
                
                Instrucción: Analiza el siguiente vector de inteligencia de datos financieros y emite tu resolución
                táctica EXCLUSIVAMENTE mediante un objeto JSON puro (sin los caracteres de bloque de código \`\`\`json)
                que evalúe los riesgos u oportunidades del usuario.
                
                FORMATO DE SALIDA OBLIGATORIO (STRICT JSON):
                {
                    "observacion": "Texto analítico asertivo de lo detectado (ej. 'Burn Rate indica quiebre del P.E. a mid-month')",
                    "impacto": "Descripción monetaria o de riesgo directo sobre el Punto de Estabilidad o Liquidez",
                    "accion": "Instrucción de choque a ejecutar de inmediato de forma categórica (ej. 'Congelar Modo Disfrute')",
                    "resultadoEsperado": "Beneficio táctico medible (ej. 'Blindaje de $X y retorno a P.E. > 100%')"
                }

                VECTOR DE DATOS A ANALIZAR:
                ${JSON.stringify(contextoFinanciero, null, 2)}
            `;

            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: promptMilitar,
                config: {
                   temperature: 0.1
                }
            });

            const textoRespuesta = response.text || "";
            const jsonLimpio = textoRespuesta.replace(/```json/gi, '').replace(/```/g, '').trim();

            const resultadoConstruido = JSON.parse(jsonLimpio) as ConsejoEstructurado;
            return resultadoConstruido;
        } catch (error) {
            console.error("Fallo de comunicación criptográfica con la IA del Búnker:", error);
            return null;
        }
    }

    public async interpretarSplitTicket(base64Image: string, mimeType: string): Promise<SplitTicketResult | null> {
        try {
             const base64Data = base64Image.split(',')[1] || base64Image;

             const promptOCR = `
                ROL: Eres el Cerebro Lógico de Equilibra.
                
                Analiza esta imagen que corresponde a un recibo o ticket de compra.
                Tu objetivo es realizar un "Split de Transacciones Mixtas".
                Debes extraer el monto final cobrado y fragmentar ese único ticket entre gastos del "Cimiento" (Supervivencia: comida esencial, básicos) 
                y gastos del "Acelerador" (Disfrute: golosinas, alcohol, no esenciales).
                
                Retorna EXCLUSIVAMENTE un objeto JSON puro con la siguiente estructura:
                {
                    "montoTotal": <número con valor total exacto de la factura/ticket, float>,
                    "nombreComercio": "<nombre de la entidad>",
                    "porcionCimiento": <monto correspondiente estrictamente a supervivencia/necesidad, float>,
                    "porcionAcelerador": <monto correspondiente a disfrute o gasto variable prescindible, float>,
                    "justificacion": "<Descripción breve en tono analítico explicando el split realizado>"
                }
             `;

             const response = await this.ai.models.generateContent({
                 model: 'gemini-2.5-flash',
                 contents: [
                     promptOCR,
                     {
                         inlineData: {
                             data: base64Data,
                             mimeType: mimeType
                         }
                     }
                 ],
                 config: {
                    temperature: 0.1,
                    responseMimeType: "application/json"
                 }
             });

             const textoRespuesta = response.text || "";
             const jsonLimpio = textoRespuesta.replace(/```json/gi, '').replace(/```/g, '').trim();
             return JSON.parse(jsonLimpio) as SplitTicketResult;
        } catch (error) {
             console.error("Error procesando imagen del ticket para Split:", error);
             return null;
        }
    }

    public async procesarTicketImagen(base64Image: string, mimeType: string): Promise<{ montoTotal: number; nombreComercio: string; categoriaMacroSugerida: 'COMPROMISOS_INDISPENSABLES' | 'GASTOS_VARIABLES'; } | null> {
        try {
             const base64Data = base64Image.split(',')[1] || base64Image;

             const promptOCR = `
                Analiza esta imagen que corresponde a un recibo o ticket de compra.
                Extrae el monto final total pagado (busca TOTAL o similar).
                Identifica el nombre del comercio.
                Sugiere si este gasto corresponde a "COMPROMISOS_INDISPENSABLES" (supermercado, comida, farmacia, servicios, alquiler, colegio) o "GASTOS_VARIABLES" (salidas, restaurantes, no esenciales).
                
                Retorna EXCLUSIVAMENTE un objeto JSON puro con la siguiente estructura:
                {
                    "montoTotal": <número con el valor total, sin símbolos de moneda, usando punto para decimales>,
                    "nombreComercio": "<nombre corto del comercio>",
                    "categoriaMacroSugerida": "<'COMPROMISOS_INDISPENSABLES' o 'GASTOS_VARIABLES'>"
                }
             `;

             const response = await this.ai.models.generateContent({
                 model: 'gemini-2.5-flash',
                 contents: [
                     promptOCR,
                     {
                         inlineData: {
                             data: base64Data,
                             mimeType: mimeType
                         }
                     }
                 ],
                 config: {
                    temperature: 0.1,
                    responseMimeType: "application/json"
                 }
             });

             const textoRespuesta = response.text || "";
             const jsonLimpio = textoRespuesta.replace(/```json/gi, '').replace(/```/g, '').trim();
             const resultadoConstruido = JSON.parse(jsonLimpio);
             return resultadoConstruido;
        } catch (error) {
             console.error("Error procesando imagen del ticket:", error);
             return null;
        }
    }
}