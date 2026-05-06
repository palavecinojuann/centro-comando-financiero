import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_theme.dart';
import '../widgets/glass_card.dart';
import '../../domain/logic/tactical_engine.dart';
import 'expenses_provider.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final expensesAsync = ref.watch(currentMonthExpensesProvider);
    final expenses = expensesAsync.value ?? [];
    
    // Cálculos dinámicos
    final double totalIncome = 450000;
    final double totalExpenses = expenses.fold(0.0, (sum, e) => sum + e.amount);
    final double liquidSurplus = totalIncome - totalExpenses;
    final double sustainability = (liquidSurplus / totalIncome * 100).clamp(0, 100);

    final protocol = TacticalEngine.calculateProtocol(
      totalIncome: totalIncome,
      totalExpenses: totalExpenses,
      sustainability: sustainability,
    );
    final peacePoint = TacticalEngine.calculatePeacePoint(
      sustainability: sustainability,
      liquidSurplus: liquidSurplus,
    );

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: Row(
        children: [
          _buildSidebar(),
          Expanded(
            child: _buildMainContent(context, peacePoint, sustainability, protocol, totalIncome, totalExpenses),
          ),
        ],
      ),
    );
  }

  Widget _buildSidebar() {
    return Container(
      width: 100,
      decoration: BoxDecoration(
        color: AppTheme.background.withOpacity(0.8),
        border: const Border(right: BorderSide(color: Colors.black12, width: 0.5)),
      ),
      child: Column(
        children: [
          const SizedBox(height: 40),
          const Icon(Icons.menu, color: AppTheme.woodAccent, size: 32),
          const SizedBox(height: 60),
          _buildSidebarItem(0, Icons.dashboard_outlined, 'Resumen'),
          _buildSidebarItem(1, Icons.flag_outlined, 'Metas'),
          _buildSidebarItem(2, Icons.account_balance_wallet_outlined, 'Inversión'),
          _buildSidebarItem(3, Icons.bar_chart_outlined, 'Reportes'),
          const Spacer(),
          const Padding(
            padding: EdgeInsets.only(bottom: 40),
            child: Icon(Icons.logout, color: Colors.black26),
          ),
        ],
      ),
    );
  }

  Widget _buildSidebarItem(int index, IconData icon, String label) {
    bool isSelected = _selectedIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _selectedIndex = index),
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 16),
        child: Column(
          children: [
            Icon(
              icon,
              color: isSelected ? AppTheme.woodAccent : Colors.black26,
              size: 28,
            ),
            const SizedBox(height: 4),
            if (isSelected)
              Container(
                width: 4,
                height: 4,
                decoration: const BoxDecoration(
                  color: AppTheme.goldTactical,
                  shape: BoxShape.circle,
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildMainContent(BuildContext context, double peacePoint, double sustainability, FinancialProtocol protocol, double totalIncome, double totalExpenses) {
    return Stack(
      children: [
        // Glow effect
        Positioned(
          right: -100,
          top: 100,
          child: Container(
            width: 400,
            height: 400,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: AppTheme.goldTactical.withOpacity(0.1),
                  blurRadius: 100,
                  spreadRadius: 50,
                ),
              ],
            ),
          ),
        ),
        Column(
          children: [
            _buildTopBar(),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 20),
                child: Column(
                  children: [
                    const SizedBox(height: 20),
                    _buildGaugeSection(peacePoint.toInt(), sustainability),
                    const SizedBox(height: 40),
                    _buildProtocolButtons(protocol),
                    const SizedBox(height: 60),
                    _buildBottomGrid(totalIncome, totalExpenses),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildTopBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(40, 40, 40, 20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'COMMAND CENTER',
            style: GoogleFonts.cinzel(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              letterSpacing: 2.0,
              color: AppTheme.darkText,
            ),
          ),
          Row(
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    'Josem Poldaa',
                    style: GoogleFonts.outfit(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  Text(
                    'SW 7537',
                    style: GoogleFonts.outfit(
                      fontSize: 12,
                      color: Colors.black45,
                      letterSpacing: 1.0,
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 16),
              const CircleAvatar(
                radius: 24,
                backgroundImage: NetworkImage('https://i.pravatar.cc/150?u=josem'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildGaugeSection(int peacePoint, double sustainability) {
    return Column(
      children: [
        SizedBox(
          width: 300,
          height: 300,
          child: CustomPaint(
            painter: PeacePointPainter(sustainability: sustainability),
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'PEACE POINT',
                    style: GoogleFonts.outfit(
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 3.0,
                      color: Colors.black45,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '$peacePoint',
                    style: GoogleFonts.outfit(
                      fontSize: 84,
                      fontWeight: FontWeight.bold,
                      letterSpacing: -2.0,
                      color: AppTheme.darkText,
                    ),
                  ),
                  Text(
                    'FINANCIAL SECURITY SCORE',
                    style: GoogleFonts.outfit(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 1.0,
                      color: Colors.black38,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildProtocolButtons(FinancialProtocol currentProtocol) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _buildTacticalButton('Modo Blindaje', Icons.shield_outlined, isSelected: currentProtocol == FinancialProtocol.blindaje),
        const SizedBox(width: 16),
        _buildTacticalButton('Modo Expansión', Icons.trending_up, isSelected: currentProtocol == FinancialProtocol.expansion),
        const SizedBox(width: 16),
        _buildTacticalButton('Modo Disfrute', Icons.celebration_outlined, isSelected: currentProtocol == FinancialProtocol.disfrute),
      ],
    );
  }

  Widget _buildTacticalButton(String label, IconData icon, {bool isSelected = false}) {
    return GlassCard(
      borderRadius: 50,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
      color: isSelected ? Colors.white : Colors.white24,
      child: Row(
        children: [
          Icon(icon, size: 18, color: isSelected ? AppTheme.woodAccent : Colors.black45),
          const SizedBox(width: 8),
          Text(
            label,
            style: GoogleFonts.outfit(
              fontWeight: FontWeight.bold,
              fontSize: 13,
              color: isSelected ? AppTheme.darkText : Colors.black45,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomGrid(double totalIncome, double totalExpenses) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      childAspectRatio: 2.2,
      mainAxisSpacing: 20,
      crossAxisSpacing: 20,
      children: [
        _buildGlassSummaryCard('Total en Cuentas', '\$ ${totalIncome.toStringAsFixed(0)}'),
        _buildGlassSummaryCard('Gastos del Mes', '\$ ${totalExpenses.toStringAsFixed(0)}', isAccent: totalExpenses < totalIncome),
        _buildGlassSummaryCard('Excedente Líquido', '\$ ${(totalIncome - totalExpenses).toStringAsFixed(0)}'),
        _buildGlassSummaryCard('Alertas', '#1 ⚠️', isAlert: true),
      ],
    );
  }

  Widget _buildGlassSummaryCard(String title, String value, {bool isAccent = false, bool isAlert = false}) {
    return GlassCard(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            title.toUpperCase(),
            style: GoogleFonts.outfit(
              fontSize: 10,
              fontWeight: FontWeight.w900,
              letterSpacing: 2.0,
              color: Colors.black38,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: GoogleFonts.outfit(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: isAccent ? const Color(0xFF2E7D32) : (isAlert ? const Color(0xFFEF6C00) : AppTheme.darkText),
            ),
          ),
        ],
      ),
    );
  }
}

class PeacePointPainter extends CustomPainter {
  final double sustainability;
  PeacePointPainter({required this.sustainability});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;
    const strokeWidth = 14.0;

    final paintBase = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    // Background segments
    final rect = Rect.fromCircle(center: center, radius: radius - strokeWidth);

    // Sage segment
    paintBase.color = AppTheme.sageColor.withOpacity(0.3);
    canvas.drawArc(rect, -math.pi / 2, math.pi * 0.7, false, paintBase);

    // Terracotta segment
    paintBase.color = AppTheme.terracottaColor.withOpacity(0.3);
    canvas.drawArc(rect, math.pi * 0.2, math.pi * 0.6, false, paintBase);

    // Mustard segment
    paintBase.color = AppTheme.mustardColor.withOpacity(0.3);
    canvas.drawArc(rect, math.pi * 0.8, math.pi * 0.7, false, paintBase);

    // Active progress highlight
    final paintActive = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth + 2
      ..strokeCap = StrokeCap.round
      ..color = AppTheme.sageColor;
    
    canvas.drawArc(rect, -math.pi / 2, (math.pi * 2) * (sustainability / 100), false, paintActive);
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => true;
}
