import { Transform } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class CursorPaginationDto {
	@IsOptional()
	@IsString()
	cursor?: string;

	@IsOptional()
	@Transform(({ value }) => {
		if (value == null || value === "") return undefined;
		const parsed = Number.parseInt(String(value), 10);
		return Number.isNaN(parsed) ? undefined : parsed;
	})
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number;

	@IsOptional()
	@IsString()
	search?: string;
}
