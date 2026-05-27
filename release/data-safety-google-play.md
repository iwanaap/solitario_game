# Guía para Seguridad de datos en Google Play

> Importante: usa esto como guía. Debes responder en Play Console según la versión exacta que publiques y cualquier servicio externo que agregues.

## Resumen recomendado para la versión actual

La app funciona de forma local, sin backend propio, sin anuncios, sin compras y sin analítica configurada en el proyecto.

## ¿La app recopila o comparte datos de usuario?

Respuesta sugerida:

- **Recopila datos:** No, si Google interpreta "recopilar" como transmitir datos fuera del dispositivo.
- **Comparte datos:** No.

La app sí guarda datos localmente en el dispositivo mediante `localStorage`, pero no los transmite a un servidor propio.

## Datos guardados localmente

- Email de cuenta demo local.
- Nombre visible.
- País.
- Avatar elegido.
- Historial de partidas.
- Ranking local.
- Colores personalizados.

Uso:

- Funcionalidad de la app.
- Personalización.
- Historial/ranking local.

## Seguridad de datos

Si Play Console pregunta por eliminación de datos:

- El usuario puede borrar historial desde la pantalla Historial.
- El usuario puede cerrar sesión desde Cuenta.
- El usuario puede borrar todos los datos eliminando almacenamiento/datos de la app desde Android.

## Publicidad

Respuesta sugerida:

- La app no contiene anuncios.

## Compras dentro de la app

Respuesta sugerida:

- La app no contiene compras dentro de la app.

## Permisos

Permiso actual detectado:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

Motivo:

- WebView/Capacitor.
- Posible carga de recursos externos, como avatares predeterminados.

## Si agregas Firebase/Supabase/Analytics en el futuro

Deberás actualizar:

- política de privacidad;
- formulario de Seguridad de datos;
- descripción de datos recopilados;
- posibilidad de eliminación de cuenta/datos.
