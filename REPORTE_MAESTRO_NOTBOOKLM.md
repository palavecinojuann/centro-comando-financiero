# 🛡️ Centro de Comando Financiero: Reporte de Arquitectura y Evolución
**Fecha:** 6 de Mayo de 2026
**Versión:** 2.0 (Hito: Sincronización Búnker Casa)
**User ID Maestro:** `5vROOlanaFOGomixSwMs5h05HzD3`

Este documento sirve como la fuente de verdad definitiva para el análisis en **NotebookLM**, consolidando la visión estratégica, el desarrollo técnico y el rumbo operativo del proyecto.

---

## 1. 🎯 Visión y Filosofía del Proyecto
El "Centro de Comando Financiero" no es una aplicación de gestión de gastos tradicional; es un **Búnker de Inteligencia Táctica**. Su objetivo es transformar la relación con el dinero desde una actitud reactiva (contabilidad) a una proactiva (estrategia de capital).

### Pilares Fundamentales:
*   **Operatividad Táctica:** El sistema debe dictar qué hacer con cada excedente basado en el estado vital del hogar.
*   **Aislamiento de Lujo (Aesthetic):** Una interfaz de alta gama que reduzca la fricción psicológica de mirar las finanzas.
*   **Ubicuidad y Portabilidad:** Desarrollo agnóstico al dispositivo, utilizando la nube (Firebase/IDX) y exportaciones periódicas de conocimiento (AI Memory).

---

## 2. 💎 Identidad Visual: "Irish Cream Luxury"
El sistema ha evolucionado de un modo oscuro tecnológico a una estética de **Consola de Operaciones de Lujo**.
*   **Paleta:** Fondo `#F2EDE4` (Crema), Acentos `#8B735B` (Madera/Cuero) y `#D9A852` (Oro Táctico).
*   **Tipografía:** **Cinzel** para títulos (evocando prestigio y solidez) y **Outfit** para datos (modernidad y legibilidad).
*   **Componentes:** Uso intensivo de **Glassmorphism 2.0** con altos niveles de difuminado (blur) y sombras suaves, simulando paneles de cristal físico.

---

## 3. 🧠 Funcionalidades y Motor Lógico

### A. Tactical Engine (IA Financiera)
El núcleo del sistema es un procesador de estados que clasifica la salud financiera en tres protocolos:
1.  🔴 **EMERGENCIA:** (Gastos > Ingresos). Ordena recorte inmediato y congelamiento de capital.
2.  🟤 **BLINDAJE:** (Sostenibilidad < 100% o Excedente < $50k). Prioriza la creación del Fondo de Emergencia (80%) y Caja Operativa (20%).
3.  🟢 **EXPANSIÓN:** (Sostenibilidad total y alta liquidez). Autoriza la aceleración patrimonial: Inyección JANLU (50%), Inversión (30%) y Ocio (20%).

### B. Motor de Compromisos (Commitment Engine)
*   **Gestión de Cuotas:** Permite cargar deudas a plazos. El sistema automatiza el cálculo de "Cuota X de Y", pateando el vencimiento al mes siguiente tras cada pago.
*   **Suscripciones (Ciclo Infinito):** Gestión de gastos fijos mensuales con alarmas basadas en el día del mes, permitiendo la edición rápida de tarifas ante inflación.

### C. Copiloto IA (Gemini NLP to NoSQL)
*   Integración con **Gemini 1.5 Pro** para traducir lenguaje natural ("Pagué internet por 5k") en acciones de base de datos JSON estructuradas.
*   Permite la interacción conversacional para consultas de estado y proyecciones.

---

## 4. 🏗️ Arquitectura Técnica (Flutter SaaS)
El desarrollo utiliza una estructura de **Clean Architecture** para garantizar la escalabilidad y mantenibilidad:

*   **`domain/`**: Entidades puras (`DailyExpense`) y el `TacticalEngine`. Es la lógica de negocio que no depende de frameworks.
*   **`presentation/`**: Widgets de UI (`GlassCard`, `PeacePointGauge`) y pantallas (`DashboardScreen`, `TacticalOpsScreen`) que consumen el estado vía **Riverpod**.
*   **`core/`**: Configuración del tema (`AppTheme`) y utilidades globales.
*   **`data/`**: (En proceso) Repositorios que conectan el dominio con Firebase Firestore y Google Sheets.

---

## 5. 🏗️ Arquitectura Técnica y Sincronización Real (Hito Mayo 6)
El sistema ha pasado de una fase de prototipado con mocks a una **operatividad real-time**:

*   **Persistencia en Firestore:** Los datos se estructuran ahora por Hogares: `/hogares/{idHogar}/gastos`. Cada gasto/compromiso es una entidad reactiva.
*   **Seguridad de Búnker:** Implementación de `firestore.rules` basadas en membresía. Solo los UIDs presentes en la lista de `miembros` de un hogar pueden ver o modificar el capital táctico.
*   **StreamProviders:** El Dashboard utiliza flujos continuos para reflejar cambios en la agenda de pagos e indicadores de salud financiera al instante.

## 🗺️ Rumbo y Metodologías de Desarrollo
El proyecto sigue una metodología de **Desarrollo Iterativo de Alta Fidelidad**:

1.  **Prototipado Táctico:** Se utiliza un archivo maestro (`preview.html`) en la PC de "Casa" para probar rápidamente lógicas.
2.  **Migración a Flutter:** Se porta la lógica validada al entorno SaaS móvil/web.
3.  **CI/CD Automatizado:** Cada `push` a la rama `main` dispara un build de **Flutter Web** que se despliega en Firebase Hosting, inyectando las API Keys de Gemini y Firebase como variables de entorno seguras.
4.  **Brain Sync Process:** Sincronización del "Cerebro" (archivos Markdown) con el código fuente mediante `export.py`, alimentando a NotebookLM.

---

## ✅ 6. Hitos Completados
*   [x] Rediseño Estético "Irish Cream Luxury".
*   [x] Motor Táctico de Protocolos (IA).
*   [x] Editor de Compromisos Visual.
*   [x] Sincronización Real con Firestore.
*   [x] Automatización de Despliegue en la Nube.
