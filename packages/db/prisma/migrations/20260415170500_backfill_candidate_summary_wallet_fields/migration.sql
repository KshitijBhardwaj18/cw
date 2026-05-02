-- Backfill wallet-template aggregate columns on candidate_summary to match
-- apps/worker/src/processors/summary-recompute.processor.ts (candidate branch).
-- Only updates existing candidate_summary rows.

-- Candidates without an org+occupation mapping: wallet metrics stay zeroed; stamp timestamp.
UPDATE "candidate_summary" cs
SET
  "walletTotalComplianceItems" = 0,
  "walletApprovedComplianceItems" = 0,
  "walletPendingUploadComplianceItems" = 0,
  "walletPendingVerificationComplianceItems" = 0,
  "walletExpiredComplianceItems" = 0,
  "walletExpiringSoonComplianceItems" = 0,
  "walletNextComplianceExpiryDate" = NULL,
  "walletLastComplianceUpdatedAt" = NOW()
FROM "candidate" c
WHERE cs."candidateId" = c.id
  AND (
    c."organizationId" IS NULL
    OR NOT EXISTS (
      SELECT 1
      FROM "organization_occupation" oo
      WHERE oo."organizationId" = c."organizationId"
        AND oo."occupationId" = c."occupationId"
    )
  );

-- Candidates with org+occupation: recompute from wallet templates + candidate_compliance.
UPDATE "candidate_summary" cs
SET
  "walletTotalComplianceItems" = w."wallet_total",
  "walletApprovedComplianceItems" = w."wallet_approved",
  "walletPendingUploadComplianceItems" = w."wallet_pending_upload",
  "walletPendingVerificationComplianceItems" = w."wallet_pending_verification",
  "walletExpiredComplianceItems" = w."wallet_expired",
  "walletExpiringSoonComplianceItems" = w."wallet_expiring_soon",
  "walletNextComplianceExpiryDate" = w."wallet_next",
  "walletLastComplianceUpdatedAt" = NOW()
