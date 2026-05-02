import { Module } from "@nestjs/common";
import { BackgroundJobsModule } from "src/background-jobs/background-jobs.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { SubmissionsController } from "./submissions.controller";
import { SubmissionsService } from "./submissions.service";

@Module({
	imports: [PrismaModule, BackgroundJobsModule],
	controllers: [SubmissionsController],
	providers: [SubmissionsService],
	exports: [SubmissionsService],
})
export class SubmissionsModule {}
