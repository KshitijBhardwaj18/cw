import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export const VENDOR_DOCUMENT_WALLET_STATUS_VALUES = [
	"COMPLETE",
	"IN_PROGRESS",
	"CRITICAL",
] as const;
export type QueryVendorDocumentWalletStatus =
	(typeof VENDOR_DOCUMENT_WALLET_STATUS_VALUES)[number];

export class QueryVendorDocumentWalletsDto {
	@ApiPropertyOptional({ minimum: 1, default: 1 })
	@IsOptional()
	@Transform(({ value }) =>
		value === undefined || value === "" ? 1 : Number(value),
	)
	@IsInt()
	@Min(1)
	page?: number;

	@ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
	@IsOptional()
	@Transform(({ value }) =>
		value === undefined || value === "" ? 20 : Number(value),
	)
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number;

	@ApiPropertyOptional({ description: "Search name, email, or specialty" })
	@IsOptional()
	@IsString()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	search?: string;

	@ApiPropertyOptional({ enum: VENDOR_DOCUMENT_WALLET_STATUS_VALUES })
	@IsOptional()
	@IsIn(VENDOR_DOCUMENT_WALLET_STATUS_VALUES)
	status?: QueryVendorDocumentWalletStatus;
}
