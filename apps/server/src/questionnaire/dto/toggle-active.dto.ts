import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class ToggleActiveDto {
	@ApiProperty({
		description: "Whether the questionnaire is active for candidates",
	})
	@IsBoolean()
	active: boolean;
}
