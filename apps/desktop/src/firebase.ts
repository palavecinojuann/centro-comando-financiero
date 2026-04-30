import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAVT2RRMOsKIsnCUIN5KeapEOSYb-Bm6TA",
  authDomain: "app-finanzas-ead64.firebaseapp.com",
  projectId: "app-finanzas-ead64",
  storageBucket: "app-finanzas-ead64.firebasestorage.app",
  messagingSenderId: "711292678518",
  appId: "1:711292678518:web:71c815382d430148f0ca57"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
