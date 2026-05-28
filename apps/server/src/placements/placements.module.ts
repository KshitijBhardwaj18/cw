import { Module } from "@nestjs/common";
import { BackgroundJobsModule } from "src/background-jobs/background-jobs.module";
import { CandidateComplianceWriteModule } from "src/common/services/candidate-compliance-write.module";
import { FilesModule } from "src/files/files.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { CandidatePlacementsController } from "./controllers/candidate-placements.controller";
import { PlacementComplianceController } from "./controllers/placement-compliance.controller";
import { PlacementsController } from "./controllers/placements.controller";
import { VendorPlacementComplianceController } from "./controllers/vendor-placement-compliance.controller";
import { CandidatePlacementsService } from "./services/candidate-placements.service";
import { PlacementComplianceService } from "./services/placement-compliance.service";
import { PlacementsService } from "./services/placements.service";

@Module({
	imports: [
		PrismaModule,
		FilesModule,
		BackgroundJobsModule,
		CandidateComplianceWriteModule,
	],
	controllers: [
		PlacementComplianceController,
		PlacementsController,
		CandidatePlacementsController,
		VendorPlacementComplianceController,
	],
	providers: [
		PlacementComplianceService,
		PlacementsService,
		CandidatePlacementsService,
	],
	exports: [PlacementsService, PlacementComplianceService],
})
export class PlacementsModule {}
