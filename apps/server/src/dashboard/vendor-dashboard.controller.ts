import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import { requireVendorPortalActor } from "src/common/utils/resolve-vendor-actor";
import { VendorDashboardFinancialQueryDto } from "./dto/vendor-dashboard-financial-query.dto";
import { VendorDashboardService } from "./vendor-dashboard.service";

@ApiTags("vendor-dashboard")
@Controller("vendor/dashboard")
@UseGuards(PermissionsGuard)
export class VendorDashboardController {
	constructor(
		private readonly vendorDashboardService: VendorDashboardService,
	) {}

	private resolveContext(session: UserSession) {
		const organizationId = requireActiveOrganizationId(session);
		const actor = requireVendorPortalActor(session);
		return { organizationId, vendorId: actor.vendorId };
	}

	@Get()
	@ApiOperation({ summary: "Vendor portal dashboard overview" })
	@ApiResponse({ status: 200, description: "Vendor dashboard data" })
	@Permissions({ action: Action.Read, subject: "Dashboard" })
	getDashboard(@Session() session: UserSession) {
		const { organizationId, vendorId } = this.resolveContext(session);
		return this.vendorDashboardService.getVendorDashboard(
			organizationId,
			vendorId,
		);
	}

	@Get("summary")
	@ApiOperation({ summary: "Vendor dashboard summary cards" })
	@ApiResponse({ status: 200, description: "Vendor dashboard summary" })
	@Permissions({ action: Action.Read, subject: "Dashboard" })
	getSummary(@Session() session: UserSession) {
		const { organizationId, vendorId } = this.resolveContext(session);
		return this.vendorDashboardService.getSummary(organizationId, vendorId);
	}

	@Get("performance")
	@ApiOperation({ summary: "Vendor dashboard performance metrics" })
	@ApiResponse({ status: 200, description: "Vendor dashboard performance" })
	@Permissions({ action: Action.List, subject: "Dashboard" })
	getPerformance(@Session() session: UserSession) {
		const { organizationId, vendorId } = this.resolveContext(session);
		return this.vendorDashboardService.getPerformance(organizationId, vendorId);
	}

	@Get("financial")
	@ApiOperation({ summary: "Vendor dashboard financial overview" })
	@ApiResponse({
		status: 200,
		description: "Vendor dashboard financial metrics",
	})
	@Permissions({ action: Action.Read, subject: "Dashboard" })
	getFinancial(
		@Session() session: UserSession,
		@Query() query: VendorDashboardFinancialQueryDto,
	) {
		const { organizationId, vendorId } = this.resolveContext(session);
		return this.vendorDashboardService.getFinancial(
			organizationId,
			vendorId,
			query.period,
		);
	}

	@Get("invoice-status")
	@ApiOperation({ summary: "Vendor dashboard invoice status buckets" })
	@ApiResponse({ status: 200, description: "Vendor dashboard invoice status" })
	@Permissions({ action: Action.List, subject: "Dashboard" })
	getInvoiceStatus(
		@Session() session: UserSession,
		@Query() query: VendorDashboardFinancialQueryDto,
	) {
		const { organizationId, vendorId } = this.resolveContext(session);
		return this.vendorDashboardService.getInvoiceStatus(
			organizationId,
			vendorId,
			query.period,
		);
	}

	@Get("compliance-alerts")
	@ApiOperation({ summary: "Vendor dashboard compliance alerts" })
	@ApiResponse({
		status: 200,
		description: "Vendor dashboard compliance alerts",
	})
	@Permissions({ action: Action.List, subject: "Dashboard" })
	getComplianceAlerts(@Session() session: UserSession) {
		const { organizationId, vendorId } = this.resolveContext(session);
		return this.vendorDashboardService.getComplianceAlerts(
			organizationId,
			vendorId,
		);
	}

	@Get("recent-activity")
	@ApiOperation({ summary: "Vendor dashboard recent activity feed" })
	@ApiResponse({ status: 200, description: "Vendor dashboard recent activity" })
	@Permissions({ action: Action.List, subject: "Dashboard" })
	getRecentActivity(@Session() session: UserSession) {
		const { organizationId, vendorId } = this.resolveContext(session);
		return this.vendorDashboardService.getRecentActivity(
			organizationId,
			vendorId,
		);
	}

	@Get("offers")
	@ApiOperation({ summary: "Vendor dashboard pending and overdue offers" })
	@ApiResponse({ status: 200, description: "Vendor dashboard offers" })
	@Permissions({ action: Action.List, subject: "Dashboard" })
	getOffers(@Session() session: UserSession) {
		const { organizationId, vendorId } = this.resolveContext(session);
		return this.vendorDashboardService.getOffers(organizationId, vendorId);
	}

	@Get("upcoming-shifts")
	@ApiOperation({ summary: "Vendor dashboard upcoming claimable shifts" })
	@ApiResponse({ status: 200, description: "Vendor dashboard upcoming shifts" })
	@Permissions({ action: Action.List, subject: "Dashboard" })
	getUpcomingShifts(@Session() session: UserSession) {
		const { organizationId } = this.resolveContext(session);
		return this.vendorDashboardService.getUpcomingShifts(organizationId);
	}
}
