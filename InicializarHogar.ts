/**
 * InicializarHogar.ts
 * Script de configuración inicial para crear el Búnker Familiar.
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection } from "firebase/firestore";

const configuracionFirebase = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "tu-id",
  appId: "tu-app-id"
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
