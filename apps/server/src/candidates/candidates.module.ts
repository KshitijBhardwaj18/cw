import { Module } from "@nestjs/common";
import { BackgroundJobsModule } from "src/background-jobs/background-jobs.module";
import { CandidateComplianceWriteModule } from "src/common/services/candidate-compliance-write.module";
import { FilesModule } from "src/files/files.module";
import { OccupationsModule } from "src/occupations/occupations.module";
import { PlacementsModule } from "src/placements/placements.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { TalentCommunityModule } from "src/talent-community/talent-community.module";
import { CandidatesAccountController } from "./controllers/candidates-account.controller";
import { CandidatesDocumentWalletController } from "./controllers/candidates-document-wallet.controller";
import { CandidatesOnboardingController } from "./controllers/candidates-onboarding.controller";
import { CandidatesSupportController } from "./controllers/candidates-support.controller";
import { VendorCandidatesController } from "./controllers/vendor-candidates.controller";
import { CandidatesAccountService } from "./services/candidates-account.service";
import { CandidatesDocumentWalletService } from "./services/candidates-document-wallet.service";
import { CandidatesOnboardingService } from "./services/candidates-onboarding.service";
import { CandidatesSupportService } from "./services/candidates-support.service";
import { VendorCandidatesService } from "./services/vendor-candidates.service";
import { VendorOnboardingService } from "./services/vendor-onboarding.service";

@Module({
	imports: [
		PrismaModule,
		FilesModule,
		TalentCommunityModule,
		PlacementsModule,
		BackgroundJobsModule,
		CandidateComplianceWriteModule,
		OccupationsModule,
	],
	controllers: [
		CandidatesAccountController,
		CandidatesOnboardingController,
		CandidatesDocumentWalletController,
		CandidatesSupportController,
		VendorCandidatesController,
	],
	providers: [
		CandidatesAccountService,
		CandidatesOnboardingService,
		CandidatesDocumentWalletService,
		CandidatesSupportService,
		VendorCandidatesService,
		VendorOnboardingService,
	],
	exports: [VendorCandidatesService],
})
export class CandidatesModule {}
