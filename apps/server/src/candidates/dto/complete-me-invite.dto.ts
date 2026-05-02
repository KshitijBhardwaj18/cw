import { IsArray, IsOptional, IsUUID } from "class-validator";

export class CompleteMeInviteDto {
	@IsOptional()
	@IsArray()
	@IsUUID("4", { each: true })
	locationIds?: string[];
}
