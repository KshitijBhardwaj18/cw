import {
	Body,
	Controller,
	Delete,
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
import { AddProjectRequisitionsDto } from "./dto/add-project-requisitions.dto";
import { CreateProjectDto } from "./dto/create-project.dto";
import { QueryProjectRequisitionsDto } from "./dto/query-project-requisitions.dto";
import { QueryProjectsDto } from "./dto/query-projects.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { ProjectsService } from "./projects.service";

@ApiTags("Projects")
@Controller("org/projects")
@UseGuards(PermissionsGuard)
export class ProjectsController {
	constructor(private readonly service: ProjectsService) {}

	@Get()
	@ApiOperation({ summary: "List projects for an organization" })
	@ApiResponse({ status: 200, description: "Paginated projects" })
	@Permissions({ action: Action.List, subject: "Project" })
	list(@Session() session: UserSession, @Query() query: QueryProjectsDto) {
		const orgId = requireActiveOrganizationId(session);
		return this.service.list(orgId, query);
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: "Create a project" })
	@ApiResponse({ status: 201, description: "Project created" })
	@Permissions({ action: Action.Create, subject: "Project" })
	create(@Session() session: UserSession, @Body() dto: CreateProjectDto) {
		const orgId = requireActiveOrganizationId(session);
		return this.service.create(orgId, dto, session.user.id);
	}

	@Get(":projectId/stats")
	@ApiOperation({
		summary: "Project metrics for dashboard cards",
		description:
			"Aggregates only: requisition count, sum of open positions, and active (non-draft, non-filled) requisition count.",
	})
	@Permissions({ action: Action.Read, subject: "Project" })
	getStats(
		@Session() session: UserSession,
		@Param("projectId", ParseUUIDPipe) projectId: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.service.getStats(orgId, projectId);
	}

	@Get(":projectId/requisitions")
	@ApiOperation({
		summary: "Paginated requisitions on this project",
		description:
			"DB-level search and status filter. Display status maps to Prisma: Closed=Filled, On Hold=Draft, Open=other statuses.",
	})
	@Permissions({ action: Action.List, subject: "Project" })
	listRequisitions(
		@Session() session: UserSession,
		@Param("projectId", ParseUUIDPipe) projectId: string,
		@Query() query: QueryProjectRequisitionsDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.service.listRequisitions(orgId, projectId, query);
	}

	@Get(":projectId")
	@ApiOperation({
		summary: "Get project (header fields only)",
	})
	@Permissions({ action: Action.Read, subject: "Project" })
	findOne(
		@Session() session: UserSession,
		@Param("projectId", ParseUUIDPipe) projectId: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.service.findMeta(orgId, projectId);
	}

	@Patch(":projectId")
	@ApiOperation({ summary: "Update a project" })
	@Permissions({ action: Action.Update, subject: "Project" })
	update(
		@Session() session: UserSession,
		@Param("projectId", ParseUUIDPipe) projectId: string,
		@Body() dto: UpdateProjectDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.service.update(orgId, projectId, dto, session.user.id);
	}

	@Delete(":projectId")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Delete a project (requisitions are unassigned)" })
	@ApiResponse({ status: 204, description: "Project deleted" })
	@Permissions({ action: Action.Delete, subject: "Project" })
	async remove(
		@Session() session: UserSession,
		@Param("projectId", ParseUUIDPipe) projectId: string,
	): Promise<void> {
		const orgId = requireActiveOrganizationId(session);
		await this.service.remove(orgId, projectId);
	}

	@Post(":projectId/requisitions")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Assign requisitions to this project" })
	@ApiResponse({ status: 204, description: "Requisitions linked" })
	@Permissions({ action: Action.Update, subject: "Project" })
	async addRequisitions(
		@Session() session: UserSession,
		@Param("projectId", ParseUUIDPipe) projectId: string,
		@Body() dto: AddProjectRequisitionsDto,
	): Promise<void> {
		const orgId = requireActiveOrganizationId(session);
		await this.service.addRequisitions(orgId, projectId, dto);
	}

	@Delete(":projectId/requisitions/:requisitionId")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Remove a requisition from this project" })
	@ApiResponse({ status: 204, description: "Requisition unlinked" })
	@Permissions({ action: Action.Update, subject: "Project" })
	async removeRequisition(
		@Session() session: UserSession,
		@Param("projectId", ParseUUIDPipe) projectId: string,
		@Param("requisitionId", ParseUUIDPipe) requisitionId: string,
	): Promise<void> {
		const orgId = requireActiveOrganizationId(session);
		await this.service.removeRequisition(orgId, projectId, requisitionId);
	}
}
