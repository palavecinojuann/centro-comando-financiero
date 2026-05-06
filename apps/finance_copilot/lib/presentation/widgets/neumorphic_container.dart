import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class NeumorphicContainer extends StatelessWidget {
  final Widget child;
  final double? width;
  final double? height;
  final double borderRadius;
  final EdgeInsetsGeometry padding;
  final bool isPressed;
  final Color? color;

  const NeumorphicContainer({
    super.key,
    required this.child,
    this.width,
    this.height,
    this.borderRadius = 24.0,
    this.padding = const EdgeInsets.all(16.0),
    this.isPressed = false,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final bgColor = color ?? AppTheme.background;

    return Container(
      width: width,
      height: height,
      padding: padding,
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(borderRadius),
        boxShadow: isPressed
            ? [
                // Inner shadows (simulated with darker colors and no spread)
                BoxShadow(
                  color: AppTheme.neuShadow.withOpacity(0.5),
                  offset: const Offset(4, 4),
                  blurRadius: 10,
                  spreadRadius: 1,
                ),
                BoxShadow(
                  color: AppTheme.neuLight.withOpacity(0.8),
                  offset: const Offset(-4, -4),
                  blurRadius: 10,
                  spreadRadius: 1,
                ),
              ]
            : [
                // Outer shadows
                BoxShadow(
                  color: AppTheme.neuShadow,
                  offset: const Offset(8, 8),
                  blurRadius: 16,
                  spreadRadius: 1,
                ),
                BoxShadow(
                  color: AppTheme.neuLight,
                  offset: const Offset(-8, -8),
                  blurRadius: 16,
                  spreadRadius: 1,
                ),
              ],
      ),
      child: child,
    );
  }
}
