-- Move subRole from session to user (Better Auth additional user field)

ALTER TABLE "user" ADD COLUMN "subRole" TEXT;

UPDATE "user" u
SET "subRole" = s."subRole"
FROM (
  SELECT DISTINCT ON ("userId") "userId", "subRole"
  FROM "session"
  WHERE "subRole" IS NOT NULL
  ORDER BY "userId", "createdAt" DESC
) s
WHERE u.id = s."userId";

ALTER TABLE "session" DROP COLUMN "subRole";
