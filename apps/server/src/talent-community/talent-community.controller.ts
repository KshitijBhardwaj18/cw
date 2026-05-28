import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { Session, UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import { CandidateActivityQueryDto } from "./dto/candidate-activity-query.dto";
import { InviteCandidateDto } from "./dto/invite-candidate.dto";
import { TalentCommunityQueryDto } from "./dto/talent-community-query.dto";
import { UpdateCandidateWorkforceTypeDto } from "./dto/update-candidate-workforce-type.dto";
import { TalentCommunityService } from "./talent-community.service";

@ApiTags("talent-community")
@Controller("org/talent-community")
@UseGuards(PermissionsGuard)
export class TalentCommunityController {
	constructor(
		private readonly talentCommunityService: TalentCommunityService,
	) {}

	@Get()
	@ApiOperation({ summary: "List talent community candidates" })
	@ApiResponse({ status: 200, description: "Paginated talent community list" })
	@Permissions({ action: Action.List, subject: "TalentCommunity" })
	async getTalentCommunity(
		@Session() session: UserSession,
		@Query() query: TalentCommunityQueryDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.talentCommunityService.findAll(orgId, query);
	}

	@Get("candidates/:candidateId")
	@ApiOperation({ summary: "Get a candidate profile in org talent community" })
	@ApiResponse({ status: 200, description: "Candidate profile details" })
	@Permissions({ action: Action.Read, subject: "TalentCommunity" })
	async getCandidateProfile(
		@Session() session: UserSession,
		@Param("candidateId", ParseUUIDPipe) candidateId: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.talentCommunityService.getCandidateProfile(orgId, candidateId);
	}

	@Get("candidates/:candidateId/activity")
	@ApiOperation({ summary: "List candidate activity events for org timeline" })
	@ApiResponse({ status: 200, description: "Candidate activity events" })
	@Permissions({ action: Action.List, subject: "TalentCommunity" })
	async getCandidateActivity(
		@Session() session: UserSession,
		@Param("candidateId", ParseUUIDPipe) candidateId: string,
		@Query() query: CandidateActivityQueryDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.talentCommunityService.getCandidateActivity(
			orgId,
			candidateId,
			query,
		);
	}

	@Patch("candidates/:candidateId/workforce-type")
	@ApiOperation({ summary: "Assign or update candidate workforce type" })
	@ApiResponse({ status: 200, description: "Candidate workforce type updated" })
	@Permissions({ action: Action.Update, subject: "TalentCommunity" })
	async updateCandidateWorkforceType(
		@Session() session: UserSession,
		@Param("candidateId", ParseUUIDPipe) candidateId: string,
		@Body() dto: UpdateCandidateWorkforceTypeDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.talentCommunityService.updateCandidateWorkforceType(
			orgId,
			candidateId,
			dto,
			session.user.id,
		);
	}

	@Post("invite")
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: "Invite a new candidate to the talent community" })
	@ApiResponse({ status: 201, description: "Candidate invited successfully" })
	@ApiResponse({ status: 409, description: "Candidate already exists" })
	@Permissions({ action: Action.Create, subject: "TalentCommunity" })
	async inviteCandidate(
		@Session() session: UserSession,
		@Body() dto: InviteCandidateDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.talentCommunityService.inviteCandidate(
			orgId,
			dto,
			session.user.id,
		);
	}
}
