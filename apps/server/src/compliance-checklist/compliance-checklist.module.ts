import { Module } from "@nestjs/common";
import { ComplianceChecklistController } from "./compliance-checklist.controller";
import { ComplianceChecklistService } from "./compliance-checklist.service";

@Module({
	providers: [ComplianceChecklistService],
	controllers: [ComplianceChecklistController],
	exports: [ComplianceChecklistService],
})
export class ComplianceChecklistModule {}
