import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

part 'ai_insight.freezed.dart';
part 'ai_insight.g.dart';

@Freezed(fieldRename: FieldRename.snake)
class AiInsight with _$AiInsight {
  const factory AiInsight({
    required String id,
    required String suggestion,
    required DateTime timestamp,
    required String userId,
    String? relatedCategory,
  }) = _AiInsight;

  factory AiInsight.fromJson(Map<String, dynamic> json) => _$AiInsightFromJson(json);

  factory AiInsight.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    if (data['timestamp'] is Timestamp) {
      data['timestamp'] = (data['timestamp'] as Timestamp).toDate().toIso8601String();
    }
    return AiInsight.fromJson({
      ...data,
      'id': doc.id,
    });
  }
}
