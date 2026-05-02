import { Module } from "@nestjs/common";
import { BackgroundJobsModule } from "src/background-jobs/background-jobs.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { TalentCommunityController } from "./talent-community.controller";
import { TalentCommunityService } from "./talent-community.service";
import { TalentCommunityOnboardingService } from "./talent-community-onboarding.service";

@Module({
	imports: [PrismaModule, BackgroundJobsModule],
	controllers: [TalentCommunityController],
	providers: [TalentCommunityService, TalentCommunityOnboardingService],
	exports: [TalentCommunityOnboardingService, TalentCommunityService],
})
export class TalentCommunityModule {}
