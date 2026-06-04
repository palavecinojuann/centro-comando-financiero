import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: "50mb" }));

  // Initialize Gemini
  const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY || "dummy", 
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/ocr-ticket", async (req, res) => {
    try {
      const { imageBase64, mimeType } = req.body;

      if (!imageBase64 || !mimeType) {
        return res.status(400).json({ error: "Missing image data or mimeType" });
      }

      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy') {
        return res.status(500).json({ error: "No se configuró GEMINI_API_KEY en el Búnker" });
      }

      const prompt = `Eres el Auditor Óptico Avanzado de "Equilibra" (El Búnker).
Tu tarea es realizar un OCR analítico y un triaje conceptual sobre la imagen de un ticket o comprobante de pago que se te proporcionará.

Debes extraer:
1. El nombre del comercio o proveedor.
2. El monto total de la operación (numérico puro).
3. Analizar la lista de artículos para calcular un "porcentajeCimiento" (0 a 100):
   - El Cimiento (Nivel 1 y 2) incluye: Alimentos básicos, salud, vivienda, educación, servicios y transporte vital.
   - El Acelerador (Nivel 3 al 5) incluye: Ocio, salidas, tecnología no esencial, regalos o gastos variables superfluos.
   Pondera los montos de cada ítem para determinar qué porcentaje del total del ticket pertenece estrictamente al Cimiento.

Debes responder EXCLUSIVAMENTE con un objeto JSON válido, sin bloques de código markdown (sin \`\`\`json), con la siguiente estructura:
{
  "comercio": "Nombre del Lugar",
  "montoTotal": 12540.50,
  "porcentajeCimiento": 85,
  "justificacionCognitiva": "Breve explicación técnica de por qué se asignó ese porcentaje en base a los artículos detectados."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: imageBase64.replace(/^data:image\/[a-z]+(?:;[a-z0-9]+)*;base64,/, "")
              }
            }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              comercio: { type: Type.STRING },
              montoTotal: { type: Type.NUMBER },
              porcentajeCimiento: { type: Type.NUMBER },
              justificacionCognitiva: { type: Type.STRING }
            },
            required: ["comercio", "montoTotal", "porcentajeCimiento", "justificacionCognitiva"]
          }
        }
      });

      const text = response.text || "";
      const json = JSON.parse(text);

      res.json(json);

    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Error procesando el OCR" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
