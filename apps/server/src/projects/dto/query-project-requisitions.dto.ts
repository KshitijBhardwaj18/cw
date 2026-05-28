import { ApiPropertyOptional } from "@nestjs/swagger";
import { RequisitionStatus } from "@repo/db";
import { IsIn, IsOptional } from "class-validator";
import { PaginatedQueryDto } from "src/common/dto/paginated-query.dto";

const REQUISITION_STATUS_FILTER = [
	"all",
	...Object.values(RequisitionStatus),
] as const;

export class QueryProjectRequisitionsDto extends PaginatedQueryDto {
	@ApiPropertyOptional({
		enum: REQUISITION_STATUS_FILTER,
		description: "Filter by RequisitionStatus, or 'all' for no filter",
	})
	@IsOptional()
	@IsIn([...REQUISITION_STATUS_FILTER])
	requisitionStatus?: (typeof REQUISITION_STATUS_FILTER)[number];
}
