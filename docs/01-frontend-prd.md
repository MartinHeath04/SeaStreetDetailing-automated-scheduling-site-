# Frontend Product Requirements (Next.js, React, TypeScript)

**Product**: Automated Scheduling Website for Sea Street Detailing  
**Tech**: Next.js (App Router), React, TypeScript, TailwindCSS, shadcn/ui, React Hook Form, Zod, SWR/React Query, Next-SEO  
**Devices**: Mobile-first, responsive (sm, md, lg breakpoints)  
**SEO**: Schema.org LocalBusiness/Service, sitemap, robots, OG images, Lighthouse ≥ 95

## Goals & Outcomes
- Let customers view services, pricing, gallery, and **book a time slot** in < 2 minutes.
- Reduce no-shows via **SMS/email confirmations and reminders**.
- Provide **admin dashboard** to manage bookings, blackout times, and see daily routes.

## Personas
- **Customer**: Needs clear pricing, availability, fast booking, reminders.
- **Owner/Admin**: Needs calendar view, quick reschedule, KPI snapshots.

## Site Map & Pages
1. **/** Home (hero, value props, CTA "Book Now")
2. **/services** Services & Pricing (cards, add-ons)
3. **/gallery** Before/After Gallery (lazy-loaded grid)
4. **/reviews** Social proof (static or pulled from Google)
5. **/book** Booking flow (multi-step)
6. **/contact** Simple form (email+SMS) + FAQ
7. **/portal** Customer portal (view/reschedule/cancel) [phase 2]
8. **/admin** Dashboard (auth required)
   - **/admin/calendar** day/week views
   - **/admin/bookings** table + filters
   - **/admin/blocks** manage blackout/unavailability
   - **/admin/analytics** KPIs charts

## Global UX Requirements
- Mobile-first, tap-friendly buttons (44px min)
- Form validation with Zod (inline errors)
- Instant feedback: spinners, disabled states, optimistic UI where safe
- Accessible: semantic HTML, labels, aria attributes, keyboard navigable

## Component Inventory
- **Layout**: Header (logo, nav), Footer (contact, social, hours)
- **Hero**: CTA buttons "Book Now", "See Pricing"
- **ServiceCard**: name, duration, price, add-on chips
- **BeforeAfter**: slider or side-by-side images (next/image)
- **ReviewCard**: stars, text, author, date
- **BookingWizard** (multi-step):
  1. **SelectServiceStep** (service + add-ons)
  2. **SelectDateTimeStep** (availability grid)
  3. **DetailsStep** (name, email, phone, address, notes)
  4. **PaymentStep** (Stripe Payment Element) [optional deposit]
  5. **ConfirmationStep** (summary, calendar .ics link)
- **AvailabilityGrid**: shows 30–60 min slots; disabled if conflict
- **Toasts/Modals**: success, error, confirm dialogs
- **Admin components**:
  - **AdminCalendar** (day/week; drag to reschedule)
  - **BookingTable** (status filters, search)
  - **BlockForm** (create blackout times)
  - **KPIWidgets** (Revenue, Utilization, Avg duration, Top service)

## Booking Flow (Frontend)
1. User selects service → add-ons → next.
2. Date picker (shows next 14–30 days). On date click, request `/api/availability?serviceId&date` → render slots.
3. User picks a time → enters details (Zod-validated) → next.
4. Payment step (if deposit required): mount Stripe Element; handle result.
5. Show confirmation page: booking id, date/time, address, instructions; buttons for "Add to Calendar," "Manage Booking."

### Edge Cases & Errors
- No slots available → show alternate dates + "request callback."
- Payment failure → retry or allow hold-without-deposit (configurable).
- Double-submit prevention: disable CTA, idempotency keys in backend.

## Admin Dashboard UX
- **Calendar**: day/week switch; bookings color-coded by status.
- **Drag & drop** reschedule → opens confirm modal; sends SMS.
- **Blocks**: add recurring or single unavailability; reason field.
- **Table**: search by name/phone; bulk confirm/remind.
- **Analytics**: date range filter; charts for revenue, service mix, utilization.

## State Management & Data Fetching
- Use **SWR or React Query** for cache & revalidation.
- Keep booking wizard state in local component state; persist to `sessionStorage` to guard refreshes.

## Theming & Branding
- Tailwind + shadcn/ui; neutral palette with accent color.
- Light mode default, good contrast ratios.

## Telemetry & Analytics
- Plausible (pageviews, conversion)
- PostHog (funnels for booking steps)

## SEO Requirements
- Metadata via Next.js metadata API
- `schema.org` JSON-LD: LocalBusiness, Service, Offer
- Sitemap (`/sitemap.xml`) and robots.txt; fast LCP (image optimization)

## Acceptance Criteria (Frontend)
- Lighthouse ≥ 95 mobile/desktop
- Booking flow completes within ≤ 5 interactions after selecting a date
- Forms are fully accessible and keyboard navigable
- Availability grid loads in < 600ms on 4G