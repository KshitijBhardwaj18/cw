import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsUUID } from "class-validator";

export class ReorderSubmissionReadinessDto {
	@ApiProperty({
		description: "Ordered question IDs for submission readiness",
		type: [String],
		example: ["uuid-1", "uuid-2", "uuid-3"],
	})
	@IsArray()
	@IsUUID("4", { each: true })
	questionIds: string[];
}
