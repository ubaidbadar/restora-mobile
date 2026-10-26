# Status

## Done

- **Foundation.** Expo SDK 58, native tabs, a stack with native headers per tab; light and dark theme from the same
  tokens as the web; offline storage of `/me`, `useGet` answers and the outbox (`utils/offline_db`); sync when the
  internet is back and every 30 s while anything waits; the API address found from the dev machine.
- **UI kit.** Button, icon button, icon, input, password, select (sheet), segmented control (native), chips, toggle,
  badge, avatar, skeleton, native bottom sheet, menu sheet, swipe row, snackbar with swipe-to-dismiss, form, form sheet.
- **Auth and start.** Sign in, create account, check email, forgot password, your restaurants and invitations,
  create a restaurant, tax setup, menu setup.
- **Orders.** Board with status chips (phone) or columns (tablet); cards with elapsed time; swipe to move on or pay;
  long-press menu; details, pay, print kitchen slip or receipt, cancel; pull to refresh; works offline.
- **New / edit order.** Full screen above the tabs. Customer search (phone or name, server search for older ones, new
  customer on the spot, offline), menu rows (phone) or tiles (tablet), options sheet, cart sheet (phone) or docked
  panel (tablet), order type, table, delivery, payment, discount, totals; leaving asks first; offline tokens ("A-3").
- **Tables.** Floor by section with state colors, guest calls (refreshed every 30 s), table sheet with its orders,
  new order for the table, QR code to show or share; scan a table's QR to start its order.
- **Customers.** Native search, segments, swipe to call or WhatsApp, add; profile with stats, khata (record payment,
  take back, send statement on WhatsApp, share PDF), orders, notes, edit, delete.
- **Today.** The web dashboard's numbers, branch/all-branches, breakdowns, customers slipping away with a WhatsApp nudge.
- **More.** Account, restaurant and branch switchers, sync, appearance, web pages, sign out.

## To check on a device (not testable from the build machine)

- Native bottom sheets with long forms and the keyboard (customer form, cart sheet) on a small Android phone.
- Swipe rows inside the orders list (no conflict with scrolling) and the snackbar's swipe.
- The tab bar height guess for the snackbar position (`constants/tab_bar_height`).
- Continue with Google (native sheet) on an Android and an iPhone build with the Google client IDs set. Not in Expo Go.

## Next

1. POS mode on a counter tablet (lock screen, PIN, idle lock) — web `pages/pos_page`.
2. Menu: mark dishes sold out from the phone.
3. Push notifications for guest calls.
4. Reservations.

## 2026-10-21 update
- One bottom sheet for the whole app: `ui/sheet_panel` (RN Modal + Reanimated, drag handle to close). `@expo/ui` BottomSheet and the page sheet are gone.
- Tab screens draw their own title (`components/page_header`, inside the scroll view) in `components/tab_screen`; pages opened from More get a back arrow.
- Native Menu (dishes, categories, add-ons), Reservations and Staff (members, invitations) under More → Manage. Only restaurant settings, branches, tables and roles still open the web.
- Lint fails on any deprecated API (`@typescript-eslint/no-deprecated`).

## 2026-10-26 update
- Menu deals: Menu → Deals (add, edit, stock, days and hours); New order offers a deal only while it can be sold and shows what is in it; order cards and slips list a deal's dishes.
