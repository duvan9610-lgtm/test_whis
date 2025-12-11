# Voice Inventory Mobile App

Aplicación móvil para la gestión de inventarios mediante comandos de voz. Permite a los usuarios realizar conteos rápidos de inventario, gestionar usuarios y puntos de venta, conectados a un backend centralizado.

## Características Principales

*   **Reconocimiento de Voz Avanzado:** Detecta cantidades y precios complejos ("veinte por cinco mil", "cuarenta y dos mil").
*   **Gestión de Inventario:** Edición manual, eliminación y visualización de totales en tiempo real.
*   **Gestión de Usuarios:** Registro, edición y eliminación de usuarios (Admin/User).
*   **Integración API:** Conexión segura (JWT) con el backend para sincronización de datos.
*   **UI Moderna:** Interfaz limpia con formateo de moneda (COP) y feedback visual.

## Requisitos Previos

*   **Node.js** (v18 o superior)
*   **Java JDK 17** (Requerido para Android builds)
*   **Android Studio** (con SDK instalado)
*   **Dispositivo Android** o Emulador configurado.

## Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone <url-del-repo>
    cd front-inventario
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar SDK de Android (Windows):**
    Asegúrate de crear el archivo `android/local.properties` si no existe:
    ```properties
    sdk.dir=C:\\Users\\<TuUsuario>\\AppData\\Local\\Android\\Sdk
    ```

## Configuración de Entorno

La configuración principal se encuentra en `src/api/client.ts`.

### URL de la API
Para apuntar al backend, edita la constante `API_URL`:

```typescript
// src/api/client.ts

// Para producción o pruebas remotas:
export const API_URL = 'https://api-cal-9r5v.onrender.com/';

// Para desarrollo local (Emulador Android):
// export const API_URL = 'http://10.0.2.2:3000/';

// Para desarrollo en dispositivo físico (misma WiFi):
// export const API_URL = 'http://192.168.1.X:3000/';
```

> **Nota:** La aplicación usa JWT para autenticación. Asegúrate de que el backend esté corriendo y sea accesible desde el dispositivo móvil.

## Ejecución

### Android
Para compilar y correr la aplicación en un dispositivo o emulador Android:

```bash
npm run android
```
*(Esto ejecuta `npx expo run:android`)*

### Inicio del Metro Bundler
Si la aplicación ya está instalada y solo quieres iniciar el servidor de desarrollo:

```bash
npm start
```

## Estructura del Proyecto

*   `src/api`: Configuración de Axios `client.ts`.
*   `src/context`: Estado global (`AuthContext`, etc).
*   `src/hooks`: Hooks personalizados (`useVoiceRecognition`).
*   `src/navigation`: Configuración de rutas (`AppNavigator`).
*   `src/screens`: Pantallas principales (`VoiceSessionScreen`, `UsersScreen`, `LoginScreen`).
*   `src/utils`: Utilidades de lógica (`voiceParser.ts`, `formatters.ts`).
*   `src/types`: Definiciones de TypeScript.

## Solución de Problemas Comunes

*   **Error de Voz / Micrófono:** Asegúrate de conceder permisos de micrófono al iniciar la app.
*   **Error de Conexión (Network Error):** Verifica que `API_URL` sea correcta y que el dispositivo tenga acceso a internet o a la IP local del servidor.
*   **Build Fallido (Java):** Verifica que `JAVA_HOME` apunte al JDK 17 y que `android/gradle.properties` tenga la configuración correcta.

---
Desarrollado con React Native y Expo.
