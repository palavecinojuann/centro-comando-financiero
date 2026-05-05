import 'package:google_generative_ai/google_generative_ai.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'gemini_provider.g.dart';

/// Provider que inicializa y proporciona acceso al modelo de Gemini.
/// La API Key se lee de las variables de entorno inyectadas en tiempo de compilación
/// mediante `--dart-define=GEMINI_API_KEY=tu_clave_aqui`.
@riverpod
GenerativeModel geminiModel(GeminiModelRef ref) {
  const apiKey = String.fromEnvironment('GEMINI_API_KEY');
  
  if (apiKey.isEmpty) {
    // Para entornos de desarrollo donde la variable no esté seteada aún.
    // Lanza una advertencia, pero no crashea de inmediato hasta que se use.
    print('⚠️ WARNING: GEMINI_API_KEY no está definida.');
  }

  return GenerativeModel(
    model: 'gemini-1.5-pro-latest',
    apiKey: apiKey,
    generationConfig: GenerationConfig(
      temperature: 0.2, // Baja temperatura para respuestas lógicas (JSON)
      responseMimeType: 'application/json', // Fuerzo el formato JSON nativamente si el modelo lo soporta
    ),
  );
}
