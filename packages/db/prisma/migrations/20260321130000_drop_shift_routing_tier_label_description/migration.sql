-- ShiftRoutingTier: display copy is app-layer only (CandidateWorkforceType maps in @repo/shared)

ALTER TABLE "shift_routing_tiers" DROP COLUMN IF EXISTS "label";
ALTER TABLE "shift_routing_tiers" DROP COLUMN IF EXISTS "description";
