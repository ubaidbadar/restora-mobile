# Restora Android ID, Google sign-in, and Firebase

## Canonical identifiers

| Setting | Value |
|---|---|
| Google Play Android application ID | `com.restoralive.app` |
| Native APK application ID | `com.restoralive.app` |
| Kotlin source / generated BuildConfig namespace | `live.restora.nativeapp` |
| Web Google OAuth client ID | `415170912813-7ikcdht16n2vgumkkpvaslda5c8kbbop.apps.googleusercontent.com` |
| Firebase project | `restora-live` |
| Public guest links | `https://restora.live/t/<table-code>` |
| Backend API | `https://restora.live/api/v1` |
| Web dashboard | `https://app.restora.live` |

The uploaded `google-services.json` belongs to **`com.restoralive.app`** and is
now included under `app/google-services.json`. It contains public Android
app/Firebase client configuration; do not add service-account JSON or private
OAuth client secrets to the repository. Keep the Firebase API key restricted
appropriately in Google Cloud.

## Android signing requirements

The existing Firebase Android OAuth client is associated with:
- Android package: `com.restoralive.app`
- SHA-1 signing certificate fingerprint (from the supplied client JSON):
  `76:60:F6:04:F6:E6:D3:73:C2:1B:F3:9A:49:2F:02:4E:A2:46:B7:75`

This fingerprint may **not** be your Android Studio debug key, Play App
Signing key, or current upload key. On the Android development machine, run:

```bash
cd android-native
gradle :app:signingReport
```

Compare its **SHA-1** to the Android OAuth clients configured in the
Google Cloud project for `com.restoralive.app`. Add a debug-specific Android
OAuth client if necessary, without modifying the existing production client.
For a Play Store build, inspect the **App signing key certificate** and
**Upload key certificate** in Play Console > App integrity. Do not assume a
debug build is eligible for Play distribution.

### Installing on a test phone

**Caution:** because the native preview and the released React Native app
now use the same Android application ID, they cannot coexist as two installed
apps. A different signing certificate will block in-place installation; a
compatible signature can replace the current installed APK and its code.
Use a spare device/emulator or backup current data before testing.

### Google sign-in architecture

The native app uses stable Android Credential Manager and Google ID Token
libraries to request an ID token scoped to the web client ID. The token and
a freshly generated nonce are submitted to the existing Better Auth endpoint
`POST /api/v1/auth/sign-in/social`. The backend verifies Google authentication
and issues the session cookie. **Do not add a deprecated GoogleSignIn SDK**.

Credentials dependencies:
- `androidx.credentials:credentials:1.6.0`
- `androidx.credentials:credentials-play-services-auth:1.6.0`
- `com.google.android.libraries.identity.googleid:googleid:1.2.1`

Verify production backend `GOOGLE_CLIENT_ID` uses the same web client ID and
`GET /api/v1/public/sign-in-providers` includes Google under `app`. Test
login, cancel, switching Google accounts, offline errors, and sign-out on a
Google Play-enabled device.

### Why the Google Services plugin is not yet added

Credential Manager does not require the `com.google.gms.google-services`
Gradle plugin or a Firebase SDK. The uploaded `google-services.json` is kept
in the native app for future Firebase use, but no Firebase plugin is enabled
until FCM or another Firebase SDK is actually implemented. Avoid unnecessary
plugins and slower builds.

## Play Store release gate

A replacement AAB must have this same application ID, use the Play upload
signing key, and increment `versionCode` above the currently published
version. These are **necessary but not sufficient**. The native preview lacks
feature parity and has not passed device and CI testing. Do **not** publish
it yet. The `versionCode = 1` in this preview is not a claim that it can
replace the current Play release.

Official references:
- https://developer.android.com/build/configure-app-module#set-application-id
- https://developer.android.com/identity/sign-in/credential-manager-siwg-implementation
- https://developer.android.com/jetpack/androidx/releases/credentials
- https://support.google.com/googleplay/android-developer/answer/9842756
- https://firebase.google.com/docs/android/google-services-plugin-and-file
