# Restora Mobile QA

## Automated checks

- `yarn verify` runs TypeScript, Expo ESLint and the repository-specific rules in `scripts/check_rules.sh`.
- `.github/workflows/mobile-e2e.yml` runs verification, creates a debug APK, starts an Android API 34 emulator and runs Maestro UI flows.
- The guest flow checks the welcome/sign-in screens on every CI run.
- When `RESTORA_E2E_EMAIL` and `RESTORA_E2E_PASSWORD` are configured, CI also signs in, opens Orders and opens New Order.
- The Play Store release workflow calls the same reusable workflow with authenticated testing required. A Play upload cannot begin unless the signed-in mobile journey passes.

## E2E account setup

Add these repository Actions secrets in **Settings → Secrets and variables → Actions**:

- `RESTORA_E2E_EMAIL`
- `RESTORA_E2E_PASSWORD`

Optional repository variable:

- `RESTORA_E2E_API_URL` (defaults to `https://dev.restora.live` for PR/nightly tests)

Use a dedicated test account in the matching environment. It must have a confirmed email, a completed restaurant setup, and `orders:view` plus `orders:create` permissions. For a Play Store release, the release workflow tests against the same API URL that will be baked into the AAB (the repository variable `EXPO_PUBLIC_API_URL`, defaulting to production).

The authenticated flow only signs in, opens Orders and opens New Order. It does **not** submit an order or change restaurant data. Never use a staff member's personal account.

## Run locally

Install Maestro and start an Android emulator with the app installed. Then run:

```sh
maestro test .maestro/flows/guest-sign-in.yaml
maestro test -e E2E_EMAIL="$RESTORA_E2E_EMAIL" -e E2E_PASSWORD="$RESTORA_E2E_PASSWORD" .maestro/flows/authenticated-orders.yaml
```
