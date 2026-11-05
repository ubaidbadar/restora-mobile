# Android APK builds on GitHub Actions (without EAS Build)

The [Android APK workflow](../.github/workflows/mobile-build.yml) compiles the
Restora Android app **on a GitHub-hosted Ubuntu runner** with Expo's local
prebuild and Android Gradle. It does not request a build from Expo's cloud
service and does not incur Expo EAS Build queue/priority charges.

- **APK:** `Restora-android.apk`, a standalone release build that does not
  require an Expo/Metro development server.
- **Branches:** `main`, `dev`, `stage`, or manual Actions → Run workflow.
- **iOS:** not built by this workflow for now.
- **Play Store:** the separate `play-release.yml` publishes an AAB from
  `stage` and `main`; it is unchanged.

Expo is still the JavaScript/native framework, and the Expo **Push API** remains
available to the backend for phone notifications. No Expo EAS cloud build is used.

## Setup: what is required and optional?

| Configuration | Needed for APK? | Where |
| --- | --- | --- |
| GitHub Actions `EXPO_TOKEN` | **No** | Not used |
| GitHub `EAS_PROJECT_ID` variable | **No** | Already in `app.json` |
| Expo EAS Build subscription / credentials | **No** | Not used |
| Apple Developer account / APNs key | **No** | iOS builds disabled |
| Google Play service account | **No** | Only separate Play release workflow |
| Android release keystore secrets (four) | **Optional** | GitHub Actions secrets |
| `GOOGLE_SERVICES_JSON` | Optional | GitHub Actions secret, for Android push |
| Firebase FCM V1 credentials | Not for APK creation | Required separately for live Android push |
| `EXPO_PUBLIC_API_URL` | Optional | GitHub Actions variable; defaults to `https://restora.live` |
| `EXPO_PUBLIC_WEB_URL` | Optional | GitHub Actions variable; defaults to `https://app.restora.live` |

The app's Expo Project ID is committed under
`app.json → expo.extra.eas.projectId`, along with `expo.owner`.
Do not remove it: the mobile push token registration uses it even though
**the APK build does not authenticate to EAS**.

The backend `EXPO_ACCESS_TOKEN`, `WEB_PUSH_PUBLIC_KEY`, and
`WEB_PUSH_PRIVATE_KEY` remain **backend-only**. They are not required in
the mobile repository and should never be copied into `EXPO_PUBLIC_*` variables.

### Optional Android signing

The workflow can reuse all four signing secrets already used by the separate
Play Store workflow:

- `ANDROID_KEYSTORE_BASE64` — base64-encoded keystore contents.
- `KEYSTORE_PASSWORD`
- `KEY_ALIAS`
- `KEY_PASSWORD`

If none are set, the generated standalone release APK uses the Android
debug key provided by the GitHub runner. That APK can be installed for
testing, but its signature is not stable between fresh runners, so it may
not update a previously installed APK. For repeatable upgrades, configure
all four signing secrets. If only some are set, the workflow fails clearly.

A key used to upload to Google Play may be different from the **app-signing
key** that Google uses to distribute apps; even a consistently signed test
APK may not upgrade a Play-installed app.

### Optional Android push notifications

To enable Android notifications, add the full Firebase `google-services.json`
contents as the repository secret `GOOGLE_SERVICES_JSON`; the workflow
writes a temporary file before `expo prebuild`. Also configure the
relevant FCM V1 credentials with Expo for push delivery. Without it,
the APK can still run but device push delivery is not set up.

## Download your APK

1. Go to **GitHub → Actions → Build Android APK (GitHub runner)**.
2. Choose `main`, `dev`, or `stage`, then **Run workflow**.
3. Open the run and let the Android Gradle build finish.
4. Download the `Restora-android-<run number>` artifact.
5. Unzip it to get `Restora-android.apk`.

Artifacts are retained for **30 days**. GitHub Actions runner quotas may apply,
but the APK no longer uses the Expo paid build queue.

## Troubleshooting

- **Gradle error:** Inspect the GitHub job logs. The workflow forces an empty
  watched-directories JSON list because Restora doesn't configure Expo inline
  modules; this targets a prior `expo:generateInlineModules` parsing failure.
  Other native compilation errors may still require code changes.
- **APK not generated:** Check the Gradle `assembleRelease` step; no Expo
  EAS build or signing initialization is attempted.
- **App cannot reach backend:** Review `EXPO_PUBLIC_API_URL` and backend
  accessibility; production defaults to `https://restora.live`.
- **Cannot install over existing app:** Signing key or Android package ID
  mismatch. `stage` currently has a different Android package name from
  `main`/`dev`, and the workflow does not alter it.
- **Google Play AAB fails:** The separate `play-release.yml` Gradle job has
  its own build and publishing steps; errors there are independent of the
  downloadable APK job.

Reference: https://docs.expo.dev/guides/local-app-production/
