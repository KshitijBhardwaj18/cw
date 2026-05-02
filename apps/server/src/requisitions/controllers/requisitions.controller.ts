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
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import { CreateRequisitionDto } from "../dto/create-requisition.dto";
import { QueryRequisitionApprovalsDto } from "../dto/query-requisition-approvals.dto";
import { QueryRequisitionsDto } from "../dto/query-requisitions.dto";
import { RequisitionApprovalActionDto } from "../dto/requisition-approval-action.dto";
import { UpdateRequisitionDto } from "../dto/update-requisition.dto";
import { RequisitionsService } from "../services/requisitions.service";

@ApiTags("Requisitions")
@Controller("org/requisitions")
@UseGuards(PermissionsGuard)
export class RequisitionsController {
	constructor(private readonly service: RequisitionsService) {}

	@Get()
	@ApiOperation({ summary: "List job requisitions for an organization" })
	@ApiResponse({ status: 200, description: "Paginated requisitions" })
	@Permissions({ action: Action.List, subject: "Requisition" })
	list(@Session() session: UserSession, @Query() query: QueryRequisitionsDto) {
		const orgId = requireActiveOrganizationId(session);
		return this.service.list(orgId, query);
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: "Create a job requisition" })
	@ApiResponse({ status: 201, description: "Requisition created" })
	@Permissions({ action: Action.Create, subject: "Requisition" })
	create(@Session() session: UserSession, @Body() dto: CreateRequisitionDto) {
		const orgId = requireActiveOrganizationId(session);
		return this.service.create(orgId, dto, session.user.id);
	}

	@Get("approvals/pending")
	@ApiOperation({
		summary: "List pending requisitions waiting for my approval",
	})
	@Permissions({ action: Action.List, subject: "RequisitionApprovals" })
	listPendingApprovals(
		@Session() session: UserSession,
		@Query() query: QueryRequisitionApprovalsDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.service.listPendingApprovals(orgId, session.user.id, query);
	}

	@Post(":id/approve")
	@ApiOperation({ summary: "Approve a pending requisition" })
	@Permissions({ action: Action.Update, subject: "RequisitionApprovals" })
	approve(
		@Session() session: UserSession,
		@Param("id", ParseUUIDPipe) id: string,
		@Body() dto: RequisitionApprovalActionDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.service.approve(orgId, id, session.user.id, dto.notes);
	}

	@Post(":id/reject")
	@ApiOperation({ summary: "Reject a pending requisition" })
	@Permissions({ action: Action.Update, subject: "RequisitionApprovals" })
	reject(
		@Session() session: UserSession,
		@Param("id", ParseUUIDPipe) id: string,
		@Body() dto: RequisitionApprovalActionDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.service.reject(orgId, id, session.user.id, dto.notes);
	}

	@Get(":id")
	@ApiOperation({ summary: "Get requisition for edit / review" })
	@Permissions({ action: Action.Read, subject: "Requisition" })
	findOne(
		@Session() session: UserSession,
		@Param("id", ParseUUIDPipe) id: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.service.findOne(orgId, id);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update a job requisition" })
	@Permissions({ action: Action.Update, subject: "Requisition" })
	update(
		@Session() session: UserSession,
		@Param("id", ParseUUIDPipe) id: string,
		@Body() dto: UpdateRequisitionDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.service.update(orgId, id, dto, session.user.id);
	}

	@Post(":id/cancel")
	@ApiOperation({ summary: "Cancel a requisition" })
	@Permissions({ action: Action.Update, subject: "Requisition" })
	cancel(
		@Session() session: UserSession,
		@Param("id", ParseUUIDPipe) id: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.service.cancel(orgId, id, session.user.id);
	}
}
