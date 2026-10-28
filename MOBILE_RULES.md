# Restora mobile — rules

Expo SDK 58 · React Native 0.88 · React 19 (React Compiler on) · Expo Router · Uniwind (Tailwind v4).
**Phones and tablets only. There is no web build of this app** (the web app lives in `../web`).

Read this file, then `PLAN.md`, before changing anything. `AGENTS.md` has Expo's own advice (read the SDK 58 docs, never
trust memory for Expo APIs).

## 1. The web conventions apply here

`../web/.claude/app-structure-forms-ui/SKILL.md` is the source. Everything in it applies as written, except where the
table below says how a web idea becomes a native one. The web pages in `../web/src/pages` are the reference for logic:
same endpoints, same state updates after saves, same zod schemas, same permission checks, same words.

- Simple code first. One state per component or hook: `useState` (an object if values belong together), `useGet`,
  `useWatch` or a store read. Environment reads are not state: router hooks, `useWindowDimensions`,
  `useSafeAreaInsets`, `useCSSVariable`. No `useRef`, request counters, `useMemo`, `useCallback` or `memo`.
- **No one-line wrappers.** Write `useAuthStore((state) => state.me?.workplace)` where it is used, not `useWorkplace()`.
- Default exports only, one export per file, file named after its export, `snake_case` (hooks camelCase).
- Imports use `@/…` (this app's `src/`) and `@shared/…` (`./shared`, a copy of the web app's `shared/`: change it there and copy it here). No `../../`.
- `/me` is read once at start; after a save the store or list is updated from the answer (`update(...)`), never re-read.
- Each list is loaded once by the top component of the screen and passed down. Rows never call `useGet`.

## 2. Web → native

| Web | Native |
|---|---|
| `pages/<name>_page/index.tsx` | Same. |
| React Router routes | Expo Router in `src/app/`. A route file is one line: `export { default } from '@/pages/orders_page';` (the only re-export allowed). Layouts (`_layout.tsx`) live there too. Nothing else goes in `src/app/`. |
| `hoc/require_auth`, `guest_only`, `require_restaurant`, `require_setup` | `Stack.Protected guard={…}` in `src/app/_layout.tsx`. `hoc/require_permission` stays. |
| `boot_gate` | `expo-splash-screen` stays up until `me !== undefined`. |
| `useSearchParams` + `with_param` | `useLocalSearchParams` to read, `router.setParams({ … })` to change. Filters, tabs and search live in params. |
| `<Button as={Link}>` | `<Link href="…" asChild><Button … /></Link>` |
| httpOnly cookie | Better Auth Expo client (`config/auth_api.ts`) keeps the session in `expo-secure-store` and sends it as a `Cookie` header (`config/api.ts`). Nothing else is stored as a credential. |
| IndexedDB (`utils/offline_db`) | `expo-sqlite/kv-store` (`utils/offline_db`): `/me`, `useGet` answers and the outbox survive a restart. |
| `register(name)` | RN inputs can't be registered: `register(name)` returns `{ name, control }` and every field uses `useController`. Screens still write `{...register('phone')}`. |
| `<label>` wrapping a field | `FieldShell` (label, red `*`, control, `FieldError`). The control gets `accessibilityLabel={label}`. |
| `withOverlay` + `component={({ open }) => …}` | Same API. `ui/sheet` is the native bottom sheet (`@expo/ui` `BottomSheet`: swipe down to close); `components/form_sheet` is the web's `FormDrawer`. No `isOpen` state in screens. Opening a screen or another sheet from a sheet waits for it to slide away first. |
| Confirm dialogs | `await confirm({ title, message, confirmLabel, destructive })` (`utils/confirm`, the native alert). |
| Dropdown / "more" menus | `ui/menu_sheet`: the row's actions in a bottom sheet, opened by long-press and by its ⋯ button. |
| Toasts | Same `toast.success(...)` call (`utils/toast`), shown as a **snackbar** (`components/snackbar`): one at a time, at the bottom above the tabs, swipe to dismiss, optional action, with a haptic. |
| `PageHeader` | The native header: `Stack.Screen options`, `headerSearchBarOptions`, `headerRight`. Large titles on iOS. |
| Tables | `FlatList` rows. Phone: one column. Tablet (`width ≥ 768`): two panes or a grid (`useWindowDimensions`). |
| `@theme` tokens | `src/global.css` holds the same token names with a **light and a dark** value. No hex, no `slate-*`/`rose-*`/`white`, no inline color styles. A color a prop needs (icons, `placeholderTextColor`, native headers) comes from `*ClassName="accent-…"` or `useCSSVariable`. |
| Logical CSS | Same: `ms-`/`me-`/`ps-`/`pe-`/`start-`/`end-`, never left/right. |
| Lucide icons | `ui/icon` (Ionicons) with `className="accent-muted"`-style colors. Tab icons are native (SF Symbols / Material Symbols). |

## 3. Native feel (non-negotiable)

- Tap targets ≥ 44pt (48dp on Android). Primary actions at the bottom of the screen or in the header, never mid-page.
- Taps that change something give a haptic (`expo-haptics`): selection for picks, success/warning/error for results.
- Lists: pull to refresh; swipe a row for its main action; long-press for all actions (the same list as its ⋯ menu).
- Sheets for anything short (pick, pay, add); push a screen for anything long (new order, customer profile).
- Inline field errors in forms; the snackbar is for results of actions ("Order #12 placed · Print slip").
- Light and dark mode follow the system (More → Appearance can pin one).
- Text inputs: right `keyboardType`, `autoComplete`, `returnKeyType`; the keyboard never covers the focused field.

## 4. Checks before you say done

- `yarn verify` passes: typecheck, lint and `scripts/check_rules.sh` (no hex colors, no raw palette classes, no
  `useRef`/`useMemo`/`useCallback`, no `../` imports, no named exports outside `src/app`, no `left`/`right` styles).
- Every `<Text>` has a text color class (an uncolored Text is black in dark mode).
- `python3 scripts/fix_imports.py` turns `../` imports into `@/…` after copying files from the web app.
- `npx expo-doctor` and `npx expo export --platform android` bundle cleanly.
- Try it on a real Android phone on a slow connection.
