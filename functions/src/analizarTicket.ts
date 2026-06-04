// analizarTicket.ts - Cloud Function para Procesamiento Multimodal con Gemini API
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { GoogleGenAI } from "@google/genai";

// Inicializamos la SDK con la API Key de Google AI Studio configurada en el entorno
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const analizarTicket = onRequest({ cors: true, secrets: ["GEMINI_API_KEY"] }, async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64 || !mimeType) {
      res.status(400).json({ error: "Parámetros insuficientes: imageBase64 y mimeType son obligatorios." });
      return;
    }

    logger.info("Iniciando auditoría cognitiva multimodal sobre el comprobante...");

    // Configuración del System Instruction alineado con el glosario técnico
    const systemInstruction = `Eres el Auditor Óptico Avanzado del "Centro de Comando Financiero". Analiza el ticket, extrae el comercio, el monto total y calcula el porcentajeCimiento (0-100) según las prioridades del búnker. Responde únicamente un JSON plano con las llaves: comercio, montoTotal, porcentajeCimiento, justificacionCognitiva.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Modelo multimodal de alta velocidad optimizado para extracción
      contents: [
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType // Ej: "image/jpeg" o "image/png"
          }
        },
        "Analiza este comprobante siguiendo tus instrucciones de sistema."
      ],
      config: {
        systemInstruction: systemInstruction,
        // Forzamos al modelo a estructurar la salida bajo un esquema JSON puro
        responseMimeType: "application/json", 
        temperature: 0.1, // Baja temperatura para asegurar precisión y consistencia matemática
      }
    });

    const responseText = response.text;
    
    if (!responseText) {
      throw new Error("El modelo generó una respuesta vacía.");
    }

    // Parseamos el resultado para enviarlo sanitizado al cliente
    const resultadoFinanciero = JSON.parse(responseText.trim());
    
    logger.info("Auditoría completada de forma exitosa para: " + resultadoFinanciero.comercio);
    res.status(200).json(resultadoFinanciero);

  } catch (error: any) {
    logger.error("Falla crítica en el análisis cognitivo del ticket:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});
