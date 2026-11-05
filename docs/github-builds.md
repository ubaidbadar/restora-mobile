# Automatic Android APK and iOS IPA builds

The GitHub Actions workflow at [`.github/workflows/mobile-build.yml`](../.github/workflows/mobile-build.yml)
builds two installable **preview** packages using Expo Application Services (EAS):

- **Android:** `Restora-android.apk` (installable on compatible Android phones).
- **iOS:** `Restora-ios.ipa` (installable only on iPhones/iPads included in the Apple ad hoc provisioning profile).

It starts automatically when code is pushed to `main`. You can also start it from
**GitHub → Actions → Build Android APK and iOS IPA → Run workflow** on a chosen branch.
The platforms run independently, so the APK can still succeed if iOS signing fails.

These builds are **not app-store submissions**. The separate `play-release.yml` workflow
remains unchanged and produces an Android App Bundle for Google Play.

## One-time setup (required before CI builds will succeed)

### 1. Link this repository to an Expo EAS project

In a local checkout, install dependencies and log in to the Expo account that should own
the app:

```sh
yarn install --frozen-lockfile
npx eas-cli@latest login
npx eas-cli@latest init
```

Copy the EAS project UUID from Expo (or the newly generated `extra.eas.projectId`).
The existing `app.config.ts` supports the `EAS_PROJECT_ID` environment variable,
so you do **not** need to commit a private token or project UUID.

### 2. Configure GitHub Actions

Go to **Repository → Settings → Secrets and variables → Actions** and set:

| Type | Name | Value |
| --- | --- | --- |
| Repository secret | `EXPO_TOKEN` | Expo access token from https://expo.dev/settings/access-tokens |
| Repository variable | `EAS_PROJECT_ID` | The EAS project's UUID |

Generate the token in the **same Expo account/team** that has access to the project.
Do not place Apple passwords, Expo tokens, or signing keys in source code.

### 3. Initialize Android and Apple signing credentials interactively

On your local computer, perform each initial build once, signed into Expo:

```sh
npx eas-cli@latest build --platform android --profile preview
```

Allow EAS to create an Android keystore, or import the **existing Google Play signing
key** if you need preview APKs to upgrade an already installed Play Store app.
An APK signed by a different key cannot replace the existing installation.

For **iPhone installation**, you need a paid Apple Developer Program membership.
First register your iPhone or iPad, then create the initial iOS build interactively:

```sh
npx eas-cli@latest device:create
npx eas-cli@latest build --platform ios --profile preview
```

Follow Expo's prompts to connect the Apple Developer team and create/upload the
distribution certificate and ad hoc provisioning profile. The iOS bundle identifier
is `com.restoralive.app`. **New iPhones must be registered and included in an
updated provisioning profile before their IPA can be installed.** Once valid
credentials are stored with EAS, CI reuses them non-interactively. Re-run an
interactive iOS build or refresh the provisioning profile after adding devices.

The iOS IPA is **not** a TestFlight or App Store release. For public iPhone
distribution, use an App Store/TestFlight profile and submission workflow instead.

### 4. Configure optional build-time app settings in Expo

The app uses `https://restora.live` as its API in release builds unless
`EXPO_PUBLIC_API_URL` is set. To override it for cloud builds, use the
**preview environment in EAS** (not only a GitHub Actions variable). The
`EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` and `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
values used for Google sign-in also belong in the EAS build environment.

If enabling push notifications, configure `EAS_PROJECT_ID` and an Android
`GOOGLE_SERVICES_JSON` file environment variable in EAS as described by the
app's `.env.example` and `app.config.ts`.

### 5. Download the packages from GitHub

After merging this workflow into `main`, push a commit to `main` or manually
trigger **Actions → Build Android APK and iOS IPA**. When the jobs finish:

1. Open the specific workflow run in GitHub Actions.
2. Scroll to the **Artifacts** area.
3. Download `Restora-android-<run number>` and/or `Restora-ios-<run number>`.
4. Unzip the downloaded GitHub artifact to get the `.apk` or `.ipa` file.

Artifacts are retained for **30 days**. A build requires EAS access and signing
credentials; merging the YAML alone does not create those credentials. EAS build
quotas and Apple provisioning limitations apply.

## Troubleshooting

- **Missing EXPO_TOKEN / EAS_PROJECT_ID:** Configure the GitHub secret and variable.
- **Non-interactive credentials error:** Run the initial platform build locally,
  interactively, and finish the EAS credentials setup.
- **Device cannot install iOS IPA:** Register it with `eas device:create`,
  refresh the ad hoc provisioning profile and rebuild.
- **Android or iOS compilation failure:** Open the EAS build log linked by the
  GitHub Actions step. Source or dependency issues are not fixed by signing setup.
- **APK fails to update existing app:** Use the same Android signing key and package
  identifier as the installed app, or uninstall the installed app first.

Official docs:
- https://docs.expo.dev/build/building-on-ci/
- https://docs.expo.dev/build/eas-json/
- https://docs.expo.dev/build/internal-distribution/
- https://docs.expo.dev/accounts/programmatic-access/
