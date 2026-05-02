import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsUUID } from "class-validator";

export class ReplaceOrgSpecialtiesBodyDto {
	@ApiProperty({
		description:
			"Specialty IDs to link to the organization occupation (replaces existing)",
		example: ["550e8400-e29b-41d4-a716-446655440000"],
		type: [String],
		isArray: true,
	})
	@IsArray()
	@IsUUID(undefined, { each: true })
	specialtyIds: string[];
}

export interface ReplaceOrgSpecialtiesInput {
	organizationId: string;
	orgOccupationId: string;
	specialtyIds: string[];
	userId: string;
}
