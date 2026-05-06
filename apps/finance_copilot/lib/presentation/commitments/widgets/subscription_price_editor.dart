import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class SubscriptionPriceEditor extends StatelessWidget {
  final double amount;
  final ValueChanged<double> onChanged;

  const SubscriptionPriceEditor({
    super.key,
    required this.amount,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const Text(
          'TARIFA ACTUAL',
          style: TextStyle(
            fontSize: 9,
            fontWeight: FontWeight.w900,
            letterSpacing: 3.0,
            opacity: 0.4,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const Text(
              '$',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.w300,
                color: AppTheme.woodAccent,
              ),
            ),
            const SizedBox(width: 8),
            IntrinsicWidth(
              child: TextField(
                keyboardType: TextInputType.number,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontFamily: 'Outfit',
                  fontSize: 64,
                  fontWeight: FontWeight.w200,
                  letterSpacing: -2.0,
                  color: AppTheme.darkText,
                ),
                decoration: const InputDecoration(
                  border: InputBorder.none,
                  hintText: '0.00',
                  hintStyle: TextStyle(opacity: 0.1),
                ),
                controller: TextEditingController(text: amount.toStringAsFixed(0))
                  ..selection = TextSelection.fromPosition(
                    TextPosition(offset: amount.toStringAsFixed(0).length),
                  ),
                onChanged: (val) {
                  final newAmt = double.tryParse(val);
                  if (newAmt != null) onChanged(newAmt);
                },
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: AppTheme.goldTactical.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Text(
            '⚠️ Ajuste por Inflación',
            style: TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.bold,
              color: AppTheme.goldTactical,
            ),
          ),
        ),
      ],
    );
  }
}
