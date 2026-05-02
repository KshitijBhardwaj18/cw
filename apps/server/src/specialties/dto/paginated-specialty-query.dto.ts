import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";
import { PaginatedQueryDto } from "src/common/dto/paginated-query.dto";

export class PaginatedSpecialtyQueryDto extends PaginatedQueryDto {
	@ApiPropertyOptional({
		description:
			"When provided (e.g. in Manage Specialty dialog), inactive specialties not linked to this org occupation are excluded",
	})
	@IsOptional()
	@IsUUID()
	organizationOccupationId?: string;
}
