import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export enum TalentCommunityTab {
	TALENT_COMMUNITY = "talent-community",
	NEW_UNASSIGNED = "new",
	INVITED = "invited",
}

export class TalentCommunityQueryDto {
	@ApiPropertyOptional({
		enum: TalentCommunityTab,
		default: TalentCommunityTab.TALENT_COMMUNITY,
	})
	@IsOptional()
	@IsEnum(TalentCommunityTab)
	tab?: TalentCommunityTab = TalentCommunityTab.TALENT_COMMUNITY;

	@ApiPropertyOptional({ description: "Search by name or occupation" })
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	search?: string;

	@ApiPropertyOptional({ default: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1;

	@ApiPropertyOptional({ default: 20 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number = 20;
}
