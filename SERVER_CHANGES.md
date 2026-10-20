# Server changes for the mobile app

## Done (in `../backend`)

- **Better Auth Expo plugin.** `src/config/auth.ts` adds `expo()` from `@better-auth/expo` and trusts the app's scheme
  `restora://` (and Expo Go's `exp://` outside production). `package.json` lists `@better-auth/expo`.
  Run `bun install` in `backend/` once.

## Not needed

- A new `mode`: the server already answers `mode: 'web'` for anyone signed in with their own account, which is what the
  app is. (`pos` is a shared terminal; a tablet POS mode is planned later, see PLAN.md.)

## Later

- Push notifications for guest calls and new orders (Expo push tokens per device).
- Email links (verify email, reset password) open the web app; universal links could open the app instead.
