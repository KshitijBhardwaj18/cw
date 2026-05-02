import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, ValidateNested } from "class-validator";
import { CreateProgramUserDto } from "./program-user.dto";

export class CreateBulkProgramUsersDto {
	@ApiProperty({ type: [CreateProgramUserDto] })
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CreateProgramUserDto)
	users: CreateProgramUserDto[];
}
