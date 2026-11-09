# Restora Native for Android (Kotlin + Jetpack Compose)

This is the **separate, in-progress native Android implementation** of the existing Expo/React Native app. The shipping app remains at the repository root. The Android package ID is deliberately different (`live.restora.nativeapp`) so testers cannot accidentally replace production.

## Current scope

Foundation: Kotlin/Compose, single-activity app, light/dark Restora color tokens, API client, Android Keystore-encrypted session storage, lifecycle-aware StateFlow, permission-gated tabs, and read-only Today / Orders / Tables / Customers views. Order status advancement is deliberately not enabled until offline outbox/reconciliation is ready. No claim is made that the complete app has been ported or tested on devices.

**Not yet ported:** sign-up/verification/forgot password, restaurant setup/switching, offline order outbox, create/edit/pay/cancel/print order, live SSE, QR scan, customer profile/khata, menu/staff/reservations/printers, notifications, and Google sign-in. All require parity work before production replacement.

## Build

Requirements: JDK 21 for Gradle (Java bytecode targets 17), Android SDK Platform 37, Build Tools 36.0.0, Gradle 9.5.0, AGP 9.3.3, Kotlin/Compose compiler 2.4.21. Open `android-native/` in Android Studio, or from that directory run:

```bash
gradle :app:assembleDebug :app:testDebugUnitTest :app:lintDebug
```

GitHub Actions is configured to compile, run unit tests and lint. A successful Android build is not verified until a runner executes it. Kotlin and Android lint warnings are treated as errors. No secrets are required to compile. Default HTTPS server is `https://restora.live/api/v1`; do not commit real credentials or cookie values.

## Faster local builds

**For everyday Kotlin/Compose edits, run only:**

```bash
cd android-native
gradle :app:assembleDebug
```

Use Android Studio **Run** / **Apply Changes** for quick UI iterations. Do not run `clean`, `--refresh-dependencies`, `--no-build-cache`, or the full unit-test-plus-lint task set for every code change. `gradle.properties` now enables the local build cache and configuration cache (strict compatibility mode); it does not skip compilation or change release safety rules.

**For the full verification pass:**

```bash
gradle :app:assembleDebug :app:testDebugUnitTest :app:lintDebug
```

**How to check whether caching works:** run `gradle :app:assembleDebug --info` twice without changing source files. The next build should show `Reusing configuration cache`, and unchanged tasks should be `UP-TO-DATE` or `FROM-CACHE`. First builds download the Gradle distribution, Android SDK, and many dependencies and will still be slower; configuration cache does not accelerate Android Studio's Gradle *sync*.

**Find the real bottleneck:** In Android Studio open **Build > Build Analyzer**, or run `gradle :app:assembleDebug --profile` and open the resulting report under `build/reports/profile`. Check whether the time is spent on downloading dependencies, configuration, Kotlin compilation, or DEX packaging. If the build fails with configuration-cache incompatibility, temporarily rerun with `--no-configuration-cache` and report the exact message rather than suppressing configuration-cache problems.

**Slow-memory devices:** avoid running multiple Gradle builds at once. The 3 GiB Gradle heap setting may be excessive if the computer has little free RAM; monitor swapping before increasing memory or worker counts. Gradle's daemon and Kotlin incremental compilation already operate by default; adding redundant flags will not necessarily speed builds.

The GitHub Actions workflow runs tests and lint to preserve quality. It now avoids overlapping builds on the same feature branch and permits cache writes from its push builds. This does not resolve a GitHub Actions run that fails before receiving a runner.

## Architecture

* `data/`: transport, models and encrypted cookie; no UI or global mutable state.
* `ui/`: lifecycle-aware state holder and small screen composables.
* Session cookie stored with AES-256-GCM using non-exportable Android Keystore key; not copied into logs or backups.
* Only the selected tab composes its screen. Collections use stable-key `LazyColumn`, not huge `Column` trees.
* No calls from composables during recomposition; network requests run on `Dispatchers.IO` through a repository.
* Every server request still checks its own permission; the app's permissions merely control UI visibility.

## Release gate

Do not ship instead of React Native until the migration matrix is complete, `assembleRelease` and lint pass, instrumentation on representative low-end phones/tablets passes, migrations and sign-in are validated against a staging server, and crash/performance monitoring is configured.
