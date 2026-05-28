import {
	BadRequestException,
	Body,
	Controller,
	Get,
	Headers,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { SKILLS_CHECKLIST_MAX_SIZE_BYTES } from "@repo/shared";
import {
	AllowAnonymous,
	Session,
	type UserSession,
} from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { resolveActiveOrganizationIdFromRequest } from "src/common/utils/resolve-active-organization-id";
import { PrismaService } from "src/prisma/prisma.service";
import { OnboardingSelfStartDto } from "src/talent-community/dto/onboarding-self-start.dto";
import { TalentCommunityOnboardingService } from "src/talent-community/talent-community-onboarding.service";
import { MAX_RESUME_SIZE_BYTES } from "../constants";
import { CompleteMeInviteDto } from "../dto/complete-me-invite.dto";
import { OnboardingProgressMePatchDto } from "../dto/onboarding-progress-me-patch.dto";
import { SaveOnboardingIdentityDto } from "../dto/save-onboarding-identity.dto";
import { SaveOnboardingQuestionnaireAnswersDto } from "../dto/save-onboarding-questionnaire-answers.dto";
import { SaveOnboardingReferencesDto } from "../dto/save-onboarding-references.dto";
import { CandidatesOnboardingService } from "../services/candidates-onboarding.service";

@ApiTags("candidates / onboarding")
@Controller("candidates")
@UseGuards(PermissionsGuard)
export class CandidatesOnboardingController {
	constructor(
		private readonly onboardingService: TalentCommunityOnboardingService,
		private readonly candidatesOnboardingService: CandidatesOnboardingService,
		private readonly prismaService: PrismaService,
	) {}

	@Post("self/start")
	@AllowAnonymous()
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: "Start self onboarding (creates minimal candidate, ready for OTP)",
	})
	@ApiResponse({ status: 200, description: "Onboarding started" })
	@ApiResponse({ status: 400, description: "Invalid input or org not found" })
	async startSelfOnboarding(
		@Body() dto: OnboardingSelfStartDto,
		@Headers() headers: Record<string, string | string[] | undefined>,
	) {
		const organizationId = await resolveActiveOrganizationIdFromRequest(
			this.prismaService,
			headers,
		);
		if (!organizationId) {
			throw new BadRequestException(
				"This hostname is not associated with any organization.",
			);
		}
		return this.onboardingService.startSelfOnboarding(organizationId, dto);
	}

	@Get("me/onboarding")
	@Permissions({ action: Action.Read, subject: "Candidate" })
	@ApiOperation({ summary: "Get current onboarding progress (session-based)" })
	@ApiResponse({ status: 200, description: "Onboarding progress data" })
	@ApiResponse({ status: 400, description: "Candidate profile not found" })
	async getMeOnboarding(@Session() session: UserSession) {
		return this.candidatesOnboardingService.getMeOnboarding(session.user.id);
	}

	@Get("me/org-occupations")
	@Permissions({ action: Action.Read, subject: "Candidate" })
	@ApiOperation({
		summary:
			"Org-enabled occupations for the session candidate's org — drives the occupation picker on candidate-facing screens. Specialties are fetched per-occupation via the route below.",
	})
	@ApiResponse({ status: 200, description: "Org-enabled occupations" })
	@ApiResponse({ status: 400, description: "Candidate profile not found" })
	async getMeOrgOccupations(@Session() session: UserSession) {
		return this.candidatesOnboardingService.getOrgEnabledOccupationsForMe(
			session.user.id,
		);
	}

	@Get("me/occupations/:occupationId/specialties")
	@Permissions({ action: Action.Read, subject: "Candidate" })
	@ApiOperation({
		summary:
			"Org-enabled specialties for one occupation, scoped to the session candidate's org. Empty list if the occupation isn't enabled in that org.",
	})
	@ApiResponse({ status: 200, description: "Org-enabled specialties" })
	@ApiResponse({ status: 400, description: "Candidate profile not found" })
	async getMeOccupationSpecialties(
		@Session() session: UserSession,
		@Param("occupationId", ParseUUIDPipe) occupationId: string,
	) {
		return this.candidatesOnboardingService.getOrgEnabledSpecialtiesForMeOccupation(
			session.user.id,
			occupationId,
		);
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

	@Get("me/onboarding/questionnaires")
	@Permissions({ action: Action.Read, subject: "Candidate" })
	@ApiOperation({
		summary:
			"Get questionnaire questions + saved answers for the candidate's occupation and specialties",
	})
	@ApiResponse({ status: 200, description: "Questionnaires returned" })
	@ApiResponse({ status: 400, description: "Candidate profile not found" })
	async getMeQuestionnaires(@Session() session: UserSession) {
		return this.candidatesOnboardingService.getMeQuestionnaires(
			session.user.id,
		);
	}

	@Patch("me/onboarding/questionnaires/answers")
	@Permissions({ action: Action.Update, subject: "Candidate" })
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: "Upsert questionnaire answers for the session candidate",
	})
	@ApiResponse({ status: 200, description: "Answers saved" })
	@ApiResponse({ status: 400, description: "Validation error" })
	async saveMeQuestionnaireAnswers(
		@Session() session: UserSession,
		@Body() dto: SaveOnboardingQuestionnaireAnswersDto,
	) {
		return this.candidatesOnboardingService.saveMeQuestionnaireAnswers(
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
		if (!file) throw new BadRequestException("Resume file is required.");
		return this.candidatesOnboardingService.saveMeResume(session.user.id, file);
	}

	@Patch("me/onboarding/identity")
	@Permissions({ action: Action.Update, subject: "Candidate" })
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Save identity (DOB + last 4 SSN)" })
	@ApiResponse({ status: 200, description: "Identity saved" })
	async saveMeIdentity(
		@Session() session: UserSession,
		@Body() dto: SaveOnboardingIdentityDto,
	) {
		return this.candidatesOnboardingService.saveMeIdentity(
			session.user.id,
			dto,
		);
	}

	@Patch("me/onboarding/references")
	@Permissions({ action: Action.Update, subject: "Candidate" })
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Replace professional references list" })
	@ApiResponse({ status: 200, description: "References saved" })
	async saveMeReferences(
		@Session() session: UserSession,
		@Body() dto: SaveOnboardingReferencesDto,
	) {
		return this.candidatesOnboardingService.saveMeReferences(
			session.user.id,
			dto,
		);
	}

	@Patch("me/onboarding/skills-checklist")
	@Permissions({ action: Action.Update, subject: "Candidate" })
	@HttpCode(HttpStatus.OK)
	@UseInterceptors(
		FileInterceptor("file", {
			limits: { fileSize: SKILLS_CHECKLIST_MAX_SIZE_BYTES },
		}),
	)
	@ApiOperation({ summary: "Upload skills checklist file" })
	@ApiResponse({ status: 200, description: "Skills checklist saved" })
	async uploadSkillsChecklist(
		@Session() session: UserSession,
		@UploadedFile() file: Express.Multer.File | undefined,
	) {
		if (!file) throw new BadRequestException("File is required.");
		return this.candidatesOnboardingService.saveMeSkillsChecklist(
			session.user.id,
			file,
		);
	}

	@Get("me/onboarding/skills-checklist/signed-url")
	@Permissions({ action: Action.Read, subject: "Candidate" })
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Signed URL for the skills checklist file" })
	async getSkillsChecklistSignedUrl(@Session() session: UserSession) {
		const signedUrl =
			await this.candidatesOnboardingService.getMeSkillsChecklistSignedUrl(
				session.user.id,
			);
		return { signedUrl };
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
