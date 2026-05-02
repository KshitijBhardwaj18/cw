-- Backfill ShiftRoutingSettings for existing organizations that don't have one yet.
-- New orgs get this record created during organization creation, but pre-existing
-- orgs need to be seeded here with the same defaults.

INSERT INTO "shift_routing_settings" (
  "id",
  "organizationId",
  "enableRoutingDelay",
  "delayDuration",
  "delayUnit",
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid(),
  o."id",
  false,
  24,
  'HOURS'::"DelayUnit",
  now(),
  now()
FROM "organization" o
WHERE NOT EXISTS (
  SELECT 1
  FROM "shift_routing_settings" s
  WHERE s."organizationId" = o."id"
);
