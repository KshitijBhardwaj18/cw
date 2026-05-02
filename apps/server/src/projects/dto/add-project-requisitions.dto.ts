import { ApiProperty } from "@nestjs/swagger";
import { ArrayMaxSize, IsArray, IsUUID } from "class-validator";

export class AddProjectRequisitionsDto {
	@ApiProperty({ type: [String] })
	@IsArray()
	@IsUUID("4", { each: true })
	@ArrayMaxSize(100)
	requisitionIds: string[];
}
