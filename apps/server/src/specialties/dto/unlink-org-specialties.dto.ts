import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsNotEmpty, IsUUID } from "class-validator";

export class UnlinkOrgSpecialtiesBodyDto {
	@ApiProperty({
		description: "Specialty IDs to unlink from the organization occupation",
		example: ["550e8400-e29b-41d4-a716-446655440000"],
		type: [String],
		isArray: true,
	})
	@IsArray()
	@ArrayMinSize(1, { message: "At least one specialty is required" })
	@IsUUID(undefined, { each: true })
	@IsNotEmpty()
	specialtyIds: string[];
}

export interface UnlinkOrgSpecialtiesInput {
	organizationId: string;
	orgOccupationId: string;
	specialtyIds: string[];
}
