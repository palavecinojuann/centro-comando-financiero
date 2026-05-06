import '../entities/daily_expense.dart';

abstract class ExpensesRepository {
  /// Obtiene los gastos de un hogar para un mes específico
  Stream<List<DailyExpense>> watchExpenses(String householdId, DateTime startOfMonth, DateTime endOfMonth);
  
  /// Agrega un nuevo gasto a un hogar
  Future<void> addExpense(String householdId, DailyExpense expense);
  
  /// Elimina un gasto de un hogar
  Future<void> deleteExpense(String householdId, String expenseId);
}
