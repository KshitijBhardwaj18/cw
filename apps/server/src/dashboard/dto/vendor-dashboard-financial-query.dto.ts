import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional } from "class-validator";

export const FINANCIAL_PERIODS = [
	"this-week",
	"this-month",
	"this-quarter",
] as const;

export type FinancialPeriod = (typeof FINANCIAL_PERIODS)[number];

export class VendorDashboardFinancialQueryDto {
	@ApiPropertyOptional({
		enum: FINANCIAL_PERIODS,
		description: "Filter invoices by invoice date within the given period",
	})
	@IsOptional()
	@IsIn(FINANCIAL_PERIODS)
	period?: FinancialPeriod;
}
