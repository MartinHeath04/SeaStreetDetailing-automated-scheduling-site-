# Backend Product Requirements (Next.js API Routes / Node)

**Tech**: Next.js API routes (Route Handlers), TypeScript, Prisma (PostgreSQL), Zod, Stripe, Twilio, Google Calendar API, Vercel Cron, Sentry

## Goals
- Provide secure, typed endpoints for booking, availability, payments, SMS, and admin ops.
- Enforce **conflict-free scheduling** (DB-level + application-level checks).
- Integrate with Stripe (payment intent + webhooks), Twilio (SMS + inbound), Google Calendar (event sync).

## Environment & Config
- Timezone: **America/New_York** (store UTC in DB; convert at edges)
- ENV:
  - `DATABASE_URL`
  - `NEXTAUTH_SECRET`, OAuth providers (if used)
  - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_MESSAGING_SERVICE_SID`
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_CALENDAR_ID`
  - `APP_BASE_URL`, `VERCEL_URL`

## Data Model (high level)
- **User**(id, name, email, phone, role)
- **Service**(id, name, duration_min, base_price_cents, active)
- **AddOn**(id, name, price_cents, duration_min, active)
- **Booking**(id, user_id?, customer_name, email, phone, service_id, add_on_ids[], start_at_utc, end_at_utc, address, notes, status, price_cents, stripe_payment_intent_id?, gcal_event_id?, created_at)
- **Unavailability**(id, start_at_utc, end_at_utc, reason)
- **SmsLog**(id, to, direction, body, status, booking_id?, created_at)
- **Payment**(id, booking_id, amount_cents, status, provider_ref, paid_at)

> See `/docs/04-database-schema.md` for DDL and critical queries.

## API Endpoints (Contract)
- `GET /api/services` → list services & add-ons
- `GET /api/availability?date=YYYY-MM-DD&serviceId=...` → returns slots (UTC + local labels)
- `POST /api/bookings` → body: { serviceId, addOnIds, customer, contact, address, date, slot, notes }
  - Response: { bookingId, status, paymentRequired, clientSecret? }
- `POST /api/bookings/:id/confirm` (admin or after payment)
- `PATCH /api/bookings/:id` (reschedule/cancel)
- `GET /api/admin/bookings?from&to&status` → list with pagination
- `POST /api/blocks` / `DELETE /api/blocks/:id`
- **Webhooks**
  - `POST /api/webhooks/stripe`
  - `POST /api/webhooks/twilio`
- **Jobs** (cron-invoked)
  - `POST /api/jobs/send-reminders?window=24h` (also `2h`)

### Availability Logic (Server)
- Use SQL to detect conflicts (tstzrange overlap) and to **generate candidate slots** for a date based on service duration + travel buffer.
- Filter out slots overlapping **Bookings** (pending/confirmed) and **Unavailability**.
- Optional: also consult Google Calendar busy periods (same service calendar) as a final gate.

### Payments Flow
- Create Booking in `pending_payment` with a **Stripe Payment Intent** (amount = deposit or full).
- On `payment_intent.succeeded` webhook → mark `confirmed`, create Google Calendar event, send SMS.
- On failure/cancel → expire booking or keep `pending` with TTL; notify user.

### SMS Flow (Twilio)
- Outbound templates: confirmation, 24h reminder, 2h reminder, follow-up review.
- Inbound webhook handles:
  - "CONFIRM" → set confirmed
  - "RESCHEDULE" → reply with link (signed URL) to reschedule UI
  - Free-text → fallback message + link

### Admin Auth
- NextAuth (email link or Google). `role = admin` gate on `/admin/*`.

### Observability
- Sentry for API errors
- Structured logs (pino) → request id, user id, endpoint, duration

## Acceptance Criteria (Backend)
- Double-booking impossible (DB constraint + tested)
- Webhooks verified (secret signatures) and idempotent
- Reminders sent for 100% of next-day and same-day bookings (cron verified)
- P95 API latency < 300ms for availability on 1k bookings