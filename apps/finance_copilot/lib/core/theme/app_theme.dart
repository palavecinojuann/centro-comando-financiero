import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Tema Premium para la plataforma Finance Copilot
/// Utiliza colores profundos con acentos esmeralda y oro,
/// preparado para efectos Glassmorphism.
class AppTheme {
  // Paleta de Colores "Irish Cream"
  static const Color background = Color(0xFFF2EDE4);
  static const Color woodAccent = Color(0xFF8B735B);
  static const Color goldTactical = Color(0xFFD9A852);
  static const Color darkText = Color(0xFF4A443F);
  static const Color glassBackground = Color(0x99FFFFFF);
  static const Color glassBorder = Color(0x66FFFFFF);
  static const Color emeraldAccent = Color(0xFF50C878);
  static const Color goldAccent = Color(0xFFD9A852);
  static const Color darkBackground = Color(0xFF2C2C2C);

  static ThemeData get luxuryTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: background,
      colorScheme: const ColorScheme.light(
        primary: woodAccent,
        secondary: goldTactical,
        surface: background,
        onSurface: darkText,
      ),
      textTheme: GoogleFonts.outfitTextTheme(
        ThemeData.light().textTheme,
      ).apply(
        bodyColor: darkText,
        displayColor: darkText,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          color: woodAccent,
          fontSize: 20,
          fontWeight: FontWeight.bold,
          fontFamily: 'Cinzel',
        ),
      ),
    );
  }
}
