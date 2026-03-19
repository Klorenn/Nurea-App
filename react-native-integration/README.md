# Integración de RevenueCat (React Native)

Este directorio contiene la implementación de RevenueCat usando `react-native-purchases` y `react-native-purchases-ui`.

## ⚠️ AVISO IMPORTANTE SOBRE PRUEBAS (TESTING)
Actualmente, el proyecto principal es un sistema construido en **Next.js** (Web). El SDK de RevenueCat que hemos implementado es **exclusivo para React Native** (iOS y Android) y depende de módulos nativos (StoreKit en Apple y BillingClient de Google). 

Por lo tanto:
1. **No puedes probar esta integración ("Pruebalo") ejecutando `npm run dev` en la web.** Si intentas importar estos componentes en páginas de Next.js (`app/page.tsx`), la aplicación web fallará ("romperá") porque la web no entiende librerías nativas móviles.
2. Estos archivos (`RevenueCatProvider.tsx`, `SubscribeScreen.tsx`, `SettingsScreen.tsx`) están diseñados para ser copiados o utilizados **exclusivamente en tu proyecto o aplicación móvil (Expo o React Native CLI) de Nurea APP**.

## Archivos
* **`RevenueCatProvider.tsx`**: Contiene el Contexto que inicializa el SDK de RevenueCat y expone un hook (`useRevenueCat`) para saber si el usuario es `Pro` en tiempo real.
* **`SubscribeScreen.tsx`**: Una pantalla que llama a la UI nativa del Paywall de RevenueCat v9.
* **`SettingsScreen.tsx`**: Muestra cómo abrir el *Customer Center* para que los usuarios gestionen sus cancelaciones/reembolsos y también incluye el botón obligatorio de *Restaurar Compras*.

## ¿Cómo probarlo realmente?
Para probar este flujo, debes integrar estos archivos en tu app móvil y ejecutarla en:
* Un dispositivo físico (iPhone / Android) usando Expo Development Build o TestFlight.
* Un simulador de iOS o emulador de Android (Nota: Las pruebas de compras in-app en simuladores de iOS requieren configuración en Xcode (StoreKit Testing)).
