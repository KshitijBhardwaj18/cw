-- Ensure spend_analytics is a snapshot TABLE (not a view/materialized view).

DO $$
DECLARE
	relkind text;
BEGIN
	SELECT c.relkind::text
	INTO relkind
	FROM pg_class c
	JOIN pg_namespace n ON n.oid = c.relnamespace
	WHERE n.nspname = current_schema()
	  AND c.relname = 'spend_analytics'
	LIMIT 1;

	IF relkind = 'm' THEN
		EXECUTE 'DROP MATERIALIZED VIEW IF EXISTS "spend_analytics"';
	ELSIF relkind = 'v' THEN
		EXECUTE 'DROP VIEW IF EXISTS "spend_analytics"';
	END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "spend_analytics" (
	"id" UUID NOT NULL,
	"organizationId" UUID NOT NULL,
	"periodStart" TIMESTAMP(3) NOT NULL,
	"periodEnd" TIMESTAMP(3) NOT NULL,
	"periodType" TEXT NOT NULL,
	"departmentId" UUID,
	"locationId" UUID,
	"vendorId" UUID,
	"occupationId" UUID,
	"projectId" UUID,
	"totalSpend" DOUBLE PRECISION NOT NULL DEFAULT 0,
	"regularHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
	"overtimeHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
	"totalHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
	"activePlacements" INTEGER NOT NULL DEFAULT 0,
	"totalInvoices" INTEGER NOT NULL DEFAULT 0,
	"averageBillRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
	"permanentHeadcount" INTEGER NOT NULL DEFAULT 0,
	"contingentHeadcount" INTEGER NOT NULL DEFAULT 0,
	"contractorHeadcount" INTEGER NOT NULL DEFAULT 0,
	"calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "spend_analytics_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "spend_analytics_organizationId_idx"
	ON "spend_analytics"("organizationId");
CREATE INDEX IF NOT EXISTS "spend_analytics_periodStart_periodEnd_idx"
	ON "spend_analytics"("periodStart", "periodEnd");
CREATE INDEX IF NOT EXISTS "spend_analytics_periodType_idx"
	ON "spend_analytics"("periodType");
CREATE INDEX IF NOT EXISTS "spend_analytics_departmentId_idx"
	ON "spend_analytics"("departmentId");
CREATE INDEX IF NOT EXISTS "spend_analytics_vendorId_idx"
	ON "spend_analytics"("vendorId");

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'spend_analytics_organizationId_fkey'
	) THEN
		ALTER TABLE "spend_analytics"
			ADD CONSTRAINT "spend_analytics_organizationId_fkey"
			FOREIGN KEY ("organizationId") REFERENCES "organization"("id")
			ON DELETE CASCADE ON UPDATE CASCADE;
	END IF;

	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'spend_analytics_departmentId_fkey'
	) THEN
		ALTER TABLE "spend_analytics"
			ADD CONSTRAINT "spend_analytics_departmentId_fkey"
			FOREIGN KEY ("departmentId") REFERENCES "department"("id")
			ON DELETE SET NULL ON UPDATE CASCADE;
	END IF;

	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'spend_analytics_locationId_fkey'
	) THEN
		ALTER TABLE "spend_analytics"
			ADD CONSTRAINT "spend_analytics_locationId_fkey"
			FOREIGN KEY ("locationId") REFERENCES "organization_location"("id")
			ON DELETE SET NULL ON UPDATE CASCADE;
	END IF;

	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'spend_analytics_vendorId_fkey'
	) THEN
		ALTER TABLE "spend_analytics"
			ADD CONSTRAINT "spend_analytics_vendorId_fkey"
			FOREIGN KEY ("vendorId") REFERENCES "vendor"("id")
			ON DELETE SET NULL ON UPDATE CASCADE;
	END IF;

	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'spend_analytics_occupationId_fkey'
	) THEN
		ALTER TABLE "spend_analytics"
			ADD CONSTRAINT "spend_analytics_occupationId_fkey"
			FOREIGN KEY ("occupationId") REFERENCES "occupation"("id")
			ON DELETE SET NULL ON UPDATE CASCADE;
	END IF;

	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'spend_analytics_projectId_fkey'
	) THEN
		ALTER TABLE "spend_analytics"
			ADD CONSTRAINT "spend_analytics_projectId_fkey"
			FOREIGN KEY ("projectId") REFERENCES "project"("id")
			ON DELETE SET NULL ON UPDATE CASCADE;
	END IF;
END
$$;

