export enum WorkforceBillingFeeType {
	HOUR = "HOUR",
	SHIFT = "SHIFT",
}

export const WORKFORCE_BILLING_FEE_TYPE_OPTIONS = [
	{ value: WorkforceBillingFeeType.HOUR, label: "Per Hour" },
	{ value: WorkforceBillingFeeType.SHIFT, label: "Per Shift" },
] as const satisfies readonly {
	value: WorkforceBillingFeeType;
	label: string;
}[];
