# Ferneau — hair-care e-commerce concept (website + mobile app + admin)

Concept project by **Zyqor Studio**. Ferneau is a **fictional** botanical hair-care brand; every product, rating and order is demo data and no payment is ever taken.

Live: https://ferneau-concept.vercel.app/ · App in a phone frame: https://ferneau-concept.vercel.app/app/ · Admin: https://ferneau-concept.vercel.app/admin/

Deployed on Vercel (static, no build step; output directory `web/site`, see `vercel.json`); every push to `main` redeploys.

## What is in here
| Folder | What |
|---|---|
| `web/site/` | The storefront (static HTML/CSS/JS + three.js): 3D home, shop with search + filters, 3D product viewer, bag, checkout with a demo payment gateway, account + wishlist, order tracking, admin dashboard (`/admin/`), app showcase (`/app/`). |
| `web/site/js/ferneau3d.js` | The 3D kit: every bottle (pump, flip-cap, tube, jar, dropper, spray), label, leaf, rosemary sprig, water drop and bubble is modelled in code. No downloaded models, no stock photos. |
| `web/site/js/home3d.js` | The home scene: one fixed WebGL stage, four scroll chapters, camera keys anchored to the DOM copy (desktop: product right of the copy; phone: product in the largest free gap), copy guard so text never sits on the object, reduced-motion snap, no-WebGL poster. |
| `app/` | React Native + Expo (TypeScript) app, one codebase for iOS, Android and web. See `app/README.md`. |
| `shared/` | The data layer used by all three (`db.js`, `catalog.js`): products, search/filters, auth, cart, wishlist, orders, status timeline. Async, REST-shaped. |
| `server/` | Node.js reference API (no dependencies) exposing the same data layer as REST endpoints (`node server/index.mjs`). |

## How the pieces talk
The website, the admin and the web build of the app are served from one origin, so in the browser they share one store (localStorage) through `shared/db.js`: place an order in the app, it shows in `/admin/`; change its status in admin, the tracking timeline in the app and on the site updates live. On iOS/Android the app plugs AsyncStorage into the same layer; in production the layer points at the API in `server/` (swap the JSON file for Postgres, add JWT auth and a real gateway webhook).

## Demo details
- Demo login: `demo@ferneau.example` / `demo1234` · Coupon: `ROOTS10` (10%) · Free shipping over ₹999
- Test card: 4242 4242 4242 4242 (simulated gateway; UPI and cash on delivery also simulated)
- Sample orders FN10421–FN10426 for tracking

## Run locally
- Website: serve `web/site/` with any static server (`python3 -m http.server -d web/site 8080`).
- App: `cd app && npm install && npx expo start` (Expo Go on iOS/Android), `npm run export:web` for the browser build (copy `app/dist` to `web/site/app/expo/`).
- API: `node server/index.mjs` → `GET /api/products?search=rose`, `POST /api/orders`, `PATCH /api/orders/:id/status` …

## Next steps for a real build
Android APK / iOS build through EAS (needs the client's Expo + store accounts), real payment gateway (Razorpay or Stripe), push notifications for order status, Postgres + auth on the API, analytics.

Credits: see `CREDITS.md` (three.js MIT; Fraunces and DM Sans, SIL OFL; React Native / Expo / React Navigation MIT).
