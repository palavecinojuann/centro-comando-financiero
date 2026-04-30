/**
 * InicializarHogar.ts
 * Script de configuración inicial para crear el Búnker Familiar.
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection } from "firebase/firestore";

const configuracionFirebase = {
  apiKey: "AIzaSyAVT2RRMOsKIsnCUIN5KeapEOSYb-Bm6TA",
  authDomain: "app-finanzas-ead64.firebaseapp.com",
  projectId: "app-finanzas-ead64",
  storageBucket: "app-finanzas-ead64.firebasestorage.app",
  messagingSenderId: "711292678518",
  appId: "1:711292678518:web:71c815382d430148f0ca57"
};

const app = initializeApp(configuracionFirebase);
const db = getFirestore(app);

async function crearEstructuraFamiliar() {
  const ID_HOGAR = "hogar_bimont_central";
  const UID_JUAN = "REEMPLAZAR_CON_UID";
  const UID_SOFIA = "REEMPLAZAR_CON_UID";

  try {
    await setDoc(doc(db, "hogares", ID_HOGAR), {
      nombre: "Familia Bimont",
      miembros: [UID_JUAN, UID_SOFIA],
      fecha_creacion: new Date().toISOString(),
      configuracion: { moneda: "ARS", punto_de_paz_objetivo: 100 }
    });

    await setDoc(doc(db, "usuarios", UID_JUAN), {
      nombre: "Juan",
      id_hogar: ID_HOGAR,
      rol: "administrador"
    });

    await setDoc(doc(db, "usuarios", UID_SOFIA), {
      nombre: "Sofía",
      id_hogar: ID_HOGAR,
      rol: "administrador"
    });

    console.log("✅ Búnker inicializado.");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

crearEstructuraFamiliar();