FROM (
  WITH
  candidates_with_org_occ AS (
    SELECT
      c.id AS candidate_id,
      oo.id AS org_occ_id
    FROM "candidate" c
    INNER JOIN "organization_occupation" oo
      ON oo."organizationId" = c."organizationId"
      AND oo."occupationId" = c."occupationId"
    WHERE c."organizationId" IS NOT NULL
  ),
  org_spec_for_candidate AS (
    SELECT
      cs."candidateId" AS candidate_id,
      os.id AS org_specialty_id
    FROM "candidate_specialties" cs
    INNER JOIN "candidate" c ON c.id = cs."candidateId"
    INNER JOIN "organization_occupation" oo
      ON oo."organizationId" = c."organizationId"
      AND oo."occupationId" = c."occupationId"
    INNER JOIN "organization_specialty" os
      ON os."organizationOccupationId" = oo.id
      AND os."specialtyId" = cs."specialtyId"
      AND os."organizationId" = c."organizationId"
  ),
  required_items AS (
    SELECT DISTINCT
      cwo.candidate_id,
      cwti."complianceListItemId" AS item_id
    FROM candidates_with_org_occ cwo
    INNER JOIN "compliance_wallet_template" cwt
      ON cwt."organizationOccupationId" = cwo.org_occ_id
      AND cwt."organizationId" = (SELECT "organizationId" FROM "candidate" WHERE id = cwo.candidate_id)
    INNER JOIN "compliance_wallet_template_item" cwti
      ON cwti."complianceWalletTemplateId" = cwt.id
    INNER JOIN "compliance_list_item" cli
      ON cli.id = cwti."complianceListItemId"
      AND cli.status = 'ACTIVE'::"ComplianceListItemStatus"
      AND cli."displayToCandidate" = true
    WHERE (
      (
        NOT EXISTS (SELECT 1 FROM org_spec_for_candidate o WHERE o.candidate_id = cwo.candidate_id)
        AND cwt."organizationSpecialtyId" IS NULL
      )
      OR (
        EXISTS (SELECT 1 FROM org_spec_for_candidate o WHERE o.candidate_id = cwo.candidate_id)
        AND (
          cwt."organizationSpecialtyId" IS NULL
          OR cwt."organizationSpecialtyId" IN (
            SELECT org_specialty_id FROM org_spec_for_candidate o WHERE o.candidate_id = cwo.candidate_id
          )
        )
      )
    )
  ),
  item_rows AS (
    SELECT
      ri.candidate_id,
      ri.item_id,
      cc.id AS cc_id,
      cc.status AS cc_status,
      cc."expiryDate" AS expiry_date,
      cc."documentUrl" AS document_url
    FROM required_items ri
    LEFT JOIN "candidate_compliance" cc
      ON cc."candidateId" = ri.candidate_id
      AND cc."complianceListItemId" = ri.item_id
  ),
  computed AS (
    SELECT
      ir.candidate_id,
      ir.item_id,
      ir.cc_status,
      ir.expiry_date,
      (
        ir.cc_id IS NOT NULL
        AND btrim(COALESCE(ir.document_url, '')) <> ''
      ) AS has_doc,
      (
        (ir.expiry_date IS NOT NULL AND ir.expiry_date < NOW())
        OR ir.cc_status = 'EXPIRED'::"CandidateComplianceStatus"
      ) AS is_expired
    FROM item_rows ir
  ),
  bucketed AS (
    SELECT
      c.candidate_id,
      c.item_id,
      CASE
        WHEN NOT c.has_doc THEN 'pending_upload'
        WHEN c.is_expired THEN 'expired'
        WHEN c.cc_status = 'APPROVED'::"CandidateComplianceStatus" THEN 'approved'
        WHEN c.cc_status = 'PENDING'::"CandidateComplianceStatus" THEN 'pending_verification'
        ELSE 'pending_verification'
      END AS bucket,
      CASE
        WHEN c.has_doc
          AND NOT c.is_expired
          AND c.expiry_date IS NOT NULL
          AND c.expiry_date > NOW()
        THEN c.expiry_date
        ELSE NULL
      END AS future_expiry
    FROM computed c
  ),
  wallet_from_items AS (
    SELECT
      b.candidate_id,
      COUNT(*)::int AS wallet_total,
      SUM(CASE WHEN b.bucket = 'pending_upload' THEN 1 ELSE 0 END)::int AS wallet_pending_upload,
      SUM(CASE WHEN b.bucket = 'expired' THEN 1 ELSE 0 END)::int AS wallet_expired,
      SUM(CASE WHEN b.bucket = 'approved' THEN 1 ELSE 0 END)::int AS wallet_approved,
      SUM(CASE WHEN b.bucket = 'pending_verification' THEN 1 ELSE 0 END)::int AS wallet_pending_verification,
      MIN(b.future_expiry) AS wallet_next,
      COUNT(*) FILTER (
        WHERE b.future_expiry IS NOT NULL
          AND b.future_expiry > NOW()
          AND b.future_expiry <= NOW() + INTERVAL '30 days'
      )::int AS wallet_expiring_soon
    FROM bucketed b
    GROUP BY b.candidate_id
  )
  SELECT
    cwo.candidate_id,
    COALESCE(w.wallet_total, 0) AS wallet_total,
    COALESCE(w.wallet_approved, 0) AS wallet_approved,
    COALESCE(w.wallet_pending_upload, 0) AS wallet_pending_upload,
    COALESCE(w.wallet_pending_verification, 0) AS wallet_pending_verification,
    COALESCE(w.wallet_expired, 0) AS wallet_expired,
    COALESCE(w.wallet_expiring_soon, 0) AS wallet_expiring_soon,
    w.wallet_next
  FROM candidates_with_org_occ cwo
  LEFT JOIN wallet_from_items w ON w.candidate_id = cwo.candidate_id
) w
WHERE cs."candidateId" = w.candidate_id;
