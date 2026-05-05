import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../core/providers/firebase_providers.dart';
import '../../domain/entities/monthly_budget.dart';
import '../../domain/repositories/budgets_repository.dart';

part 'firestore_budgets_repository.g.dart';

class FirestoreBudgetsRepository implements BudgetsRepository {
  final FirebaseFirestore _firestore;

  FirestoreBudgetsRepository(this._firestore);

  @override
  Stream<List<MonthlyBudget>> watchBudgets(String userId, String month) {
    return _firestore
        .collection('monthly_budgets')
        .where('user_id', isEqualTo: userId)
        .where('month', isEqualTo: month)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs.map((doc) {
        final data = doc.data();
        data['id'] = doc.id;
        return MonthlyBudget.fromJson(data);
      }).toList();
    });
  }

  @override
  Future<void> updateBudgetProgress(String budgetId, double newProgress) async {
    await _firestore.collection('monthly_budgets').doc(budgetId).update({
      'current_progress': newProgress,
    });
  }
}

@riverpod
BudgetsRepository budgetsRepository(BudgetsRepositoryRef ref) {
  return FirestoreBudgetsRepository(ref.watch(firebaseFirestoreProvider));
}
