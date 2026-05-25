# DEV-001: Requirements Discovery & API Specification Mapping

**Last updated:** 2026-05-21 (re-scan)  
**Repos reviewed:**

| Repo | Path | Role |
|------|------|------|
| API | `C:\Users\hp\Downloads\gemex-rails-api` | Backend (Hono + Bun + MongoDB) |
| Merchant UI | `C:\Users\hp\Downloads\gemrails-frontend` | Reference implementation |
| Developer UI | `C:\Users\hp\Downloads\gemrails-developer-portal` | New portal (in progress) |

> **Naming note:** Requirements refer to `gemrails-api`; the actual folder is **`gemex-rails-api`**.

### Re-scan summary (what changed since first DEV-001)

| Area | Before | Now |
|------|--------|-----|
| **KYC module** | ❌ Not mounted | ✅ `/api/v1/kyc/*` + SmileID client |
| **SmileID** | ❌ | ✅ `integrations/smileid/smileid.client.ts` |
| **Referrals** | ❌ | ✅ `/api/v1/referrals/*` |
| **Developer routes** | ❌ | ❌ Still **not present** |
| **Tier limits** | Assumed from spec | API: `TIER_0` ₦200k, `TIER_1` ₦500k, `TIER_2` unlimited (`shared/constants/tiers.ts`) |

---

## 1. Merchant frontend — reusable assets

Copy or adapt from `gemrails-frontend` when building developer portal features.

| Asset | Path | Use in dev portal (card) |
|-------|------|---------------------------|
| OTP input (6-digit, auto-focus) | `components/otp-input.tsx` | DEV-502 Tier 1 phone OTP |
| Phone verification modal | `components/phone-verification-modal.tsx` | DEV-502 (resend cooldown pattern) |
| Business onboarding form | `app/dashboard/onboarding/page.tsx` | DEV-503 fields/layout |
| Onboarding modal | `components/onboarding-modal.tsx` | Profile completion prompts |
| Bank selector + 10-digit account | `components/bank-selector.tsx` + onboarding/settings | DEV-602 |
| Business categories list | `lib/constants.ts` → `BUSINESS_CATEGORIES` | DEV-503 category selector |
| Nigerian banks list | `lib/constants.ts` → `NIGERIAN_BANKS` | DEV-602 |
| CAC upload + RC validation UI | `app/dashboard/settings/page.tsx` (verification tab) | DEV-503, DEV-504 |
| API client + JWT refresh | `lib/api/client.ts` | DEV-003 ✅ (ported) |
| Auth API helpers | `lib/api/auth.ts` | Login, profile, bank, phone |
| KYC client (stub target) | `lib/api/kyc.ts` | DEV-503–504 |
| Auth hooks | `lib/hooks/use-auth.ts` | Mutations for profile/OTP |
| KYC hook | `lib/hooks/use-kyc.ts` | CAC submit |
| Design tokens | `COLOR_GUIDE.md`, `app/globals.css` | DEV-002 ✅ |
| Confirmation modal | `components/confirmation-modal.tsx` | DEV-302 regenerate keys |

### CAC / Tier 2 form fields (merchant UI today)

From `settings/page.tsx` → `handleVerifyCac`:

| Field | FormData key | Validation in UI |
|-------|--------------|------------------|
| RC/BN number | `rcNumber` | Must start with `RC` |
| Business address | `businessAddress` | Required before submit |
| Business category | `businessCategory` | Required before submit |
| CAC document | `document` | Optional file (PDF/PNG/JPG in spec: up to 20MB) |

**Frontend calls:** `POST /api/v1/kyc/verify/cac` (multipart) — ✅ **implemented** (alias: `/verify-cac-document`).

### Phone verification (Tier 1)

| Step | Method | Path |
|------|--------|------|
| Send OTP | POST | `/api/v1/enterprise/phone/send-otp` `{ phone }` |
| Verify OTP | POST | `/api/v1/enterprise/phone/verify-otp` `{ phone, otp }` |

Both require JWT (`authMiddleware`). Used by merchant app via `lib/api/auth.ts` — not under `/auth/*`.

---

## 2. API — mounted routes (`gemex-rails-api`)

Base: `{API_URL}/api/v1`  
OpenAPI: `{API_URL}/api/docs`

