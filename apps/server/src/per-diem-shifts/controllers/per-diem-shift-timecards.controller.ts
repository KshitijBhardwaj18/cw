import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Put,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { UserRole } from "@repo/db";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import { SubmitShiftTimecardDto } from "../dto/per-diem-shift-timecards/submit-shift-timecard.dto";
import { PerDiemShiftTimecardsService } from "../services/per-diem-shift-timecards.service";

@ApiTags("per-diem-shift-timecards")
@Controller("org/per-diem-shift-timecards")
@UseGuards(PermissionsGuard)
export class PerDiemShiftTimecardsController {
	constructor(
		private readonly timecardsService: PerDiemShiftTimecardsService,
	) {}

	@Put("candidates/:shiftId/timecard")
	@HttpCode(HttpStatus.OK)
	@Permissions({ action: Action.Update, subject: "Timesheet" })
	@ApiOperation({
		summary: "Save draft or submit timecard for a claimed shift (candidate)",
	})
	submitTimecard(
		@Session() session: UserSession,
		@Param("shiftId", ParseUUIDPipe) shiftId: string,
		@Body() dto: SubmitShiftTimecardDto,
	) {
		const organizationId = requireActiveOrganizationId(session);
		return this.timecardsService.submitShiftTimecard(
			session.user.id,
			organizationId,
			shiftId,
			dto,
		);
	}

	@Put("vendor/:assignmentId/timecard")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary:
			"Save draft or submit timecard for a per-diem assignment (org staff or vendor)",
	})
	@Permissions({ action: Action.Update, subject: "Timesheet" })
	submitTimecardForAssignment(
		@Param("assignmentId", ParseUUIDPipe) assignmentId: string,
		@Body() dto: SubmitShiftTimecardDto,
		@Session() session: UserSession,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.timecardsService.submitAssignmentTimecardForOrgActor(
			session.user.id,
			session.user.role as UserRole,
			orgId,
			assignmentId,
			dto,
			session,
		);
	}
}
