# 🛡️ Centro de Comando Financiero: Proyecto Búnker

Este es el repositorio central de tu **Centro de Comando Personal**. Diseñado para separar el sustento familiar (Bimont S.A.) del crecimiento comercial (Janlu Velas).

## 🎨 Identidad Visual (Irish Cream)
- **Fondo**: `#E8DFD1` (Sherwin Williams SW 7537).
- **Acentos**: `#8B735B` (Tonos madera/cálidos).
- **Estética**: Minimalismo funcional, sombras suaves y tipografía *Outfit*.

---

## 🛠️ Configuración Técnica (Entorno Local)

### 1. Inicialización del Proyecto
Ejecuta estos comandos en la terminal desde esta carpeta:

1. **Crear estructura**:
   ```bash
   mkdir -p apps/desktop apps/mobile packages/core
   ```
2. **Setup Desktop**:
   ```bash
   cd apps/desktop && npx create-tauri-app@latest . --template react-ts
   ```
3. **Setup Mobile**:
   ```bash
   cd ../mobile && npx react-native init MobileApp --template react-native-template-typescript
   ```

### 2. Seguridad Cloud (Firestore Rules)
Copia estas reglas en tu consola de Firebase:

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
- **Punto de Paz**: `(Sueldo_Bimont / Gastos_Vitales) * 100`.
- **Triaje Financiero**: Lógica de niveles (5-Intocables a 1-Congelables).
- **Janlu Bridge**: Espejo asincrónico para inyección de utilidades netas.
