import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class AssignPerDiemShiftDto {
	@ApiProperty({
		format: "uuid",
		description: "Candidate to assign to this shift",
	})
	@IsUUID("4")
	candidateId!: string;
}
