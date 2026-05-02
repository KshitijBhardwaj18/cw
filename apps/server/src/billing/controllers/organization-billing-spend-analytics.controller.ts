import {
	Controller,
	Get,
	Param,
	ParseUUIDPipe,
	Query,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { QuerySpendAnalyticsDto } from "../dto/query-spend-analytics.dto";
import { BillingSpendAnalyticsService } from "../services/billing-spend-analytics.service";

@ApiTags("Billing — Spend analytics")
@Controller("organizations/:organizationId/billing")
@UseGuards(PermissionsGuard)
export class OrganizationBillingSpendAnalyticsController {
	constructor(
		private readonly spendAnalyticsService: BillingSpendAnalyticsService,
	) {}

	@Get("spend-analytics/summary")
	@ApiOperation({
		summary: "Spend summary aggregates (explicit organization id)",
	})
	@Permissions({ action: Action.Read, subject: "SpendAnalytics" })
	getSummary(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Query() query: QuerySpendAnalyticsDto,
	) {
		return this.spendAnalyticsService.getSpendSummary(organizationId, query);
	}

	@Get("spend-analytics")
	@ApiOperation({ summary: "List spend analytics (explicit organization id)" })
	@Permissions({ action: Action.List, subject: "SpendAnalytics" })
	list(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Query() query: QuerySpendAnalyticsDto,
	) {
		return this.spendAnalyticsService.listSpendAnalytics(organizationId, query);
	}

	@Get("spend-analytics/open-committed-breakdown")
	@ApiOperation({
		summary: "Open vs committed spend breakdown (explicit organization id)",
	})
	@Permissions({ action: Action.List, subject: "SpendAnalytics" })
	listOpenCommittedBreakdown(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Query() query: QuerySpendAnalyticsDto,
	) {
		return this.spendAnalyticsService.listOpenCommittedBreakdown(
			organizationId,
			query,
		);
	}
}
