import { Module } from "@nestjs/common";
import { ComplianceWalletTemplateModule } from "src/compliance-wallet-template/compliance-wallet-template.module";
import { OccupationsController } from "./controllers/occupations.controller";
import { OrgOccupationsController } from "./controllers/org-occupations.controller";
import { OccupationsService } from "./services/occupations.service";

@Module({
	imports: [ComplianceWalletTemplateModule],
	controllers: [OccupationsController, OrgOccupationsController],
	providers: [OccupationsService],
	exports: [OccupationsService],
})
export class OccupationsModule {}
