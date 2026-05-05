import '../entities/monthly_budget.dart';

abstract class BudgetsRepository {
  /// Observa los presupuestos de un mes específico
  Stream<List<MonthlyBudget>> watchBudgets(String userId, String month);
  
  /// Actualiza el progreso de un presupuesto
  Future<void> updateBudgetProgress(String budgetId, double newProgress);
}
