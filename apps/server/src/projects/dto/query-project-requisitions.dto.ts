import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional } from "class-validator";
import { PaginatedQueryDto } from "src/common/dto/paginated-query.dto";

const REQUISITION_STATUS_FILTER = ["all", "Open", "Closed", "On Hold"] as const;

export class QueryProjectRequisitionsDto extends PaginatedQueryDto {
	@ApiPropertyOptional({
		enum: REQUISITION_STATUS_FILTER,
		description:
			"Filter by display status: Closed = FILLED, On Hold = DRAFT, Open = all other statuses",
	})
	@IsOptional()
	@IsIn([...REQUISITION_STATUS_FILTER])
	requisitionStatus?: (typeof REQUISITION_STATUS_FILTER)[number];
}
