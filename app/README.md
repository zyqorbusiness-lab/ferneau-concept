# Ferneau — mobile app (concept)

**Concept project by Zyqor Studio — fictional brand.** Demo data only; no real payments are taken and no reviews are real (rating counts are labelled "sample ratings (demo data)").

One TypeScript codebase for **iOS, Android and the web**, built with React Native + Expo.

## Stack

| Layer | Choice |
|---|---|
| App framework | React Native 0.88 + Expo SDK 58 (TypeScript, strict) |
| Navigation | React Navigation 7 — native stack + bottom tabs (no URL routing, so the web build is one page that runs inside an iframe on static hosting) |
| Fonts / icons | Fraunces + DM Sans via `@expo-google-fonts` (OFL), Feather + Ionicons via `@expo/vector-icons` |
| Storage | `@react-native-async-storage/async-storage` on iOS/Android; `localStorage` on web |
| Data layer | `src/api/db.js` + `src/api/catalog.js` — the same async "REST-like" module the Ferneau website and the admin dashboard use (copied from `../shared/`, typed by `src/api/db.d.ts`) |
| Web | `react-native-web` 0.21 + `react-dom`, Metro bundler, single-page output |

## Run it

```bash
npm install
npx expo start            # scan the QR with Expo Go (iOS / Android), or press i / a for a simulator
npx tsc --noEmit          # type check
npm run export:web        # = expo export -p web && node scripts/postexport.js  → dist/
```

The web build is configured with `experiments.baseUrl = "/app/expo"` and `web.output = "single"`; copy `dist/` to `<site>/app/expo/`.
`scripts/postexport.js` renames `dist/assets/node_modules` to `dist/assets/nm` (some static hosts drop folders named `node_modules`) and rewrites the bundle's asset URLs.

**Android APK / iOS build via EAS: next step** (needs an Expo account): `npx eas build -p android --profile preview`.

## Screens

- **Onboarding** — 3 slides, skippable, remembered on the device
- **Log in / Sign up** — validation, error states, "Demo login — tap to fill" (demo@ferneau.example / demo1234), **Continue as guest**
- **Home** — greeting, hero card with the featured product, category chips, bestsellers carousel, shop by hair type, ROOTS10 offer banner
- **Shop** — live search, category chips, filter sheet (category, hair type, concern, sort, in-stock only), result count, active-filter pills, empty state
- **Product** — big product image, price + MRP strike + % off, size, "4.6 · 56 sample ratings (demo data)", hair types / concerns, delivery + stock + returns, ingredients, how to use, quantity stepper, sticky Add to bag, wishlist heart
- **Wishlist** — saved products grid, empty state
- **Bag** — quantity steppers, remove, free-shipping progress (free over ₹999), coupon (ROOTS10 = 10% off, hint shown), totals, sticky checkout button, tab badge with item count
- **Checkout** — contact + address form with validation (email, 10-digit mobile, 6-digit PIN), saved address prefill, payment choice UPI / card / cash on delivery, order summary
- **Demo payment sheet ("Ferneau Pay")** — clearly labelled "Demo payment — no real charge"; card form accepts 4242 4242 4242 4242 (other numbers are refused), UPI ID form, COD confirm; processing → success animation
- **Order success** — order ID, ETA, payment reference
- **Order history** — orders for the signed-in (or last guest) email with status pills
- **Order tracking** — placed → packed → shipped → out for delivery → delivered timeline with timestamps, ETA, progress bar, "Simulate next step (demo)" button; updates live when the status changes in the admin dashboard
- **Profile** — name / phone / address edit, stats, My orders, Wishlist, Reset demo data (tap twice), Log out, "Concept project by Zyqor Studio — fictional brand"

Bottom tabs: Home, Shop, Wishlist, Bag (badge), Profile.

## Shared data layer ("backend")

`src/api/db.js` behaves like a small REST backend (every call is async with latency): products with search/filters/sort, auth, cart, wishlist, orders, status changes.
On **iOS/Android** the app calls `useStorage(AsyncStorage)`, so data persists on the device.
On the **web** build it keeps `localStorage`; the Ferneau website, `/admin` and this app are served from one origin, so an order placed in the app appears in the admin dashboard, and status changes made there show up live in the app's tracking screen (via `storage` events).
The same endpoints exist as a Node server in the website project (`server/index.mjs`), so swapping the module for `fetch` calls is a one-file change.

## Brand

Paper `#F4F1E8` · Fern `#234A3A` · Deep text `#1F3A2F` · Sage `#CFE1D3` · Mist `#E7EFE8` · Terracotta accent `#D9764A`. Product images are 3D bottle renders made for this concept (`assets/products/`).
