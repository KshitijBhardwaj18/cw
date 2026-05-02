import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { DashboardService } from "./dashboard.service";
import { DashboardSummaryDto } from "./dto/dashboard-summary.dto";

@Controller("dashboard")
@ApiTags("Dashboard")
@UseGuards(PermissionsGuard)
export class DashboardController {
	constructor(private readonly dashboardService: DashboardService) {}

	@Get("summary")
	@ApiOperation({ summary: "Get dashboard summary" })
	@ApiResponse({ status: 200, description: "Dashboard summary" })
	@Permissions({ action: Action.Read, subject: "Dashboard" })
	async getDashboardSummary(): Promise<DashboardSummaryDto> {
		return this.dashboardService.getDashboardSummary();
	}
}
