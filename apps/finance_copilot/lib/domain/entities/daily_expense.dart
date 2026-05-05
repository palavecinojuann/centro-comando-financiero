import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

part 'daily_expense.freezed.dart';
part 'daily_expense.g.dart';

@freezed
class DailyExpense with _$DailyExpense {
  const factory DailyExpense({
    required String id,
    required double amount,
    required String category,
    required DateTime timestamp,
    required String description,
    @JsonKey(name: 'payment_method') required String paymentMethod,
    @JsonKey(name: 'user_id') required String userId,
  }) = _DailyExpense;

  factory DailyExpense.fromJson(Map<String, dynamic> json) => _$DailyExpenseFromJson(json);

  /// Helper para convertir desde un documento de Firestore,
  /// manejando la conversión de Timestamp a DateTime.
  factory DailyExpense.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    if (data['timestamp'] is Timestamp) {
      data['timestamp'] = (data['timestamp'] as Timestamp).toDate().toIso8601String();
    }
    return DailyExpense.fromJson({
      ...data,
      'id': doc.id,
    });
  }
}
