-- CandidateWorkforceType: internal float pool / volunteer, external 1099 / EOR

ALTER TYPE "CandidateWorkforceType" ADD VALUE 'INTERNAL_FLOAT_POOL';
ALTER TYPE "CandidateWorkforceType" ADD VALUE 'INTERNAL_VOLUNTEER';
ALTER TYPE "CandidateWorkforceType" ADD VALUE 'EXTERNAL_1099';
ALTER TYPE "CandidateWorkforceType" ADD VALUE 'EXTERNAL_EOR';
