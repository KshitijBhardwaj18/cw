-- Vendor role for portal users lives on `user.subRole`; session copy was redundant.
ALTER TABLE "session" DROP COLUMN IF EXISTS "vendorUserRole";
