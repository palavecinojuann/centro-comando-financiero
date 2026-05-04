import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Configuración real del proyecto Finanzas Hogar
const firebaseConfig = {
  apiKey: "AIzaSyCiuoGBkBynB8o28UFdqwLCtQKIa7zSr1A",
  authDomain: "finanzas-hogar-8129e.firebaseapp.com",
  projectId: "finanzas-hogar-8129e",
  storageBucket: "finanzas-hogar-8129e.firebasestorage.app",
  messagingSenderId: "778909325230",
  appId: "1:778909325230:web:acc244bca14222a1af5a3f"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
