import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

// Inicializamos la app de administración si no fue inicializada previamente en el index
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

interface WebhookPayload {
  bunkerId: string;
  proveedor: string;
  monto: number;
  concepto: string;
  authKey: string;
}

export const receptorWebhooks = onRequest({ cors: false }, async (req, res) => {
  try {
    // 1. Verificación de firma/llave técnica de seguridad
    const { bunkerId, proveedor, monto, concepto, authKey } = req.body as WebhookPayload;
    
    // Llave de paso para evitar inyecciones maliciosas en el búnker
    if (authKey !== process.env.BUNKER_WEBHOOK_SECRET) {
      logger.error("Falla de autenticación en Handshake de Webhook.");
      res.status(401).json({ error: "UNAUTHORIZED_ACCESS_DENIED" });
      return;
    }

    if (!bunkerId || !monto || !proveedor) {
      res.status(400).json({ error: "INVALID_PARAMETERS" });
      return;
    }

    logger.info(`Interceptando consumo pasivo de: ${proveedor} por un monto de $${monto}`);

    // 2. Algoritmo de Triaje Automatizado de Cajas
    const conceptoMinuscula = concepto.toLowerCase();
    let nivelAsignado: 1 | 2 | 3 | 4 | 5 = 3; // Por defecto: Variable / Disfrute (Acelerador)

    // Matriz de palabras clave institucionales para resguardar el Punto de Estabilidad
    const keywordsSupervivencia = ["coto", "carrefour", "ypf", "colegio", "edesur", "aysa", "gas", "supermercado"];
    const keywordsEducacionSalud = ["osde", "medicina", "libreria", "matricula", "cuota"];

    if (keywordsSupervivencia.some(kw => conceptoMinuscula.includes(kw))) {
      nivelAsignado = 5; // Sostenimiento Vital
    } else if (keywordsEducacionSalud.some(kw => conceptoMinuscula.includes(kw))) {
      nivelAsignado = 4; // Educación y Gastos del Núcleo
    }

    // 3. Inyección directa en la base fiduciaria de Firestore
    const gastoNormalizado = {
      descripcion: `${proveedor.toUpperCase()} // ${concepto.toUpperCase()} [Automático]`,
      monto: Number(monto),
      nivel: nivelAsignado,
      esEstacional: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection("hogares")
            .doc(bunkerId)
            .collection("egresos_diarios")
            .add(gastoNormalizado);

    logger.info(`Consumo consolidado con éxito en Firestore bajo Nivel ${nivelAsignado}.`);
    res.status(200).json({ status: "SUCCESS_CONSOLIDATED", nivelImpactado: nivelAsignado });

  } catch (error: any) {
    logger.error("Colapso en la intercepción del Webhook:", error);
    res.status(500).json({ error: "INTERNAL_CORE_ERROR", details: error.message });
  }
});
