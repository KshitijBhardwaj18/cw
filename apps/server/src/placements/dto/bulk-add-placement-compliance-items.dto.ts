import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsUUID } from "class-validator";

export class BulkAddPlacementComplianceItemsDto {
	@ApiProperty({
		type: [String],
		description: "Compliance list item IDs to attach to this placement",
	})
	@IsArray()
	@ArrayMinSize(1)
	@IsUUID(undefined, { each: true })
	complianceListItemIds: string[];
}
