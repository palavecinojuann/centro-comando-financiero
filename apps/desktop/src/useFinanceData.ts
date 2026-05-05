import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './AuthContext';

export interface Transaction {
  id?: string;
  amount: number;
  description: string;
  category?: string;
  type: 'income' | 'expense' | 'commitment' | 'recurring';
  source: 'salary' | 'janlu' | 'other';
  date: any;
  userId: string;
  dueDate?: string;
  totalInstallments?: number | null;
  currentInstallment?: number | null;
  dueDay?: number | null;
  paid?: boolean;
}

export const useFinanceData = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [peacePoint, setPeacePoint] = useState(820);
  const [loading, setLoading] = useState(true);

  // Escuchar transacciones en tiempo real
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      setTransactions(list);
      
      // Lógica de Sostenibilidad (solo sueldo base vs gastos)
      const totalIncomeSalary = list.filter(t => t.type === 'income' && t.source === 'salary').reduce((a, b) => a + Number(b.amount), 0);
      const totalExpenses = list.filter(t => t.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);
      
      const savingsRatio = totalIncomeSalary > 0 ? (totalIncomeSalary - totalExpenses) / totalIncomeSalary : 0;
      setPeacePoint(Math.floor(800 + (savingsRatio * 200)));
      
      setLoading(false);
    }, (error) => {
      console.error("Error en Firestore:", error);
      setLoading(false); // Evitar carga infinita
      if (error.code === 'failed-precondition') {
        console.warn("⚠️ Falta un índice compuesto en Firestore. Revisa el link en la consola de Firebase.");
      }
    });

    return unsubscribe;
  }, [user]);

  const addTransaction = async (t: Omit<Transaction, 'id' | 'userId' | 'date'>) => {
    if (!user) return;
    await addDoc(collection(db, 'transactions'), {
      ...t,
      userId: user.uid,
      date: serverTimestamp(),
    });
  };

  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    if (!user) return;
    const { doc, updateDoc } = await import('firebase/firestore');
    await updateDoc(doc(db, 'transactions', id), data);
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'transactions', id));
  };

  return { transactions, peacePoint, loading, addTransaction, updateTransaction, deleteTransaction };
};
