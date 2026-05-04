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

export interface Expense {
  id?: string;
  amount: number;
  description: string;
  category: string;
  date: any;
  method: string;
  userId: string;
}

export const useFinanceData = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [peacePoint, setPeacePoint] = useState(820); // Valor base
  const [loading, setLoading] = useState(true);

  // Escuchar gastos en tiempo real
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const expenseList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Expense[];
      setExpenses(expenseList);
      
      // Lógica simple para mover el Peace Point (Ejemplo inicial)
      // En el futuro esto vendrá de una fórmula más compleja
      const totalSpent = expenseList.reduce((acc, curr) => acc + curr.amount, 0);
      setPeacePoint(Math.max(0, 1000 - Math.floor(totalSpent / 10)));
      
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const addExpense = async (expense: Omit<Expense, 'id' | 'userId' | 'date'>) => {
    if (!user) return;
    
    try {
      await addDoc(collection(db, 'expenses'), {
        ...expense,
        userId: user.uid,
        date: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error al añadir gasto:", error);
    }
  };

  return { expenses, peacePoint, loading, addExpense };
};
