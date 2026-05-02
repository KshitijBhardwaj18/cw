import {
	Body,
	Controller,
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
import { UserRole } from "@repo/db";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import { AssignPerDiemShiftDto } from "../dto/per-diem-shift-assignment/assign-per-diem-shift.dto";
import { QueryCandidateShiftsDto } from "../dto/per-diem-shift-assignment/query-candidate-shifts.dto";
import { QueryCandidateShiftsCalendarDto } from "../dto/per-diem-shift-assignment/query-candidate-shifts-calendar.dto";
import { VendorPerDiemShiftsQueryDto } from "../dto/per-diem-shifts/vendor-per-diem-shifts-query.dto";
import { PerDiemShiftAssignmentService } from "../services/per-diem-shift-assignment.service";

@ApiTags("per-diem-shift-assignment")
@Controller("org/per-diem-shift-assignment")
@UseGuards(PermissionsGuard)
export class PerDiemShiftAssignmentController {
	constructor(
		private readonly assignmentService: PerDiemShiftAssignmentService,
	) {}

	@Get("candidates/available")
	@Permissions({ action: Action.List, subject: "PerDiemShift" })
	@ApiOperation({
		summary: "Paginated list of open / claimable shifts (candidate)",
	})
	available(
		@Session() session: UserSession,
		@Query() query: QueryCandidateShiftsDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.assignmentService.listCandidateAvailableShifts(
			session.user.id,
			orgId,
			query,
		);
	}

	@Get("candidates/my")
	@Permissions({ action: Action.List, subject: "PerDiemShift" })
	@ApiOperation({ summary: "Shifts the candidate has claimed" })
	myShifts(
		@Session() session: UserSession,
		@Query() query: QueryCandidateShiftsDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.assignmentService.listCandidateMyShifts(
			session.user.id,
			orgId,
			query,
		);
	}

	@Get("candidates/counts")
	@Permissions({ action: Action.Read, subject: "PerDiemShift" })
	@ApiOperation({ summary: "Tab counts: available shifts and my shifts" })
	counts(@Session() session: UserSession) {
		const orgId = requireActiveOrganizationId(session);
		return this.assignmentService.getCandidateShiftCounts(
			session.user.id,
			orgId,
		);
	}

	@Get("candidates/calendar")
	@Permissions({ action: Action.List, subject: "PerDiemShift" })
	@ApiOperation({
		summary: "All shifts for a candidate in a given month (for calendar view)",
	})
	calendar(
		@Session() session: UserSession,
		@Query() query: QueryCandidateShiftsCalendarDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.assignmentService.listCandidateShiftsForCalendar(
			session.user.id,
			orgId,
			query.year,
			query.month,
		);
	}

	@Post("candidates/:shiftId/claim")
	@HttpCode(HttpStatus.OK)
	@Permissions({ action: Action.Update, subject: "PerDiemShift" })
	@ApiOperation({ summary: "Claim an available shift" })
	claim(
		@Session() session: UserSession,
		@Param("shiftId", ParseUUIDPipe) shiftId: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.assignmentService.claimShift(session.user.id, orgId, shiftId);
	}

	@Post("vendor/:shiftId/assign")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary:
			"Assign an open shift to a candidate (org staff or vendor; vendors limited to their candidates)",
	})
	@ApiResponse({ status: 200, description: "Shift assigned" })
	@Permissions({ action: Action.Update, subject: "PerDiemShift" })
	assign(
		@Param("shiftId", ParseUUIDPipe) shiftId: string,
		@Body() dto: AssignPerDiemShiftDto,
		@Session() session: UserSession,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.assignmentService.assignShiftToCandidate(
			session.user.id,
			session.user.role as UserRole,
			orgId,
			shiftId,
			dto.candidateId,
			session,
		);
	}

	@Get("vendor/available")
	@ApiOperation({
		summary: "Vendor: paginated open public shifts available to claim",
	})
	@ApiResponse({ status: 200, description: "Paginated claimable shifts" })
	@Permissions({ action: Action.List, subject: "PerDiemShift" })
	async listVendorAvailable(
		@Session() session: UserSession,
		@Query() query: VendorPerDiemShiftsQueryDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.assignmentService.listVendorAvailableShifts(
			orgId,
			query,
			session,
		);
	}

	@Get("vendor/assigned")
	@ApiOperation({
		summary: "Vendor: paginated shifts assigned to this vendor's candidates",
	})
	@ApiResponse({ status: 200, description: "Paginated assigned shifts" })
	@Permissions({ action: Action.List, subject: "PerDiemShift" })
	async listVendorAssigned(
		@Query() query: VendorPerDiemShiftsQueryDto,
		@Session() session: UserSession,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.assignmentService.listVendorAssignedShifts(
			orgId,
			query,
			session,
		);
	}

	@Get("vendor/metrics")
	@ApiOperation({ summary: "Vendor: dashboard metrics for shift claiming" })
	@ApiResponse({ status: 200, description: "Metric counts" })
	@Permissions({ action: Action.List, subject: "PerDiemShift" })
	async getVendorMetrics(@Session() session: UserSession) {
		const orgId = requireActiveOrganizationId(session);
		return this.assignmentService.getVendorShiftMetrics(orgId, session);
	}

	@Get("vendor/:shiftId/assignable-candidates")
	@ApiOperation({
		summary: "Vendor: candidates that can be assigned to an open shift",
	})
	@ApiResponse({ status: 200, description: "Qualified candidates" })
	@Permissions({ action: Action.List, subject: "PerDiemShift" })
	async listVendorAssignableCandidates(
		@Session() session: UserSession,
		@Param("shiftId", ParseUUIDPipe) shiftId: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.assignmentService.listVendorAssignableCandidates(
			orgId,
			shiftId,
			session,
		);
	}
}
