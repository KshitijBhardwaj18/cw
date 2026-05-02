import { Module } from "@nestjs/common";
import { MatchingLogicController } from "./matchinglogic.controller";
import { MatchingLogicService } from "./matchinglogic.service";

@Module({
	controllers: [MatchingLogicController],
	providers: [MatchingLogicService],
	exports: [MatchingLogicService],
})
export class MatchingLogicModule {}
