import '../entities/daily_expense.dart';

enum FinancialProtocol {
  emergencia,
  blindaje,
  expansion,
  disfrute,
}

class TacticalEngine {
  /// Calcula el protocolo activo basado en ingresos y egresos efectivos.
  static FinancialProtocol calculateProtocol({
    required double totalIncome,
    required double totalExpenses,
    required double sustainability,
  }) {
    if (totalExpenses > totalIncome) {
      return FinancialProtocol.emergencia;
    }
    
    // Blindaje si la sostenibilidad es baja o el excedente es limitado
    // (Ajustado según los parámetros de preview.html)
    final liquidSurplus = totalIncome - totalExpenses;
    if (sustainability < 100 || liquidSurplus < 50000) {
      return FinancialProtocol.blindaje;
    }
    
    // Modo Disfrute si la sostenibilidad es excepcional (> 120%)
    if (sustainability > 120) {
      return FinancialProtocol.disfrute;
    }
    
    return FinancialProtocol.expansion;
  }

  /// Calcula la distribución de capital sugerida según el protocolo.
  static Map<String, double> getDistribution(FinancialProtocol protocol, double surplus) {
    if (surplus <= 0) return {};

    switch (protocol) {
      case FinancialProtocol.emergencia:
        return {
          'Recorte Inmediato': surplus.abs(),
        };
      case FinancialProtocol.blindaje:
        return {
          'Fondo de Emergencia (80%)': surplus * 0.8,
          'Caja Operativa (20%)': surplus * 0.2,
        };
      case FinancialProtocol.expansion:
        return {
          'Inyección JANLU (50%)': surplus * 0.5,
          'Inversión Externa (30%)': surplus * 0.3,
          'Disfrute Libre (20%)': surplus * 0.2,
        };
      case FinancialProtocol.disfrute:
        return {
          'Inversión (40%)': surplus * 0.4,
          'Disfrute Total (60%)': surplus * 0.6,
        };
    }
  }

  /// Calcula el "Peace Point"
  /// Basado en la fórmula de preview.html: 800 + (sustainability * 2) + (liquidSurplus / 10000)
  static int calculatePeacePoint({
    required double sustainability,
    required double liquidSurplus,
  }) {
    return (800 + (sustainability * 2) + (liquidSurplus / 10000)).floor();
  }
}
