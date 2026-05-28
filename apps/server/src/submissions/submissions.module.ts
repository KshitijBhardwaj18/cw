import { Module } from "@nestjs/common";
import { AgingRulesModule } from "src/aging-rules/aging-rules.module";
import { BackgroundJobsModule } from "src/background-jobs/background-jobs.module";
import { FilesModule } from "src/files/files.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { SubmissionsController } from "./submissions.controller";
import { SubmissionsService } from "./submissions.service";

@Module({
	imports: [PrismaModule, BackgroundJobsModule, FilesModule, AgingRulesModule],
	controllers: [SubmissionsController],
	providers: [SubmissionsService],
	exports: [SubmissionsService],
})
export class SubmissionsModule {}
