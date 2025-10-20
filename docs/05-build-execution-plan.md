# Build Execution Plan – Step-by-Step Implementation Guide

## 0) Repo & Tooling Setup
- Create GitHub repo `sea-street-detailing`.
- Node 20.x, pnpm (or npm/yarn). Editor: VSCode + ESLint/Prettier.
- Create Vercel project (Next.js). Enable preview deployments.

## 1) Scaffold Frontend
```bash
npx create-next-app@latest sea-street-detailing \
  --ts --tailwind --eslint --src-dir --app --import-alias "@/*"
cd sea-street-detailing
pnpm add @tanstack/react-query zod react-hook-form next-seo class-variance-authority lucide-react
# shadcn/ui
pnpm add -D tailwind-merge tailwindcss-animate
npx shadcn-ui@latest init
```
- Set up base layout (Header, Footer), pages: `/`, `/services`, `/gallery`, `/book`, `/contact`, `/admin`.
- Add favicon, brand colors, typography.

## 2) Database Setup (PostgreSQL)
- Create **Neon** (or Supabase) Postgres. Grab `DATABASE_URL`.
- Add Prisma:
```bash
pnpm add prisma @prisma/client
npx prisma init
```
- Model basic tables in Prisma for CRUD convenience (Service, Booking, Unavailability). Keep raw SQL for availability.
- Run migration: `npx prisma migrate dev -n init`.

## 3) Authentication (Admin)
- Add NextAuth (email link or Google):
```bash
pnpm add next-auth
```
- Protect `/admin/*` route handlers and pages.

## 4) Services & Pricing Pages
- Seed services and add-ons via script or `/admin` form.
- Build **/services** page with `ServiceCard` components.

## 5) Availability API
- Create `GET /api/availability` route: validate query with Zod; call raw SQL (from `/docs/04-database-schema.md`).
- Frontend: **AvailabilityGrid**; fetch on date/service change; handle loading/errors.

## 6) Booking API & Flow
- `POST /api/bookings`: validate body; compute price; calculate `end_at` using duration + add-ons + buffer; run conflict check; insert booking as `pending` or `pending_payment`.
- Frontend: **BookingWizard** steps (service → slot → details → confirm).

## 7) Stripe Payment Integration
- Install Stripe SDK: `pnpm add stripe @stripe/stripe-js`
- Server: create PaymentIntent in `POST /api/bookings` when payment required; store `payment_intent` id.
- Client: mount Payment Element and confirm.
- Webhook: `POST /api/webhooks/stripe` → on success set booking `confirmed`, create Google Calendar event, send SMS.

## 8) Twilio SMS Integration
- Install: `pnpm add twilio`
- Outbound: send SMS on confirmation; queue reminders.
- Inbound webhook: `/api/webhooks/twilio` → parse message body; handle `CONFIRM`/`RESCHEDULE`.

## 9) Google Calendar Sync
- Install googleapis: `pnpm add googleapis`
- Service to create/update/delete events for confirmed bookings.

## 10) Automated Reminders (Cron Jobs)
- Vercel Cron: schedule two POSTs to `/api/jobs/send-reminders?window=24h` and `?window=2h`.
- Job selects upcoming bookings and sends SMS; log to `SmsLog`.

## 11) Admin Dashboard
- **/admin/calendar**: day/week calendar (e.g., use `@fullcalendar` or custom grid). Drag-reschedule -> `PATCH /api/bookings/:id`.
- **/admin/bookings**: table with search, filters; export CSV.
- **/admin/blocks**: CRUD for unavailability.
- **/admin/analytics**: charts (PostHog or lightweight chart lib) via SQL views.

## 12) SEO & Performance Optimization
- Add Next-SEO configs, schema.org JSON-LD, sitemap, robots.
- Optimize images in gallery; prefetch booking route; analyze Lighthouse.

## 13) Testing Implementation
- Unit: Zod schemas, availability function wrapper.
- Integration: API routes with a test DB (Vitest/Jest + Supertest).
- E2E: Playwright covering full booking flow.

## 14) Observability & CI/CD
- Sentry setup for server errors.
- GitHub Actions: lint, typecheck, tests on PR.

## 15) Production Launch
- Domain on Vercel; HTTPS; `www` + apex redirects.
- Production env vars set; webhooks pointing to prod URLs.
- Backup policy (daily DB snapshots via Neon/Supabase).

## 16) Post-Launch Enhancements
- Customer portal for self-service reschedule/cancel.
- Discount codes, loyalty, tips.
- Multi-day routes, travel-time estimation.

## Environment Variables Template
```env
DATABASE_URL=postgres://...
NEXTAUTH_SECRET=...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_MESSAGING_SERVICE_SID=MG...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
GOOGLE_CALENDAR_ID=...
APP_BASE_URL=https://yourdomain.com
```

## Definition of Done (Project Complete)
- Public site deployed on Vercel, SEO configured, Lighthouse ≥ 95
- End-to-end booking: select service → slot → details → pay (if enabled) → confirmation
- SMS confirmation + scheduled reminders delivered
- Admin can reschedule via dashboard; DB prevents double bookings
- All webhooks verified and idempotent; error logging in Sentry