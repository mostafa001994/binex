DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "service_definitions")
     OR EXISTS (SELECT 1 FROM "business_services") THEN
    RAISE EXCEPTION 'Service tables must be empty before changing identifier types';
  END IF;
END
$$;

ALTER TABLE "business_services"
  DROP CONSTRAINT "business_services_service_id_fkey";

ALTER TABLE "service_definitions"
  ALTER COLUMN "id" DROP DEFAULT;

ALTER TABLE "service_definitions"
  ALTER COLUMN "id" TYPE VARCHAR(80)
  USING "id"::text;

ALTER TABLE "business_services"
  ALTER COLUMN "service_id" TYPE VARCHAR(80)
  USING "service_id"::text;

ALTER TABLE "business_services"
  ADD CONSTRAINT "business_services_service_id_fkey"
  FOREIGN KEY ("service_id")
  REFERENCES "service_definitions"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;