import { ApiPropertyOptional } from "@nestjs/swagger";
import { RequisitionType, ShiftType } from "@repo/db";
import {
	IsDateString,
	IsEnum,
	IsIn,
	IsOptional,
	IsUUID,
} from "class-validator";
import { PaginatedQueryDto } from "src/common/dto/paginated-query.dto";

const CARD_STATUS_VALUES = [
	"all",
	"OPEN",
	"OFFER_ACCEPTED",
	"FILLED",
	"DRAFT",
] as const;

export class QueryRequisitionsDto extends PaginatedQueryDto {
	@ApiPropertyOptional({ enum: CARD_STATUS_VALUES })
	@IsOptional()
	@IsIn([...CARD_STATUS_VALUES])
	cardStatus?: (typeof CARD_STATUS_VALUES)[number];

	@ApiPropertyOptional({ enum: ShiftType })
	@IsOptional()
	@IsEnum(ShiftType)
	shiftType?: ShiftType;

	@ApiPropertyOptional({ enum: RequisitionType })
	@IsOptional()
	@IsEnum(RequisitionType)
	requisitionType?: RequisitionType;

	@ApiPropertyOptional()
	@IsOptional()
	@IsUUID()
	locationId?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsUUID()
	departmentId?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsUUID()
	organizationOccupationId?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsUUID()
	organizationSpecialtyId?: string;

	@ApiPropertyOptional({
		description:
			"Match requisitions whose startDate is on this calendar day (UTC)",
	})
	@IsOptional()
	@IsDateString()
	expectedStartDate?: string;

	@ApiPropertyOptional({
		description:
			"When set (e.g. add-to-project picker), omit requisitions already assigned to this project",
	})
	@IsOptional()
	@IsUUID()
	excludeProjectId?: string;
}
