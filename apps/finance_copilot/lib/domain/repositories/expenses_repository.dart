import '../entities/daily_expense.dart';

abstract class ExpensesRepository {
  /// Obtiene los gastos de un usuario para un mes específico
  Stream<List<DailyExpense>> watchExpenses(String userId, DateTime startOfMonth, DateTime endOfMonth);
  
  /// Agrega un nuevo gasto
  Future<void> addExpense(DailyExpense expense);
  
  /// Elimina un gasto
  Future<void> deleteExpense(String expenseId);
}
