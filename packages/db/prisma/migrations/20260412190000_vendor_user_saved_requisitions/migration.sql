-- CreateTable
CREATE TABLE "vendor_user_saved_requisitions" (
    "id" UUID NOT NULL,
    "vendorUserId" UUID NOT NULL,
    "requisitionId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_user_saved_requisitions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vendor_user_saved_requisitions_vendorUserId_requisitionId_key" ON "vendor_user_saved_requisitions"("vendorUserId", "requisitionId");

-- CreateIndex
CREATE INDEX "vendor_user_saved_requisitions_vendorUserId_idx" ON "vendor_user_saved_requisitions"("vendorUserId");

-- CreateIndex
CREATE INDEX "vendor_user_saved_requisitions_requisitionId_idx" ON "vendor_user_saved_requisitions"("requisitionId");

-- AddForeignKey
ALTER TABLE "vendor_user_saved_requisitions" ADD CONSTRAINT "vendor_user_saved_requisitions_vendorUserId_fkey" FOREIGN KEY ("vendorUserId") REFERENCES "vendor_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_user_saved_requisitions" ADD CONSTRAINT "vendor_user_saved_requisitions_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES "requisition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
