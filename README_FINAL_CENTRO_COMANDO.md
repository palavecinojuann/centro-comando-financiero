# 🛡️ Centro de Comando Financiero: Proyecto Búnker

Este es el repositorio central de nuestro Centro de Comando Familiar. Diseñado para globalizar, organizar y visualizar todos los ingresos y gastos de nuestra vida diaria en una única plataforma. Su objetivo es darnos claridad absoluta para establecer prioridades y diseñar planes de acción eficientes frente a los costos, deudas y necesidades de nuestra casa.

### Nuestra Estrategia de Capital:
- **El Cimiento (Bimont S.A.)**: Nuestro ingreso principal y vital, encargado de blindar la tranquilidad de la familia, la educación y el hogar.
- **El Acelerador (Janlu Velas)**: Nuestro proyecto de crecimiento. Se gestiona de forma inteligente para escalarlo hasta convertirlo en un ingreso sólido que potencie el bienestar, el disfrute y la libertad financiera de toda la familia.

---

## 🎨 Identidad Visual (Irish Cream)
- **Fondo**: `#E8DFD1` (Sherwin Williams SW 7537).
- **Acentos**: `#8B735B` (Tonos madera/cálidos).
- **Estética**: Minimalismo funcional, sombras suaves y tipografía *Outfit*.

---

## 🔄 Sincronización entre Equipos (Oficina ↔ Casa)

Para mantener este proyecto disponible en múltiples computadoras, utilizamos **Git**:

1. **En la PC de la Oficina (ya iniciado)**:
   - Crea un repositorio nuevo en GitHub (vacío).
   - Ejecuta estos comandos en esta carpeta:
     ```bash
     git remote add origin https://github.com/palavecinojuann/centro-comando-financiero.git
     git branch -M main
     git push -u origin main
     ```

2. **En la PC de Casa (Configuración Única)**:
   - **Instalar Node.js**: Descárgalo de [nodejs.org](https://nodejs.org/).
   - **Instalar Git**: Descárgalo de [git-scm.com](https://git-scm.com/).
   - **Instalar Firebase Tools**: Abre una terminal y ejecuta:
     ```bash
     npm install -g firebase-tools
     ```
   - **Clonar el proyecto**:
     ```bash
     git clone https://github.com/palavecinojuann/centro-comando-financiero.git
     cd centro-comando-financiero
     npm install
     cd apps/desktop
     npm install
     ```
   - **Iniciar**:
     ```bash
     npm run dev
     ```

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
