# Native Android parity tracker

Dependency baseline: AGP 9.3.3 / Gradle 9.5.0 / Kotlin and Compose compiler 2.4.21 / Compose BOM 2026.09.00 / compileSdk 37. Use nondeprecated state-based text fields. Kotlin warnings and Android lint warnings fail the build.

Source of truth: repository root `MOBILE_RULES.md`, `PLAN.md`, `STATUS.md` and `src/pages/`. Feature behavior and permissions must match React Native.

| Feature | Native status | Required acceptance |
|---|---|---|
| Architecture, theming, secure cookie | Implemented, unverified build/device | Light/dark, rotation, encrypted session |
| Sign in, session restore | Initial implementation | Verify Better Auth cookie on a real Android device |
| Today numbers | Read-only implementation | Branch/date and live updates |
| Orders board | Read-only implementation | Offline outbox, mutations, payment, history, print |
| Tables floor | Read-only implementation | Calls, QR scanning, create order |
| Customers list | Read-only implementation | Search, profile, khata, create/edit |
| More | Initial sign-out | Restaurant/branch selection, sync, appearance |
| Onboarding and account recovery | Not started | Match existing account flow |
| New/edit orders | Not started | Add-ons, deals, tax, offline and idempotency |
| Menu, reservations, staff, printers | Not started | Permission-gated forms and actions |
| Native Google sign-in | Credential Manager flow implemented; device unverified | Register preview package + signing SHA-1, verify backend provider and cookie against server |
| Table QR guest links | Public web link open/share implemented | Every URL uses restora.live/t/code, never staff app host; QR image/scanner still missing |
| FCM push, SSE, audio, QR scanner | Not started | Lifecycle/background behavior |
| Testing and accessibility | Not completed | Build, lint, unit, UI, TalkBack, slow-network and process death |

## Non-negotiable behavior

1. Do not rewrite or delete the React Native implementation while native parity is incomplete.
2. Do not present unverified behavior as crash-free or bug-free.
3. Respect backend permissions, branch context, and exact original API payloads.
4. New orders must have stable client IDs and persist to an offline outbox before any UI claims offline support.
5. Match Restora type and color tokens; 48dp minimum action targets, safe insets, keyboard visibility, RTL/TalkBack.
6. Never repeatedly fetch `/me` or rebuild every page on each tab transition. Load data once per screen activation and refresh on demand.
7. Add tests for money, status transitions, sync replay, auth expiry, pagination, and rotations before a production release.
