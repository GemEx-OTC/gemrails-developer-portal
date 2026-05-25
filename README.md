# GemRails Developer Portal

Developer portal for [developer.gemrails.com](https://developer.gemrails.com) — API keys, webhooks, SDK docs, and integration dashboard.

## DEV-002 — Theme & layouts

- Next.js 16 App Router + TypeScript
- Tailwind CSS v4 with GemRails emerald/teal theme (`COLOR_GUIDE.md` tokens)
- Geist + Geist Mono fonts
- Marketing shell (header, landing hero stub)
- Dashboard shell (sidebar, mobile nav, placeholder routes)

## DEV-001 — Discovery

See **[docs/DEV-001-discovery.md](./docs/DEV-001-discovery.md)** for:

- Reusable merchant UI assets
- Full `gemex-rails-api` route map
- Gaps: `/developer/*` and `/kyc/*` not on API yet
- Developer portal routes vs interim APIs

## DEV-003 — API client

- `lib/api/client.ts` — Axios instance, `NEXT_PUBLIC_GEMRAILS_API_BASE_URL` + `/api/v1`
- JWT in `localStorage` (`token`, `refreshToken`), `Authorization: Bearer` on requests
- 401 interceptor → `POST /auth/refresh-token`, retry original request; redirect to `/auth/login` on failure
- `lib/api/types.ts` — `ApiResponse`, `ApiError`, pagination, developer dashboard/keys/webhook types
- `lib/api/auth.ts`, `lib/api/developer.ts` — typed endpoint helpers

```ts
import { apiClient, login, getDashboardStats } from "@/lib/api"
```

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_GEMRAILS_API_BASE_URL` in `.env.local` (default `http://localhost:4000`).

Open [http://localhost:3000](http://localhost:3000) for the landing page and [http://localhost:3000/dashboard](http://localhost:3000/dashboard) for the dashboard shell.

## Next up

- **DEV-101+**: Full landing page, SDK playground, auth UI
- **DEV-201+**: Wire dashboard to `getDashboardStats`, webhooks, etc.

## Related repos

- `gemrails-frontend` — merchant portal (reuse patterns for KYC, OTP, API client)
- `gemrails-api` — backend API
