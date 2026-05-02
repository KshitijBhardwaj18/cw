import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class VendorUsersQueryDto {
	@ApiPropertyOptional({
		description: "Search by user name or email",
	})
	@IsOptional()
	@IsString()
	search?: string;
}
