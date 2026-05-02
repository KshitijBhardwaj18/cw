import { ApiProperty } from "@nestjs/swagger";
import { CandidateWorkforceType } from "@repo/db";
import { Type } from "class-transformer";
import {
	IsArray,
	IsBoolean,
	IsEnum,
	IsInt,
	IsNotEmpty,
	Min,
	ValidateNested,
} from "class-validator";

export class TierItemDto {
	@ApiProperty({ enum: CandidateWorkforceType })
	@IsEnum(CandidateWorkforceType)
	@IsNotEmpty()
	workforceType: CandidateWorkforceType;

	@ApiProperty()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	priorityOrder: number;

	@ApiProperty()
	@IsBoolean()
	isActive: boolean;
}

export class SyncTiersDto {
	@ApiProperty({ type: [TierItemDto] })
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => TierItemDto)
	tiers: TierItemDto[];
}
