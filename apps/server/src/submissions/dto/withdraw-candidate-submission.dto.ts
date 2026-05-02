import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class WithdrawCandidateSubmissionDto {
	@ApiPropertyOptional({ maxLength: 2000 })
	@IsOptional()
	@IsString()
	@MaxLength(2000)
	withdrawalReason?: string;
}
