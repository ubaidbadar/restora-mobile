# Restora mobile — UX plan

Who uses it: **waiters** taking orders on a phone, **cashiers** at the counter on a tablet (often landscape), and
**owners/managers** checking the day on their phone. Mostly mid-range Android, patchy internet, busy hands. So: big
targets, few taps, works offline, readable in a bright kitchen and at night (dark mode).

Web-only for now (opened from More → "Open Restora on the web"): settings, staff and roles, menu editing, devices,
customer import, reservations. Everything a person does during service is in the app.

## Navigation

```
Splash (until /me is known)
├─ (auth)   Sign in · Create account · Check your email · Forgot password
├─ (start)  Your restaurants (invitations, switch) · Create restaurant · Set up tax  ← signed in, not ready yet
└─ (app)    Native tabs (iOS tab bar / Android navigation bar), each tab its own Stack with a native header
    ├─ Today      dashboard (reports:view only)
    ├─ Orders     board → order details sheet · New order (pushed) · Edit order (pushed)
    ├─ Tables     floor → table sheet (order, new order, QR) · Scan table QR (camera, full-screen modal)
    ├─ Customers  list with native search → profile (pushed): Orders · Khata · Notes
    └─ More       account, restaurant & branch, sync, appearance, web, sign out
```

Tabs show by permission and are fixed while the navigator is mounted; switching restaurant or branch remounts it
(keyed `restaurantId:branchId`), so each tab loads its data once again. Orders is the first tab for anyone without
`reports:view`.

## Patterns

| Need | Pattern |
|---|---|
| Result of an action | Snackbar at the bottom (one at a time, swipe away, action like "Print slip" or "Undo"), haptic. |
| Field mistakes | Inline under the field, red, with the field's border red. |
| Pick one of a few | Segmented control (2–4) or chips (more). |
| Pick from a list | Native bottom sheet with a list (selected row checked). |
| Short form (pay, add customer, khata payment) | Native bottom sheet, Save at the bottom, keyboard-safe. |
| Long task (new order, profile) | Pushed screen with a native header and back swipe; leaving a started order asks first. |
| All actions of a row | Long-press → native menu; the same menu behind the ⋯ button. |
| Main action of a row | Swipe (orders: swipe right to move to the next status). |
| Danger (cancel order, sign out) | Native alert with a destructive button. |
| Loading | Skeletons in the shape of the content; never a blank screen. |
| Offline | A pill above the bottom edge: "Offline · 3 waiting"; tap to sync when back. Orders still work. |

## Screens

**Orders.** Phone: status chips with counts (New · Preparing · Ready · On the way · Done) and that status's cards.
Tablet: the statuses as columns side by side. Card: token, type/table, elapsed time (amber after 15 min, red after 30),
customer, lines, total, payment badge. Swipe right = next status; tap = details sheet (pay, print, edit, cancel);
long-press = menu. Header: "New order". Pull to refresh.

**New order.** Phone: customer search on top (phone or name, "New customer" from what was typed), category chips,
dish rows (tap adds one with defaults, "Options" for sizes/add-ons, stepper once in the cart), a cart bar at the bottom
that opens the order sheet (type, table/delivery, payment, discount, totals, Place order). Tablet: menu tiles on the
left, the order panel docked on the right. Offline: saved with a device number ("A-3") and sent later.

**Tables.** Grid of tiles coloured by state (free, ordering, waiting for food, wants the bill, guest call). Guest calls
in a strip at the top. Tap a tile = sheet with its open order, "New order for this table", QR. Header: scan a table QR.

**Customers.** Native search in the header; rows with avatar, phone, khata owed. Swipe = call / WhatsApp. Profile:
call and WhatsApp buttons, stats, tabs Orders · Khata · Notes; record a khata payment; share the khata statement (PDF
or WhatsApp text).

**Today** (owners). The web dashboard's numbers for today, payment split, order types, branches, customers slipping away.

**More.** Who you are, restaurant and branch switchers, sync status, appearance (System/Light/Dark), open the web app,
sign out.

## Phases

1. **Foundation** — config, theme (light/dark), providers, offline storage, Expo auth on the server.
2. **UI kit** — button, icon, fields, form, sheet, modal, menu, snackbar, swipe row, list row, skeleton, empty state.
3. **Auth and start** — sign in, create account, check email, forgot password, restaurants, create restaurant, tax setup.
4. **Orders and new order.**
5. **Tables** (floor, sheet, QR, scanner).
6. **Customers** (list, profile, khata, notes).
7. **Today and More.**
8. Later: POS terminal mode on a tablet (lock screen + PIN), menu stock toggles, reservations, push notifications for
   guest calls, Bluetooth thermal printing.

`STATUS.md` says what is done and what is next.
