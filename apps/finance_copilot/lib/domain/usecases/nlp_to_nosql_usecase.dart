import 'dart:convert';
import 'package:google_generative_ai/google_generative_ai.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../core/providers/gemini_provider.dart';

part 'nlp_to_nosql_usecase.g.dart';

class NlpToNoSqlUseCase {
  final GenerativeModel _model;

  NlpToNoSqlUseCase(this._model);

  static const String _systemPrompt = '''
Eres el motor lógico de un Copiloto Financiero (SaaS). 
Tu tarea es traducir solicitudes en lenguaje natural del usuario a comandos estructurados en formato JSON puro (sin bloques de código Markdown) para ejecutar contra Firestore.

La base de datos tiene estas colecciones:
- "daily_expenses" (campos: amount (number), category (string), description (string), payment_method (string), timestamp (string ISO))

Formato de salida requerido:
{
  "action": "read" | "write",
  "collection": "nombre_coleccion",
  "query": {
    "field": "...",
    "operator": "==", ">", "<", ">=", "<=",
    "value": "..."
  },
  "data_to_write": null | { ... },
  "explanation_for_user": "Un mensaje amigable explicando lo que entendiste y vas a hacer."
}

Ejemplo Entrada: "Gasté 50 en café hoy en efectivo"
Ejemplo Salida JSON:
{
  "action": "write",
  "collection": "daily_expenses",
  "query": null,
  "data_to_write": {
    "amount": 50,
    "category": "café",
    "description": "café hoy",
    "payment_method": "efectivo"
  },
  "explanation_for_user": "Registrando un gasto de \$50 en la categoría café pagado en efectivo."
}
''';

  Future<Map<String, dynamic>> execute(String userInput) async {
    final prompt = '$_systemPrompt\n\nEntrada del usuario: "$userInput"\n\nSalida JSON:';
    
    try {
      final content = [Content.text(prompt)];
      final response = await _model.generateContent(content);
      
      final textResponse = response.text ?? '{}';
      // Limpiar posibles bloques markdown
      final cleanJson = textResponse.replaceAll('```json', '').replaceAll('```', '').trim();
      
      return jsonDecode(cleanJson) as Map<String, dynamic>;
    } catch (e) {
      return {
        "action": "error",
        "explanation_for_user": "Lo siento, tuve un problema analizando tu solicitud. ¿Podrías ser más específico? Error: \$e"
      };
    }
  }
}

@riverpod
NlpToNoSqlUseCase nlpToNoSqlUseCase(NlpToNoSqlUseCaseRef ref) {
  return NlpToNoSqlUseCase(ref.watch(geminiModelProvider));
}
