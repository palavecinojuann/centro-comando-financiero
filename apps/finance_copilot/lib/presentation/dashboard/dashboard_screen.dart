import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../core/theme/app_theme.dart';
import '../../domain/logic/tactical_engine.dart';
import '../../domain/entities/daily_expense.dart';
import '../widgets/premium_glass_card.dart';
import '../widgets/hyper_neumorphic_reactor.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _selectedIndex = 0;
  final String householdId = 'mi-bunker-casa';

  @override
  Widget build(BuildContext context) {
    // Calculamos el rango del mes actual
    final now = DateTime.now();
    final startOfMonth = DateTime(now.year, now.month, 1);
    final endOfMonth = DateTime(now.year, now.month + 1, 0, 23, 59, 59);

    return StreamBuilder<QuerySnapshot>(
      stream: FirebaseFirestore.instance
          .collection('hogares')
          .doc(householdId)
          .collection('gastos')
          .where('timestamp', isGreaterThanOrEqualTo: startOfMonth)
          .where('timestamp', isLessThanOrEqualTo: endOfMonth)
          .orderBy('timestamp', descending: true)
          .snapshots(),
      builder: (context, snapshot) {
        // Obtenemos los gastos de forma segura, incluso si falla la conexión
        List<DailyExpense> expenses = [];
        if (snapshot.hasData) {
          for (var doc in snapshot.data!.docs) {
            try {
              expenses.add(DailyExpense.fromFirestore(doc));
            } catch (e) {
              debugPrint('Error parseando gasto: $e');
            }
          }
        }

        return _buildUI(context, expenses);
      },
    );
  }

  Widget _buildUI(BuildContext context, List<DailyExpense> expenses) {
    const double totalIncome = 450000.0;
    final double totalExpenses = expenses.fold(0.0, (sum, e) => sum + e.amount);
    final double liquidSurplus = totalIncome - totalExpenses;
    final double sustainability = (totalIncome > 0) 
        ? (liquidSurplus / totalIncome * 100).clamp(0.0, 100.0) 
        : 0.0;

    final protocol = TacticalEngine.calculateProtocol(
      totalIncome: totalIncome,
      totalExpenses: totalExpenses,
      sustainability: sustainability,
    );
    final peacePoint = TacticalEngine.calculatePeacePoint(
      sustainability: sustainability,
      liquidSurplus: liquidSurplus,
    ).toDouble();

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: Stack(
        children: [
          Positioned(
            top: -100,
            left: -100,
            child: Container(
              width: 400,
              height: 400,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.neonGreen.withOpacity(0.05),
                    blurRadius: 100,
                    spreadRadius: 50,
                  ),
                ],
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
      padding: const EdgeInsets.symmetric(vertical: 40),
      child: Column(
        children: [
          const HyperNeumorphicReactor(
            size: 60,
            child: Icon(Icons.menu, color: AppTheme.mutedText, size: 28),
          ),
          const SizedBox(height: 80),
          _buildSidebarItem(0, Icons.dashboard_outlined),
          _buildSidebarItem(1, Icons.flag_outlined),
          _buildSidebarItem(2, Icons.account_balance_wallet_outlined),
          _buildSidebarItem(3, Icons.bar_chart_outlined),
          const Spacer(),
          const HyperNeumorphicReactor(
            size: 50,
            child: Icon(Icons.power_settings_new, color: Colors.redAccent, size: 20),
          ),
        ],
      ),
    );
  }

  Widget _buildSidebarItem(int index, IconData icon) {
    bool isSelected = _selectedIndex == index;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 15),
      child: HyperNeumorphicReactor(
        size: 60,
        onTap: () => setState(() => _selectedIndex = index),
        isCircle: false,
        borderRadius: 15,
        child: Icon(
          icon,
          color: isSelected ? AppTheme.neonGreen : AppTheme.mutedText,
          shadows: isSelected ? [const Shadow(color: AppTheme.neonGreen, blurRadius: 10)] : [],
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
                _buildReactorGauge(peacePoint, sustainability),
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
          const Text(
            'BÚNKER FAMILIAR',
            style: TextStyle(
              fontFamily: 'Cinzel',
              fontSize: 26,
              fontWeight: FontWeight.bold,
              letterSpacing: 3.5,
              color: AppTheme.neonGreen,
              shadows: [Shadow(color: AppTheme.neonGreen, blurRadius: 20)],
            ),
          ),
          HyperNeumorphicReactor(
            size: 70,
            isCircle: false,
            borderRadius: 35,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const CircleAvatar(
                  radius: 18,
                  backgroundColor: AppTheme.slateDark,
                  child: Icon(Icons.home_rounded, color: AppTheme.neonGreen, size: 20),
                ),
                const SizedBox(width: 10),
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('HOGAR', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
                    Text('SISTEMA ACTIVO', style: TextStyle(fontSize: 8, color: AppTheme.neonGreen.withOpacity(0.8))),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReactorGauge(double peacePoint, double sustainability) {
    return HyperNeumorphicReactor(
      size: 320,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'PEACE POINT',
                style: TextStyle(
                  fontFamily: 'Outfit',
                  fontSize: 14,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 5.0,
                  color: AppTheme.mutedText,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '${peacePoint.toInt()}',
                style: const TextStyle(
                  fontFamily: 'Outfit',
                  fontSize: 100,
                  fontWeight: FontWeight.bold,
                  letterSpacing: -4.0,
                  color: AppTheme.neonGreen,
                  shadows: [Shadow(color: AppTheme.neonGreen, blurRadius: 20)],
                ),
              ),
              Text(
                'SISTEMA: OPTIMIZADO',
                style: TextStyle(
                  fontFamily: 'Outfit',
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 2.0,
                  color: AppTheme.neonGreen.withOpacity(0.6),
                ),
              ),
            ],
          ),
          SizedBox(
            width: 280,
            height: 280,
            child: CircularProgressIndicator(
              value: sustainability / 100,
              strokeWidth: 2,
              backgroundColor: AppTheme.slateDark,
              color: AppTheme.neonGreen,
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
        _buildTacticalButton('Blindaje', Icons.shield, isSelected: currentProtocol == FinancialProtocol.blindaje),
        const SizedBox(width: 25),
        _buildTacticalButton('Expansión', Icons.bolt, isSelected: currentProtocol == FinancialProtocol.expansion),
        const SizedBox(width: 25),
        _buildTacticalButton('Disfrute', Icons.diamond, isSelected: currentProtocol == FinancialProtocol.disfrute),
      ],
    );
  }

  Widget _buildTacticalButton(String label, IconData icon, {bool isSelected = false}) {
    return HyperNeumorphicReactor(
      size: 110,
      isCircle: false,
      borderRadius: 20,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon, 
            size: 28, 
            color: isSelected ? AppTheme.neonGreen : AppTheme.mutedText,
            shadows: isSelected ? [const Shadow(color: AppTheme.neonGreen, blurRadius: 15)] : [],
          ),
          const SizedBox(height: 8),
          Text(
            label.toUpperCase(),
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w900,
              color: isSelected ? AppTheme.neonGreen : AppTheme.mutedText,
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
      mainAxisSpacing: 30,
      crossAxisSpacing: 30,
      children: [
        _buildGlassSummaryCard('Ingresos', '\$ ${totalIncome.toStringAsFixed(0)}'),
        _buildGlassSummaryCard('Egresos', '\$ ${totalExpenses.toStringAsFixed(0)}'),
        _buildGlassSummaryCard('Excedente', '\$ ${(totalIncome - totalExpenses).toStringAsFixed(0)}', isAccent: true),
        _buildGlassSummaryCard('Alertas', '#0', isAlert: true),
      ],
    );
  }

  Widget _buildGlassSummaryCard(String title, String value, {bool isAccent = false, bool isAlert = false}) {
    return PremiumGlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            title.toUpperCase(),
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w900,
              letterSpacing: 2.0,
              color: AppTheme.mutedText,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            value,
            style: TextStyle(
              fontSize: 30,
              fontWeight: FontWeight.bold,
              color: isAccent ? AppTheme.neonGreen : (isAlert ? Colors.orangeAccent : Colors.white),
              shadows: isAccent ? [const Shadow(color: AppTheme.neonGreen, blurRadius: 10)] : [],
            ),
          ),
        ],
      ),
    );
  }
}
