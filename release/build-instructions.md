# Instrucciones de build para release Android

## 1. Requisitos

- Node.js 22+
- npm
- Android Studio
- JDK configurado
- Variable `JAVA_HOME` configurada

Verifica Java:

```bash
java -version
```

Si falla, instala/configura JDK antes de compilar Android.

## 2. Validar proyecto web

Desde la raíz del proyecto:

```bash
npm install
npm run lint
npm run test
npm run build
```

## 3. Sincronizar Capacitor

```bash
npm run cap:sync
```

## 4. Abrir Android Studio

```bash
npm run cap:android
```

O abre manualmente la carpeta:

```txt
android/
```

## 5. Revisar versión

Archivo:

```txt
android/app/build.gradle
```

Versión actual:

```gradle
versionCode 1
versionName "1.0.0"
```

Para cada actualización en Google Play, incrementa `versionCode`.

Ejemplo:

```gradle
versionCode 2
versionName "1.0.1"
```

## 6. Generar keystore

En Android Studio:

```txt
Build > Generate Signed App Bundle / APK > Android App Bundle
```

Si no tienes keystore, crea uno nuevo.

Guarda en un lugar seguro:

- archivo `.jks`;
- alias;
- contraseña del keystore;
- contraseña de la key.

No subas el keystore al repositorio.

## 7. Generar Android App Bundle

En Android Studio:

```txt
Build > Generate Signed App Bundle / APK
> Android App Bundle
> release
```

El resultado normalmente queda en:

```txt
android/app/release/app-release.aab
```

## 8. Subir a Google Play Console

1. Crear app.
2. Completar ficha de Play Store.
3. Completar Seguridad de datos.
4. Completar clasificación por edades.
5. Crear prueba interna.
6. Subir `.aab`.
7. Probar instalación desde Google Play.
8. Enviar a producción.

## 9. Comando opcional por terminal

Si Java/JDK está configurado:

```bash
cd android
./gradlew bundleRelease
```

Para firmar por terminal se requiere configurar firma release en Gradle o usar Android Studio.
