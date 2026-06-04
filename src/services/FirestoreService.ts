// FirestoreService.ts - Conector oficial a la Base de Datos de Equilibra
import { db } from '../firebase'; 
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { Gasto, Deuda } from './motores/FinancialEngine';

export class FirestoreService {
  
  /**
   * INYECTAR EGRESO FRAGMENTADO (SPLIT TICKETS)
   * Guarda de forma persistente los egresos impactando directamente el acumulado del Cimiento o Acelerador.
   */
  public static async registrarGasto(hogarId: string, gasto: Omit<Gasto, 'id'>): Promise<void> {
    try {
      const colRef = collection(db, 'hogares', hogarId, 'egresos_diarios');
      await addDoc(colRef, {
        ...gasto,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error crítico al registrar egreso en el búnker:", error);
      throw error;
    }
  }

  /**
   * ESCUCHAR EGRESO EN TIEMPO REAL (REAL-TIME SNAPSHOT)
   * Sincroniza la lista de gastos familiares de forma reactiva entre dispositivos.
   */
  public static escucharGastosDelMes(
    hogarId: string, 
    onUpdate: (gastos: Gasto[]) => void
  ): () => void {
    const colRef = collection(db, 'hogares', hogarId, 'egresos_diarios');
    const q = query(colRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const listaGastos: Gasto[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        listaGastos.push({
          id: docSnap.id,
          descripcion: data.descripcion,
          monto: data.monto,
          nivel: data.nivel,
          esEstacional: data.esEstacional,
          mesesProrrateo: data.mesesProrrateo
        });
      });
      onUpdate(listaGastos);
    });
  }

  /**
   * ACTUALIZAR ESTADO DE UNA DEUDA (BOLA DE NIEVE)
   * Guarda el nuevo saldo de un pasivo cuando el Gatillo de Extinción altera sus valores.
   */
  public static async actualizarSaldoDeuda(
    hogarId: string, 
    deudaId: string, 
    nuevoSaldo: number, 
    nuevaCuota: number
  ): Promise<void> {
    try {
      const docRef = doc(db, 'hogares', hogarId, 'deudas', deudaId);
      await updateDoc(docRef, {
        saldoPendiente: nuevoSaldo,
        cuotaMensual: nuevaCuota,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error(`Error al actualizar estado de la deuda ${deudaId}:`, error);
      throw error;
    }
  }
}
