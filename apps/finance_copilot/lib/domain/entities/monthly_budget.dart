import 'package:freezed_annotation/freezed_annotation.dart';

part 'monthly_budget.freezed.dart';
part 'monthly_budget.g.dart';

@Freezed(fieldRename: FieldRename.snake)
class MonthlyBudget with _$MonthlyBudget {
  const factory MonthlyBudget({
    required String id,
    required String category,
    required double limit,
    required double currentProgress,
    required String userId,
    required String month, // Formato YYYY-MM
  }) = _MonthlyBudget;

  factory MonthlyBudget.fromJson(Map<String, dynamic> json) => _$MonthlyBudgetFromJson(json);
}
