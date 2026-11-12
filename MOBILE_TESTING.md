# Testing Restora mobile on actual devices

**Scope:** Expo SDK 58, React Native 0.88, app id `app.restora.live`, phones and tablets only. Web app screenshots are not mobile app tests.

## What passing `yarn verify` means

It checks TypeScript, ESLint and Restora source conventions. It does **not** launch the native app, verify any layout, test navigation, exercise gestures, capture screenshots, test iOS/Android compatibility or check end-to-end order behavior.

## First: visual, installable smoke tests (already scaffolded)

The project includes `.maestro/auth_navigation.yaml` with zero server writes. It opens Sign in, Forgot password and Create account, asserts the expected headings and captures screenshots.

- Local Android device/emulator: install an APK built from this exact commit, install Maestro CLI, then `maestro test .maestro/auth_navigation.yaml`.
- EAS Android emulator (manual): `npx eas-cli@latest workflow:run .eas/workflows/visual-smoke-android.yml`
- EAS iOS Simulator (manual): `npx eas-cli@latest workflow:run .eas/workflows/visual-smoke-ios.yml`
- Review screenshot and video artifacts in the EAS workflow run. EAS Maestro jobs are alpha. The workflow is deliberately **not triggered on every push** because builds and emulator jobs cost resources.
- The `e2e-test` profile in `eas.json` produces an Android APK or iOS Simulator build without app-store signing. This is **not** a real iPhone/Play Store release test.

The manually run `.maestro/manual/signed_in_navigation.yaml` flow assumes a real test user is **already logged into an isolated test restaurant**. Do not run it in a live restaurant; it exists to collect initial screens for review, not to validate business logic. Do not add it to an automated cloud workflow until the test account, data setup and permissions are reproducible.

## Actual physical devices

Install the **same commit's release/preview APK** on at least:
- Small budget Android, ~360 dp wide, Android 10/11 or the oldest supported version; 2–4 GB RAM.
- Recent Android phone, ~400–430 dp wide, latest supported OS.
- Android tablet in portrait **and landscape**; a small tablet around 8 inches and, if available, a 10-inch counter tablet.
- Small iPhone and a current iPhone; iPad portrait/landscape if iOS release is planned.

An APK installs directly on Android; a Play Store AAB does not. Use the existing manual `.github/workflows/mobile-build.yml` APK job or a signed EAS internal-distribution build for physical Android devices. A real iPhone requires TestFlight or properly provisioned ad hoc distribution, not the iOS Simulator build.

Commercial/hosted options, and what each proves:
- **Maestro**: script user taps, input, swipe, navigate, assert visible content and take screenshots on installed apps.
- **Expo EAS Maestro Workflows**: builds the real native binary and runs scripts on Android emulators/iOS simulators.
- **BrowserStack App Live/App Automate**: interactive physical iOS/Android devices, device logs and screenshots; best for OEM/keyboard issues when you lack the hardware.
- **Firebase Test Lab Robo**: crawls an APK for crashes/screenshots and tests on varied Android configurations; use a disposable test account and seeded data. Google Play pre-launch reports offer similar automated exploration for test tracks.
- **Appetize**: fast browser-based Android/iOS *virtual device* previews for stakeholders, not proof of behavior on real hardware.
- **Android Accessibility Scanner/TalkBack and iOS VoiceOver**: labels, contrast, font scaling and touch targets (44pt+).

## Staging test data — do not test financial mutations on live restaurants

Before allowing automated sign-in or order creation, use an isolated staging API and seeded test organization. At minimum: two restaurants, two branches in one restaurant, owner, manager, cashier and waiter permissions, five menu dishes with sizes/add-ons/deals, three tables including a QR code, a customer with khata, one reservation, and a fake/test printer endpoint. Meta/WhatsApp calls must use test-specific numbers and must not send messages to actual customers.

