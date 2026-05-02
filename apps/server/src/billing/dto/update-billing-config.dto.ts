import {
	BILLING_CURRENCIES,
	BILLING_CYCLE_START_DAYS,
	BILLING_FREQUENCIES,
	INVOICE_GROUPING_METHODS,
	PAYMENT_TERMS,
} from "@repo/shared";
import { Type } from "class-transformer";
import {
	IsBoolean,
	IsIn,
	IsNumber,
	IsOptional,
	IsString,
} from "class-validator";

export class UpdateBillingConfigDto {
	// Contact info
	@IsOptional()
	@IsString()
	contactName?: string;

	@IsOptional()
	@IsString()
	contactEmail?: string;

	@IsOptional()
	@IsString()
	contactPhone?: string;

	// Billing address
	@IsOptional()
	@IsString()
	billingStreet?: string;

	@IsOptional()
	@IsString()
	billingCity?: string;

	@IsOptional()
	@IsString()
	billingState?: string;

	@IsOptional()
	@IsString()
	billingZip?: string;

	// Remittance address
	@IsOptional()
	@IsString()
	remittanceStreet?: string;

	@IsOptional()
	@IsString()
	remittanceCity?: string;

	@IsOptional()
	@IsString()
	remittanceState?: string;

	@IsOptional()
	@IsString()
	remittanceZip?: string;

	// Invoice preferences
	@IsOptional()
	@IsIn(PAYMENT_TERMS)
	paymentTerms?: string;

	@IsOptional()
	@IsIn(BILLING_FREQUENCIES)
	billingFrequency?: string;

	@IsOptional()
	@IsIn(INVOICE_GROUPING_METHODS)
	invoiceGrouping?: string;

	@IsOptional()
	@IsIn(BILLING_CURRENCIES)
	currency?: string;

	@IsOptional()
	@IsIn(BILLING_CYCLE_START_DAYS)
	cycleStartDay?: string;

	@IsOptional()
	@IsString()
	invoiceFormat?: string;

	@IsOptional()
	@IsBoolean()
	invoiceDeliveryEmail?: boolean;

	@IsOptional()
	@IsBoolean()
	invoiceDeliverySftp?: boolean;

	@IsOptional()
	@IsBoolean()
	invoiceDeliveryDownload?: boolean;

	// Timekeeping rules
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	otThreshold?: number;

	@IsOptional()
	@IsBoolean()
	timesheetApproval?: boolean;

	@IsOptional()
	@IsBoolean()
	mobileEntry?: boolean;

	@IsOptional()
	@IsBoolean()
	fileUpload?: boolean;

	@IsOptional()
	@IsBoolean()
	disputeTracking?: boolean;

	// Fee structure
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	mspPercent?: number;

	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	saasPercent?: number;

	@IsOptional()
	@IsString()
	markupType?: string;

	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	markupValue?: number;
}
