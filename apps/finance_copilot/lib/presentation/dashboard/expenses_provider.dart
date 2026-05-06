import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../data/repositories/firestore_expenses_repository.dart';
import '../../domain/entities/daily_expense.dart';

part 'expenses_provider.g.dart';

@riverpod
Stream<List<DailyExpense>> currentMonthExpenses(CurrentMonthExpensesRef ref) {
  final repository = ref.watch(expensesRepositoryProvider);
  
  // ID de hogar simulado
  const householdId = 'mi-bunker-casa';
  
  final now = DateTime.now();
  final startOfMonth = DateTime(now.year, now.month, 1);
  final endOfMonth = DateTime(now.year, now.month + 1, 0, 23, 59, 59);
  
  return repository.watchExpenses(householdId, startOfMonth, endOfMonth);
}
