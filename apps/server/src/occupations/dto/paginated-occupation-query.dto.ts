import { ApiPropertyOptional } from "@nestjs/swagger";
import { $Enums } from "@repo/db";
import { IsEnum, IsOptional, IsUUID } from "class-validator";
import { PaginatedQueryDto } from "src/common/dto/paginated-query.dto";

export class PaginatedOccupationQueryDto extends PaginatedQueryDto {
	@ApiPropertyOptional({
		description: "Filter by occupation status",
		enum: $Enums.OccupationStatus,
	})
	@IsOptional()
	@IsEnum($Enums.OccupationStatus)
	status?: $Enums.OccupationStatus;

	@ApiPropertyOptional({
		description:
			"When provided, returns only active occupations plus inactive ones linked to this org (excludes unlinked inactive). Use for org occupation picker.",
	})
	@IsOptional()
	@IsUUID()
	organizationId?: string;
}
