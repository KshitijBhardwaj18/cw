import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { MatchingCriterionKey } from "@repo/db";
import { Max } from "class-validator";

export class MatchingCriterionWithLogicDto {
	@ApiProperty({ description: "Matching criterion ID" })
	matchingCriterionId: string;

	@ApiProperty({
		enum: MatchingCriterionKey,
		description: "Stable criterion code",
	})
	key: MatchingCriterionKey;

	@ApiProperty({ description: "Criterion name" })
	name: string;

	@ApiPropertyOptional({ description: "Criterion description" })
	description: string | null;

	@ApiProperty({
		description: "Whether this criterion is active for the organization",
		default: false,
	})
	active: boolean;

	@ApiProperty({
		description: "Weight for this criterion (0 when inactive/empty state)",
		default: 0,
	})
	@Max(100, { message: "Weight must be between 0 and 100" })
	weight: number;

	@ApiPropertyOptional({
		description:
			"MatchingLogic ID when persisted; null for empty-state defaults",
	})
	matchingLogicId: string | null;
}
