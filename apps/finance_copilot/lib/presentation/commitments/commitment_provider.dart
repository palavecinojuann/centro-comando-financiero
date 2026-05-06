import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/daily_expense.dart';
import '../../domain/repositories/expenses_repository.dart';
import '../../data/repositories/firestore_expenses_repository.dart';

/// Provider para gestionar el estado de edición de un compromiso.
final commitmentEditProvider = StateNotifierProvider.family<CommitmentEditNotifier, DailyExpense, DailyExpense>((ref, expense) {
  final repository = ref.watch(expensesRepositoryProvider);
  return CommitmentEditNotifier(expense, repository);
});

class CommitmentEditNotifier extends StateNotifier<DailyExpense> {
  final ExpensesRepository _repository;
  // ID de hogar simulado (En una app real vendría de un AuthProvider)
  static const String _householdId = 'mi-bunker-casa';

  CommitmentEditNotifier(super.state, this._repository);

  void updateAmount(double newAmount) {
    state = state.copyWith(amount: newAmount);
  }

  void updateDueDay(int day) {
    state = state.copyWith(dueDay: day);
  }

  Future<void> markAsPaid() async {
    DailyExpense newState;
    if (state.type == 'commitment') {
      if (state.currentInstallment < state.totalInstallments) {
        final nextDate = state.dueDate?.add(const Duration(days: 30));
        newState = state.copyWith(
          currentInstallment: state.currentInstallment + 1,
          dueDate: nextDate,
        );
      } else {
        newState = state.copyWith(isPaid: true);
      }
    } else {
      final nextDate = state.dueDate?.add(const Duration(days: 30));
      newState = state.copyWith(dueDate: nextDate);
    }

    // Persistencia Real
    await _repository.addExpense(_householdId, newState);
    state = newState;
  }
}
