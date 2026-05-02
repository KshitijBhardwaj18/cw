import { CandidateWorkforceType, WorkforceBillingFeeType } from "@repo/db";
import { getDeterministicId, SEED_PREFIX } from "../utils";

export const BILLING_CONFIG_ID = getDeterministicId(
	`${SEED_PREFIX}billing-config`,
);

export const getBillingConfigDataset = (organizationId: string) => {
	return {
		id: BILLING_CONFIG_ID,
		organizationId,
		clientBillingId: "ORG-BIL-2026-001",
		contactName: "Sarah Johnson",
		contactEmail: "billing@healthcarecorp.com",
		contactPhone: "+1 (555) 123-4567",
		billingStreet: "123 Healthcare Plaza",
		billingCity: "San Francisco",
		billingState: "CA",
		billingZip: "94102",
		remittanceStreet: "PO Box 9876",
		remittanceCity: "San Francisco",
		remittanceState: "CA",
		remittanceZip: "94103",
		mspPercent: 10.0,
		saasPercent: 5.0,
		otThreshold: 40.0,
		timesheetApproval: true,
		mobileEntry: true,
		disputeTracking: true,
		paymentTerms: "Net 30",
		invoiceDeliveryEmail: true,
		invoiceGrouping: "By Requisition",
		currency: "USD",
		billingFrequency: "Monthly",
		cycleStartDay: "Monday",
	};
};

export const BILLING_RATE_ID = {
	INTERNAL_FT: getDeterministicId(`${SEED_PREFIX}rate-internal-ft`),
	INTERNAL_PT: getDeterministicId(`${SEED_PREFIX}rate-internal-pt`),
	INTERNAL_PRN: getDeterministicId(`${SEED_PREFIX}rate-internal-prn`),
	EXTERNAL_1099: getDeterministicId(`${SEED_PREFIX}rate-external-1099`),
	EXTERNAL_EOR: getDeterministicId(`${SEED_PREFIX}rate-external-eor`),
	VENDOR_PER_DIEM: getDeterministicId(`${SEED_PREFIX}rate-vendor-per-diem`),
	VENDOR_LTO: getDeterministicId(`${SEED_PREFIX}rate-vendor-lto`),
} as const;

export const getWorkforceBillingRatesDataset = (organizationId: string) => {
	return [
		{
			id: BILLING_RATE_ID.INTERNAL_FT,
			organizationId,
			workforceType: CandidateWorkforceType.INTERNAL_FULL_TIME,
			techFee: 6.0,
			feeType: WorkforceBillingFeeType.HOUR,
			isActive: true,
		},
		{
			id: BILLING_RATE_ID.INTERNAL_PT,
			organizationId,
			workforceType: CandidateWorkforceType.INTERNAL_PART_TIME,
			techFee: 4.5,
			feeType: WorkforceBillingFeeType.HOUR,
			isActive: true,
		},
		{
			id: BILLING_RATE_ID.INTERNAL_PRN,
			organizationId,
			workforceType: CandidateWorkforceType.INTERNAL_PRN,
			techFee: 0.0,
			feeType: WorkforceBillingFeeType.HOUR,
			isActive: false,
		},
		{
			id: BILLING_RATE_ID.EXTERNAL_1099,
			organizationId,
			workforceType: CandidateWorkforceType.EXTERNAL_1099,
			techFee: 8.0,
			feeType: WorkforceBillingFeeType.HOUR,
			isActive: true,
		},
		{
			id: BILLING_RATE_ID.EXTERNAL_EOR,
			organizationId,
			workforceType: CandidateWorkforceType.EXTERNAL_EOR,
			techFee: 7.5,
			feeType: WorkforceBillingFeeType.HOUR,
			isActive: true,
		},
		{
			id: BILLING_RATE_ID.VENDOR_PER_DIEM,
			organizationId,
			workforceType: CandidateWorkforceType.EXTERNAL_VENDOR_PER_DIEM,
			techFee: 75.0,
			feeType: WorkforceBillingFeeType.SHIFT,
			isActive: true,
		},
		{
			id: BILLING_RATE_ID.VENDOR_LTO,
			organizationId,
			workforceType: CandidateWorkforceType.EXTERNAL_VENDOR_LTO,
			techFee: 6.0,
			feeType: WorkforceBillingFeeType.HOUR,
			isActive: true,
		},
	];
};
