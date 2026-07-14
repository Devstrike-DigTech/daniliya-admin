# Daniliya Affiliate

Standalone affiliate portal (post-activation dashboard) for the Daniliya
platform. Extracted from `daniliya-web` so it can be deployed and scaled
independently — the landing site redirects affiliates here.

```bash
npm install
npm run dev        # http://localhost:3001 (set PORT to avoid clashing with the landing)
```

## Routes
`/` Overview · `/links` · `/earnings` · `/payouts` · `/referrals` ·
`/leaderboard` · `/resources` · `/profile`

## Config
`NEXT_PUBLIC_LANDING_URL` — where "Sign out" / the logo send users (the
marketing site). Defaults to `http://localhost:3000`.

All data is dummy (`src/lib/dashboard.ts`) pending the backend.
# daniliya-admin
