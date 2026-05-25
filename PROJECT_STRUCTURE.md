# Estructura del proyecto

## Resumen

Aplicación web del juego **El Solitario** construida con:

- Vite
- React
- TypeScript
- Phaser 3
- Capacitor
- CSS Modules
- localStorage

La arquitectura separa:

- **React** para navegación, pantallas y flujo general
- **Phaser** para tablero, fichas, animaciones y feedback visual
- **TypeScript puro** para reglas, movimientos y puntajes
- **storage** para persistencia local

---

## Árbol de carpetas

```text
.
├── capacitor.config.ts
├── eslint.config.js
├── index.html
├── package.json
├── PROJECT_STRUCTURE.md
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── routes.tsx
│   │   └── layout/
│   │       ├── AppLayout.module.css
│   │       └── AppLayout.tsx
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── features/
│   │   ├── game/
│   │   │   ├── GamePage.module.css
│   │   │   └── GamePage.tsx
│   │   ├── history/
│   │   │   ├── HistoryPage.module.css
│   │   │   └── HistoryPage.tsx
│   │   ├── home/
│   │   │   ├── HomePage.module.css
│   │   │   └── HomePage.tsx
│   │   ├── how-to-play/
│   │   │   ├── HowToPlayPage.module.css
│   │   │   └── HowToPlayPage.tsx
│   │   └── results/
│   │       ├── ResultsPage.module.css
│   │       └── ResultsPage.tsx
│   ├── game/
│   │   ├── core/
│   │   │   ├── board.ts
│   │   │   ├── gameState.ts
│   │   │   ├── moves.ts
│   │   │   ├── rules.ts
│   │   │   └── scoring.ts
│   │   ├── data/
│   │   │   └── initialBoard.ts
│   │   ├── phaser/
│   │   │   ├── config.ts
│   │   │   ├── GameCanvas.module.css
│   │   │   ├── GameCanvas.tsx
│   │   │   └── scenes/
│   │   │       ├── BootScene.ts
│   │   │       ├── GameScene.ts
│   │   │       └── UIScene.ts
│   │   └── types/
│   │       └── game.types.ts
│   ├── storage/
│   │   ├── historyStorage.ts
│   │   └── save.types.ts
│   ├── styles/
│   │   └── globals.css
│   └── main.tsx
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## Responsabilidades por carpeta

### `src/app/`
Configura la aplicación React.

- `App.tsx`: entrada principal de la app
- `routes.tsx`: rutas de navegación
- `layout/`: layout general compartido

### `src/features/`
Contiene las pantallas funcionales de la app.

- `home/`: menú principal
- `game/`: pantalla del juego y HUD
- `history/`: historial guardado en localStorage
- `how-to-play/`: explicación de reglas
- `results/`: pantalla final y evaluación

### `src/game/core/`
Lógica pura del juego, independiente de la UI.

- `board.ts`: creación y acceso al tablero
- `moves.ts`: validación y aplicación de movimientos
- `rules.ts`: reglas generales y game over
- `scoring.ts`: puntajes, etiquetas y evaluación
- `gameState.ts`: estado global del juego

### `src/game/data/`
Datos estáticos del juego.

- `initialBoard.ts`: layout inicial del tablero 7x7 en cruz

### `src/game/phaser/`
Integración visual del juego con Phaser.

- `config.ts`: configuración del engine
- `GameCanvas.tsx`: puente React ↔ Phaser
- `scenes/BootScene.ts`: arranque inicial
- `scenes/GameScene.ts`: tablero, animaciones, interacción, sonido, vibración
- `scenes/UIScene.ts`: texto de ayuda dentro del canvas

### `src/game/types/`
Tipos compartidos del dominio del juego.

### `src/storage/`
Persistencia local.

- `historyStorage.ts`: guardar, leer y limpiar historial
- `save.types.ts`: tipos de datos persistidos

### `src/styles/`
Estilos globales.

---

## Flujo principal

1. El usuario entra al menú principal.
2. React navega a la pantalla de juego.
3. `GamePage.tsx` monta `GameCanvas.tsx`.
4. Phaser crea `GameScene` y dibuja el tablero.
5. Las jugadas se validan usando funciones de `src/game/core/`.
6. El estado actualizado vuelve a React mediante callbacks.
7. Al terminar la partida se guarda el resultado en `localStorage`.
8. React navega a la pantalla de resultados.

---

## Notas

- El proyecto está preparado para evolucionar hacia móvil con **Capacitor**.
- La lógica del juego está desacoplada del motor gráfico.
- El historial se maneja localmente, sin backend.
