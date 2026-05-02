import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { ArrayMaxSize, IsArray, IsOptional, IsUUID } from "class-validator";

export class SubmitVendorTimekeepingDto {
	@ApiPropertyOptional({
		description:
			"Submit these draft entries to the organization. Omit to submit all drafts for this vendor.",
		type: [String],
	})
	@IsOptional()
	@IsArray()
	@ArrayMaxSize(500)
	@IsUUID("4", { each: true })
	@Transform(({ value }) => (Array.isArray(value) ? value : undefined))
	entryIds?: string[];
}
