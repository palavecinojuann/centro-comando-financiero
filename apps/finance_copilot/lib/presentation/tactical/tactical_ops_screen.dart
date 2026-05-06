import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../widgets/glass_card.dart';
import '../../domain/logic/tactical_engine.dart';

class TacticalOpsScreen extends ConsumerStatefulWidget {
  const TacticalOpsScreen({super.key});

  @override
  ConsumerState<TacticalOpsScreen> createState() => _TacticalOpsScreenState();
}

class _TacticalOpsScreenState extends ConsumerState<TacticalOpsScreen> {
  double simIncomeBoost = 0;
  double simExpenseCut = 0;
  FinancialProtocol? forcedProtocol;

  @override
  Widget build(BuildContext context) {
    // Valores base
    const double baseIncome = 450000;
    const double baseExpenses = 280000;
    const double sustainability = 85.0;

    final effectiveIncome = baseIncome + simIncomeBoost;
    final effectiveExpenses = (baseExpenses - simExpenseCut).clamp(0.0, baseExpenses);
    final liquidSurplus = effectiveIncome - effectiveExpenses;

    final activeProtocol = forcedProtocol ?? TacticalEngine.calculateProtocol(
      totalIncome: effectiveIncome,
      totalExpenses: effectiveExpenses,
      sustainability: sustainability,
    );

    final distribution = TacticalEngine.getDistribution(activeProtocol, liquidSurplus);

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('CENTRO TÁCTICO'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSimulatorPanel(effectiveIncome, effectiveExpenses, liquidSurplus, activeProtocol),
            const SizedBox(height: 32),
            _buildDirectivesPanel(activeProtocol, distribution),
          ],
        ),
      ),
    );
  }

  Widget _buildSimulatorPanel(double income, double expenses, double surplus, FinancialProtocol protocol) {
    return GlassCard(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'SIMULADOR DE ESCENARIOS',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2.0, color: AppTheme.darkText.withOpacity(0.5)),
          ),
          const SizedBox(height: 24),
          _buildSlider('Ingreso Extra (+)', simIncomeBoost, 0, 500000, (val) {
            setState(() => simIncomeBoost = val);
          }, Colors.green),
          const SizedBox(height: 16),
          _buildSlider('Recorte Gastos (-)', simExpenseCut, 0, 150000, (val) {
            setState(() => simExpenseCut = val);
          }, Colors.red),
          const Divider(height: 40, color: Colors.black12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('EXCEDENTE LÍQUIDO', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.darkText.withOpacity(0.6))),
                  Text('\$${surplus.toStringAsFixed(0)}', style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900)),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: AppTheme.darkText,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  protocol.name.toUpperCase(),
                  style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.2),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSlider(String label, double value, double min, double max, Function(double) onChanged, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
            Text('\$${value.toStringAsFixed(0)}', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: color)),
          ],
        ),
        Slider(
          value: value,
          min: min,
          max: max,
          activeColor: color,
          onChanged: onChanged,
        ),
      ],
    );
  }

  Widget _buildDirectivesPanel(FinancialProtocol protocol, Map<String, double> distribution) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'DIRECTRICES DE CAPITAL',
          style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2.0, color: AppTheme.darkText.withOpacity(0.4)),
        ),
        const SizedBox(height: 16),
        if (distribution.isEmpty)
          Text('No hay excedente para distribuir.', style: TextStyle(fontStyle: FontStyle.italic, color: AppTheme.darkText.withOpacity(0.5))),
        ...distribution.entries.map((e) => _buildDirectiveItem(e.key, e.value)),
      ],
    );
  }

  Widget _buildDirectiveItem(String label, double amount) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.black.withValues(alpha: 0.05)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          Text('\$${amount.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 20, color: AppTheme.woodAccent)),
        ],
      ),
    );
  }
}
