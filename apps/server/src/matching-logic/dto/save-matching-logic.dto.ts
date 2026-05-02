import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, ValidateNested } from "class-validator";
import { SaveMatchingLogicItemDto } from "./save-matching-logic-item.dto";

export class SaveMatchingLogicDto {
	@ApiProperty({
		description: "List of matching criteria with their active state and weight",
		type: [SaveMatchingLogicItemDto],
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => SaveMatchingLogicItemDto)
	items: SaveMatchingLogicItemDto[];
}
