import 'package:freezed_annotation/freezed_annotation.dart';

part 'monthly_budget.freezed.dart';
part 'monthly_budget.g.dart';

@freezed
class MonthlyBudget with _$MonthlyBudget {
  const factory MonthlyBudget({
    required String id,
    required String category,
    required double limit,
    @JsonKey(name: 'current_progress') required double currentProgress,
    @JsonKey(name: 'user_id') required String userId,
    required String month, // Formato YYYY-MM
  }) = _MonthlyBudget;

  factory MonthlyBudget.fromJson(Map<String, dynamic> json) => _$MonthlyBudgetFromJson(json);
}
