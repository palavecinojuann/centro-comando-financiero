import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Tema Premium para la plataforma Finance Copilot
/// Utiliza colores profundos con acentos esmeralda y oro,
/// preparado para efectos Glassmorphism.
class AppTheme {
  // Paleta de Colores
  static const Color darkBackground = Color(0xFF0B0B0B);
  static const Color emeraldAccent = Color(0xFF2ECC71);
  static const Color goldAccent = Color(0xFFF1C40F);
  static const Color glassBackground = Color(0x1AFFFFFF); // 10% opacity white para glass
  static const Color glassBorder = Color(0x33FFFFFF); // 20% opacity white para bordes glass

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: darkBackground,
      colorScheme: const ColorScheme.dark(
        primary: emeraldAccent,
        secondary: goldAccent,
        surface: darkBackground,
      ),
      textTheme: GoogleFonts.interTextTheme(
        ThemeData.dark().textTheme,
      ).apply(
        bodyColor: Colors.white,
        displayColor: Colors.white,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
    );
  }
}
