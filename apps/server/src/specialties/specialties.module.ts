import { Module } from "@nestjs/common";
import { ComplianceWalletTemplateModule } from "src/compliance-wallet-template/compliance-wallet-template.module";
import { SpecialtiesController } from "./controllers/specialties.controller";
import { SpecialtiesService } from "./services/specialties.service";

@Module({
	imports: [ComplianceWalletTemplateModule],
	controllers: [SpecialtiesController],
	providers: [SpecialtiesService],
	exports: [SpecialtiesService],
})
export class SpecialtiesModule {}
