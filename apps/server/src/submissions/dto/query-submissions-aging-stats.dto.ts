import { ApiPropertyOptional } from "@nestjs/swagger";
import { SubmissionStage } from "@repo/db";
import { Transform } from "class-transformer";
import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";

/** Filters that scope aging breakdown (same dimensions as list, minus pagination / aging bucket). */
export class QuerySubmissionsAgingStatsDto {
	@ApiPropertyOptional({ enum: SubmissionStage })
	@IsOptional()
	@IsEnum(SubmissionStage)
	stage?: SubmissionStage;

	@ApiPropertyOptional()
	@IsOptional()
	@IsUUID()
	requisitionId?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsUUID()
	vendorId?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsUUID()
	hiringManagerId?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsUUID()
	departmentId?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsUUID()
	locationId?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() || undefined : value,
	)
	search?: string;
}
