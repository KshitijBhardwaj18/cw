import { ApiProperty } from "@nestjs/swagger";
import {
	IsBoolean,
	IsInt,
	IsNotEmpty,
	IsString,
	IsUUID,
	Min,
} from "class-validator";

export class SaveMatchingLogicItemDto {
	@ApiProperty({ description: "Matching criterion ID" })
	@IsNotEmpty({ message: "matchingCriterionId is required" })
	@IsString()
	@IsUUID()
	matchingCriterionId: string;

	@ApiProperty({ description: "Whether this criterion is active" })
	@IsBoolean()
	active: boolean;

	@ApiProperty({ description: "Weight for this criterion", minimum: 0 })
	@IsInt()
	@Min(0, { message: "weight must be 0 or greater" })
	weight: number;
}
