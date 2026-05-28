import { Module } from "@nestjs/common";
import { AgingRulesController } from "./controllers/aging-rules.controller";
import { AgingRulesService } from "./services/aging-rules.service";

@Module({
	controllers: [AgingRulesController],
	providers: [AgingRulesService],
	exports: [AgingRulesService],
})
export class AgingRulesModule {}
