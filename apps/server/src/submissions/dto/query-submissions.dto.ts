import { ApiPropertyOptional } from "@nestjs/swagger";
import { SubmissionStage } from "@repo/db";
import { IsEnum, IsIn, IsOptional, IsUUID } from "class-validator";
import { PaginatedQueryDto } from "src/common/dto/paginated-query.dto";

const AGING_BUCKET_VALUES = ["ALL", "OVERDUE", "NEAR", "WITHIN"] as const;

export class QuerySubmissionsDto extends PaginatedQueryDto {
	@ApiPropertyOptional({ enum: SubmissionStage })
	@IsOptional()
	@IsEnum(SubmissionStage)
	stage?: SubmissionStage;

	@ApiPropertyOptional({ enum: AGING_BUCKET_VALUES })
	@IsOptional()
	@IsIn([...AGING_BUCKET_VALUES])
	agingBucket?: (typeof AGING_BUCKET_VALUES)[number];

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
}
