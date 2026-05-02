import { Module } from "@nestjs/common";
import { BackgroundJobsModule } from "src/background-jobs/background-jobs.module";
import { FilesModule } from "src/files/files.module";
import { PlacementsModule } from "src/placements/placements.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { TalentCommunityModule } from "src/talent-community/talent-community.module";
import { CandidatesDocumentWalletController } from "./controllers/candidates-document-wallet.controller";
import { CandidatesOnboardingController } from "./controllers/candidates-onboarding.controller";
import { VendorCandidatesController } from "./controllers/vendor-candidates.controller";
import { CandidatesDocumentWalletService } from "./services/candidates-document-wallet.service";
import { CandidatesOnboardingService } from "./services/candidates-onboarding.service";
import { VendorCandidatesService } from "./services/vendor-candidates.service";
import { VendorOnboardingService } from "./services/vendor-onboarding.service";

@Module({
	imports: [
		PrismaModule,
		FilesModule,
		TalentCommunityModule,
		PlacementsModule,
		BackgroundJobsModule,
	],
	controllers: [
		CandidatesOnboardingController,
		CandidatesDocumentWalletController,
		VendorCandidatesController,
	],
	providers: [
		CandidatesOnboardingService,
		CandidatesDocumentWalletService,
		VendorCandidatesService,
		VendorOnboardingService,
	],
})
export class CandidatesModule {}
