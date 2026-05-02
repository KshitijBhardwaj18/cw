-- CreateTable
CREATE TABLE "candidate_questionnaire_response" (
    "id" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_questionnaire_response_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "candidate_questionnaire_response_candidateId_questionId_key" ON "candidate_questionnaire_response"("candidateId", "questionId");

-- CreateIndex
CREATE INDEX "candidate_questionnaire_response_candidateId_idx" ON "candidate_questionnaire_response"("candidateId");

-- CreateIndex
CREATE INDEX "candidate_questionnaire_response_questionId_idx" ON "candidate_questionnaire_response"("questionId");

-- AddForeignKey
ALTER TABLE "candidate_questionnaire_response" ADD CONSTRAINT "candidate_questionnaire_response_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "candidate_questionnaire_response" ADD CONSTRAINT "candidate_questionnaire_response_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
