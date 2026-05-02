import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
	IsIn,
	IsInt,
	IsOptional,
	IsString,
	IsUUID,
	Max,
	Min,
} from "class-validator";

export type CredentialStatusFilter = "EXPIRING_SOON" | "EXPIRED" | "CRITICAL";

export class QueryCredentialsDto {
	@ApiPropertyOptional({
		description: "Search worker name, credential, or job",
	})
	@IsOptional()
	@IsString()
	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() || undefined : value,
	)
	search?: string;

	@ApiPropertyOptional({ enum: ["EXPIRING_SOON", "EXPIRED", "CRITICAL"] })
	@IsOptional()
	@IsIn(["EXPIRING_SOON", "EXPIRED", "CRITICAL"])
	status?: CredentialStatusFilter;

	@ApiPropertyOptional({ description: "Location UUID" })
	@IsOptional()
	@IsUUID()
	locationId?: string;

	@ApiPropertyOptional({ description: "Department UUID" })
	@IsOptional()
	@IsUUID()
	departmentId?: string;

	@ApiPropertyOptional({ description: "Vendor UUID" })
	@IsOptional()
	@IsUUID()
	vendorId?: string;

	@ApiPropertyOptional({ description: "Hiring manager User UUID" })
	@IsOptional()
	@IsUUID()
	hiringManagerId?: string;

	@ApiPropertyOptional({ default: 1, minimum: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number;

	@ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number;
}