### 2.1 Auth — `/api/v1/auth`

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/register` | Public | `businessName`, `email`, `password`, optional profile fields |
| POST | `/verify-email` | Public | `{ email, otp }` |
| POST | `/resend-otp` | Public | |
| POST | `/login` | Public | Returns JWT pair |
| POST | `/admin/login` | Public | Admin only |
| POST | `/forgot-password` | Public | |
| POST | `/reset-password` | Public | |
| POST | `/refresh-token` | Public | `{ refreshToken }` |
| GET | `/profile` | JWT | |
| PUT | `/profile` | JWT | Includes `rcNumber`, `businessCategory`, etc. |
| PUT | `/settings` | JWT | `emailNotifications`, `smsNotifications` |
| PUT | `/bank-account` | JWT | 10-digit account, optional `otp` |
| POST | `/change-password` | JWT | |
| POST | `/upload-logo` | JWT | multipart |
| DELETE | `/logo` | JWT | |
| POST | `/logout` | JWT | |
| GET | `/banks` | JWT | Bank list |
| POST | `/verify-bank` | JWT | Resolve account name |
| POST | `/send-bank-otp` | JWT | Bank change OTP |

### 2.2 Dashboard (merchant) — `/api/v1/dashboard`

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/` | JWT + merchant/mod | Stats + user summary |
| GET | `/transactions` | JWT + merchant/mod | Paginated |
| GET | `/transactions/:id` | JWT + merchant/mod | |

### 2.3 Enterprise — `/api/v1/enterprise`

Branches, terminals, moderators, banks, **phone OTP** (see §1).

### 2.4 Payments — `/api/v1/payments` (mostly public)

`merchant/:id`, `rate`, `initiate`, `status/:id`, `confirm`, receipts — customer/merchant payment flow.

### 2.5 Other modules

- `/api/v1/notifications` — in-app notifications  
- `/api/v1/admin` — admin operations  
- `/api/v1/wallets` — wallet operations  

### 2.6 KYC — `/api/v1/kyc` (JWT required)

| Method | Path | Body / params | Response highlights |
|--------|------|---------------|---------------------|
| POST | `/verify-cac-document` | multipart: `rcNumber`, `businessAddress`, `businessCategory`, `document` | Same handler as `/verify/cac` |
| POST | `/verify/cac` | multipart (above) or JSON `{ rcNumber }` legacy | `{ status, jobId?, tier?, message }` |
| GET | `/status/:jobId` | — | `{ status: 'pending' \| 'success' \| 'failed', message?, tier? }` |

**SmileID / validation (server):**

- `rcNumber` must start with **`RC`** or **`BN`** (uppercased server-side)
- Document: PDF, JPEG, PNG, WebP — max **20MB**
- Async flow returns `jobId` (e.g. `CAC_<timestamp>`) for polling
- Immediate success: `resultCode === '1012'` → `cacVerified`, `tier: 2`, `merchantStatus: 'verified'`

### 2.7 Referrals — `/api/v1/referrals` (JWT required)

| Method | Path |
|--------|------|
| GET | `/stats` |
| GET | `/history` |
| GET | `/withdrawals` |
| POST | `/withdraw` |
| GET | `/banks` |
| POST | `/verify-payout-account` |
| POST | `/payout-account` |

*Not in developer portal spec — merchant/referral feature.*

### 2.8 Still not implemented (developer portal spec)

| Spec path | Status |
|-----------|--------|
| `/api/v1/developer/dashboard/stats` | ❌ |
| `/api/v1/developer/dashboard/analytics` | ❌ |
| `/api/v1/developer/dashboard/integration-health` | ❌ |
| `/api/v1/developer/keys` | ❌ |
| `/api/v1/developer/keys/regenerate` | ❌ |
| `/api/v1/developer/webhooks` | ❌ |
| `/api/v1/developer/webhooks/logs` | ❌ |

---

## 3. User model & KYC / tier mapping

From `gemex-rails-api/src/modules/users/users.models.ts`:

| Field | Type | Dev portal tier mapping |
|-------|------|-------------------------|
| `emailVerified` | boolean | Registration complete |
| `phoneVerified` | boolean | **Tier 1** (DEV-502) |
| `cacVerified` | boolean | **Tier 2** (DEV-503–504) |
| `tier` | number (default `1`) | Numeric tier on user |
| `merchantStatus` | `pending` \| `verified` \| `suspended` | Badges (DEV-501) |
| `businessCategory`, `businessAddress`, `rcNumber` | strings | CAC / profile forms |

