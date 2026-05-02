import { Module } from "@nestjs/common";
import { BackgroundJobsModule } from "src/background-jobs/background-jobs.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { CommandCenterController } from "./controllers/command-center.controller";
import { CommandCenterService } from "./services/command-center.service";

@Module({
	imports: [PrismaModule, BackgroundJobsModule],
	controllers: [CommandCenterController],
	providers: [CommandCenterService],
})
export class CommandCenterModule {}
