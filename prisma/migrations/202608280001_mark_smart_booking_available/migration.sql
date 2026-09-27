-- Smart Booking is ready for commercial intake. Runtime workflow wiring remains
-- an independent integration concern and is intentionally not changed here.
UPDATE "service_definitions"
SET
  "availability" = 'AVAILABLE',
  "updated_at" = CURRENT_TIMESTAMP
WHERE "id" = 'smart-booking'
  AND "availability" <> 'AVAILABLE';

