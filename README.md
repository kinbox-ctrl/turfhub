# TurfHub

Turf booking platform — public website, player app and owner console. Built with **Vite · React 18 · TypeScript · zustand (persisted) · react-router · react-leaflet · framer-motion · lucide-react · qrcode.react · date-fns**.

Design: own identity (Sora + Inter, ink-blue surfaces, electric-lime + coral accents), dark/light themes, glass top header on desktop, bottom tabs on mobile, ⌘K command palette.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production bundle in dist/
npm run preview    # serve the production build
```

## Demo accounts
| Role   | Email               | Password |
|--------|---------------------|----------|
| Player | player@turfhub.app  | anything |
| Owner  | owner@turfhub.app   | anything |

Or append `?as=player` / `?as=owner` (and optionally `&theme=light`) to the URL to auto sign in. All data is seeded deterministically and persisted in `localStorage` (`Settings → Reset demo data` restores the seed).

## Website
Landing page (hero with live booking ticker, featured venues, how it works, feature bento, owner pitch, testimonials) and a split-screen login.

## Player
Discover (search, sport/city filters, sort, live scores, smart pick) → **Explore map** (Leaflet, price-pill markers, "free at 7 PM" filter) → Turf (**7-day availability grid** or day view, duration, slot grid with peak/offer pricing, blocked/booked/past states) → Review & pay (add-ons, coupons `FIRST10` `TURF20` `WEEKEND15`, loyalty points, UPI/Card/Venue) → Ticket (scannable QR check-in code, .ics calendar export, share). Bookings (upcoming/past/cancelled, refund-policy cancel, rebook, rate, log score). Open matches (join/leave/host/invite). Profile + Career (rating ring, XP level, badges, form, 6-month chart, sports mix, rivalries, match history). Leaderboard (podium, per-sport). On-device smart assistant.

## Owner
**Week calendar** of all bookings (colour by sport, live now-line, tap to check in). Command center (7/30/90-day KPIs with deltas, revenue trend, today's timeline with live marker, computed insights, 7×18 peak-hour heatmap, sports mix, top regulars, turf performance). My turfs (publish/edit/pause, offers, block slots). Bookings (search, tabs, per-turf filter, check-in / no-show / cancel+refund, walk-in booking, CSV export). Profile & payouts.

## Structure
```
src/
  data/seed.ts      deterministic seed + pricing
  lib/              format, domain logic, assistant heuristics
  store.ts          zustand store (persisted) + transient UI store
  components/       ui primitives, cards, charts, procedural turf art
  sheets/           bottom sheets (booking, ticket, cancel, host, owner tools…)
  pages/            player pages, pages/owner/* owner console
```
