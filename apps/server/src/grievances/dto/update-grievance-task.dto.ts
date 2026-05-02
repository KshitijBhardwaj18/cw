import { ApiPropertyOptional } from "@nestjs/swagger";
import { GrievanceTaskStatus } from "@repo/db";
import { IsEnum, IsOptional } from "class-validator";

export class UpdateGrievanceTaskDto {
	@ApiPropertyOptional({ enum: GrievanceTaskStatus })
	@IsOptional()
	@IsEnum(GrievanceTaskStatus)
	status?: GrievanceTaskStatus;
}
