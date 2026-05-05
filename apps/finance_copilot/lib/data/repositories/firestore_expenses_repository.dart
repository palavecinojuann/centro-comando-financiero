import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../core/providers/firebase_providers.dart';
import '../../domain/entities/daily_expense.dart';
import '../../domain/repositories/expenses_repository.dart';

part 'firestore_expenses_repository.g.dart';

class FirestoreExpensesRepository implements ExpensesRepository {
  final FirebaseFirestore _firestore;

  FirestoreExpensesRepository(this._firestore);

  @override
  Stream<List<DailyExpense>> watchExpenses(String userId, DateTime startOfMonth, DateTime endOfMonth) {
    return _firestore
        .collection('daily_expenses')
        .where('user_id', isEqualTo: userId)
        .where('timestamp', isGreaterThanOrEqualTo: startOfMonth)
        .where('timestamp', isLessThanOrEqualTo: endOfMonth)
        .orderBy('timestamp', descending: true)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs.map((doc) => DailyExpense.fromFirestore(doc)).toList();
    });
  }

  @override
  Future<void> addExpense(DailyExpense expense) async {
    // Convertimos la entidad a JSON, pero reemplazamos DateTime por Timestamp para Firestore
    final data = expense.toJson();
    data['timestamp'] = Timestamp.fromDate(expense.timestamp);
    data.remove('id'); // Firestore auto-genera el ID o usamos doc(id).set()
    
    await _firestore.collection('daily_expenses').doc(expense.id).set(data);
  }

  @override
  Future<void> deleteExpense(String expenseId) async {
    await _firestore.collection('daily_expenses').doc(expenseId).delete();
  }
}

@riverpod
ExpensesRepository expensesRepository(ExpensesRepositoryRef ref) {
  return FirestoreExpensesRepository(ref.watch(firebaseFirestoreProvider));
}
