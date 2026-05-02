import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsUUID } from "class-validator";

export class ReplaceOrgOccupationsBodyDto {
	@ApiProperty({
		description:
			"Occupation IDs to link to the organization (replaces existing)",
		example: ["550e8400-e29b-41d4-a716-446655440000"],
		type: [String],
		isArray: true,
	})
	@IsArray()
	@IsUUID(undefined, { each: true })
	occupationIds: string[];
}

export interface ReplaceOrgOccupationsInput {
	organizationId: string;
	occupationIds: string[];
	userId: string;
}
