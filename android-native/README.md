# Restora Native for Android (Kotlin + Jetpack Compose)

This is the **separate, in-progress native Android implementation** of the existing Expo/React Native app. The shipping app remains at the repository root. The Android package ID is deliberately different (`live.restora.nativeapp`) so testers cannot accidentally replace production.

## Current scope

Foundation: Kotlin/Compose, single-activity app, light/dark Restora color tokens, API client, Android Keystore-encrypted session storage, lifecycle-aware StateFlow, permission-gated tabs, and read-only Today / Orders / Tables / Customers views. Order status advancement is deliberately not enabled until offline outbox/reconciliation is ready. No claim is made that the complete app has been ported or tested on devices.

**Not yet ported:** sign-up/verification/forgot password, restaurant setup/switching, offline order outbox, create/edit/pay/cancel/print order, live SSE, QR scan, customer profile/khata, menu/staff/reservations/printers, notifications, and Google sign-in. All require parity work before production replacement.

## Build

Requirements: JDK 21 for Gradle (Java bytecode targets 17), Android SDK Platform 37, Build Tools 36.0.0, Gradle 9.5.0, AGP 9.3.3, Kotlin/Compose compiler 2.4.20. Open `android-native/` in Android Studio, or from that directory run:

```bash
gradle :app:assembleDebug :app:testDebugUnitTest :app:lintDebug
```

GitHub Actions is configured to compile, run unit tests and lint. A successful Android build is not verified until a runner executes it. Kotlin and Android lint warnings are treated as errors. No secrets are required to compile. Default HTTPS server is `https://restora.live/api/v1`; do not commit real credentials or cookie values.

## Architecture

* `data/`: transport, models and encrypted cookie; no UI or global mutable state.
* `ui/`: lifecycle-aware state holder and small screen composables.
* Session cookie stored with AES-256-GCM using non-exportable Android Keystore key; not copied into logs or backups.
* Only the selected tab composes its screen. Collections use stable-key `LazyColumn`, not huge `Column` trees.
* No calls from composables during recomposition; network requests run on `Dispatchers.IO` through a repository.
* Every server request still checks its own permission; the app's permissions merely control UI visibility.

## Release gate

Do not ship instead of React Native until the migration matrix is complete, `assembleRelease` and lint pass, instrumentation on representative low-end phones/tablets passes, migrations and sign-in are validated against a staging server, and crash/performance monitoring is configured.
