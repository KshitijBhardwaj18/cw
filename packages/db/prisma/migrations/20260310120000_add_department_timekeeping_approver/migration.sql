-- CreateTable
CREATE TABLE "department_timekeeping_approver" (
    "id" UUID NOT NULL,
    "departmentId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_timekeeping_approver_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "department_timekeeping_approver_departmentId_userId_key" ON "department_timekeeping_approver"("departmentId", "userId");

-- CreateIndex
CREATE INDEX "department_timekeeping_approver_departmentId_idx" ON "department_timekeeping_approver"("departmentId");

-- CreateIndex
CREATE INDEX "department_timekeeping_approver_userId_idx" ON "department_timekeeping_approver"("userId");

-- AddForeignKey
ALTER TABLE "department_timekeeping_approver" ADD CONSTRAINT "department_timekeeping_approver_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_timekeeping_approver" ADD CONSTRAINT "department_timekeeping_approver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
