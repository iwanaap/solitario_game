# Guía rápida para formularios de Play Console

## Detalles de la app

- Nombre: El Solitario
- Idioma predeterminado: Español
- App o juego: Juego
- Gratis o de pago: Gratis, salvo que decidas monetizar
- Categoría sugerida: Puzzle o Juegos de mesa

## Contenido de la app

### Política de privacidad

Usa `release/privacy-policy.md` como base y publícala en una URL pública.

### Anuncios

Si no agregas SDK de anuncios:

- La app no contiene anuncios.

### Acceso a la app

- Todas las funciones principales son accesibles sin credenciales.

### Público objetivo

Sugerencia conservadora:

- Público general / mayores de 13 años.

Completa según la estrategia real de publicación.

### Clasificación por edades

Contenido:

- Sin violencia realista.
- Sin contenido sexual.
- Sin apuestas.
- Sin compras.
- Juego de puzzle/estrategia.

### Seguridad de datos

Ver `release/data-safety-google-play.md`.

## Ficha de Play Store

### Descripción corta

Juego clásico de estrategia con estética retro arcade, rachas e historial local.

### Capturas recomendadas

Mínimo sugerido:

1. Menú principal.
2. Tablero durante partida.
3. Modal de victoria/derrota.
4. Historial.
5. Personalización de colores.

### Gráficos incluidos

- Icono: `release/assets/play-store-icon-512.png`
- Feature graphic: `release/assets/feature-graphic-1024x500.png`

## Prueba interna recomendada

Antes de enviar a producción:

1. Crea una prueba interna.
2. Sube el `.aab` firmado.
3. Agrega tu correo como tester.
4. Instala desde el enlace de Play Store.
5. Prueba una partida completa.
6. Verifica que no haya pantallas cortadas.
7. Verifica persistencia después de cerrar y abrir la app.
