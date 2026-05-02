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
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import { CreateGrievanceDto } from "./dto/create-grievance.dto";
import { CreateGrievanceTaskDto } from "./dto/create-grievance-task.dto";
import { QueryGrievancesDto } from "./dto/query-grievances.dto";
import { UpdateGrievanceDto } from "./dto/update-grievance.dto";
import { UpdateGrievanceTaskDto } from "./dto/update-grievance-task.dto";
import { GrievancesService } from "./grievances.service";

@ApiTags("Grievances")
@Controller("org/grievances")
@UseGuards(PermissionsGuard)
export class GrievancesController {
	constructor(private readonly grievancesService: GrievancesService) {}

	@Get("log-options")
	@ApiOperation({ summary: "Workers and placements for log grievance form" })
	@Permissions({ action: Action.List, subject: "Grievance" })
	getLogOptions(@Session() session: UserSession) {
		const orgId = requireActiveOrganizationId(session);
		return this.grievancesService.getLogOptions(orgId);
	}

	@Get("counts")
	@ApiOperation({ summary: "Summary counts by status" })
	@Permissions({ action: Action.Read, subject: "Grievance" })
	getCounts(@Session() session: UserSession) {
		const orgId = requireActiveOrganizationId(session);
		return this.grievancesService.getCounts(orgId);
	}

	@Get()
	@ApiOperation({ summary: "List grievances for organization" })
	@Permissions({ action: Action.List, subject: "Grievance" })
	list(@Session() session: UserSession, @Query() query: QueryGrievancesDto) {
		const orgId = requireActiveOrganizationId(session);
		return this.grievancesService.list(orgId, query);
	}

	@Post()
	@ApiOperation({ summary: "Create grievance" })
	@Permissions({ action: Action.Create, subject: "Grievance" })
	create(@Session() session: UserSession, @Body() dto: CreateGrievanceDto) {
		const orgId = requireActiveOrganizationId(session);
		return this.grievancesService.create(orgId, dto, session.user.id);
	}

	@Get(":grievanceId")
	@ApiOperation({ summary: "Grievance detail" })
	@Permissions({ action: Action.Read, subject: "Grievance" })
	getById(
		@Session() session: UserSession,
		@Param("grievanceId", ParseUUIDPipe) grievanceId: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.grievancesService.getById(orgId, grievanceId);
	}

	@Patch(":grievanceId")
	@ApiOperation({ summary: "Update grievance (e.g. status)" })
	@Permissions({ action: Action.Update, subject: "Grievance" })
	update(
		@Session() session: UserSession,
		@Param("grievanceId", ParseUUIDPipe) grievanceId: string,
		@Body() dto: UpdateGrievanceDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.grievancesService.update(orgId, grievanceId, dto);
	}

	@Post(":grievanceId/tasks")
	@ApiOperation({ summary: "Add task to grievance" })
	@Permissions({ action: Action.Update, subject: "Grievance" })
	createTask(
		@Session() session: UserSession,
		@Param("grievanceId", ParseUUIDPipe) grievanceId: string,
		@Body() dto: CreateGrievanceTaskDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.grievancesService.createTask(
			orgId,
			grievanceId,
			dto,
			session.user.id,
		);
	}

	@Patch(":grievanceId/tasks/:taskId")
	@ApiOperation({ summary: "Update grievance task status" })
	@Permissions({ action: Action.Update, subject: "Grievance" })
	updateTask(
		@Session() session: UserSession,
		@Param("grievanceId", ParseUUIDPipe) grievanceId: string,
		@Param("taskId", ParseUUIDPipe) taskId: string,
		@Body() dto: UpdateGrievanceTaskDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.grievancesService.updateTask(orgId, grievanceId, taskId, dto);
	}
}
