import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Post,
	Query,
	Res,
	StreamableFile,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { Session, UserSession } from "@thallesp/nestjs-better-auth";
import type { Response } from "express";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import { AddWorkforceListMembersDto } from "./dto/add-workforce-list-members.dto";
import { BulkTagWorkforceListDto } from "./dto/bulk-tag-workforce-list.dto";
import { CreateWorkforceListDto } from "./dto/create-workforce-list.dto";
import { WorkforceListMembersQueryDto } from "./dto/workforce-list-members-query.dto";
import { WorkforceListsQueryDto } from "./dto/workforce-lists-query.dto";
import { WorkforceListsService } from "./workforce-lists.service";

@ApiTags("workforce-lists")
@Controller("org/workforce-lists")
@UseGuards(PermissionsGuard)
export class WorkforceListsController {
	constructor(private readonly workforceListsService: WorkforceListsService) {}

	@Get()
	@ApiOperation({ summary: "List workforce lists for an organization" })
	@ApiResponse({ status: 200, description: "Paginated workforce lists" })
	@Permissions({ action: Action.List, subject: "WorkforceLists" })
	async list(
		@Session() session: UserSession,
		@Query() query: WorkforceListsQueryDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.workforceListsService.list(orgId, query);
	}

	@Post()
	@ApiOperation({ summary: "Create a workforce list" })
	@ApiResponse({ status: 201, description: "Workforce list created" })
	@Permissions({ action: Action.Create, subject: "WorkforceLists" })
	async create(
		@Session() session: UserSession,
		@Body() dto: CreateWorkforceListDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.workforceListsService.create(orgId, dto, session.user.id);
	}

	@Get(":listId")
	@ApiOperation({ summary: "Get workforce list details" })
	@ApiResponse({ status: 200, description: "Workforce list details" })
	@Permissions({ action: Action.Read, subject: "WorkforceLists" })
	async get(
		@Session() session: UserSession,
		@Param("listId", ParseUUIDPipe) listId: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.workforceListsService.get(orgId, listId);
	}

	@Delete(":listId")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Delete a workforce list" })
	@ApiResponse({ status: 200, description: "Workforce list deleted" })
	@Permissions({ action: Action.Delete, subject: "WorkforceLists" })
	async remove(
		@Session() session: UserSession,
		@Param("listId", ParseUUIDPipe) listId: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.workforceListsService.remove(orgId, listId);
	}

	@Get(":listId/members")
	@ApiOperation({ summary: "List workforce list members" })
	@ApiResponse({ status: 200, description: "Paginated list members" })
	@Permissions({ action: Action.List, subject: "WorkforceLists" })
	async listMembers(
		@Session() session: UserSession,
		@Param("listId", ParseUUIDPipe) listId: string,
		@Query() query: WorkforceListMembersQueryDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.workforceListsService.listMembers(orgId, listId, query);
	}

	@Get(":listId/available-candidates")
	@ApiOperation({ summary: "List candidates eligible to be added to list" })
	@ApiResponse({ status: 200, description: "Paginated available candidates" })
	@Permissions({ action: Action.List, subject: "WorkforceLists" })
	async listAvailableCandidates(
		@Session() session: UserSession,
		@Param("listId", ParseUUIDPipe) listId: string,
		@Query() query: WorkforceListMembersQueryDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.workforceListsService.listAvailableCandidates(
			orgId,
			listId,
			query,
		);
	}

	@Post(":listId/members")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Add members to a workforce list" })
	@ApiResponse({ status: 200, description: "Members added to list" })
	@Permissions({ action: Action.Update, subject: "WorkforceLists" })
	async addMembers(
		@Session() session: UserSession,
		@Param("listId", ParseUUIDPipe) listId: string,
		@Body() dto: AddWorkforceListMembersDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.workforceListsService.addMembers(
			orgId,
			listId,
			dto,
			session.user.id,
		);
	}

	@Delete(":listId/members/:memberId")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Remove a member from a workforce list" })
	@ApiResponse({ status: 200, description: "Member removed" })
	@Permissions({ action: Action.Update, subject: "WorkforceLists" })
	async removeMember(
		@Session() session: UserSession,
		@Param("listId", ParseUUIDPipe) listId: string,
		@Param("memberId", ParseUUIDPipe) memberId: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.workforceListsService.removeMember(orgId, listId, memberId);
	}

	@Post(":listId/bulk-tag")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Bulk tag list members (server-side)" })
	@ApiResponse({ status: 200, description: "Bulk tag applied" })
	@Permissions({ action: Action.Update, subject: "WorkforceLists" })
	async bulkTag(
		@Session() session: UserSession,
		@Param("listId", ParseUUIDPipe) listId: string,
		@Body() dto: BulkTagWorkforceListDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.workforceListsService.bulkTag(
			orgId,
			listId,
			dto,
			session.user.id,
		);
	}

	@Get(":listId/members/export.csv")
	@ApiOperation({
		summary: "Export workforce list members as CSV (server-side)",
	})
	@ApiResponse({ status: 200, description: "CSV export" })
	@Permissions({ action: Action.Read, subject: "WorkforceLists" })
	async exportMembersCsv(
		@Session() session: UserSession,
		@Param("listId", ParseUUIDPipe) listId: string,
		@Query() query: WorkforceListMembersQueryDto,
		@Res({ passthrough: true }) res: Response,
	) {
		const orgId = requireActiveOrganizationId(session);
		const { filename, csv } = await this.workforceListsService.exportMembersCsv(
			orgId,
			listId,
			query,
		);

		res.setHeader("Content-Type", "text/csv; charset=utf-8");
		res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

		return new StreamableFile(Buffer.from(csv, "utf-8"));
	}
}
