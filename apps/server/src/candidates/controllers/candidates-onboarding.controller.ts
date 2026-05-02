import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Patch,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import {
	AllowAnonymous,
	Session,
	type UserSession,
} from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { OnboardingSelfStartDto } from "src/talent-community/dto/onboarding-self-start.dto";
import { TalentCommunityOnboardingService } from "src/talent-community/talent-community-onboarding.service";
import { MAX_RESUME_SIZE_BYTES } from "../constants";
import { CompleteMeInviteDto } from "../dto/complete-me-invite.dto";
import { OnboardingProgressMePatchDto } from "../dto/onboarding-progress-me-patch.dto";
import { CandidatesOnboardingService } from "../services/candidates-onboarding.service";

@ApiTags("candidates / onboarding")
@Controller("candidates")
@UseGuards(PermissionsGuard)
export class CandidatesOnboardingController {
	constructor(
		private readonly onboardingService: TalentCommunityOnboardingService,
		private readonly candidatesOnboardingService: CandidatesOnboardingService,
	) {}

	@Post("self/start")
	@AllowAnonymous()
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: "Start self onboarding (creates minimal candidate, ready for OTP)",
	})
	@ApiResponse({ status: 200, description: "Onboarding started" })
	@ApiResponse({ status: 400, description: "Invalid input or org not found" })
	async startSelfOnboarding(@Body() dto: OnboardingSelfStartDto) {
		return this.onboardingService.startSelfOnboarding(dto.organizationId, dto);
	}

	@Get("me/onboarding")
	@Permissions({ action: Action.Read, subject: "Candidate" })
	@ApiOperation({ summary: "Get current onboarding progress (session-based)" })
	@ApiResponse({ status: 200, description: "Onboarding progress data" })
	@ApiResponse({ status: 400, description: "Candidate profile not found" })
	async getMeOnboarding(@Session() session: UserSession) {
		return this.candidatesOnboardingService.getMeOnboarding(session.user.id);
	}

	@Patch("me/onboarding")
	@Permissions({ action: Action.Update, subject: "Candidate" })
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: "Save onboarding progress (session-based, partial)",
	})
	@ApiResponse({ status: 200, description: "Progress saved" })
	@ApiResponse({ status: 400, description: "Candidate profile not found" })
	async saveMeOnboarding(
		@Session() session: UserSession,
		@Body() dto: OnboardingProgressMePatchDto,
	) {
		return this.candidatesOnboardingService.saveMeOnboarding(
			session.user.id,
			dto,
		);
	}

	@Post("me/notifications/profile-banner/dismiss")
	@Permissions({ action: Action.Update, subject: "Candidate" })
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: "Dismiss the profile completion banner for the session candidate",
	})
	@ApiResponse({ status: 200, description: "Banner dismissed" })
	@ApiResponse({ status: 400, description: "Candidate profile not found" })
	async dismissProfileBanner(@Session() session: UserSession) {
		return this.candidatesOnboardingService.dismissProfileBanner(
			session.user.id,
		);
	}

	@Post("me/invite/complete")
	@Permissions({ action: Action.Update, subject: "Candidate" })
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: "Complete invite onboarding and mark accepted (session-based)",
	})
	@ApiResponse({ status: 200, description: "Invite accepted" })
	@ApiResponse({
		status: 403,
		description: "Invite not pending or not applicable",
	})
	async completeMeInvite(
		@Session() session: UserSession,
		@Body() dto: CompleteMeInviteDto,
	) {
		return this.candidatesOnboardingService.completeMeInvite(
			session.user.id,
			dto,
		);
	}

	@Patch("me/onboarding/professional/resume")
	@Permissions({ action: Action.Update, subject: "Candidate" })
	@HttpCode(HttpStatus.OK)
	@UseInterceptors(
		FileInterceptor("resume", { limits: { fileSize: MAX_RESUME_SIZE_BYTES } }),
	)
	@ApiOperation({ summary: "Upload professional resume (session-based)" })
	@ApiResponse({ status: 200, description: "Resume stored" })
	async uploadResume(
		@Session() session: UserSession,
		@UploadedFile() file: Express.Multer.File | undefined,
	) {
		if (!file) throw new BadRequestException("resume file is required");
		return this.candidatesOnboardingService.saveMeResume(session.user.id, file);
	}

	@Get("me/onboarding/professional/resume/signed-url")
	@Permissions({ action: Action.Read, subject: "Candidate" })
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: "Get signed URL for uploaded resume (session-based)",
	})
	@ApiResponse({ status: 200, description: "Signed URL for temporary access" })
	async getResumeSignedUrl(@Session() session: UserSession) {
		const signedUrl =
			await this.candidatesOnboardingService.getMeResumeSignedUrl(
				session.user.id,
			);
		return { signedUrl };
	}
}
