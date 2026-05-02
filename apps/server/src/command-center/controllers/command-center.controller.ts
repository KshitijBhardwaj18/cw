import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import { QueryCommandCenterActiveWorkforceDto } from "../dto/query-command-center-active-workforce.dto";
import { QueryCommandCenterHiringFunnelDto } from "../dto/query-command-center-hiring-funnel.dto";
import { QueryCommandCenterOperationsDto } from "../dto/query-command-center-operations.dto";
import { QueryCommandCenterPerformanceDto } from "../dto/query-command-center-performance.dto";
import { QueueCommandCenterReminderDto } from "../dto/queue-command-center-reminder.dto";
import { CommandCenterService } from "../services/command-center.service";

@ApiTags("Command Center")
@Controller("org/command-center")
@UseGuards(PermissionsGuard)
export class CommandCenterController {
	constructor(private readonly commandCenterService: CommandCenterService) {}

	@Get("operations")
	@ApiOperation({ summary: "Operations management stats and issue rows" })
	@ApiResponse({ status: 200, description: "Operations tab data" })
	@Permissions({ action: Action.List, subject: "CommandCenter" })
	getOperations(
		@Session() session: UserSession,
		@Query() query: QueryCommandCenterOperationsDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.commandCenterService.getOperations(orgId, query);
	}

	@Get("performance")
	@ApiOperation({ summary: "Performance summary and KPI cards" })
	@ApiResponse({ status: 200, description: "Performance tab data" })
	@Permissions({ action: Action.List, subject: "CommandCenter" })
	getPerformance(
		@Session() session: UserSession,
		@Query() query: QueryCommandCenterPerformanceDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.commandCenterService.getPerformance(orgId, query);
	}

	@Get("active-workforce")
	@ApiOperation({ summary: "Active workforce counts by workforce type" })
	@ApiResponse({ status: 200, description: "Active workforce tab data" })
	@Permissions({ action: Action.List, subject: "CommandCenter" })
	getActiveWorkforce(
		@Session() session: UserSession,
		@Query() query: QueryCommandCenterActiveWorkforceDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.commandCenterService.getActiveWorkforce(orgId, query);
	}

	@Get("hiring-funnel")
	@ApiOperation({ summary: "Hiring funnel listings and stage summary" })
	@ApiResponse({ status: 200, description: "Hiring funnel tab data" })
	@Permissions({ action: Action.List, subject: "CommandCenter" })
	getHiringFunnel(
		@Session() session: UserSession,
		@Query() query: QueryCommandCenterHiringFunnelDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.commandCenterService.getHiringFunnel(orgId, query);
	}

	@Post("operations/remind")
	@ApiOperation({
		summary: "Queue onboarding reminder email for reminder-eligible placement",
	})
	@ApiResponse({ status: 200, description: "Reminder queued" })
	@Permissions({ action: Action.Update, subject: "Requisition" })
	queueRequisitionReminder(
		@Session() session: UserSession,
		@Body() body: QueueCommandCenterReminderDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.commandCenterService.queueRequisitionReminder(
			orgId,
			body.requisitionId,
			body.placementId,
		);
	}
}
