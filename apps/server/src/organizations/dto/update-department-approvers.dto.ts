import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsUUID } from "class-validator";

export class UpdateDepartmentApproversDto {
	@ApiProperty({
		description: "User IDs to set as timekeeping approvers for this department",
		type: [String],
	})
	@IsArray()
	@IsUUID("4", { each: true })
	userIds: string[];
}
