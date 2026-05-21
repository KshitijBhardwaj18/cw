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
import { Session, UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import { CancelPerDiemShiftDto } from "../dto/per-diem-shifts/cancel-per-diem-shift.dto";
import { CreatePerDiemShiftDto } from "../dto/per-diem-shifts/create-per-diem-shift.dto";
import { PerDiemShiftsQueryDto } from "../dto/per-diem-shifts/per-diem-shifts-query.dto";
import { PerDiemShiftsService } from "../services/per-diem-shifts.service";

@ApiTags("per-diem-shifts")
@Controller("org/per-diem-shifts")
@UseGuards(PermissionsGuard)
export class PerDiemShiftsController {
	constructor(private readonly perDiemShiftsService: PerDiemShiftsService) {}

	@Get()
	@ApiOperation({ summary: "List per diem shifts with filters and pagination" })
	@ApiResponse({ status: 200, description: "Paginated shifts + status counts" })
	@Permissions({ action: Action.List, subject: "PerDiemShift" })
	async list(
		@Query() query: PerDiemShiftsQueryDto,
		@Session() session: UserSession,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.perDiemShiftsService.list(orgId, query);
	}

	@Get("command-center/locations")
	@ApiOperation({
		summary: "Command Center shifts grouped by location (next 3 days)",
	})
	@ApiResponse({
		status: 200,
		description: "Locations with shifts + summary counts + filters meta",
	})
	@Permissions({ action: Action.List, subject: "PerDiemShift" })
	async getCommandCenterLocations(
		@Session() session: UserSession,
		@Query("search") search?: string,
		@Query("department") department?: string,
		@Query("occupation") occupation?: string,
		@Query("page") page?: string,
		@Query("limit") limit?: string,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.perDiemShiftsService.getCommandCenterLocations(orgId, {
			search,
			department,
			occupation,
			page: page ? Math.max(1, Number.parseInt(page, 10)) : 1,
			limit: limit ? Math.min(50, Math.max(1, Number.parseInt(limit, 10))) : 10,
		});
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: "Create a per diem shift from a template" })
	@ApiResponse({ status: 201, description: "Shift created" })
	@Permissions({ action: Action.Create, subject: "PerDiemShift" })
	async create(
		@Session() session: UserSession,
		@Body() dto: CreatePerDiemShiftDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		const user = session.user;
		return this.perDiemShiftsService.create(orgId, dto, user.id);
	}

	@Patch(":shiftId/cancel")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Cancel a per diem shift" })
	@ApiResponse({ status: 200, description: "Shift cancelled" })
	@Permissions({ action: Action.Update, subject: "PerDiemShift" })
	async cancel(
		@Session() session: UserSession,
		@Param("shiftId", ParseUUIDPipe) shiftId: string,
		@Body() dto: CancelPerDiemShiftDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		const user = session.user;
		return this.perDiemShiftsService.cancel(orgId, shiftId, dto, user.id);
	}
}
