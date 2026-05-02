import { getDeterministicId, SEED_PREFIX } from "../utils";

export enum PayCode {
	REG = "REG",
	TRAIN = "TRAIN",
	OT = "OT",
	DT = "DT",
	PTO = "PTO",
	HOL = "HOL",
	SICK = "SICK",
	BEREAVE = "BEREAVE",
	JURY = "JURY",
	ONCALL = "ONCALL",
}

export const getPayCodesDataset = (organizationId: string) => {
	const payCodes = [
		{
			id: getDeterministicId(`${SEED_PREFIX}paycode-reg`),
			organizationId,
			code: PayCode.REG,
			category: "Standard Time",
			description: "Regular hours worked during standard shift",
			multiplier: 1.0,
			isActive: true,
		},
		{
			id: getDeterministicId(`${SEED_PREFIX}paycode-train`),
			organizationId,
			code: PayCode.TRAIN,
			category: "Standard Time",
			description: "Paid training time",
			multiplier: 1.0,
			isActive: true,
		},
		{
			id: getDeterministicId(`${SEED_PREFIX}paycode-ot`),
			organizationId,
			code: PayCode.OT,
			category: "Overtime",
			description: "Overtime hours (over 40 hours per week)",
			multiplier: 1.5,
			isActive: true,
		},
		{
			id: getDeterministicId(`${SEED_PREFIX}paycode-dt`),
			organizationId,
			code: PayCode.DT,
			category: "Overtime",
			description:
				"Double time hours (over 12 hours in a day or 7th consecutive day)",
			multiplier: 2.0,
			isActive: true,
		},
		{
			id: getDeterministicId(`${SEED_PREFIX}paycode-pto`),
			organizationId,
			code: PayCode.PTO,
			category: "Paid Leave",
			description: "Paid time off",
			multiplier: 1.0,
			isActive: true,
		},
		{
			id: getDeterministicId(`${SEED_PREFIX}paycode-hol`),
			organizationId,
			code: PayCode.HOL,
			category: "Paid Leave",
			description: "Holiday pay",
			multiplier: 1.0,
			isActive: true,
		},
		{
			id: getDeterministicId(`${SEED_PREFIX}paycode-sick`),
			organizationId,
			code: PayCode.SICK,
			category: "Paid Leave",
			description: "Sick leave",
			multiplier: 1.0,
			isActive: true,
		},
		{
			id: getDeterministicId(`${SEED_PREFIX}paycode-bereave`),
			organizationId,
			code: PayCode.BEREAVE,
			category: "Paid Leave",
			description: "Bereavement leave",
			multiplier: 1.0,
			isActive: true,
		},
		{
			id: getDeterministicId(`${SEED_PREFIX}paycode-jury`),
			organizationId,
			code: PayCode.JURY,
			category: "Paid Leave",
			description: "Jury duty leave",
			multiplier: 1.0,
			isActive: true,
		},
		{
			id: getDeterministicId(`${SEED_PREFIX}paycode-oncall`),
			organizationId,
			code: PayCode.ONCALL,
			category: "Special Pay",
			description: "On-call availability pay",
			multiplier: 1.0,
			isActive: true,
		},
	];

	return payCodes;
};
