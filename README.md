# Daniliya Admin

Internal admin & content-management portal for the Daniliya platform. It is the
back-office surface that oversees the other five apps (`daniliya-web`,
`daniliya-affiliate`, `daniliya-influencer`, `daniliya-vendor`, and the
`daniliya-api`): managing people, commerce, growth campaigns, money, and system
settings from one place.

Built to match the frames in `designs/Admin Portal/`.

## Tech stack

- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript 5**
- **Tailwind CSS v4** — theme tokens defined with `@theme` in
  [`src/app/globals.css`](src/app/globals.css) (no `tailwind.config.js`)
- Icons: monochrome SVGs in `public/icons/` rendered by
  [`Icon`](src/components/Icon.tsx), tinted to `currentColor` via CSS mask
- No runtime dependencies beyond `next` / `react` — all data is currently
  in-repo dummy data (see [Data](#data))

## Getting started

```bash
npm install
npm run dev      # http://localhost:3004
```

| Script          | Does                                    |
| --------------- | --------------------------------------- |
| `npm run dev`   | Dev server with Turbopack on port 3004  |
| `npm run build` | Production build                        |
| `npm run start` | Serve the production build              |
| `npm run lint`  | ESLint (`eslint-config-next`)           |

> Requires Node 20+. Don't run `npm run build` while `npm run dev` is live —
> they share `.next` and the dev cache can corrupt (`rm -rf .next` to recover).

## Modules & routes

The portal is a grouped-sidebar shell ([`DashboardShell`](src/components/DashboardShell.tsx))
with a signed-in home at `/`. List pages follow one pattern (header + Export CSV,
summary cards, search + filter + status pills, a table/card grid) and open a
detail page.

| Group        | Pages                                                                    |
| ------------ | ------------------------------------------------------------------------ |
| **Overview** | `/` Command centre                                                       |
| **People**   | `/affiliates` · `/influencers` · `/vendors` (+ `/[id]` detail tabs)      |
| **Commerce** | `/orders` · `/products` · `/bookings` (+ `/[ref]` or `/[id]` detail)     |
| **Growth**   | `/campaigns` (+ `/[id]` detail, create & edit) · `/reviews`              |
| **Money**    | `/payouts` (+ `/[ref]` detail) · `/finance`                              |
| **System**   | `/settings` · `/audit-log` · `/support`                                  |
| **Auth**     | `/login` · `/verify` · `/forgot-password` · `/reset-password`            |

Notable interactive surfaces:

- **Campaigns** — Platform/Vendor tabs, a functional **create** form (dynamic
  deliverables/checklist, audience toggles), **edit**, and a status-aware detail
  (Pause/Resume, interactive posting checklist, asset delete, End Campaign
  early). State is held in a session store
  ([`CampaignsContext`](src/app/campaigns/CampaignsContext.tsx)).
- **Payouts detail** — renders per status (Scheduled / Review / Paid / Failed),
  with a live ticking countdown ([`Countdown`](src/components/Countdown.tsx)) on
  the scheduled batch.
- **Bookings detail** — two-state (Requested → Accept/Reject, else fulfilment
  timeline).

## Project structure

```
src/
  app/                 # App Router — one folder per route, [id]/[ref] for details
    globals.css        # Tailwind v4 @theme tokens (brand gold, ink, coal, paper…)
    <module>/          # page.tsx + client view components
  components/
    DashboardShell.tsx # top bar + grouped sidebar shell
    Icon.tsx           # mask-tinted SVG icon loader (public/icons/*.svg)
    Countdown.tsx      # live HH:MM:SS timer
    widgets.tsx        # shared cards / tiles / tables
    auth/              # auth-screen chrome
  lib/
    dashboard.ts       # single source of all dummy data + types
public/
  icons/               # ~82 monochrome UI icons
  images/              # products, affiliates, brand assets
  fonts/               # Product Sans (falls back to DM Sans until added)
```

## Data

Everything the portal renders comes from
[`src/lib/dashboard.ts`](src/lib/dashboard.ts) — deterministic dummy data and
types (no RNG, no network). Interactive state (e.g. campaign create/edit) lives
in client-side React context and **resets on a full page reload**; there is no
persistence yet. Wiring these screens to `daniliya-api` is the next step.

## Theming

Brand tokens are CSS variables in `@theme` — change them once and the whole app
follows:

| Token                | Value     | Use              |
| -------------------- | --------- | ---------------- |
| `--color-brand`      | `#d4a017` | gold accent      |
| `--color-ink`        | `#212121` | primary text     |
| `--color-coal`       | `#2d2d2d` | dark surfaces    |
| `--color-paper`      | `#ffffff` | page background  |

Use them via Tailwind utilities: `bg-brand`, `text-ink`, `bg-coal`, etc.

## Deployment

Standalone repo (`Devstrike-DigTech/daniliya-admin`), deployed as a standard
Next.js app on Vercel — repo root as the project root, no special config.

The **application lives on the `dev` branch**; `main` is currently an empty
scaffold. Make sure the Vercel project's Production Branch (and the branch behind
`dev-admin.daniliya.com`) points at the branch that actually contains the app,
or the domain will return a platform 404.
