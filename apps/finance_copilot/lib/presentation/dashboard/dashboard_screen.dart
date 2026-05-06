import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../domain/entities/daily_expense.dart';
import '../widgets/glass_card.dart';
import '../../domain/logic/tactical_engine.dart';
import '../commitments/commitment_edit_dialog.dart';
import 'expenses_provider.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  @override
  Widget build(BuildContext context) {
    // Valores simulados basados en preview.html
    const double totalIncome = 450000;
    const double totalExpenses = 280000;
    const double sustainability = 85.0;
    final protocol = TacticalEngine.calculateProtocol(
      totalIncome: totalIncome,
      totalExpenses: totalExpenses,
      sustainability: sustainability,
    );
    final peacePoint = TacticalEngine.calculatePeacePoint(
      sustainability: sustainability,
      liquidSurplus: totalIncome - totalExpenses,
    );

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(protocol),
              const SizedBox(height: 40),
              Center(
                child: _buildPeacePointGauge(peacePoint, sustainability),
              ),
              const SizedBox(height: 40),
              _buildExecutiveSummary(totalIncome, totalExpenses),
              const SizedBox(height: 32),
              _buildPaymentAgenda(),
              const SizedBox(height: 32),
              _buildQuickActions(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(FinancialProtocol protocol) {
    String protocolName = protocol.name.toUpperCase();
    Color protocolColor = protocol == FinancialProtocol.emergencia 
        ? Colors.red 
        : protocol == FinancialProtocol.blindaje 
            ? AppTheme.woodAccent 
            : Colors.green;

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'COMANDO FINANCIERO',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w900,
                letterSpacing: 4.0,
                color: AppTheme.darkText.withOpacity(0.4),
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Resumen Ejecutivo',
              style: TextStyle(
                fontFamily: 'Cinzel',
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: AppTheme.darkText,
              ),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: protocolColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: protocolColor.withValues(alpha: 0.2)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.bolt, size: 14, color: protocolColor),
                  const SizedBox(width: 6),
                  Text(
                    'PROTOCOLO: $protocolName',
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.5,
                      color: protocolColor,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        const CircleAvatar(
          radius: 24,
          backgroundImage: NetworkImage('https://i.pravatar.cc/150?u=finance_copilot'),
        ),
      ],
    );
  }

  Widget _buildPeacePointGauge(int peacePoint, double sustainability) {
    return Stack(
      alignment: Alignment.center,
      children: [
        SizedBox(
          width: 250,
          height: 250,
          child: CustomPaint(
            painter: GaugePainter(
              progress: sustainability / 100,
              color: sustainability >= 100 ? const Color(0xFF9BB095) : AppTheme.goldTactical,
            ),
          ),
        ),
        Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'PEACE POINT',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w900,
                letterSpacing: 2.0,
                color: AppTheme.darkText.withOpacity(0.4),
              ),
            ),
            Text(
              '$peacePoint',
              style: const TextStyle(
                fontSize: 72,
                fontWeight: FontWeight.w900,
                letterSpacing: -2.0,
                color: AppTheme.darkText,
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.6),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 6,
                    height: 6,
                    decoration: BoxDecoration(
                      color: sustainability >= 100 ? Colors.green : Colors.red,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    'SOSTENIBILIDAD ${sustainability.toInt()}%',
                    style: TextStyle(
                      fontSize: 8,
                      fontWeight: FontWeight.w900,
                      color: sustainability >= 100 ? Colors.green[800] : Colors.red[800],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildExecutiveSummary(double income, double expenses) {
    return Row(
      children: [
        Expanded(
          child: GlassCard(
            height: 120,
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'GASTOS TOTALES',
                  style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, letterSpacing: 1.2, color: AppTheme.darkText.withOpacity(0.5)),
                ),
                Text(
                  '\$${expenses.toStringAsFixed(0)}',
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, letterSpacing: -1.0),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: GlassCard(
            height: 120,
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'INGRESO NETO',
                  style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, letterSpacing: 1.2, color: AppTheme.darkText.withOpacity(0.5)),
                ),
                Text(
                  '\$${income.toStringAsFixed(0)}',
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, letterSpacing: -1.0, color: Color(0xFF9BB095)),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPaymentAgenda() {
    final expensesAsync = ref.watch(currentMonthExpensesProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'AGENDA DE PAGOS',
              style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2.0, color: AppTheme.darkText.withOpacity(0.4)),
            ),
            Icon(Icons.calendar_today, size: 14, color: AppTheme.darkText.withOpacity(0.4)),
          ],
        ),
        const SizedBox(height: 16),
        expensesAsync.when(
          data: (expenses) {
            final commitments = expenses.where((e) => e.type == 'commitment' || e.type == 'recurring').toList();
            if (commitments.isEmpty) {
              return const Padding(
                padding: EdgeInsets.symmetric(vertical: 20),
                child: Center(child: Text('Sin compromisos pendientes', style: TextStyle(color: AppTheme.darkText.withOpacity(0.3), fontSize: 12))),
              );
            }
            return Column(
              children: commitments.map((e) => _buildAgendaItem(context, e)).toList(),
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (err, stack) => Text('Error: $err'),
        ),
      ],
    );
  }

  Widget _buildAgendaItem(BuildContext context, DailyExpense exp) {
    final bool isRecurring = exp.type == 'recurring';
    final String dateStr = '${exp.dueDate?.day} ${exp.dueDate?.month == 5 ? 'May' : 'Jun'}';

    return GestureDetector(
      onTap: () {
        showDialog(
          context: context,
          builder: (context) => CommitmentEditDialog(expense: exp),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.4),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withValues(alpha: 0.5)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                if (isRecurring)
                  const Padding(
                    padding: EdgeInsets.only(right: 12.0),
                    child: Icon(Icons.repeat, size: 16, color: AppTheme.woodAccent),
                  ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(exp.description, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    Text('Vence: $dateStr', style: const TextStyle(fontSize: 10, color: Colors.red, fontWeight: FontWeight.w800)),
                  ],
                ),
              ],
            ),
            Text('\$${exp.amount.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: GestureDetector(
            onTap: () => GoRouter.of(context).push('/tactical'),
            child: GlassCard(
              height: 70,
              child: const Center(
                child: Text(
                  'CENTRO TÁCTICO',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2.0),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: GestureDetector(
            onTap: () => GoRouter.of(context).push('/copilot'),
            child: Container(
              height: 70,
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
                  'COPILOTO IA',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2.0, color: Colors.white),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class GaugePainter extends CustomPainter {
  final double progress;
  final Color color;

  GaugePainter({required this.progress, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;
    const strokeWidth = 20.0;

    // Background circle
    final bgPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.6)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth;
    canvas.drawCircle(center, radius - strokeWidth / 2, bgPaint);

    // Progress arc
    final progressPaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius - strokeWidth / 2),
      -math.pi / 2,
      2 * math.pi * progress,
      false,
      progressPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
