import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsUUID } from "class-validator";

export class UpdateWalletItemsDto {
	@ApiProperty({
		description: "List of compliance list item IDs to assign to the wallet",
		type: [String],
		example: ["uuid-1", "uuid-2"],
	})
	@IsArray()
	@IsUUID("4", { each: true })
	complianceListItemIds: string[];
}
