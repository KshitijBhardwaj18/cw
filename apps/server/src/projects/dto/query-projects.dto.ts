import { ApiPropertyOptional } from "@nestjs/swagger";
import { ProjectStatus } from "@repo/db";
import { IsEnum, IsOptional } from "class-validator";
import { PaginatedQueryDto } from "src/common/dto/paginated-query.dto";

export class QueryProjectsDto extends PaginatedQueryDto {
	@ApiPropertyOptional({ enum: ProjectStatus })
	@IsOptional()
	@IsEnum(ProjectStatus)
	projectStatus?: ProjectStatus;
}
