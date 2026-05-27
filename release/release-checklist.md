# Checklist de publicación - El Solitario

## Proyecto

- [ ] `npm run lint` pasa.
- [ ] `npm run test` pasa.
- [ ] `npm run build` pasa.
- [ ] `npm run cap:sync` ejecutado después del último build.
- [ ] Versión revisada en `android/app/build.gradle`.
- [ ] `versionCode` incrementado si no es primera publicación.
- [ ] `applicationId` definitivo: `com.negrura.elsolitario`.
- [ ] Nombre visible revisado: `El Solitario`.

## Android

- [ ] Android Studio abre el proyecto sin errores.
- [ ] Icono launcher revisado en dispositivo/emulador.
- [ ] Splash screen revisada.
- [ ] App probada en vertical y horizontal si aplica.
- [ ] Botón atrás de Android probado.
- [ ] Sonido probado.
- [ ] Vibración probada.
- [ ] Historial probado.
- [ ] Ranking local probado.
- [ ] Cuenta demo local probada.
- [ ] Personalización de colores probada.
- [ ] App Bundle `.aab` generado y firmado.

## Google Play Console

- [ ] Cuenta de desarrollador activa.
- [ ] App creada en Play Console.
- [ ] Nombre, idioma, categoría y tipo configurados.
- [ ] Descripción corta agregada.
- [ ] Descripción completa agregada.
- [ ] Icono 512x512 subido.
- [ ] Feature graphic 1024x500 subido.
- [ ] Capturas de pantalla subidas.
- [ ] Email de contacto configurado.
- [ ] Política de privacidad publicada en una URL pública.
- [ ] Cuestionario de Seguridad de datos completado.
- [ ] Clasificación por edades completada.
- [ ] Público objetivo completado.
- [ ] Declaración de anuncios: sin anuncios, si no agregas ads.
- [ ] Declaración de compras: sin compras, si no agregas IAP.
- [ ] Prueba interna creada.
- [ ] App instalada desde canal de prueba interna.
- [ ] Producción enviada a revisión.

## Assets generados en este proyecto

- `release/assets/play-store-icon-512.png`
- `release/assets/feature-graphic-1024x500.png`

## Pendientes manuales

- Reemplazar `[REEMPLAZAR_CON_EMAIL_DE_CONTACTO]` en `release/privacy-policy.md`.
- Publicar la política de privacidad en una URL pública.
- Crear capturas reales desde dispositivo/emulador.
- Crear y guardar keystore release fuera del repo.
