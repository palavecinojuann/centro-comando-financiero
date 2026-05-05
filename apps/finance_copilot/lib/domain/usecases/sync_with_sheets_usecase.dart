import 'package:googleapis_auth/googleapis_auth.dart' as auth;
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../data/repositories/sheets_repository.dart';
import '../repositories/expenses_repository.dart';

part 'sync_with_sheets_usecase.g.dart';

class SyncWithSheetsUseCase {
  final ExpensesRepository _expensesRepository;

  SyncWithSheetsUseCase(this._expensesRepository);

  /// Ejecuta el proceso de sincronización leyendo todos los gastos de un mes
  /// y enviándolos a Google Sheets
  Future<void> execute({
    required String userId,
    required DateTime startOfMonth,
    required DateTime endOfMonth,
    required auth.AuthClient authClient,
    required String spreadsheetId,
    required String sheetName, // Ej: "Enero2026!A1:F"
  }) async {
    // 1. Obtener los gastos del repositorio local (Firestore)
    // Ya que watchExpenses es un Stream, usaremos first para obtener el snapshot actual
    final expenses = await _expensesRepository.watchExpenses(userId, startOfMonth, endOfMonth).first;

    if (expenses.isEmpty) {
      return; // Nada que sincronizar
    }

    // 2. Instanciar el repositorio de Sheets con el cliente autenticado
    final sheetsRepository = SheetsRepository(authClient);

    // 3. Enviar a Google Sheets
    await sheetsRepository.backupExpenses(spreadsheetId, sheetName, expenses);
  }
}

// Nota: No inyectamos esto directamente como provider estático porque requiere el AuthClient
// que se obtiene dinámicamente durante el flujo de Google SignIn.
