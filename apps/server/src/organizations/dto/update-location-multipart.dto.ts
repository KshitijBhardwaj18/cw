import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateLocationMultipartDto {
	@ApiPropertyOptional({
		description:
			"JSON string of location update data (partial fields to update)",
		example:
			'{"name":"Updated Office","address":"456 New St","city":"Boston","state":"MA","zipCode":"02101"}',
	})
	@IsOptional()
	@IsString()
	data?: string;
}
