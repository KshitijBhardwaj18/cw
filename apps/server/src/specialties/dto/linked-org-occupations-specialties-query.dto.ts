import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

export class LinkedOrgOccupationsSpecialtiesQueryDto {
	@ApiPropertyOptional({
		description:
			"Max number of org-linked occupations (by createdAt desc) to include when aggregating specialties",
		minimum: 1,
		maximum: 500,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(500)
	limit?: number;
}
