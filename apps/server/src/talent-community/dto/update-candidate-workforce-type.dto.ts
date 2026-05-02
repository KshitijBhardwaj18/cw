import { ApiProperty } from "@nestjs/swagger";
import { CandidateWorkforceType } from "@repo/db";
import { IsEnum, IsOptional, IsUUID } from "class-validator";

export class UpdateCandidateWorkforceTypeDto {
	@ApiProperty({ enum: CandidateWorkforceType })
	@IsEnum(CandidateWorkforceType)
	workforceType: CandidateWorkforceType;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsUUID()
	vendorId?: string;
}
