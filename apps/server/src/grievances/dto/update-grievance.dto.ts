import { ApiPropertyOptional } from "@nestjs/swagger";
import { GrievanceStatus } from "@repo/db";
import { IsEnum, IsOptional } from "class-validator";

export class UpdateGrievanceDto {
	@ApiPropertyOptional({ enum: GrievanceStatus })
	@IsOptional()
	@IsEnum(GrievanceStatus)
	status?: GrievanceStatus;
}
