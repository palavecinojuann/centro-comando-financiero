import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_theme.dart';
import '../../domain/logic/tactical_engine.dart';
import '../widgets/premium_glass_card.dart';
import '../widgets/neumorphic_container.dart';
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
      body: Stack(
        children: [
          // 3. MOTOR DE LUZ (RADIAL GRADIENT)
          Positioned.fill(
            child: Container(
              decoration: const BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment(0.7, -0.3),
                  radius: 1.2,
                  colors: [
                    Color(0x40D9A852), // Oro Táctico al 25%
                    AppTheme.background,
                  ],
                ),
              ),
            ),
          ),
          
          Row(
            children: [
              _buildSidebar(),
              Expanded(
                child: _buildMainContent(context, peacePoint, sustainability, protocol, totalIncome, totalExpenses),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSidebar() {
    return Container(
      width: 110,
      color: Colors.transparent,
      child: Column(
        children: [
          const SizedBox(height: 60),
          NeumorphicContainer(
            borderRadius: 20,
            padding: const EdgeInsets.all(12),
            child: const Icon(Icons.menu, color: AppTheme.woodAccent, size: 28),
          ),
          const SizedBox(height: 80),
          _buildSidebarItem(0, Icons.dashboard_outlined),
          _buildSidebarItem(1, Icons.flag_outlined),
          _buildSidebarItem(2, Icons.account_balance_wallet_outlined),
          _buildSidebarItem(3, Icons.bar_chart_outlined),
          const Spacer(),
          const Padding(
            padding: EdgeInsets.only(bottom: 60),
            child: Icon(Icons.logout, color: Colors.black26),
          ),
        ],
      ),
    );
  }

  Widget _buildSidebarItem(int index, IconData icon) {
    bool isSelected = _selectedIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _selectedIndex = index),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 20),
        child: NeumorphicContainer(
          width: 60,
          height: 60,
          borderRadius: 18,
          isPressed: isSelected,
          padding: EdgeInsets.zero,
          child: Icon(
            icon,
            color: isSelected ? AppTheme.woodAccent : Colors.black26,
            size: 24,
          ),
        ),
      ),
    );
  }

  Widget _buildMainContent(BuildContext context, double peacePoint, double sustainability, FinancialProtocol protocol, double totalIncome, double totalExpenses) {
    return Column(
      children: [
        _buildTopBar(),
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 20),
            child: Column(
              children: [
                const SizedBox(height: 30),
                AdvancedNeumorphicGauge(peacePoint: peacePoint, sustainability: sustainability),
                const SizedBox(height: 60),
                _buildProtocolButtons(protocol),
                const SizedBox(height: 70),
                _buildBottomGrid(totalIncome, totalExpenses),
                const SizedBox(height: 50),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTopBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(40, 60, 40, 20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'COMMAND CENTER',
            style: GoogleFonts.cinzel(
              fontSize: 26,
              fontWeight: FontWeight.bold,
              letterSpacing: 2.5,
              color: AppTheme.darkText,
            ),
          ),
          NeumorphicContainer(
            borderRadius: 50,
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            child: Row(
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      'Josem Poldaa',
                      style: GoogleFonts.outfit(
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                        color: AppTheme.darkText,
                      ),
                    ),
                    Text(
                      'SW 7537',
                      style: GoogleFonts.outfit(
                        fontSize: 11,
                        color: Colors.black45,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: 15),
                const CircleAvatar(
                  radius: 20,
                  backgroundImage: NetworkImage('https://i.pravatar.cc/150?u=josem'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProtocolButtons(FinancialProtocol currentProtocol) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _buildTacticalButton('Modo Blindaje', Icons.shield_outlined, isSelected: currentProtocol == FinancialProtocol.blindaje),
        const SizedBox(width: 25),
        _buildTacticalButton('Modo Expansión', Icons.trending_up, isSelected: currentProtocol == FinancialProtocol.expansion),
        const SizedBox(width: 25),
        _buildTacticalButton('Modo Disfrute', Icons.celebration_outlined, isSelected: currentProtocol == FinancialProtocol.disfrute),
      ],
    );
  }

  Widget _buildTacticalButton(String label, IconData icon, {bool isSelected = false}) {
    return NeumorphicContainer(
      borderRadius: 50,
      isPressed: isSelected,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Row(
        children: [
          Icon(icon, size: 20, color: isSelected ? AppTheme.goldTactical : Colors.black38),
          const SizedBox(width: 12),
          Text(
            label.toUpperCase(),
            style: GoogleFonts.outfit(
              fontWeight: FontWeight.w900,
              fontSize: 11,
              letterSpacing: 1.2,
              color: isSelected ? AppTheme.darkText : Colors.black38,
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
      childAspectRatio: 2.0,
      mainAxisSpacing: 30,
      crossAxisSpacing: 30,
      children: [
        _buildPremiumGlassCard('Total en Cuentas', '\$ ${totalIncome.toStringAsFixed(0)}'),
        _buildPremiumGlassCard('Gastos del Mes', '\$ ${totalExpenses.toStringAsFixed(0)}', isAccent: totalExpenses < totalIncome),
        _buildPremiumGlassCard('Excedente Líquido', '\$ ${(totalIncome - totalExpenses).toStringAsFixed(0)}'),
        _buildPremiumGlassCard('Alertas Tácticas', '#1 ⚠️', isAlert: true),
      ],
    );
  }

  Widget _buildPremiumGlassCard(String title, String value, {bool isAccent = false, bool isAlert = false}) {
    return PremiumGlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            title.toUpperCase(),
            style: GoogleFonts.outfit(
              fontSize: 11,
              fontWeight: FontWeight.w900,
              letterSpacing: 2.0,
              color: AppTheme.woodAccent.withOpacity(0.8),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: GoogleFonts.outfit(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: isAccent ? const Color(0xFF2E7D32) : (isAlert ? const Color(0xFFEF6C00) : AppTheme.darkText),
            ),
          ),
        ],
      ),
    );
  }
}

class AdvancedNeumorphicGauge extends StatelessWidget {
  final double peacePoint;
  final double sustainability;

  const AdvancedNeumorphicGauge({
    super.key,
    required this.peacePoint,
    required this.sustainability,
  });

  @override
  Widget build(BuildContext context) {
    return NeumorphicContainer(
      width: 320,
      height: 320,
      borderRadius: 160,
      padding: EdgeInsets.zero,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Inner Neumorphic circle for depth
          NeumorphicContainer(
            width: 240,
            height: 240,
            borderRadius: 120,
            isPressed: true,
            padding: EdgeInsets.zero,
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'PEACE POINT',
                    style: GoogleFonts.outfit(
                      fontSize: 13,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 4.0,
                      color: Colors.black38,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${peacePoint.toInt()}',
                    style: GoogleFonts.outfit(
                      fontSize: 92,
                      fontWeight: FontWeight.bold,
                      letterSpacing: -3.0,
                      color: AppTheme.darkText,
                    ),
                  ),
                  Text(
                    'FINANCIAL SECURITY SCORE',
                    style: GoogleFonts.outfit(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 1.5,
                      color: AppTheme.woodAccent,
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          // Outer segment gauge (Custom Paint)
          SizedBox(
            width: 320,
            height: 320,
            child: CustomPaint(
              painter: GaugePainter(sustainability: sustainability),
            ),
          ),
        ],
      ),
    );
  }
}

class GaugePainter extends CustomPainter {
  final double sustainability;
  GaugePainter({required this.sustainability});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width / 2) - 20;
    const strokeWidth = 10.0;

    final paintBase = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    final rect = Rect.fromCircle(center: center, radius: radius);

    // Segmented colors with Neumorphic feel (blended)
    paintBase.color = AppTheme.sageColor.withOpacity(0.4);
    canvas.drawArc(rect, -math.pi / 2, math.pi * 0.7, false, paintBase);

    paintBase.color = AppTheme.terracottaColor.withOpacity(0.4);
    canvas.drawArc(rect, math.pi * 0.2, math.pi * 0.6, false, paintBase);

    paintBase.color = AppTheme.mustardColor.withOpacity(0.4);
    canvas.drawArc(rect, math.pi * 0.8, math.pi * 0.7, false, paintBase);

    // Active progress highlight with Glow
    final paintActive = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth + 4
      ..strokeCap = StrokeCap.round
      ..color = AppTheme.goldTactical;
    
    // Simulating a suttle glow
    canvas.drawArc(rect, -math.pi / 2, (math.pi * 2) * (sustainability / 100), false, paintActive);
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => true;
}
