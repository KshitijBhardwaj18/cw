import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class EndPlacementDto {
	@ApiPropertyOptional({
		description: "Reason for ending the placement",
		maxLength: 1000,
	})
	@IsOptional()
	@IsString()
	@MaxLength(1000)
	terminationReason?: string;
}
