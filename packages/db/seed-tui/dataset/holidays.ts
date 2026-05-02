import { getDeterministicId, SEED_PREFIX } from "../utils";

export const HOLIDAY_ID = {
	NY: getDeterministicId(`${SEED_PREFIX}holiday-ny`),
	MLK: getDeterministicId(`${SEED_PREFIX}holiday-mlk`),
	PRES: getDeterministicId(`${SEED_PREFIX}holiday-pres`),
	MEM: getDeterministicId(`${SEED_PREFIX}holiday-mem`),
	JUNE: getDeterministicId(`${SEED_PREFIX}holiday-june`),
	IND: getDeterministicId(`${SEED_PREFIX}holiday-ind`),
	LAB: getDeterministicId(`${SEED_PREFIX}holiday-lab`),
	COL: getDeterministicId(`${SEED_PREFIX}holiday-col`),
	VET: getDeterministicId(`${SEED_PREFIX}holiday-vet`),
	THA: getDeterministicId(`${SEED_PREFIX}holiday-tha`),
	DAT: getDeterministicId(`${SEED_PREFIX}holiday-dat`),
	CEVE: getDeterministicId(`${SEED_PREFIX}holiday-ceve`),
	CHR: getDeterministicId(`${SEED_PREFIX}holiday-chr`),
	NYEVE: getDeterministicId(`${SEED_PREFIX}holiday-nyeve`),
} as const;

export const getHolidaysDataset = (organizationId: string) => {
	const holidays = [
		{
			id: HOLIDAY_ID.NY,
			organizationId,
			name: "New Year's Day",
			observedOn: new Date("2026-01-01"),
			holidayType: "Federal Holiday",
		},
		{
			id: HOLIDAY_ID.MLK,
			organizationId,
			name: "Martin Luther King Jr. Day",
			observedOn: new Date("2026-01-19"),
			holidayType: "Federal Holiday",
		},
		{
			id: HOLIDAY_ID.PRES,
			organizationId,
			name: "Presidents' Day",
			observedOn: new Date("2026-02-16"),
			holidayType: "Federal Holiday",
		},
		{
			id: HOLIDAY_ID.MEM,
			organizationId,
			name: "Memorial Day",
			observedOn: new Date("2026-05-25"),
			holidayType: "Federal Holiday",
		},
		{
			id: HOLIDAY_ID.JUNE,
			organizationId,
			name: "Juneteenth",
			observedOn: new Date("2026-06-19"),
			holidayType: "Federal Holiday",
		},
		{
			id: HOLIDAY_ID.IND,
			organizationId,
			name: "Independence Day",
			observedOn: new Date("2026-07-04"),
			holidayType: "Federal Holiday",
		},
		{
			id: HOLIDAY_ID.LAB,
			organizationId,
			name: "Labor Day",
			observedOn: new Date("2026-09-07"),
			holidayType: "Federal Holiday",
		},
		{
			id: HOLIDAY_ID.COL,
			organizationId,
			name: "Columbus Day",
			observedOn: new Date("2026-10-12"),
			holidayType: "Federal Holiday",
		},
		{
			id: HOLIDAY_ID.VET,
			organizationId,
			name: "Veterans Day",
			observedOn: new Date("2026-11-11"),
			holidayType: "Federal Holiday",
		},
		{
			id: HOLIDAY_ID.THA,
			organizationId,
			name: "Thanksgiving Day",
			observedOn: new Date("2026-11-26"),
			holidayType: "Federal Holiday",
		},
		{
			id: HOLIDAY_ID.DAT,
			organizationId,
			name: "Day After Thanksgiving",
			observedOn: new Date("2026-11-27"),
			holidayType: "Organization Holiday",
		},
		{
			id: HOLIDAY_ID.CEVE,
			organizationId,
			name: "Christmas Eve",
			observedOn: new Date("2026-12-24"),
			holidayType: "Organization Holiday",
		},
		{
			id: HOLIDAY_ID.CHR,
			organizationId,
			name: "Christmas Day",
			observedOn: new Date("2026-12-25"),
			holidayType: "Federal Holiday",
		},
		{
			id: HOLIDAY_ID.NYEVE,
			organizationId,
			name: "New Year's Eve",
			observedOn: new Date("2026-12-31"),
			holidayType: "Organization Holiday",
		},
	];

	return holidays;
};
