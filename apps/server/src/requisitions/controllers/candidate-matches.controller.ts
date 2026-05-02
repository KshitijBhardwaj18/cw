import {
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
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
import { QueryCandidateMatchesDto } from "../dto/query-candidate-matches.dto";
import { RequisitionMatchesService } from "../services/requisition-matches.service";

@ApiTags("Candidate Portal / Matches")
@Controller("candidates")
@UseGuards(PermissionsGuard)
export class CandidateMatchesController {
	constructor(private readonly service: RequisitionMatchesService) {}

	@Get("me/matches")
	@Permissions({ action: Action.List, subject: "Requisition" })
	@ApiOperation({ summary: "Paginated job matches for the candidate" })
	@ApiResponse({ status: 200, description: "Paginated match list" })
	@ApiResponse({ status: 404, description: "Candidate profile not found" })
	list(
		@Session() session: UserSession,
		@Query() query: QueryCandidateMatchesDto,
	) {
		const organizationId = requireActiveOrganizationId(session);
		return this.service.listCandidateMatches(
			session.user.id,
			organizationId,
			query,
		);
	}

	@Get("me/matches/:requisitionId")
	@Permissions({ action: Action.Read, subject: "Requisition" })
	@ApiOperation({ summary: "Single job match detail" })
	@ApiResponse({ status: 200, description: "Job match detail" })
	@ApiResponse({ status: 404, description: "Job not found" })
	detail(
		@Session() session: UserSession,
		@Param("requisitionId", ParseUUIDPipe) requisitionId: string,
	) {
		const organizationId = requireActiveOrganizationId(session);
		return this.service.getCandidateMatchDetail(
			session.user.id,
			organizationId,
			requisitionId,
		);
	}

	@Post("me/matches/:requisitionId/save")
	@HttpCode(HttpStatus.OK)
	@Permissions({ action: Action.Create, subject: "CandidateSavedRequisition" })
	@ApiOperation({ summary: "Save a job to the candidate's saved list" })
	@ApiResponse({ status: 200, description: "Job saved" })
	@ApiResponse({ status: 409, description: "Already saved" })
	save(
		@Session() session: UserSession,
		@Param("requisitionId", ParseUUIDPipe) requisitionId: string,
	) {
		const organizationId = requireActiveOrganizationId(session);
		return this.service.saveRequisition(
			session.user.id,
			organizationId,
			requisitionId,
		);
	}

	@Delete("me/matches/:requisitionId/save")
	@HttpCode(HttpStatus.OK)
	@Permissions({ action: Action.Delete, subject: "CandidateSavedRequisition" })
	@ApiOperation({ summary: "Remove a job from the candidate's saved list" })
	@ApiResponse({ status: 200, description: "Job unsaved" })
	unsave(
		@Session() session: UserSession,
		@Param("requisitionId", ParseUUIDPipe) requisitionId: string,
	) {
		const organizationId = requireActiveOrganizationId(session);
		return this.service.unsaveRequisition(
			session.user.id,
			organizationId,
			requisitionId,
		);
	}
}
