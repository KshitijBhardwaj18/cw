-- Add wallet-template-only compliance aggregate columns to candidate_summary

ALTER TABLE "candidate_summary"
  ADD COLUMN IF NOT EXISTS "walletTotalComplianceItems" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "walletApprovedComplianceItems" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "walletPendingUploadComplianceItems" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "walletPendingVerificationComplianceItems" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "walletExpiredComplianceItems" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "walletExpiringSoonComplianceItems" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "walletNextComplianceExpiryDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "walletLastComplianceUpdatedAt" TIMESTAMP(3);

