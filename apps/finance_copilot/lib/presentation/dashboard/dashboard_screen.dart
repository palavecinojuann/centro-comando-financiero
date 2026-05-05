import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../widgets/glass_card.dart';
import '../widgets/finance_line_chart.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          color: AppTheme.darkBackground,
          // Un sutil fondo con blobs oscuros para dar profundidad al glassmorphism
          image: DecorationImage(
            image: NetworkImage('https://www.transparenttextures.com/patterns/stardust.png'), // Placeholder para textura sutil
            opacity: 0.1,
            repeat: ImageRepeat.repeat,
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(),
                const SizedBox(height: 32),
                _buildMainBalance(),
                const SizedBox(height: 24),
                const Expanded(
                  child: GlassCard(
                    padding: EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Tendencia de Gastos',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                        SizedBox(height: 24),
                        Expanded(child: FinanceLineChart()),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                _buildQuickActions(context),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Buenos días,',
              style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 14),
            ),
            const Text(
              'Comandante 🚀',
              style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        const CircleAvatar(
          backgroundColor: AppTheme.emeraldAccent,
          child: Icon(Icons.person, color: AppTheme.darkBackground),
        ),
      ],
    );
  }

  Widget _buildMainBalance() {
    return GlassCard(
      height: 160,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Presupuesto Disponible',
                style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 16),
              ),
              const Icon(Icons.account_balance_wallet, color: AppTheme.goldAccent),
            ],
          ),
          const SizedBox(height: 8),
          const Text(
            '\$2,450.00',
            style: TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.trending_up, color: AppTheme.emeraldAccent, size: 16),
              const SizedBox(width: 4),
              Text(
                '+12% vs mes pasado',
                style: TextStyle(color: AppTheme.emeraldAccent.withValues(alpha: 0.9), fontSize: 14),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: GlassCard(
            height: 80,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.add, color: AppTheme.emeraldAccent),
                const SizedBox(width: 8),
                Text('Añadir Gasto', style: TextStyle(color: Colors.white.withValues(alpha: 0.9), fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: GestureDetector(
            onTap: () => GoRouter.of(context).push('/copilot'),
            child: GlassCard(
              height: 80,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.auto_awesome, color: AppTheme.goldAccent),
                  const SizedBox(width: 8),
                  Text('Copiloto IA', style: TextStyle(color: Colors.white.withValues(alpha: 0.9), fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
