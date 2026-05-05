import 'package:googleapis/sheets/v4.dart' as sheets;
import 'package:googleapis_auth/googleapis_auth.dart' as auth;
import 'package:http/http.dart' as http;
import '../../domain/entities/daily_expense.dart';

class SheetsRepository {
  final auth.AuthClient _authClient;

  SheetsRepository(this._authClient);

  /// Sincroniza una lista de gastos con una hoja de cálculo específica de Google Sheets.
  /// Agrega los gastos como nuevas filas al final de la hoja.
  Future<void> backupExpenses(String spreadsheetId, String range, List<DailyExpense> expenses) async {
    final sheetsApi = sheets.SheetsApi(_authClient);

    // Mapear los gastos a una lista de listas (filas y columnas)
    final values = expenses.map((e) => [
      e.id,
      e.timestamp.toIso8601String(),
      e.category,
      e.amount.toString(),
      e.description,
      e.paymentMethod,
    ]).toList();

    final valueRange = sheets.ValueRange(
      values: values,
    );

    try {
      await sheetsApi.spreadsheets.values.append(
        valueRange,
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
      );
    } catch (e) {
      throw Exception('Error al sincronizar con Google Sheets: \$e');
    }
  }
}

/// Helper para crear un AuthClient a partir del accessToken de GoogleSignIn
class GoogleAuthClient extends http.BaseClient {
  final Map<String, String> _headers;
  final http.Client _client = http.Client();

  GoogleAuthClient(this._headers);

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) {
    return _client.send(request..headers.addAll(_headers));
  }
}
