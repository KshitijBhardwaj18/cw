import { ApiPropertyOptional } from "@nestjs/swagger";
import {
	COMBINATIONS_FILTER_VALUES,
	type CombinationsFilter,
} from "@repo/shared";
import { Transform } from "class-transformer";
import { IsIn, IsOptional } from "class-validator";
import { PaginatedQueryDto } from "src/common/dto/paginated-query.dto";

export class CombinationsQueryDto extends PaginatedQueryDto {
	@ApiPropertyOptional({
		description: "Filter by wallet status",
		enum: COMBINATIONS_FILTER_VALUES,
		default: "all",
	})
	@IsOptional()
	@Transform(({ value }) =>
		COMBINATIONS_FILTER_VALUES.includes(value as CombinationsFilter)
			? value
			: "all",
	)
	@IsIn(COMBINATIONS_FILTER_VALUES)
	filter?: CombinationsFilter = "all";
}
