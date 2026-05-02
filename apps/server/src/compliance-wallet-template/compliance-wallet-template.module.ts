import { Module } from "@nestjs/common";
import { ComplianceWalletTemplateController } from "./compliance-wallet-template.controller";
import { ComplianceWalletTemplateService } from "./compliance-wallet-template.service";

@Module({
	controllers: [ComplianceWalletTemplateController],
	providers: [ComplianceWalletTemplateService],
	exports: [ComplianceWalletTemplateService],
})
export class ComplianceWalletTemplateModule {}
