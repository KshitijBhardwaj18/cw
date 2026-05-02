import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsNotEmpty, IsUUID } from "class-validator";

export class LinkOrgOccupationsBodyDto {
	@ApiProperty({
		description: "Occupation IDs to link to the organization",
		example: ["550e8400-e29b-41d4-a716-446655440000"],
		type: [String],
		isArray: true,
	})
	@IsArray()
	@ArrayMinSize(1, { message: "At least one occupation is required" })
	@IsUUID(undefined, { each: true })
	@IsNotEmpty()
	occupationIds: string[];
}

export interface LinkOrgOccupationsInput {
	organizationId: string;
	occupationIds: string[];
	userId: string;
}
