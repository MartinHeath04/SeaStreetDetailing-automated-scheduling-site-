# API Integrations (Stripe, Twilio, Google Calendar)

## Stripe (Payments)
**Use**: Accept deposit or full payment at booking; store `payment_intent` id; listen to webhooks.

### Setup
1. Create Stripe account; enable test mode.
2. Products/Prices (optional) or compute price server-side.
3. Configure webhook endpoint → `/api/webhooks/stripe` (events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `checkout.session.completed` if using Checkout).
4. ENV: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.

### Client Flow (Payment Element)
- Backend: `POST /api/bookings` creates PaymentIntent and returns `clientSecret`.
- Frontend: mount Payment Element; confirm payment.
- Success → show confirmation page; final state updated via webhook (source of truth).

### Webhook Handling
- Verify signature.
- On success: set booking `confirmed`, create Google Calendar event, send confirmation SMS/email, mark `Payment` paid.
- On failure: mark as `payment_failed`, notify customer with retry link.

## Twilio (SMS)
**Use**: Confirmation, reminders, 2-way reschedule intent.

### Setup
1. Buy a number or use Messaging Service.
2. Configure inbound webhook → `/api/webhooks/twilio`.
3. ENV: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_MESSAGING_SERVICE_SID`.

### Outbound Templates
- **Confirmation**: "Your detailing is booked for {DATE at TIME}. Reply RESCHEDULE to change."
- **24h Reminder**: "Reminder for tomorrow {TIME}. Address: {ADDR}. Reply RESCHEDULE to change."
- **2h Reminder**: quick reminder + prep instructions.
- **Follow-up**: "Thanks! Please leave a review: {LINK}."

### Inbound Keywords
- `CONFIRM` → update status
- `RESCHEDULE` → reply with signed link to reschedule page
- Other → fallback help text

### Delivery & Logging
- Store every outbound/inbound in `SmsLog` with status.

## Google Calendar (Availability & Events)
**Use**: Keep an official calendar in sync and optionally consult busy times.

### Setup
1. Google Cloud project → OAuth consent (internal), enable Calendar API.
2. Create OAuth client; obtain refresh token for service account or installed app flow.
3. ENV: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_CALENDAR_ID`.

### Flows
- **Create event** on confirmation with: title, description (service, customer, phone), location (address), reminders.
- **Reschedule**: patch event time.
- **Cancel**: delete event.

### Notes
- DB is source of truth. Calendar mirrors confirmed bookings + blocks (optional as "busy" events).