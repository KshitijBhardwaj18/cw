-- CreateEnum
CREATE TYPE "MemberInviteStatus" AS ENUM ('NOT_SENT', 'PENDING', 'SCHEDULED', 'SENT', 'FAILED');

-- AlterTable
ALTER TABLE "member"
  ADD COLUMN "last_invite_status"       "MemberInviteStatus" NOT NULL DEFAULT 'NOT_SENT',
  ADD COLUMN "last_invite_at"           TIMESTAMP(3),
  ADD COLUMN "last_invite_scheduled_for" TIMESTAMP(3),
  ADD COLUMN "last_invite_job_id"       UUID;
