import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export async function crearEstructuraFamiliar() { 
  const ID_HOGAR = "hogar_bimont_central"; 
  const UID_JUAN = "REEMPLAZAR_UID_JUAN"; 
  const UID_SOFIA = "REEMPLAZAR_UID_SOFIA";

  try { 
    await setDoc(doc(db, "hogares", ID_HOGAR), { 
      nombre: "Familia Bimont", 
      miembros: [UID_JUAN, UID_SOFIA], 
      configuracion: { moneda: "ARS", punto_de_paz_objetivo: 100 } 
    });
  } catch (error) { 
    console.error("Error al inicializar el hogar:", error); 
  } 
}
