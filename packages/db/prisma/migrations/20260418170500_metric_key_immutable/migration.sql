-- CreateEnum
CREATE TYPE "MetricKey" AS ENUM (
    'REJECTION_PERCENTAGE',
    'FILL_RATE_LONG_TERM_REQS',
    'FILL_RATE_SHIFTS',
    'SUBMIT_TO_OFFER_RATIO',
    'AVG_TIME_TO_FIRST_SUBMISSION',
    'AVG_TIME_PUBLISH_TO_ACCEPT',
    'PERCENT_INCOMPLETE_ASSIGNMENTS',
    'EXPIRED_CREDENTIALING_PERCENT',
    'ON_TIME_STARTS_PERCENT',
    'BACK_OUT_PERCENTAGE',
    'PERFORMANCE_GRIEVANCE_PERCENT',
    'GRIEVANCE_PERCENTAGE'
);

-- AlterTable
ALTER TABLE "metric" ADD COLUMN "key" "MetricKey";

-- Backfill key from existing immutable metric catalog names
UPDATE "metric"
SET "key" = CASE "name"
    WHEN 'Rejection Percentage' THEN 'REJECTION_PERCENTAGE'::"MetricKey"
    WHEN 'Fill Rate (Long Term Reqs)' THEN 'FILL_RATE_LONG_TERM_REQS'::"MetricKey"
    WHEN 'Fill Rate (Shifts)' THEN 'FILL_RATE_SHIFTS'::"MetricKey"
    WHEN 'Submit to Offer Ratio' THEN 'SUBMIT_TO_OFFER_RATIO'::"MetricKey"
    WHEN 'Avg Time to 1st Submission' THEN 'AVG_TIME_TO_FIRST_SUBMISSION'::"MetricKey"
    WHEN 'Avg Time from Publish to Accept' THEN 'AVG_TIME_PUBLISH_TO_ACCEPT'::"MetricKey"
    WHEN 'Percent of Incomplete Assignments' THEN 'PERCENT_INCOMPLETE_ASSIGNMENTS'::"MetricKey"
    WHEN 'Expired Credentialing %' THEN 'EXPIRED_CREDENTIALING_PERCENT'::"MetricKey"
    WHEN 'On Time Starts %' THEN 'ON_TIME_STARTS_PERCENT'::"MetricKey"
    WHEN 'Back Out Percentage' THEN 'BACK_OUT_PERCENTAGE'::"MetricKey"
    WHEN 'Performance Grievance %' THEN 'PERFORMANCE_GRIEVANCE_PERCENT'::"MetricKey"
    WHEN 'Grievance Percentage' THEN 'GRIEVANCE_PERCENTAGE'::"MetricKey"
    ELSE NULL
END;

-- Validate backfill before enforcing NOT NULL
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "metric" WHERE "key" IS NULL) THEN
        RAISE EXCEPTION 'Metric key backfill failed: one or more metric rows were not mapped';
    END IF;
END
$$;

-- Final constraints
ALTER TABLE "metric" ALTER COLUMN "key" SET NOT NULL;
CREATE UNIQUE INDEX "metric_key_key" ON "metric"("key");
