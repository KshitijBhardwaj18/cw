-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('CHECKBOX', 'SELECT', 'RADIO_BUTTON', 'TEXT');

-- CreateEnum
CREATE TYPE "ConditionType" AS ENUM ('EQUALS', 'LESS_THAN', 'GREATER_THAN', 'LESS_THAN_OR_EQUAL_TO', 'GREATER_THAN_OR_EQUAL_TO', 'NOT_EQUALS', 'CONTAINS', 'NOT_CONTAINS');

-- CreateTable
CREATE TABLE "organization_occupation" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "occupationId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,

    CONSTRAINT "organization_occupation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_specialty" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "specialtyId" UUID NOT NULL,
    "organizationOccupationId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,

    CONSTRAINT "organization_specialty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question" (
    "id" UUID NOT NULL,
    "order" INTEGER,
    "questionText" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL DEFAULT 'TEXT',
    "options" TEXT[],
    "required" BOOLEAN NOT NULL DEFAULT false,
    "includeInSubmission" BOOLEAN NOT NULL DEFAULT true,
    "questionnaireId" UUID NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questionnaire" (
    "id" UUID NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "organizationId" UUID NOT NULL,
    "occupationId" UUID,
    "specialtyId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,

    CONSTRAINT "questionnaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tagging_rule" (
    "id" UUID NOT NULL,
    "ruleName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "showOnSubmission" BOOLEAN NOT NULL DEFAULT true,
    "tagId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,

    CONSTRAINT "tagging_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tagging_rule_question" (
    "id" UUID NOT NULL,
    "taggingRuleId" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "condition" "ConditionType" NOT NULL,
    "triggerValue" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,

    CONSTRAINT "tagging_rule_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matching_logic" (
    "id" UUID NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "weight" INTEGER NOT NULL DEFAULT 0,
    "matchingCriterionId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,

    CONSTRAINT "matching_logic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matching_criterion" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "matching_criterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_wallet_template" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "organizationOccupationId" UUID NOT NULL,
    "organizationSpecialtyId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,

    CONSTRAINT "compliance_wallet_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_wallet_template_item" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "complianceWalletTemplateId" UUID NOT NULL,
    "complianceListItemId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_wallet_template_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "organization_occupation_organizationId_idx" ON "organization_occupation"("organizationId");

-- CreateIndex
CREATE INDEX "organization_occupation_occupationId_idx" ON "organization_occupation"("occupationId");

-- CreateIndex
CREATE INDEX "organization_specialty_organizationId_idx" ON "organization_specialty"("organizationId");

-- CreateIndex
CREATE INDEX "organization_specialty_specialtyId_idx" ON "organization_specialty"("specialtyId");

-- CreateIndex
CREATE INDEX "organization_specialty_organizationOccupationId_idx" ON "organization_specialty"("organizationOccupationId");

-- CreateIndex
CREATE INDEX "question_questionnaireId_idx" ON "question"("questionnaireId");

-- CreateIndex
CREATE INDEX "question_createdBy_idx" ON "question"("createdBy");

-- CreateIndex
CREATE INDEX "question_updatedBy_idx" ON "question"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "questionnaire_occupationId_key" ON "questionnaire"("occupationId");

-- CreateIndex
CREATE UNIQUE INDEX "questionnaire_specialtyId_key" ON "questionnaire"("specialtyId");

-- CreateIndex
CREATE INDEX "questionnaire_organizationId_idx" ON "questionnaire"("organizationId");

-- CreateIndex
CREATE INDEX "questionnaire_specialtyId_idx" ON "questionnaire"("specialtyId");

-- CreateIndex
CREATE INDEX "questionnaire_occupationId_idx" ON "questionnaire"("occupationId");

-- CreateIndex
CREATE INDEX "tagging_rule_tagId_idx" ON "tagging_rule"("tagId");

-- CreateIndex
CREATE INDEX "tagging_rule_createdBy_idx" ON "tagging_rule"("createdBy");

-- CreateIndex
CREATE INDEX "tagging_rule_updatedBy_idx" ON "tagging_rule"("updatedBy");

-- CreateIndex
CREATE INDEX "tagging_rule_question_taggingRuleId_idx" ON "tagging_rule_question"("taggingRuleId");

-- CreateIndex
CREATE INDEX "tagging_rule_question_questionId_idx" ON "tagging_rule_question"("questionId");

-- CreateIndex
CREATE INDEX "tagging_rule_question_createdBy_idx" ON "tagging_rule_question"("createdBy");

-- CreateIndex
CREATE INDEX "tagging_rule_question_updatedBy_idx" ON "tagging_rule_question"("updatedBy");

-- CreateIndex
CREATE INDEX "matching_logic_organizationId_idx" ON "matching_logic"("organizationId");

-- CreateIndex
CREATE INDEX "matching_logic_matchingCriterionId_idx" ON "matching_logic"("matchingCriterionId");

-- CreateIndex
CREATE INDEX "matching_logic_createdBy_idx" ON "matching_logic"("createdBy");

-- CreateIndex
CREATE INDEX "matching_logic_updatedBy_idx" ON "matching_logic"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "matching_logic_organizationId_matchingCriterionId_key" ON "matching_logic"("organizationId", "matchingCriterionId");

-- CreateIndex
CREATE UNIQUE INDEX "matching_criterion_name_key" ON "matching_criterion"("name");

-- CreateIndex
CREATE INDEX "compliance_wallet_template_organizationId_organizationOccup_idx" ON "compliance_wallet_template"("organizationId", "organizationOccupationId", "organizationSpecialtyId");

-- CreateIndex
CREATE INDEX "compliance_wallet_template_createdBy_idx" ON "compliance_wallet_template"("createdBy");

-- CreateIndex
CREATE INDEX "compliance_wallet_template_updatedBy_idx" ON "compliance_wallet_template"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "compliance_wallet_template_organizationId_organizationOccup_key" ON "compliance_wallet_template"("organizationId", "organizationOccupationId", "organizationSpecialtyId");

-- CreateIndex
CREATE INDEX "compliance_wallet_template_item_organizationId_complianceWa_idx" ON "compliance_wallet_template_item"("organizationId", "complianceWalletTemplateId");

-- CreateIndex
CREATE INDEX "compliance_wallet_template_item_complianceListItemId_idx" ON "compliance_wallet_template_item"("complianceListItemId");

-- CreateIndex
CREATE UNIQUE INDEX "compliance_wallet_template_item_complianceWalletTemplateId__key" ON "compliance_wallet_template_item"("complianceWalletTemplateId", "complianceListItemId");

-- AddForeignKey
ALTER TABLE "organization_occupation" ADD CONSTRAINT "organization_occupation_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_occupation" ADD CONSTRAINT "organization_occupation_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_occupation" ADD CONSTRAINT "organization_occupation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_occupation" ADD CONSTRAINT "organization_occupation_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_specialty" ADD CONSTRAINT "organization_specialty_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_specialty" ADD CONSTRAINT "organization_specialty_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_specialty" ADD CONSTRAINT "organization_specialty_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_specialty" ADD CONSTRAINT "organization_specialty_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_specialty" ADD CONSTRAINT "organization_specialty_organizationOccupationId_fkey" FOREIGN KEY ("organizationOccupationId") REFERENCES "organization_occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "questionnaire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questionnaire" ADD CONSTRAINT "questionnaire_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questionnaire" ADD CONSTRAINT "questionnaire_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questionnaire" ADD CONSTRAINT "questionnaire_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questionnaire" ADD CONSTRAINT "questionnaire_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "organization_occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questionnaire" ADD CONSTRAINT "questionnaire_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "organization_specialty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tagging_rule" ADD CONSTRAINT "tagging_rule_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tagging_rule" ADD CONSTRAINT "tagging_rule_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tagging_rule" ADD CONSTRAINT "tagging_rule_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tagging_rule_question" ADD CONSTRAINT "tagging_rule_question_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tagging_rule_question" ADD CONSTRAINT "tagging_rule_question_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tagging_rule_question" ADD CONSTRAINT "tagging_rule_question_taggingRuleId_fkey" FOREIGN KEY ("taggingRuleId") REFERENCES "tagging_rule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tagging_rule_question" ADD CONSTRAINT "tagging_rule_question_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matching_logic" ADD CONSTRAINT "matching_logic_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matching_logic" ADD CONSTRAINT "matching_logic_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matching_logic" ADD CONSTRAINT "matching_logic_matchingCriterionId_fkey" FOREIGN KEY ("matchingCriterionId") REFERENCES "matching_criterion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matching_logic" ADD CONSTRAINT "matching_logic_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_wallet_template" ADD CONSTRAINT "compliance_wallet_template_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_wallet_template" ADD CONSTRAINT "compliance_wallet_template_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_wallet_template" ADD CONSTRAINT "compliance_wallet_template_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_wallet_template" ADD CONSTRAINT "compliance_wallet_template_organizationOccupationId_fkey" FOREIGN KEY ("organizationOccupationId") REFERENCES "organization_occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_wallet_template" ADD CONSTRAINT "compliance_wallet_template_organizationSpecialtyId_fkey" FOREIGN KEY ("organizationSpecialtyId") REFERENCES "organization_specialty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_wallet_template_item" ADD CONSTRAINT "compliance_wallet_template_item_complianceWalletTemplateId_fkey" FOREIGN KEY ("complianceWalletTemplateId") REFERENCES "compliance_wallet_template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_wallet_template_item" ADD CONSTRAINT "compliance_wallet_template_item_complianceListItemId_fkey" FOREIGN KEY ("complianceListItemId") REFERENCES "compliance_list_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_wallet_template_item" ADD CONSTRAINT "compliance_wallet_template_item_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
