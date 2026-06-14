# El Solitario

Juego web de **El Solitario / Peg Solitaire** con estética retro arcade, construido con React, TypeScript, Phaser 3 y Vite.

## Demo en línea

El juego está funcionando en:

https://solitario.l-lab.cl

## Contacto

Instagram de L-Lab:

https://www.instagram.com/l.lab.cl

## Requisitos

- Node.js 22+
- npm
- Android Studio/JDK configurado (`JAVA_HOME`) si vas a abrir o compilar la app móvil Android

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Para probar desde otros dispositivos en la misma red:

```bash
npm run dev:network
```

## Calidad y build

```bash
npm run lint
npm run test
npm run build
npm run preview
```

## Publicación / release

La carpeta `release/` contiene material base para Google Play:

- textos de ficha (`google-play-description.md`)
- política de privacidad base (`privacy-policy.md`)
- guía de Seguridad de datos (`data-safety-google-play.md`)
- checklist (`release-checklist.md`)
- instrucciones de build (`build-instructions.md`)
- assets iniciales (`release/assets/`)

Antes de publicar, reemplaza el email de contacto en la política de privacidad y publícala en una URL pública.

## Android / Capacitor

El proyecto incluye una base Android generada con Capacitor en `android/`. Esta integración está iniciada, pero debe validarse y completarse para publicación final en Google Play.

Identificador configurado:

```txt
com.negrura.elsolitario
```

Versión Android inicial:

```txt
versionCode 1
versionName 1.0.0
```

Flujo recomendado después de cambios web, cuando se trabaje la versión Android:

```bash
npm run build
npm run cap:sync
npm run cap:android
```

Para compilar desde terminal necesitas Java/JDK disponible en `PATH` y `JAVA_HOME` configurado.

## Arquitectura

- `src/app/`: rutas y layout React.
- `src/features/`: pantallas de la aplicación.
- `src/game/core/`: reglas puras, movimientos, scoring, rachas y tiempo.
- `src/game/phaser/`: tablero visual, animaciones, sonido y puente React ↔ Phaser.
- `src/storage/`: persistencia local con `localStorage`.
- `src/**/*.test.ts`: pruebas unitarias de reglas y storage.
- `android/`: proyecto nativo generado por Capacitor.

Consulta `PROJECT_STRUCTURE.md` para una descripción más detallada.

## Persistencia local

La app usa `localStorage` para:

- historial de partidas
- colores personalizados del tablero

La versión 1.0 no incluye creación de cuenta, autenticación ni ranking para mantener el flujo simple y listo para producción.

## Notas de rendimiento

Phaser se carga con `React.lazy()` para no incluir el motor del juego en el bundle inicial. El chunk del tablero es grande por naturaleza del motor, por lo que Vite tiene ajustado el límite de advertencia de tamaño de chunk.
