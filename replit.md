# Flare by TK

Restaurant website for a fast-casual restaurant in Satellite Town, Bahawalpur, Pakistan — online menu, cart, order placement/tracking, and an admin order dashboard.

## Run & Operate

- Site runs via the `artifacts/flare-by-tk: web` workflow (Next.js dev server on port 22091, previewed at `/`)
- `pnpm --filter @workspace/flare-by-tk run typecheck` — typecheck the app
- Seed/re-seed data: `POST /api/setup?key=<ADMIN_PASSWORD>` (add `&force=true` to overwrite)
- Dev admin password: `admin123` (set in the artifact toml; production value is set on Vercel)
- Required env: `DATABASE_URL` (Postgres/Neon), `ADMIN_PASSWORD`

## Stack

- **Standalone Next.js 15 App Router app** at `artifacts/flare-by-tk` — deployed by the user to **Vercel**, not Replit publish
- Raw `pg` (no ORM), Tailwind CSS v4, lucide-react, Poppins + Bebas Neue fonts
- No auth libraries — admin auth is an HMAC-derived httpOnly cookie from `ADMIN_PASSWORD`

## Where things live

- `lib/db.ts` — `sql<T>()` helper + lazy schema bootstrap (CREATE TABLE IF NOT EXISTS, cached in globalThis)
- `lib/seed.ts` — seed data (10 categories, 61 menu items, 5 deals)
- `lib/cart.tsx` — cart context (localStorage key `flare-cart`)
- `lib/admin.ts` — admin session token helpers
- `app/api/*` — REST routes (categories, menu-items, deals, orders, orders/track/[token], orders/[id], admin/login, setup)
- `components/MenuSection.tsx` — main menu UI with scroll-spy category nav
- `lib/whatsapp.ts` — Pakistani phone normalization, {placeholder} template fill, wa.me link builder, default message templates
- Riders + Settings admin tabs; orders carry `pos_number` + `rider_id`; message templates stored in `settings` key/value table (defaults merged server-side)
- Order statuses: new → accepted → preparing → ready → delivered (+cancelled)
- Push: `device_tokens` table, `lib/push.ts` (Expo push API), POST `/api/devices` (admin) registers tokens; push fired on order create; `/api/cron/remind` re-pushes while orders are `new` (vercel.json cron every minute — Hobby plan runs crons once/day; rate-limited via `settings.last_remind_at`, auth via CRON_SECRET bearer or vercel-cron user-agent)

## Admin mobile app (artifacts/flare-admin-mobile)

- Expo SDK 54 Android app; user builds APK themselves via EAS (free Expo account) — full instructions in `artifacts/flare-admin-mobile/BUILD_APK.md`; NEVER run EAS CLI here
- Connects to configurable base URL (default https://flarebytk.com); password login stored in AsyncStorage, cookie auth with auto re-login on 401 (`lib/api.tsx`)
- Rings looping alarm (`assets/sounds/order_alarm.mp3`, ffmpeg-synthesized) + keep-awake while any order is `new`; Android channel "orders" (MAX, custom sound `order_alarm.wav`) for locked/closed-phone push
- android.package `com.flarebytk.admin`; push on standalone Android needs the user's Firebase FCM key (covered in BUILD_APK.md)

## Architecture decisions

- Schema is auto-created on first DB access (no migration step) so Vercel deploys need zero setup beyond env vars
- Order totals are computed server-side from DB prices (Rs. 150 delivery fee); client-sent prices are ignored
- Tracking is by unguessable UUID token — no customer accounts
- The template `api-server` artifact was moved from `/api` to `/_shared-api` so Next's API routes work in the Replit preview

## Product

- Home page with hero + full menu (Most Selling, Today's Deals, per-category sections)
- /menu, /deals, /about, /cart (delivery/pickup toggle), /order/[token] (live status polling), /admin (order dashboard)

## User preferences

- Deploys to **Vercel** (Root Directory `artifacts/flare-by-tk`), NOT Replit — only `DATABASE_URL` + `ADMIN_PASSWORD` env vars
- Follow the reverse-prompt spec in `attached_assets/` exactly

## Gotchas

- Don't remove the `[[integratedSkills]]` block from the flare artifact.toml — toml validation rejects that
- Prices are `NUMERIC` — Postgres returns them as strings; convert with `Number()` before math
