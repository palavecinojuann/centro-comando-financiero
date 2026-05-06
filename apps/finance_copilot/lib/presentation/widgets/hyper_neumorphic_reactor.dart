import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class HyperNeumorphicReactor extends StatefulWidget {
  final Widget child;
  final double size;
  final VoidCallback? onTap;
  final bool isCircle;
  final double borderRadius;

  const HyperNeumorphicReactor({
    super.key,
    required this.child,
    this.size = 200,
    this.onTap,
    this.isCircle = true,
    this.borderRadius = 24,
  });

  @override
  State<HyperNeumorphicReactor> createState() => _HyperNeumorphicReactorState();
}

class _HyperNeumorphicReactorState extends State<HyperNeumorphicReactor> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) {
        setState(() => _isPressed = false);
        widget.onTap?.call();
      },
      onTapCancel: () => setState(() => _isPressed = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        curve: Curves.easeOutQuad,
        width: widget.size,
        height: widget.size,
        decoration: BoxDecoration(
          shape: widget.isCircle ? BoxShape.circle : BoxShape.rectangle,
          borderRadius: widget.isCircle ? null : BorderRadius.circular(widget.borderRadius),
          color: AppTheme.slateBase,
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: _isPressed 
                ? [AppTheme.slateBase, AppTheme.slateBase] 
                : [AppTheme.slateBase.withOpacity(0.8), const Color(0xFF232635)],
          ),
          boxShadow: _isPressed
              ? [
                  BoxShadow(
                    color: AppTheme.slateDark.withOpacity(0.8),
                    blurRadius: 4,
                    offset: const Offset(2, 2),
                  ),
                  BoxShadow(
                    color: AppTheme.slateLight.withOpacity(0.2),
                    blurRadius: 4,
                    offset: const Offset(-2, -2),
                  ),
                ]
              : [
                  const BoxShadow(
                    color: AppTheme.slateLight,
                    blurRadius: 30,
                    offset: Offset(-12, -12),
                  ),
                  const BoxShadow(
                    color: AppTheme.slateDark,
                    blurRadius: 30,
                    offset: Offset(12, 12),
                  ),
                ],
        ),
        child: AnimatedDefaultTextStyle(
          duration: const Duration(milliseconds: 150),
          style: TextStyle(
            fontFamily: 'Outfit',
            fontWeight: FontWeight.w800,
            color: _isPressed ? AppTheme.neonGreen : AppTheme.mutedText,
            shadows: _isPressed 
                ? [Shadow(color: AppTheme.neonGreen.withOpacity(0.6), blurRadius: 15)] 
                : [],
          ),
          child: widget.child,
        ),
      ),
    );
  }
}
