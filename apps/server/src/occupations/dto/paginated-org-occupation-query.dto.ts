import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";
import { PaginatedQueryDto } from "src/common/dto/paginated-query.dto";

export class PaginatedOrgOccupationQueryDto extends PaginatedQueryDto {
	@ApiPropertyOptional({
		description: "When true, return only linked occupation IDs",
		default: false,
	})
	@IsOptional()
	@Transform(({ value }) => value === "true" || value === true)
	@IsBoolean()
	idsOnly?: boolean = false;
}
