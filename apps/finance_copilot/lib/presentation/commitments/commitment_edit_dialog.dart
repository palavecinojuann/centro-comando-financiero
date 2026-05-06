import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../domain/entities/daily_expense.dart';
import '../widgets/glass_card.dart';
import 'commitment_provider.dart';
import 'widgets/installment_progress_widget.dart';
import 'widgets/subscription_price_editor.dart';

class CommitmentEditDialog extends ConsumerWidget {
  final DailyExpense expense;

  const CommitmentEditDialog({super.key, required this.expense});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final editedExpense = ref.watch(commitmentEditProvider(expense));
    final notifier = ref.read(commitmentEditProvider(expense).notifier);

    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 40),
      child: GlassCard(
        padding: const EdgeInsets.all(32),
        borderRadius: 40,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildHeader(editedExpense),
            const SizedBox(height: 32),
            
            if (editedExpense.type == 'commitment')
              InstallmentProgressWidget(
                current: editedExpense.currentInstallment,
                total: editedExpense.totalInstallments,
              )
            else if (editedExpense.type == 'recurring')
              SubscriptionPriceEditor(
                amount: editedExpense.amount,
                onChanged: (val) => notifier.updateAmount(val),
              ),

            const SizedBox(height: 40),
            _buildActionButtons(context, editedExpense, notifier),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(DailyExpense exp) {
    return Column(
      children: [
        Text(
          exp.type == 'commitment' ? 'GESTIÓN DE DEUDA' : 'SERVICIO MENSUAL',
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w900,
            letterSpacing: 4.0,
            color: AppTheme.darkText.withOpacity(0.5),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          exp.description,
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontFamily: 'Cinzel',
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: AppTheme.darkText,
          ),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: AppTheme.woodAccent.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            exp.type == 'commitment' ? 'VENCE: ${exp.dueDate?.day} CADA MES' : 'CICLO INFINITO',
            style: const TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.bold,
              color: AppTheme.woodAccent,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildActionButtons(BuildContext context, DailyExpense exp, CommitmentEditNotifier notifier) {
    return Column(
      children: [
        GestureDetector(
          onTap: () {
            notifier.markAsPaid();
            Navigator.pop(context);
          },
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppTheme.woodAccent, Color(0xFF4A443F)],
              ),
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.woodAccent.withValues(alpha: 0.3),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: const Center(
              child: Text(
                'LIQUIDAR PERÍODO ACTUAL',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 2.0,
                  color: Colors.white,
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 16),
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text(
            'CANCELAR',
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w900,
              letterSpacing: 1.5,
              color: AppTheme.darkText.withOpacity(0.3),
            ),
          ),
        ),
      ],
    );
  }
}
