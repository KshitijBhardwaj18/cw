-- CreateEnum (idempotent)
DO $$
BEGIN
    CREATE TYPE "MetricSnapshotPeriodType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END
$$;

-- AlterEnum (idempotent)
DO $$
BEGIN
    ALTER TYPE "BackGroundJobType" ADD VALUE 'METRIC_SNAPSHOT_RECOMPUTE';
EXCEPTION
    WHEN duplicate_object THEN NULL;
END
$$;

-- CreateTable (idempotent)
CREATE TABLE IF NOT EXISTS "organization_metric_snapshot" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "metricId" UUID NOT NULL,
    "periodType" "MetricSnapshotPeriodType" NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "numerator" DOUBLE PRECISION,
    "denominator" DOUBLE PRECISION,
    "formulaVersion" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_metric_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS "organization_metric_snapshot_organizationId_metricId_periodType_key"
  ON "organization_metric_snapshot"("organizationId", "metricId", "periodType", "periodStart", "periodEnd");

CREATE INDEX IF NOT EXISTS "organization_metric_snapshot_organizationId_periodStart_idx"
  ON "organization_metric_snapshot"("organizationId", "periodStart");

CREATE INDEX IF NOT EXISTS "organization_metric_snapshot_organizationId_metricId_periodType_idx"
  ON "organization_metric_snapshot"("organizationId", "metricId", "periodType", "periodStart");

CREATE INDEX IF NOT EXISTS "organization_metric_snapshot_metricId_periodStart_idx"
  ON "organization_metric_snapshot"("metricId", "periodStart");

-- AddForeignKey (idempotent)
DO $$
BEGIN
    ALTER TABLE "organization_metric_snapshot"
        ADD CONSTRAINT "organization_metric_snapshot_organizationId_fkey"
        FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE "organization_metric_snapshot"
        ADD CONSTRAINT "organization_metric_snapshot_metricId_fkey"
        FOREIGN KEY ("metricId") REFERENCES "metric"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END
$$;
