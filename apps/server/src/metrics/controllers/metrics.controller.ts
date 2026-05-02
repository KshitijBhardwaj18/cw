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
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { QueryOrganizationMetricsDto } from "../dto/query-organization-metrics.dto";
import { RecomputeMetricSnapshotsDto } from "../dto/recompute-metric-snapshots.dto";
import { UpdateMetricStatusDto } from "../dto/update-metric-status.dto";
import { UpdateOrganizationMetricDto } from "../dto/update-organization-metric.dto";
import { UpsertOrganizationMetricDto } from "../dto/upsert-organization-metric.dto";
import { MetricsService } from "../services/metrics.service";

@Controller("metrics")
@ApiTags("Metrics")
@UseGuards(PermissionsGuard)
export class MetricsController {
	constructor(private readonly metricsService: MetricsService) {}

	@Get()
	@ApiOperation({ summary: "Get all metrics" })
	@ApiResponse({ status: 200, description: "List of all metrics" })
	@Permissions({ action: Action.List, subject: "Metric" })
	async getAll() {
		return this.metricsService.findAll();
	}

	@Patch(":id/status")
	@ApiOperation({ summary: "Update metric status (enable/disable)" })
	@ApiResponse({ status: 200, description: "Updated metric" })
	@ApiResponse({ status: 404, description: "Metric not found" })
	@Permissions({ action: Action.Update, subject: "Metric" })
	async updateStatus(
		@Param("id") id: string,
		@Body() dto: UpdateMetricStatusDto,
	) {
		return this.metricsService.updateStatus(id, dto.status);
	}

	@Get("organizations/:organizationId")
	@ApiOperation({
		summary: "Get metrics and org-level metric settings for one organization",
	})
	@ApiResponse({ status: 200, description: "Metric catalog + org goal/status" })
	@Permissions({ action: Action.List, subject: "Metric" })
	async getOrganizationMetrics(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Query() query: QueryOrganizationMetricsDto,
	) {
		return this.metricsService.listByOrganization(organizationId, query);
	}

	@Post("organizations/:organizationId")
	@ApiOperation({
		summary: "Create or update one organization metric goal/active status",
	})
	@ApiResponse({ status: 200, description: "Upserted organization metric" })
	@Permissions({ action: Action.Update, subject: "Metric" })
	async upsertOrganizationMetric(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Body() dto: UpsertOrganizationMetricDto,
	) {
		return this.metricsService.upsertOrganizationMetric(organizationId, dto);
	}

	@Patch("organizations/:organizationId/:metricId")
	@ApiOperation({
		summary: "Update goal/active status for an existing organization metric",
	})
	@ApiResponse({ status: 200, description: "Updated organization metric" })
	@Permissions({ action: Action.Update, subject: "Metric" })
	async updateOrganizationMetric(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Param("metricId", ParseUUIDPipe) metricId: string,
		@Body() dto: UpdateOrganizationMetricDto,
	) {
		return this.metricsService.updateOrganizationMetric(
			organizationId,
			metricId,
			dto,
		);
	}

	@Post("organizations/:organizationId/snapshots/recompute")
	@ApiOperation({
		summary: "Queue recompute job for organization metric snapshots",
	})
	@ApiResponse({ status: 200, description: "Snapshot recompute queued" })
	@Permissions({ action: Action.Update, subject: "Metric" })
	async recomputeOrganizationMetricSnapshots(
		@Param("organizationId", ParseUUIDPipe) organizationId: string,
		@Body() dto: RecomputeMetricSnapshotsDto,
	) {
		return this.metricsService.triggerSnapshotRecompute(organizationId, dto);
	}
}
