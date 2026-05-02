import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";

export class QueueCommandCenterReminderDto {
	@ApiProperty({
		description: "Requisition id for which reminder should be queued",
	})
	@IsUUID()
	requisitionId!: string;

	@ApiPropertyOptional({
		description:
			"Optional placement id to target reminder explicitly; must belong to requisition and organization",
	})
	@IsOptional()
	@IsUUID()
	placementId?: string;
}