Test destructive actions only on disposable records. Never store credentials or production tokens in Maestro YAML, screenshots or logs. Use secret injection and redact screenshots of personal data.

## Service-critical scenarios to automate (after staging exists)

| Priority | Scenario | Required assertions |
| --- | --- | --- |
| P0 | Waiter creates order with variants | Saved exactly once; card, totals and kitchen slip agree |
| P0 | Delivery customer selected before or after order type | Saved address and area prefill, manual destination stays editable, switching customers clears only auto-filled values |
| P0 | Start order offline and force-stop app | Saved order survives restart; pending badge; no data loss |
| P0 | Connection flaps during outbox replay | No duplicate order/payment; failure stays visible and retryable |
| P0 | Switch branches/restaurants during pending sync | No cross-tenant customer/order visibility or wrong-branch send |
| P0 | Take payment (cash, bank and khata) | Tax, discount, balance, status and receipt agree |
| P0 | Two devices update same order | Server and board eventually converge, no silent overwrites |
| P0 | Permission-denied waiter | Hidden settings/actions are inaccessible even by deep link |
| P1 | QR scan -> table -> order | Correct table/branch and order are selected |
| P1 | Guest call and push notification | Foreground/background/deep-link delivery, deduplication |
| P1 | WhatsApp message/reply | Unread state, 24-hour window and disconnected number behavior |
| P1 | Khata payment reversal / customer merge | Balances and histories remain correct; no double reversal |
| P1 | Photo picker / printer dialog / Bluetooth agent | Permissions, cancellation, errors and output are correct |
| P1 | Long form in bottom sheet with keyboard | Focused field and Save remain reachable on a small Android screen |
| P1 | Swipe row/scroll conflict | Scrolling never accidentally pays, cancels or advances an order |
| P2 | Reservations/menu/branch CRUD | Permissions and UI state update without needless refetch |
| P2 | Date/currency/locale/timezone | Pakistani mobile formats, Rs, PKT midnight and date boundaries |

## Visual screenshot matrix

Capture at least sign-in, orders board, new order/cart, tables, customer profile/khata, menu, WhatsApp inbox, More, and each full-screen form.

Run this matrix for Android small phone / Android large phone / Android tablet portrait / Android tablet landscape / iPhone / iPad; light and dark; system text 100% and 150%; English and, if supported, Urdu/RTL. For the six restaurant themes, test all in light and dark at least on the primary Android phone, plus tablet for two contrasting themes.

Review *clipping, overlap, touch size, keyboard, contrast, safe areas, status bar, bottom navigation and loading/offline/empty/error states*. Dynamic data (order IDs, elapsed timers, customer names) should be frozen or cropped before turning screenshots into visual regression baselines. Maestro `assertScreenshot` can compare against approved baseline files, but do not create baselines from arbitrary unreviewed runs.

## Proof required before merging

1. Commit SHA and platform **binary** tested (not just branch name).
2. `yarn verify`, `npx expo-doctor`, Android and iOS build result, where applicable.
3. Maestro flows executed with pass/fail, actual screenshots and video.
4. Device model, OS, orientation, theme and font-scale for each reported defect.
5. Test account/branch + safe test-data reset recipe.
6. Verified P0 offline/order/payment scenarios and evidence of no duplicated financial writes.
7. Manual real-device sign-off from a waiter on a small Android and cashier on a landscape tablet.

## Sources

- https://docs.expo.dev/eas/workflows/examples/e2e-tests/
- https://docs.expo.dev/build/internal-distribution/
- https://docs.maestro.dev/get-started/supported-platform/react-native
- https://docs.maestro.dev/reference/commands-available/takescreenshot
- https://docs.maestro.dev/reference/commands-available/assertscreenshot
- https://firebase.google.com/docs/test-lab/android/robo-ux-test
- https://www.browserstack.com/docs/test-companion/app-testing
- https://docs.appetize.io/
- https://support.google.com/accessibility/android/answer/6376570
