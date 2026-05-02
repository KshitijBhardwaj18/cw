import { Module } from "@nestjs/common";
import { BackgroundJobsModule } from "src/background-jobs/background-jobs.module";
import { FilesModule } from "src/files/files.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { CandidateTimekeepingController } from "./controllers/candidate-timekeeping.controller";
import { OrganizationTimekeepingController } from "./controllers/organization-timekeeping.controller";
import { TimekeepingController } from "./controllers/timekeeping.controller";
import { TimekeepingService } from "./services/timekeeping.service";

@Module({
	imports: [PrismaModule, BackgroundJobsModule, FilesModule],
	controllers: [
		TimekeepingController,
		OrganizationTimekeepingController,
		CandidateTimekeepingController,
	],
	providers: [TimekeepingService],
})
export class TimekeepingModule {}
