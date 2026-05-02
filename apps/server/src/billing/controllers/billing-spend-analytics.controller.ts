import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { Session, UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import { QuerySpendAnalyticsDto } from "../dto/query-spend-analytics.dto";
import { BillingSpendAnalyticsService } from "../services/billing-spend-analytics.service";

@ApiTags("Billing — Spend analytics")
@Controller("org/billing")
@UseGuards(PermissionsGuard)
export class BillingSpendAnalyticsController {
	constructor(
		private readonly spendAnalyticsService: BillingSpendAnalyticsService,
	) {}

	@Get("spend-analytics/summary")
	@ApiOperation({
		summary: "Aggregated spend totals across matching spend-analytics rows",
	})
	@Permissions({ action: Action.Read, subject: "SpendAnalytics" })
	getSummary(
		@Session() session: UserSession,
		@Query() query: QuerySpendAnalyticsDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.spendAnalyticsService.getSpendSummary(orgId, query);
	}

	@Get("spend-analytics")
	@ApiOperation({ summary: "List spend analytics rows (paginated)" })
	@Permissions({ action: Action.List, subject: "SpendAnalytics" })
	list(
		@Session() session: UserSession,
		@Query() query: QuerySpendAnalyticsDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.spendAnalyticsService.listSpendAnalytics(orgId, query);
	}

	@Get("spend-analytics/open-committed-breakdown")
	@ApiOperation({
		summary: "Open vs committed spend breakdown (requisition-level)",
	})
	@Permissions({ action: Action.List, subject: "SpendAnalytics" })
	listOpenCommittedBreakdown(
		@Session() session: UserSession,
		@Query() query: QuerySpendAnalyticsDto,
	) {
		const orgId = requireActiveOrganizationId(session);
		return this.spendAnalyticsService.listOpenCommittedBreakdown(orgId, query);
	}
}
