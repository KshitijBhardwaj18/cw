import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { MetricSnapshotPeriodType } from "@repo/db";
import { Type } from "class-transformer";
import {
	IsArray,
	IsDateString,
	IsEnum,
	IsOptional,
	IsUUID,
} from "class-validator";

export class RecomputeMetricSnapshotsDto {
	@ApiProperty({ enum: MetricSnapshotPeriodType })
	@IsEnum(MetricSnapshotPeriodType)
	periodType: MetricSnapshotPeriodType;

	@ApiPropertyOptional()
	@IsOptional()
	@IsDateString()
	periodStart?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsDateString()
	periodEnd?: string;

	@ApiPropertyOptional({ type: [String] })
	@IsOptional()
	@Type(() => String)
	@IsArray()
	@IsUUID(undefined, { each: true })
	metricIds?: string[];
}
