import { Module } from "@nestjs/common";
import { BackgroundJobsModule } from "src/background-jobs/background-jobs.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { GrievancesController } from "./grievances.controller";
import { GrievancesService } from "./grievances.service";

@Module({
	imports: [PrismaModule, BackgroundJobsModule],
	controllers: [GrievancesController],
	providers: [GrievancesService],
	exports: [GrievancesService],
})
export class GrievancesModule {}
