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
  Stream<List<DailyExpense>> watchExpenses(String householdId, DateTime startOfMonth, DateTime endOfMonth) {
    return _firestore
        .collection('hogares')
        .doc(householdId)
        .collection('gastos')
        .where('timestamp', isGreaterThanOrEqualTo: startOfMonth)
        .where('timestamp', isLessThanOrEqualTo: endOfMonth)
        .orderBy('timestamp', descending: true)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs.map((doc) => DailyExpense.fromFirestore(doc)).toList();
    });
  }

  @override
  Future<void> addExpense(String householdId, DailyExpense expense) async {
    final data = expense.toJson();
    data['timestamp'] = Timestamp.fromDate(expense.timestamp);
    data.remove('id');
    
    await _firestore
        .collection('hogares')
        .doc(householdId)
        .collection('gastos')
        .doc(expense.id)
        .set(data);
  }

  @override
  Future<void> deleteExpense(String householdId, String expenseId) async {
    await _firestore
        .collection('hogares')
        .doc(householdId)
        .collection('gastos')
        .doc(expenseId)
        .delete();
  }
}

@riverpod
ExpensesRepository expensesRepository(ExpensesRepositoryRef ref) {
  return FirestoreExpensesRepository(ref.watch(firebaseFirestoreProvider));
}
