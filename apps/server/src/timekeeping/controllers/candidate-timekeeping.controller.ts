import {
	Body,
	Controller,
	Get,
	Param,
	ParseUUIDPipe,
	Put,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import { UpsertCandidateTimecardDto } from "../dto/upsert-candidate-timecard.dto";
import { TimekeepingService } from "../services/timekeeping.service";

@ApiTags("Candidate Portal / Timekeeping")
@Controller("candidates")
@UseGuards(PermissionsGuard)
export class CandidateTimekeepingController {
	constructor(private readonly timekeepingService: TimekeepingService) {}

	@Get("me/placements/:placementId/timecards")
	@Permissions({ action: Action.List, subject: "Timesheet" })
	@ApiOperation({ summary: "Timecard list for candidate's placement" })
	list(
		@Session() session: UserSession,
		@Param("placementId", ParseUUIDPipe) placementId: string,
	) {
		const organizationId = requireActiveOrganizationId(session);
		return this.timekeepingService.listCandidateTimesheetsForPlacement(
			session.user.id,
			organizationId,
			placementId,
		);
	}

	@Get("me/placements/:placementId/timecards/:timecardId")
	@Permissions({ action: Action.Read, subject: "Timesheet" })
	@ApiOperation({ summary: "Single timecard for candidate portal" })
	detail(
		@Session() session: UserSession,
		@Param("placementId", ParseUUIDPipe) placementId: string,
		@Param("timecardId", ParseUUIDPipe) timecardId: string,
	) {
		const organizationId = requireActiveOrganizationId(session);
		return this.timekeepingService.getCandidateTimesheetDetail(
			session.user.id,
			organizationId,
			placementId,
			timecardId,
		);
	}

	@Put("me/placements/:placementId/timecards")
	@Permissions({ action: Action.Update, subject: "Timesheet" })
	@ApiOperation({ summary: "Save draft or submit timecard for approval" })
	upsert(
		@Session() session: UserSession,
		@Param("placementId", ParseUUIDPipe) placementId: string,
		@Body() dto: UpsertCandidateTimecardDto,
	) {
		const organizationId = requireActiveOrganizationId(session);
		return this.timekeepingService.upsertCandidateTimecard(
			session.user.id,
			organizationId,
			placementId,
			dto,
		);
	}
}
