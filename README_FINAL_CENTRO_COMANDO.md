# 🛡️ Centro de Comando Financiero: Proyecto Búnker

Este documento consolida la arquitectura, el diseño y la seguridad del **Centro de Comando Personal**. Diseñado para unificar el flujo de caja familiar bajo una única estrategia de blindaje y crecimiento.

---

## 🎨 Identidad Visual (Kintsugi / Irish Cream)
- **Fondo**: `#F5F1E9` (Variante Premium SW 7537).
- **Acentos**: `#8B735B` (Tonos madera/cálidos).
- **Estética**: High-end glassmorphism, sombras neumórficas suaves y tipografía combinada (*Outfit* para datos, *Playfair Display* para títulos).

---

## 🛠️ Configuración Técnica (Entorno Local)

### 1. `package.json` (Raíz del Monorepo)
```json
{
  "name": "personal-command-center",
  "version": "1.0.0",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "desktop:dev": "npm run dev --workspace=desktop",
    "firebase:deploy": "firebase deploy --only firestore:rules"
  }
}
```

### 2. Estructura de Alojamiento
- **Local**: `C:\Users\bimontcad\.gemini\antigravity\scratch\centro-comando-financiero`
- **Cloud (Datos)**: Firebase Project `app-finanzas-ead64`
- **Control de Versiones**: GitHub `palavecinojuann/centro-comando-financiero`

---

## 🔒 Seguridad Cloud (Firestore Rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function esMiembroDelHogar(idHogar) {
      return request.auth != null && 
             request.auth.uid in get(/databases/$(database)/documents/hogares/$(idHogar)).data.miembros;
    }
    match /{document=**} { allow read, write: if false; }
    match /hogares/{idHogar} {
      allow read: if esMiembroDelHogar(idHogar);
      match /{coleccion}/{documento} {
        allow read, write: if esMiembroDelHogar(idHogar);
      }
    }
    match /usuarios/{uid} { allow read: if request.auth != null && request.auth.uid == uid; }
  }
}
```

---

## 📊 Lógica de Módulos Críticos

1.  **Punto de Paz**: `(Ingresos_Totales / Gastos_Vitales) * 100`. El objetivo es el 100% de cobertura del sustento vital.
2.  **Triaje Financiero**: Lógica de 5 niveles (L5-Vital a L1-Extras).
3.  **Janlu Bridge**: Inyección directa de utilidades netas al flujo de caja unificado.

---

## 🚀 Guía de Sincronización (Oficina ↔ Casa)

### En la PC de Casa (Configuración Única):
1. **Instalar Node.js y Git**.
2. **Instalar Firebase Tools**: `npm install -g firebase-tools`.
3. **Clonar el proyecto**:
   ```bash
   git clone https://github.com/palavecinojuann/centro-comando-financiero.git
   cd centro-comando-financiero
   npm install
   cd apps/desktop
   npm install
   npm run dev
   ```
4. **Login Firebase**: `firebase login`.

---
> **Nota**: Los prototipos interactivos y los mockups visuales premium se encuentran implementados en el código fuente de `apps/desktop/src/App.tsx`.
