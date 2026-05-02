import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, Max, Min } from "class-validator";

export type VendorRequisitionCandidateTab =
	| "interested"
	| "matched"
	| "submitted";

export class QueryVendorRequisitionCandidatesDto {
	@ApiProperty({
		enum: ["interested", "matched", "submitted"],
		description:
			"interested = saved job; matched = same occupation + match score; submitted = active submission pipeline",
	})
	@IsIn(["interested", "matched", "submitted"])
	tab!: VendorRequisitionCandidateTab;

	@ApiPropertyOptional({ default: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1;

	@ApiPropertyOptional({ default: 10 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(50)
	limit?: number = 10;
}
