# Estructura del proyecto

## Resumen

Aplicación web y móvil Android del juego **El Solitario / Peg Solitaire** construida con:

- Vite
- React
- TypeScript
- Phaser 3
- Capacitor Android
- CSS Modules
- localStorage
- Vitest

La arquitectura separa:

- **React** para navegación, pantallas y flujo general
- **Phaser** para tablero, fichas, animaciones, sonido, vibración y feedback visual
- **TypeScript puro** para reglas, movimientos, fin de juego, rachas, tiempo y puntajes
- **storage** para persistencia local
- **Vitest** para pruebas unitarias de lógica y persistencia
- **Capacitor** para empaquetado Android

---

## Árbol principal de carpetas

```text
.
├── android/                      # Proyecto Android generado por Capacitor
├── capacitor.config.ts            # Config Capacitor: com.negrura.elsolitario
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── PROJECT_STRUCTURE.md
├── README.md
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── release/
│   ├── assets/
│   │   ├── feature-graphic-1024x500.png
│   │   └── play-store-icon-512.png
│   ├── build-instructions.md
│   ├── data-safety-google-play.md
│   ├── google-play-description.md
│   ├── play-console-form-guide.md
│   ├── privacy-policy.md
│   └── release-checklist.md
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── routes.tsx
│   │   └── layout/
│   ├── assets/
│   │   └── hero.png
│   ├── features/
│   │   ├── account/
│   │   ├── game/
│   │   ├── history/
│   │   ├── home/
│   │   ├── how-to-play/
│   │   ├── ranking/
│   │   ├── results/
│   │   └── settings/
│   ├── game/
│   │   ├── core/
│   │   │   ├── board.ts
│   │   │   ├── gameState.ts
│   │   │   ├── gameState.test.ts
│   │   │   ├── id.ts
│   │   │   ├── moves.ts
│   │   │   ├── rules.ts
│   │   │   ├── scoring.ts
│   │   │   ├── streak.ts
│   │   │   └── time.ts
│   │   ├── data/
│   │   │   └── initialBoard.ts
│   │   ├── phaser/
│   │   │   ├── config.ts
│   │   │   ├── GameCanvas.module.css
│   │   │   ├── GameCanvas.tsx
│   │   │   └── scenes/
│   │   └── types/
│   ├── storage/
│   │   ├── authStorage.ts
│   │   ├── historyStorage.ts
│   │   ├── rankingStorage.ts
│   │   ├── save.types.ts
│   │   ├── storage.test.ts
│   │   └── themeStorage.ts
│   ├── styles/
│   │   └── globals.css
│   └── main.tsx
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## Scripts importantes

- `npm run dev`: servidor local de desarrollo.
- `npm run dev:network`: servidor accesible desde la red local.
- `npm run lint`: validación ESLint.
- `npm run test`: pruebas unitarias con Vitest.
- `npm run build`: typecheck + build de producción.
- `npm run preview`: previsualización del build.
- `npm run cap:sync`: sincroniza `dist/` con Capacitor.
- `npm run cap:android`: abre el proyecto Android en Android Studio. Para compilar desde terminal se requiere JDK/`JAVA_HOME`.

---

## Responsabilidades por carpeta

### `src/app/`
Configura la aplicación React.

- `App.tsx`: entrada principal de la app.
- `routes.tsx`: rutas de navegación.
- `layout/`: layout general compartido.

### `src/features/`
Contiene las pantallas funcionales de la app.

- `home/`: menú principal retro arcade, hero animado, tablero decorativo móvil y accesos principales.
- `account/`: cuenta local/demo con email, contraseña, país, avatar, recuperación con código temporal demo y popup de confirmación.
- `game/`: pantalla de juego, cuenta regresiva, HUD, música retro, tema visual guardado, racha, modal de victoria/derrota y respaldo React para bloqueo sin movimientos.
- `history/`: historial local de partidas, mejor resultado y limpieza del historial.
- `how-to-play/`: explicación de reglas.
- `ranking/`: ranking local asociado al usuario autenticado; conserva solo la mejor partida por jugador.
- `results/`: pantalla final con medalla, estrellas y métricas.
- `settings/`: laboratorio visual para personalizar colores del tablero, fichas, selección y movimientos válidos.

### `src/game/core/`
Lógica pura del juego, independiente de la UI.

- `board.ts`: creación y acceso al tablero.
- `moves.ts`: validación y aplicación de movimientos.
- `rules.ts`: conteo de fichas, fin de juego y derrota sin movimientos.
- `scoring.ts`: puntajes, etiquetas, victoria/derrota y resultado perfecto.
- `streak.ts`: ventana compartida de racha de 4 segundos.
- `time.ts`: formateo de duración.
- `gameState.ts`: estado global y aplicación de jugadas.
- `id.ts`: IDs de partida compatibles con webviews sin `crypto.randomUUID`.
- `gameState.test.ts`: pruebas de tablero inicial, movimientos, rachas y clasificación de resultados.

### `src/game/data/`
Datos estáticos del juego.

- `initialBoard.ts`: layout inicial del tablero 7x7 en cruz.

### `src/game/phaser/`
Integración visual con Phaser.

- `config.ts`: configuración del engine con ajustes móviles.
- `GameCanvas.tsx`: puente React ↔ Phaser, cargado de forma diferida desde `GamePage`.
- `scenes/BootScene.ts`: arranque.
- `scenes/GameScene.ts`: tablero, interacción, animaciones, resaltados, sonido, vibración y fin de juego defensivo.
- `scenes/UIScene.ts`: texto de ayuda dentro del canvas.

### `src/game/types/`
Tipos compartidos del dominio y del tema visual.

### `src/storage/`
Persistencia local.

- `authStorage.ts`: autenticación local/demo, sesión, perfiles y recuperación con código temporal.
- `historyStorage.ts`: guardar, leer y limpiar historial.
- `rankingStorage.ts`: ranking local, mejor resultado por jugador y ordenamiento.
- `save.types.ts`: tipos de datos persistidos.
- `themeStorage.ts`: guardar, leer y restaurar tema visual.
- `storage.test.ts`: pruebas de cuenta demo, historial y ranking.

### `src/styles/`
Estilos globales retro arcade: tipografía monoespaciada, botones pixelados, paneles luminosos y scanline global.

### `android/`
Proyecto Android generado por Capacitor.

- `applicationId` y `namespace`: `com.negrura.elsolitario`.
- Versión inicial de publicación: `versionCode 1`, `versionName 1.0.0`.
- Iconos launcher reemplazados por arte propio de El Solitario.
- Los assets web se actualizan con `npm run build && npm run cap:sync`.

### `release/`
Material auxiliar para publicar en Google Play.

- `google-play-description.md`: descripción corta, larga, notas de versión y categoría sugerida.
- `privacy-policy.md`: política de privacidad base con placeholder de email.
- `data-safety-google-play.md`: guía para el formulario de Seguridad de datos.
- `play-console-form-guide.md`: guía para completar Play Console.
- `build-instructions.md`: pasos para generar el `.aab` firmado.
- `release-checklist.md`: checklist final de publicación.
- `assets/`: icono 512x512 y feature graphic 1024x500 para Play Store.

---

## Flujo principal

1. El usuario entra al menú principal animado.
2. React navega a `/game`.
3. `GamePage.tsx` monta `GameCanvas.tsx` con `React.lazy()` y muestra la cuenta regresiva `3, 2, 1, ¡YA!`.
4. Phaser crea `GameScene` y dibuja el tablero.
5. Al terminar la cuenta regresiva inicia el cronómetro.
6. Las jugadas se validan en `src/game/core/`.
7. El estado actualizado vuelve a React mediante callbacks.
8. Si ya no hay movimientos, Phaser dispara el fin de juego; React también tiene una comprobación de respaldo.
9. Con 6 o más fichas, el resultado es derrota; con 5 o menos, victoria.
10. Al terminar se guarda el resultado en historial local y, si hay usuario activo, también en ranking local.
11. Desde el modal se puede reintentar, volver al inicio o ver resultados cuando corresponde.

---

## Notas de calidad y producción

- `npm run lint`, `npm run test` y `npm run build` deben pasar antes de entregar.
- El README ya documenta instalación, desarrollo, build y flujo Android.
- Los assets de plantilla de Vite/React fueron retirados; queda solo `hero.png` como asset interno usado por la app.
- Phaser se carga en un chunk diferido. `vite.config.ts` ajusta `chunkSizeWarningLimit` para evitar warnings esperables por el peso del motor.
- La autenticación sigue siendo local/demo con `localStorage`; para producción debe conectarse a Firebase Auth, Supabase Auth u otro backend real.
- El ranking es local del dispositivo. Para ranking global real hace falta backend.
- En móvil se reducen efectos costosos: cronómetro a 100ms, sin `backdrop-filter` en paneles y sin piezas flotantes decorativas.
- La carpeta `release/` contiene textos, checklist y assets iniciales para Play Store.
- Antes de publicar, reemplazar el email de contacto en `release/privacy-policy.md` y publicar esa política en una URL pública.
- Después de modificar web, sincronizar Android con `npm run build && npm run cap:sync`.
- La compilación Android por terminal requiere Java/JDK configurado; el entorno actual no tiene `JAVA_HOME`.
