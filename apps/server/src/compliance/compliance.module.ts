import { Module } from "@nestjs/common";
import { FilesModule } from "../files/files.module";
import { ComplianceController } from "./compliance.controller";
import { ComplianceService } from "./compliance.service";

@Module({
	imports: [FilesModule],
	providers: [ComplianceService],
	controllers: [ComplianceController],
})
export class ComplianceModule {}
