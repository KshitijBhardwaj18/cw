import { Module } from "@nestjs/common";
import { BackgroundJobsModule } from "src/background-jobs/background-jobs.module";
import { FilesModule } from "src/files/files.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { CandidatePlacementsController } from "./controllers/candidate-placements.controller";
import { PlacementComplianceController } from "./controllers/placement-compliance.controller";
import { PlacementsController } from "./controllers/placements.controller";
import { CandidatePlacementsService } from "./services/candidate-placements.service";
import { PlacementComplianceService } from "./services/placement-compliance.service";
import { PlacementsService } from "./services/placements.service";

@Module({
	imports: [PrismaModule, FilesModule, BackgroundJobsModule],
	controllers: [
		PlacementComplianceController,
		PlacementsController,
		CandidatePlacementsController,
	],
	providers: [
		PlacementComplianceService,
		PlacementsService,
		CandidatePlacementsService,
	],
	exports: [PlacementsService, PlacementComplianceService],
})
export class PlacementsModule {}
