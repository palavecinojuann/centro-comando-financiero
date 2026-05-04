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
  category: string;
  type: 'income' | 'expense';
  source: 'salary' | 'janlu' | 'other';
  date: any;
  userId: string;
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
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      setTransactions(list);
      
      // Lógica de Sostenibilidad
      const totalIncomeSalary = list.filter(t => t.type === 'income' && t.source === 'salary').reduce((a, b) => a + b.amount, 0);
      const totalExpenses = list.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
      
      // Peace Point basado en la capacidad de ahorro del sueldo
      const savingsRatio = totalIncomeSalary > 0 ? (totalIncomeSalary - totalExpenses) / totalIncomeSalary : 0;
      setPeacePoint(Math.floor(800 + (savingsRatio * 200)));
      
      setLoading(false);
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

  return { transactions, peacePoint, loading, addTransaction };
};
