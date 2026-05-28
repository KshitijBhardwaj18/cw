import { Module } from "@nestjs/common";
import { AgingRulesModule } from "src/aging-rules/aging-rules.module";
import { BackgroundJobsModule } from "src/background-jobs/background-jobs.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { RequisitionAttentionRulesModule } from "src/requisition-attention-rules/requisition-attention-rules.module";
import { CommandCenterController } from "./controllers/command-center.controller";
import { CommandCenterService } from "./services/command-center.service";

@Module({
	imports: [
		PrismaModule,
		BackgroundJobsModule,
		RequisitionAttentionRulesModule,
		AgingRulesModule,
	],
	controllers: [CommandCenterController],
	providers: [CommandCenterService],
})
export class CommandCenterModule {}
