import { ApiPropertyOptional } from "@nestjs/swagger";
import { MetricSnapshotPeriodType } from "@repo/db";
import { IsEnum, IsOptional } from "class-validator";

export class QueryOrganizationMetricsDto {
	@ApiPropertyOptional({ enum: MetricSnapshotPeriodType })
	@IsOptional()
	@IsEnum(MetricSnapshotPeriodType)
	periodType?: MetricSnapshotPeriodType;
}
