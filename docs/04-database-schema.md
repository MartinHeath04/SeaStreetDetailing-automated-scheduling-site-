# Database Schema & SQL Queries (PostgreSQL)

> You will use **raw SQL** for availability/conflict checks and analytics. Prisma can handle CRUD; call raw SQL via `prisma.$queryRaw` / `.$executeRaw` where noted.

## DDL (Core Tables)
```sql
CREATE EXTENSION IF NOT EXISTS btree_gist; -- for exclusion constraints

CREATE TABLE service (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  duration_min INT NOT NULL CHECK (duration_min > 0),
  base_price_cents INT NOT NULL CHECK (base_price_cents >= 0),
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE addon (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price_cents INT NOT NULL DEFAULT 0,
  duration_min INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE booking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_id INT NOT NULL REFERENCES service(id),
  add_on_ids INT[] NOT NULL DEFAULT '{}',
  start_at_utc TIMESTAMPTZ NOT NULL,
  end_at_utc   TIMESTAMPTZ NOT NULL,
  address TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending','pending_payment','confirmed','cancelled','payment_failed')),
  price_cents INT NOT NULL,
  stripe_payment_intent_id TEXT,
  gcal_event_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE unavailability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_at_utc TIMESTAMPTZ NOT NULL,
  end_at_utc   TIMESTAMPTZ NOT NULL,
  reason TEXT
);

CREATE TABLE sms_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES booking(id) ON DELETE SET NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
  to_number TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES booking(id) ON DELETE CASCADE,
  amount_cents INT NOT NULL,
  status TEXT NOT NULL,
  provider_ref TEXT,
  paid_at TIMESTAMPTZ
);
```

## Indexes & Constraints
```sql
-- Fast lookups by time
CREATE INDEX idx_booking_start ON booking (start_at_utc);
CREATE INDEX idx_booking_time_range ON booking USING GIST (tstzrange(start_at_utc, end_at_utc, '[)'));
CREATE INDEX idx_unavailability_time_range ON unavailability USING GIST (tstzrange(start_at_utc, end_at_utc, '[)'));

-- Optional exclusion to prevent overlap among CONFIRMED/PENDING for single-resource shop
-- (If you ever scale to multiple crews, add a resource_id and include it in constraint)
ALTER TABLE booking
  ADD CONSTRAINT booking_no_time_overlap
  EXCLUDE USING GIST (
    tstzrange(start_at_utc, end_at_utc, '[)') WITH &&
  ) WHERE (status IN ('pending','confirmed'));
```

## Conflict Check (Does a candidate slot collide?)
```sql
-- Inputs: :start_ts, :end_ts
SELECT EXISTS (
  SELECT 1 FROM booking b
  WHERE b.status IN ('pending','confirmed')
    AND tstzrange(b.start_at_utc, b.end_at_utc, '[)') && tstzrange(:start_ts, :end_ts, '[)')
  UNION ALL
  SELECT 1 FROM unavailability u
  WHERE tstzrange(u.start_at_utc, u.end_at_utc, '[)') && tstzrange(:start_ts, :end_ts, '[)')
) AS has_conflict;
```

## Generate Available Slots for a Day
```sql
-- Inputs: :day_start (00:00 local converted to UTC), :day_end (23:59:59), :duration_min, :travel_buffer_min
WITH params AS (
  SELECT :day_start::timestamptz AS day_start,
         :day_end::timestamptz   AS day_end,
         (:duration_min + :travel_buffer_min)::int AS slot_min
),
slots AS (
  SELECT generate_series(day_start, day_end - make_interval(mins => slot_min), make_interval(mins => 15)) AS slot_start
  FROM params
),
intervals AS (
  SELECT slot_start,
         slot_start + make_interval(mins => (SELECT slot_min FROM params)) AS slot_end
  FROM slots
),
conflicts AS (
  SELECT tstzrange(b.start_at_utc, b.end_at_utc, '[)') AS r
  FROM booking b WHERE b.status IN ('pending','confirmed') AND b.start_at_utc::date = (SELECT day_start::date FROM params)
  UNION ALL
  SELECT tstzrange(u.start_at_utc, u.end_at_utc, '[)') FROM unavailability u
)
SELECT slot_start, slot_end
FROM intervals i
WHERE NOT EXISTS (
  SELECT 1 FROM conflicts c
  WHERE tstzrange(i.slot_start, i.slot_end, '[)') && c.r
)
ORDER BY slot_start;
```

## Analytics (Examples)
```sql
-- Weekly revenue (USD)
WITH paid AS (
  SELECT date_trunc('week', paid_at) AS wk, amount_cents
  FROM payment WHERE status = 'succeeded'
)
SELECT wk, SUM(amount_cents)/100.0 AS revenue_usd
FROM paid GROUP BY wk ORDER BY wk DESC;

-- Top services by count
SELECT s.name, COUNT(*)
FROM booking b JOIN service s ON s.id = b.service_id
WHERE b.status = 'confirmed'
GROUP BY s.name ORDER BY COUNT(*) DESC LIMIT 5;
```