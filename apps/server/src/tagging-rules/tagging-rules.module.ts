import { Module } from "@nestjs/common";
import { TaggingRulesController } from "./tagging-rules.controller";
import { TaggingRulesService } from "./tagging-rules.service";

@Module({
	controllers: [TaggingRulesController],
	providers: [TaggingRulesService],
	exports: [TaggingRulesService],
})
export class TaggingRulesModule {}