**Requirements doc vs API:**

- Spec mentions `user.merchantStatus` — API uses `merchantStatus` on User ✅  
- Spec SmileID async job + polling — **not implemented** on API; UI in merchant frontend is ahead of backend  
- Tier limits (₦100k daily, etc.) — **business rules not enforced in API files reviewed**; document as product rules until API exposes limits

---

## 4. SmileID parameters (verification checklist)

| Parameter | Required by spec | In merchant UI | In API |
|-----------|------------------|----------------|--------|
| `rcNumber` | ✅ | ✅ FormData | ✅ KYC multipart + SmileID |
| `businessAddress` | ✅ | ✅ FormData | ✅ KYC + profile |
| `businessCategory` | ✅ | ✅ FormData | ✅ KYC + profile |
| `document` | ✅ | ✅ FormData file | ✅ Stored under `uploads/kyc/` |

**Tier limits (API source of truth):** `TIER_0` ₦200,000 · `TIER_1` ₦500,000 · `TIER_2` unlimited — differs from requirements doc (₦100k Tier 1); align copy with `tiers.ts` or product owner.

---

## 5. Developer portal — page routes & API scope

### 5.1 Routes (Next.js — `gemrails-developer-portal`)

| Route | Module | API dependency |
|-------|--------|----------------|
| `/` | Landing DEV-101–104 | Mostly static; playground simulated |
| `/auth/login`, `/auth/signup` | Auth (TBD) | `POST /auth/login`, `/register`, `/verify-email` |
| `/dashboard` | DEV-201–203 | `/developer/dashboard/*` ❌ or interim: `/dashboard` |
| `/dashboard/api-keys` | DEV-301–303 | `/developer/keys`, `/developer/webhooks` ❌ |
| `/dashboard/analytics` | DEV-401–402 | `/developer/dashboard/analytics` ❌ |
| `/dashboard/kyc` | DEV-501–504 | `/auth/profile`, enterprise phone, `/kyc/*` ❌ |
| `/dashboard/settings` | DEV-601–603 | `/auth/profile`, `/bank-account`, `/settings` ✅ |

### 5.2 Interim strategy (until `/developer/*` exists)

| Feature | Interim API |
|---------|-------------|
| Auth / profile | Existing `/auth/*` ✅ |
| Bank / settings | Existing `/auth/*` ✅ |
| Phone Tier 1 | `/enterprise/phone/*` ✅ |
| Dashboard KPIs | `GET /dashboard` (merchant-shaped) or mock |
| API keys / webhooks / analytics | Mock UI or block with “coming soon” |
| CAC Tier 2 | Block until `/kyc/*` shipped |

### 5.3 CORS

API allows origins including `http://localhost:3000`, `http://localhost:3001` (`src/app.ts`). Add `developer.gemrails.com` and dev portal port when deploying.

---

## 6. Middleware & auth (API)

- JWT via `authMiddleware(JWT_SECRET)` on protected routes  
- Payload includes `role`: `admin` \| `merchant` \| `branch_mod`  
- Developer portal users likely **`merchant` role** (or new `developer` role — **not in schema today**)  
- Dashboard routes use `merchantOrMod` — developers may need a dedicated role or reuse `merchant`

---

## 7. DEV-001 checklist — status

- [x] Analyze merchant frontend for reusable assets (§1)  
- [x] Review API routes for KYC, Auth, Merchant data (§2–3)  
- [x] Verify SmileID parameters against UI + API (§4)  
- [x] Define developer portal routes and API scopes (§5)  

---

## 8. Recommended next steps

1. **Backend:** Add `src/modules/developer/` and mount `/api/v1/developer` per requirements.  
2. **Backend:** Add `src/modules/kyc/` for CAC + SmileID + status polling.  
3. **Frontend:** Move phone OTP paths to `/auth/phone/*` or document enterprise paths in dev portal `lib/api/auth.ts`.  
4. **Frontend:** DEV-101+ landing or auth pages using existing `/auth/*`.  
5. **Shared:** Extract `BUSINESS_CATEGORIES`, `otp-input`, `bank-selector` into a shared package or copy into dev portal.
