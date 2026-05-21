import {
	Body,
	Controller,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import { CreateCandidateSubmissionDto } from "./dto/create-candidate-submission.dto";
import { QueryCandidateSubmissionsDto } from "./dto/query-candidate-submissions.dto";
import { QuerySubmissionsDto } from "./dto/query-submissions.dto";
import { QuerySubmissionsAgingStatsDto } from "./dto/query-submissions-aging-stats.dto";
import { UpdateSubmissionStageDto } from "./dto/update-submission-stage.dto";
import { WithdrawCandidateSubmissionDto } from "./dto/withdraw-candidate-submission.dto";
import { SubmissionsService } from "./submissions.service";

@ApiTags("Submissions")
@Controller("org/submissions")
@UseGuards(PermissionsGuard)
export class SubmissionsController {
	constructor(private readonly submissionsService: SubmissionsService) {}

	@Get("stats/stages")
	@ApiOperation({
		summary: "Per-stage submission counts for the organization (tab badges)",
	})
	@ApiResponse({ status: 404, description: "Organization not found" })
	@Permissions({ action: Action.Read, subject: "Submission" })
	stageStats(@Session() session: UserSession) {
		const orgId = requireActiveOrganizationId(session);
		return this.submissionsService.getOrgSubmissionStageCounts(orgId);
	}

	@Get("stats/by-requisition")
	@ApiOperation({
		summary:
			"Per-stage submission counts for a single requisition (job details tab badges)",
	})
	@ApiResponse({ status: 404, description: "Organization not found" })
	@Permissions({ action: Action.List, subject: "Submission" })
	requisitionStageCounts(
		@Session() session: UserSession,
		@Query("requisitionId", ParseUUIDPipe) requisitionId: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.submissionsService.getRequisitionStageCounts(
			orgId,
			requisitionId,
		);
	}

	@Get("stats/aging")
	@ApiOperation({
		summary:
			"Aging bucket counts (OVERDUE / NEAR / WITHIN) for current filters; SLA hours are per-stage on the server",
	})
	@ApiResponse({ status: 404, description: "Organization not found" })
	@Permissions({ action: Action.Read, subject: "Submission" })
	agingStats(
		@Session() session: UserSession,
		@Query() query: QuerySubmissionsAgingStatsDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.submissionsService.getOrgSubmissionAgingCounts(orgId, query);
	}

	@Post("me")
	@ApiOperation({ summary: "Apply for a job posting (candidate portal)" })
	@ApiResponse({ status: 409, description: "Already applied for this posting" })
	@ApiResponse({
		status: 404,
		description: "Job posting not found or no longer available",
	})
	@Permissions({ action: Action.Create, subject: "CandidateSubmission" })
	candidateApply(
		@Session() session: UserSession,
		@Body() dto: CreateCandidateSubmissionDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.submissionsService.createCandidateSubmission(
			session.user.id,
			orgId,
			dto,
		);
	}

	@Get("me/stats")
	@ApiOperation({
		summary: "Per-tab submission counts for the signed-in candidate (portal)",
	})
	@ApiResponse({ status: 404, description: "Organization not found" })
	@Permissions({ action: Action.Read, subject: "CandidateSubmission" })
	candidateSubmissionTabStats(@Session() session: UserSession) {
		const orgId = requireActiveOrganizationId(session);
		return this.submissionsService.getCandidateSubmissionTabCounts(
			session.user.id,
			orgId,
		);
	}

	@Get("me")
	@ApiOperation({
		summary: "Paginated submissions for the signed-in candidate (portal)",
	})
	@ApiResponse({
		status: 404,
		description: "Organization not found or candidate profile missing",
	})
	@Permissions({ action: Action.List, subject: "CandidateSubmission" })
	candidateSubmissionsList(
		@Session() session: UserSession,
		@Query() query: QueryCandidateSubmissionsDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.submissionsService.listCandidateSubmissionsPaginated(
			session.user.id,
			orgId,
			{
				page: query.page,
				limit: query.limit,
				tab: query.tab,
			},
		);
	}

	@Get("me/:submissionId")
	@ApiOperation({
		summary:
			"Submission detail for the signed-in candidate (scoped to own submission)",
	})
	@ApiResponse({
		status: 404,
		description: "Organization, candidate profile, or submission not found",
	})
	@Permissions({ action: Action.Read, subject: "CandidateSubmission" })
	candidateSubmissionDetail(
		@Session() session: UserSession,
		@Param("submissionId", ParseUUIDPipe) submissionId: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.submissionsService.getCandidateSubmissionDetail(
			session.user.id,
			orgId,
			submissionId,
		);
	}

	@Post("me/:submissionId/withdraw")
	@ApiOperation({ summary: "Withdraw own application (candidate portal)" })
	@ApiResponse({ status: 400, description: "Invalid state for withdrawal" })
	@Permissions({ action: Action.Update, subject: "CandidateSubmission" })
	candidateWithdrawSubmission(
		@Session() session: UserSession,
		@Param("submissionId", ParseUUIDPipe) submissionId: string,
		@Body() dto: WithdrawCandidateSubmissionDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.submissionsService.withdrawCandidateSubmission(
			session.user.id,
			orgId,
			submissionId,
			dto,
		);
	}

	@Post("me/:submissionId/accept-offer")
	@ApiOperation({ summary: "Accept an extended offer (candidate portal)" })
	@ApiResponse({ status: 400, description: "No open offer to accept" })
	@Permissions({ action: Action.Update, subject: "CandidateSubmission" })
	candidateAcceptOffer(
		@Session() session: UserSession,
		@Param("submissionId", ParseUUIDPipe) submissionId: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.submissionsService.acceptCandidateOffer(
			session.user.id,
			orgId,
			submissionId,
		);
	}

	@Get()
	@ApiOperation({
		summary: "List submissions (paginated; pass vendorId, departmentId, …)",
	})
	@ApiResponse({
		status: 200,
		description: "Paginated rows",
	})
	@ApiResponse({ status: 400, description: "Invalid query or list too large" })
	@ApiResponse({ status: 404, description: "Organization not found" })
	@Permissions({ action: Action.List, subject: "Submission" })
	list(@Session() session: UserSession, @Query() query: QuerySubmissionsDto) {
		const orgId = requireActiveOrganizationId(session);
		return this.submissionsService.listOrgSubmissionsPaginated(orgId, query);
	}

	@Get(":submissionId")
	@ApiOperation({ summary: "Get one submission in an organization" })
	@ApiResponse({ status: 200, description: "Submission detail for org UI" })
	@ApiResponse({
		status: 404,
		description: "Organization or submission not found",
	})
	@Permissions({ action: Action.Read, subject: "Submission" })
	getOne(
		@Session() session: UserSession,
		@Param("submissionId", ParseUUIDPipe) submissionId: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.submissionsService.getOrgSubmission(orgId, submissionId);
	}

	@Patch(":submissionId")
	@ApiOperation({ summary: "Update submission hiring stage" })
	@ApiResponse({
		status: 200,
		description: "Updated submission detail payload",
	})
	@ApiResponse({
		status: 404,
		description: "Organization or submission not found",
	})
	@Permissions({ action: Action.Update, subject: "Submission" })
	updateStage(
		@Session() session: UserSession,
		@Param("submissionId", ParseUUIDPipe) submissionId: string,
		@Body() dto: UpdateSubmissionStageDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.submissionsService.updateOrgSubmissionStage(
			orgId,
			submissionId,
			dto.stage,
			session.user.id,
			{
				startDate: dto.startDate,
				endDate: dto.endDate,
				billRate: dto.billRate,
			},
		);
	}
}
