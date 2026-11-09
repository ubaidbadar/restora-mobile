# Restora: native Google sign-in and Firebase app registration

These instructions are for the **Kotlin preview** only. The React Native app keeps its production package and signing credentials.

## Known configuration

| Item | Value |
|---|---|
| API origin | `https://restora.live` |
| Backend API prefix | `https://restora.live/api/v1` |
| Staff web frontend | `https://app.restora.live` |
| Guest QR origin | `https://restora.live` |
| Web OAuth client ID | `415170912813-7ikcdht16n2vgumkkpvaslda5c8kbbop.apps.googleusercontent.com` |
| Firebase project ID | `restora-live` |
| Existing Expo app package | `com.restoralive.app` |
| New Kotlin preview package | `live.restora.nativeapp` |

The supplied `google-services.json` identifies an Android OAuth client for
`com.restoralive.app`. That configuration **does not match** the intentionally
separate Kotlin preview application ID. The file was **not committed** to the
repository. The preview `.gitignore` also excludes `app/google-services.json`.

## Enable Google on the preview without breaking the production app

1. In Google Cloud Console, open the Google Cloud project associated with Firebase project `restora-live`. Keep the existing **Web application OAuth client** unchanged.
2. In Android Studio, open `android-native/`, then run `gradle :app:signingReport`. Copy the **SHA-1** of the debug signing key from the build machine. Google OAuth requires both the exact Android package name and the signing certificate fingerprint.
3. In **Google Cloud Console > APIs & Services > Credentials**, add a separate **Android OAuth client** for package `live.restora.nativeapp` and that SHA-1. Do **not** delete or modify the production Android client for `com.restoralive.app`.
4. Confirm that the **web OAuth client ID** in `BuildConfig.GOOGLE_WEB_CLIENT_ID` is the ID listed above. It is used as the Credential Manager server client ID, so ID tokens have the correct intended audience.
5. Check the actual backend environment has `GOOGLE_CLIENT_ID` set to that same web client ID and that `GET /api/v1/public/sign-in-providers` includes `google` in `app`. An endpoint check could not be performed from this environment. Do not paste backend secrets into client code.
6. Test the new **Continue with Google** button on a real Android device or emulator with Google Play services. Test successful sign-in, cancellation, a different account, offline mode, sign-out, and a rotated activity. The backend must issue a Better Auth session cookie and `/me` must succeed.
7. For a Play Store build, register the **Google Play App Signing** certificate SHA-1 too. A debug fingerprint does not cover production signing.

Google sign-in uses stable `androidx.credentials:credentials:1.6.0`,
`credentials-play-services-auth:1.6.0`, and
`com.google.android.libraries.identity.googleid:googleid:1.2.1`.
The app calls `/api/v1/auth/sign-in/social` with a Google ID token and a
fresh per-request nonce. Server-side Better Auth validates the token.

### About `google-services.json`

The **Credential Manager Google sign-in flow does not need this Firebase JSON
file or the Google Services Gradle plugin**. Do not add the Firebase Gradle
plugin solely for Google authentication; it slows and may break builds due to
the wrong package. Later, when FCM push notifications or other Firebase SDKs
are added, register the Kotlin preview as an Android app in Firebase, download
the **matching** `google-services.json`, and wire the Gradle plugin at that point.

### Final migration

The native app can use `com.restoralive.app` only when all native features
have parity with the current Expo app, the production signing/Google/Firebase
configuration is verified, and a deliberate rollout plan is approved. Do not
change the package ID now: that would risk replacing the working app on testers'
phones and potentially conflict with the Play Store release.

Official references:
- https://developer.android.com/identity/sign-in/credential-manager-siwg-implementation
- https://developer.android.com/jetpack/androidx/releases/credentials
- https://developers.google.com/identity/android-credential-manager/releases
- https://firebase.google.com/docs/android/google-services-plugin-and-file
- https://better-auth.com/docs/authentication/google
