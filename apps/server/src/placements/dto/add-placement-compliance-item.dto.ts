import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class AddPlacementComplianceItemDto {
	@ApiProperty({
		description: "Global compliance list item id to attach to this placement",
	})
	@IsUUID()
	complianceListItemId: string;
}
