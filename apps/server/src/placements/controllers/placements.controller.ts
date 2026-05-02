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
import { resolveVendorActor } from "src/common/utils/resolve-vendor-actor";
import { CreatePlacementNoteDto } from "../dto/create-placement-note.dto";
import { CreatePlacementTaskDto } from "../dto/create-placement-task.dto";
import { EndPlacementDto } from "../dto/end-placement.dto";
import { QueryPlacementsDto } from "../dto/query-placements.dto";
import { PlacementsService } from "../services/placements.service";

@ApiTags("Placements")
@Controller("org/placements")
@UseGuards(PermissionsGuard)
export class PlacementsController {
	constructor(private readonly placementsService: PlacementsService) {}

	@Get("counts")
	@ApiOperation({
		summary: "Tab counts for placements (upcoming / active / completed)",
	})
	@Permissions({ action: Action.Read, subject: "Placement" })
	getTabCounts(@Session() session: UserSession) {
		const orgId = requireActiveOrganizationId(session);
		const actor = resolveVendorActor(session);
		return this.placementsService.getTabCounts(orgId, actor.vendorId);
	}

	@Get()
	@ApiOperation({
		summary: "List placements for an organization (tabs + filters)",
	})
	@Permissions({ action: Action.List, subject: "Placement" })
	list(@Session() session: UserSession, @Query() query: QueryPlacementsDto) {
		const orgId = requireActiveOrganizationId(session);
		const actor = resolveVendorActor(session);
		const sessionVendorId = actor.vendorId?.trim() ?? "";
		const vendorId = sessionVendorId
			? sessionVendorId
			: (query.vendorId?.trim() ?? undefined);
		return this.placementsService.list(orgId, {
			tab: query.tab,
			search: query.search,
			workforceType: query.workforceType,
			compliance: query.compliance,
			vendorId: vendorId || undefined,
			page: query.page,
			limit: query.limit,
		});
	}

	@Patch(":placementId/end")
	@ApiOperation({ summary: "Terminate a placement" })
	@Permissions({ action: Action.Update, subject: "Placement" })
	endPlacement(
		@Param("placementId", ParseUUIDPipe) placementId: string,
		@Body() dto: EndPlacementDto,
		@Session() session: UserSession,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.placementsService.endPlacement(
			orgId,
			placementId,
			dto,
			session.user.id,
		);
	}

	@Get(":placementId")
	@ApiOperation({ summary: "Placement detail for org portal" })
	@Permissions({ action: Action.Read, subject: "Placement" })
	getDetail(
		@Param("placementId", ParseUUIDPipe) placementId: string,
		@Session() session: UserSession,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.placementsService.getDetail(orgId, placementId);
	}

	@Get(":placementId/offer-history")
	@ApiOperation({ summary: "Offer history timeline for a placement" })
	@Permissions({ action: Action.List, subject: "Placement" })
	getOfferHistory(
		@Param("placementId", ParseUUIDPipe) placementId: string,
		@Session() session: UserSession,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.placementsService.getOfferHistory(orgId, placementId);
	}

	@Get(":placementId/notes")
	@ApiOperation({ summary: "Notes for a placement" })
	@Permissions({ action: Action.List, subject: "Placement" })
	getNotes(
		@Param("placementId", ParseUUIDPipe) placementId: string,
		@Session() session: UserSession,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.placementsService.getNotes(orgId, placementId);
	}

	@Post(":placementId/notes")
	@ApiOperation({ summary: "Add a note to a placement" })
	@Permissions({ action: Action.Update, subject: "Placement" })
	createNote(
		@Param("placementId", ParseUUIDPipe) placementId: string,
		@Body() dto: CreatePlacementNoteDto,
		@Session() session: UserSession,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.placementsService.createNote(
			orgId,
			placementId,
			dto,
			session.user.id,
		);
	}

	@Get(":placementId/tasks")
	@ApiOperation({ summary: "Tasks for a placement" })
	@Permissions({ action: Action.List, subject: "Placement" })
	getTasks(
		@Param("placementId", ParseUUIDPipe) placementId: string,
		@Session() session: UserSession,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.placementsService.getTasks(orgId, placementId);
	}

	@Post(":placementId/tasks")
	@ApiOperation({ summary: "Create a task on a placement" })
	@Permissions({ action: Action.Update, subject: "Placement" })
	createTask(
		@Param("placementId", ParseUUIDPipe) placementId: string,
		@Body() dto: CreatePlacementTaskDto,
		@Session() session: UserSession,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.placementsService.createTask(
			orgId,
			placementId,
			dto,
			session.user.id,
		);
	}

	@Patch(":placementId/tasks/:taskId")
	@ApiOperation({ summary: "Mark a placement task as completed" })
	@Permissions({ action: Action.Update, subject: "Placement" })
	completeTask(
		@Param("placementId", ParseUUIDPipe) placementId: string,
		@Param("taskId", ParseUUIDPipe) taskId: string,
		@Session() session: UserSession,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.placementsService.completeTask(
			orgId,
			placementId,
			taskId,
			session.user.id,
		);
	}
}
