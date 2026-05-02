-- AlterTable
ALTER TABLE "tagging_rule" ADD COLUMN "organizationId" UUID;

-- Backfill: Set organizationId from the first question's questionnaire for existing rules
UPDATE "tagging_rule" tr
SET "organizationId" = (
  SELECT q."organizationId"
  FROM "tagging_rule_question" trq
  JOIN "question" qu ON qu.id = trq."questionId"
  JOIN "questionnaire" q ON q.id = qu."questionnaireId"
  WHERE trq."taggingRuleId" = tr.id
  LIMIT 1
)
WHERE tr."organizationId" IS NULL;

-- Delete any rules that could not be backfilled (no questions linked)
DELETE FROM "tagging_rule" WHERE "organizationId" IS NULL;

-- Make column required
ALTER TABLE "tagging_rule" ALTER COLUMN "organizationId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "tagging_rule_organizationId_idx" ON "tagging_rule"("organizationId");

-- AddForeignKey
ALTER TABLE "tagging_rule" ADD CONSTRAINT "tagging_rule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
