import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class SetActiveOrganizationDto {
	@ApiProperty({ format: "uuid" })
	@IsUUID()
	organizationId!: string;
}
