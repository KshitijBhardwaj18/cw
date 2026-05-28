import { forwardRef, Module } from "@nestjs/common";
import { BackgroundJobsModule } from "src/background-jobs/background-jobs.module";
import { CandidatesModule } from "src/candidates/candidates.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { SubmissionsModule } from "src/submissions/submissions.module";
import { CandidateMatchesController } from "./controllers/candidate-matches.controller";
import { RequisitionsController } from "./controllers/requisitions.controller";
import { VendorRequisitionsController } from "./controllers/vendor-requisitions.controller";
import { RequisitionMatchesService } from "./services/requisition-matches.service";
import { RequisitionsService } from "./services/requisitions.service";
import { VendorRequisitionsService } from "./services/vendor-requisitions.service";

@Module({
	imports: [
		PrismaModule,
		BackgroundJobsModule,
		SubmissionsModule,
		forwardRef(() => CandidatesModule),
	],
	controllers: [
		RequisitionsController,
		CandidateMatchesController,
		VendorRequisitionsController,
	],
	providers: [
		RequisitionsService,
		RequisitionMatchesService,
		VendorRequisitionsService,
	],
	exports: [RequisitionsService, RequisitionMatchesService],
})
export class RequisitionsModule {}
