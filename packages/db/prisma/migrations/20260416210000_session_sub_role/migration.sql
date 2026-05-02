-- Session: portal-specific sub-role for org / vendor / candidate (see Better Auth session.additionalFields)
ALTER TABLE "session" ADD COLUMN "subRole" TEXT;
