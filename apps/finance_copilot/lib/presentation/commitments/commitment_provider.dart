import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/daily_expense.dart';

/// Provider para gestionar el estado de edición de un compromiso.
/// En una app real, esto llamaría al repositorio para persistir los cambios.
final commitmentEditProvider = StateNotifierProvider.family<CommitmentEditNotifier, DailyExpense, DailyExpense>((ref, expense) {
  return CommitmentEditNotifier(expense);
});

class CommitmentEditNotifier extends StateNotifier<DailyExpense> {
  CommitmentEditNotifier(super.state);

  void updateAmount(double newAmount) {
    state = state.copyWith(amount: newAmount);
  }

  void updateDueDay(int day) {
    state = state.copyWith(dueDay: day);
  }

  void markAsPaid() {
    if (state.type == 'commitment') {
      if (state.currentInstallment < state.totalInstallments) {
        // Patear al mes siguiente y subir cuota
        final nextDate = state.dueDate?.add(const Duration(days: 30)); // Simplificado
        state = state.copyWith(
          currentInstallment: state.currentInstallment + 1,
          dueDate: nextDate,
        );
      } else {
        state = state.copyWith(isPaid: true);
      }
    } else if (state.type == 'recurring') {
      // Solo patear fecha
      final nextDate = state.dueDate?.add(const Duration(days: 30));
      state = state.copyWith(dueDate: nextDate);
    }
  }
}
