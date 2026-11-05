# Automatic Android APK and iOS IPA builds

The GitHub Actions workflow [mobile-build.yml](../.github/workflows/mobile-build.yml) uses
Expo Application Services (EAS) to build two internally distributable **preview** packages:

- Android: `Restora-android.apk` (installable on compatible Android phones).
- iOS: `Restora-ios.ipa` (installable on iPhones/iPads covered by your Apple ad hoc provisioning profile).

It runs on pushes to `main`, `dev`, and `stage` or via **Actions → Build Android APK and iOS IPA → Run workflow**.
Android and iOS build independently. These are **not app-store submissions**.
The separate `play-release.yml` builds an AAB with Gradle for Google Play on `stage` and `main`; it does not use EAS Build.

## Required versus optional configuration

| Item | Where | Requirement |
| --- | --- | --- |
| Expo project ID | `app.json` → `expo.extra.eas.projectId` | **Required**, already committed to this repository |
| Expo project owner | `app.json` → `expo.owner` | **Required**, already committed |
| `EXPO_TOKEN` | GitHub Actions **secret** | **Required** for EAS APK/IPA workflow |
| `EAS_PROJECT_ID` | GitHub Actions variable | **Not required** — don't create it |
| Android signing credentials | Expo EAS credentials | **Required** for signed EAS Android builds; initialize once |
| Apple Developer membership, registered devices, iOS signing | Apple Developer and Expo EAS | **Required** to create/install iPhone device IPAs |
| `EXPO_PUBLIC_API_URL` | EAS preview build environment | Optional: defaults to `https://restora.live` in release |
| `EXPO_PUBLIC_WEB_URL` | EAS preview build environment | Recommended for release: app's current fallback uses a local web server |
| Google OAuth client IDs | EAS preview build environment | Optional, for native Google sign-in |
| Firebase Android config and FCM V1, Apple APNs | Expo/EAS credentials and file environment | Optional for builds; required to use push alerts on the respective platform |

Your backend's `EXPO_ACCESS_TOKEN` and `WEB_PUSH_PUBLIC_KEY`/`WEB_PUSH_PRIVATE_KEY`
are used by **restora-backend**, not by GitHub mobile build authentication.
They are not substitutes for `EXPO_TOKEN`.

## One-time setup

### 1. Confirm the committed Expo project linkage

The Expo project is already linked in this repository's `app.json`, under
`expo.extra.eas.projectId` and `expo.owner`. Do **not** run `eas init` again or
create another Expo project unless you intentionally want to change ownership/linkage.
The workflow checks for the committed project ID and fails with a clear error if it is missing.
No GitHub `EAS_PROJECT_ID` repository variable is used.

### 2. Add the GitHub Actions secret

In **Repository → Settings → Secrets and variables → Actions → New repository secret**, set:

| Type | Name | Value |
| --- | --- | --- |
| Repository secret | `EXPO_TOKEN` | Expo access token from https://expo.dev/settings/access-tokens |

The token must have access to the Expo account that owns the `app.json` project.
Never commit tokens, Apple private keys, or signing keys to Git.

### 3. Initialize signing interactively before CI builds

From a local checkout, sign in with the Expo account and run:

```sh
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
```

Allow EAS to create credentials, or reuse your existing Android app signing key if
preview APKs need to install over an existing Play Store version. An APK signed by
a different key cannot upgrade the installed app.

For an installable **iPhone device IPA**, you need a paid Apple Developer membership.
Register intended devices and complete the initial EAS signing prompts:

```sh
npx eas-cli@latest device:create
npx eas-cli@latest build --platform ios --profile preview
```

New devices must be covered by the updated Apple ad hoc provisioning profile.
An iOS IPA from this preview workflow is not a TestFlight or App Store release.

After signed builds have been initialized interactively, CI can reuse the stored
EAS credentials in non-interactive builds.

### 4. Optional build-time app settings

For the cloud build, set any needed `EXPO_PUBLIC_*` variables in Expo's **preview**
environment. A GitHub Actions repository variable alone will not be sent to the
EAS cloud build. See `../.env.example` for defaults and distinctions.

For native push notifications, the committed Expo project ID is necessary but
not sufficient: Android requires Firebase configuration and FCM credentials;
iOS requires APNs credentials. The backend's browser VAPID keys are independent.

### 5. Download packages

When an Actions run succeeds, scroll to **Artifacts** and download
`Restora-android-<run number>` and/or `Restora-ios-<run number>`.
Unzip the downloaded GitHub artifact to retrieve the `.apk`/`.ipa`.
Artifacts are kept for **30 days**; Expo build quotas apply.

## Troubleshooting

- **Missing EXPO_TOKEN:** Create the GitHub Actions repository secret.
- **Missing Expo project ID:** Commit `expo.extra.eas.projectId` and `expo.owner` in `app.json` for the branch.
- **Non-interactive signing error:** Finish an interactive EAS build for that platform.
- **iOS install rejected:** Register the device and refresh the ad hoc provisioning profile.
- **APK won't update installed app:** Use matching Android signing keys/package ID, or uninstall the old app.
- **Native compilation failure:** Open the EAS build logs linked from GitHub Actions.
- **Stage branch note:** Its existing Android/iOS app IDs differ from `main`/`dev`.
  The project linkage is shared, but signing credentials and package identity can differ;
  do not change the identifiers accidentally.

Reference:
- https://docs.expo.dev/build/building-on-ci/
- https://docs.expo.dev/accounts/programmatic-access/
- https://docs.expo.dev/build/internal-distribution/
