import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsInt, IsOptional, IsString, Min } from "class-validator";

export class OrgCandidatesQueryDto {
	@ApiPropertyOptional({ description: "Search by name, email, or occupation" })
	@IsOptional()
	@IsString()
	search?: string;

	@ApiPropertyOptional({ description: "Page (1-based)", default: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number;

	@ApiPropertyOptional({ description: "Items per page", default: 10 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	limit?: number;
}

export class SetCandidateActiveDto {
	@ApiProperty({ description: "Whether the candidate should be active" })
	@IsBoolean()
	isActive: boolean;
}
