-- Extend offer timeline for placement lifecycle (UI parity with org-web offer history).
ALTER TYPE "OfferEventType" ADD VALUE 'PLACEMENT_CREATED';
ALTER TYPE "OfferEventType" ADD VALUE 'START_DATE_ADJUSTED';
ALTER TYPE "OfferEventType" ADD VALUE 'ASSIGNMENT_STARTED';
ALTER TYPE "OfferEventType" ADD VALUE 'PLACEMENT_TERMINATED';
