import { ShiftType } from "@repo/db";
import { getDeterministicId, SEED_PREFIX } from "../utils";
import { DEPT_ID } from "./departments";
import { LOCATION_ID } from "./locations";
import type { OccupationAcronym } from "./occupations";
import { USER_ID } from "./users";

export const SHIFT_TEMPLATE_ID = {
	ICU_DAY: getDeterministicId(`${SEED_PREFIX}shift-template-icu-day`),
	EMERGENCY_NIGHT: getDeterministicId(
		`${SEED_PREFIX}shift-template-emergency-night`,
	),
	REHAB_DAY: getDeterministicId(`${SEED_PREFIX}shift-template-rehab-day`),
	MEDSURG_EVENING: getDeterministicId(
		`${SEED_PREFIX}shift-template-medsurg-evening`,
	),
	ICU_NIGHT: getDeterministicId(`${SEED_PREFIX}shift-template-icu-night`),
} as const;

export const getShiftTemplatesDataset = (
	orgId: string,
): {
	id: string;
	organizationId: string;
	templateName: string;
	occupationAcronym: OccupationAcronym;
	departmentId: string;
	locationId: string;
	shiftType: ShiftType;
	durationHours: number;
	baseRate: number;
	baseBillRate?: number;
	vendorRateMarkupPercent?: number;
	createdById: string;
}[] => {
	return [
		{
			id: SHIFT_TEMPLATE_ID.ICU_DAY,
			organizationId: orgId,
			templateName: "ICU Day Shift - RN",
			occupationAcronym: "RN",
			departmentId: DEPT_ID.ICU,
			locationId: LOCATION_ID.MAIN,
			shiftType: ShiftType.DAYS,
			durationHours: 12,
			baseRate: 85,
			baseBillRate: 0,
			vendorRateMarkupPercent: 10,
			createdById: USER_ID.ALICE,
		},
		{
			id: SHIFT_TEMPLATE_ID.EMERGENCY_NIGHT,
			organizationId: orgId,
			templateName: "Emergency Night Shift - RN",
			occupationAcronym: "RN",
			departmentId: DEPT_ID.ED,
			locationId: LOCATION_ID.MAIN,
			shiftType: ShiftType.NIGHTS,
			durationHours: 12,
			baseRate: 95,
			baseBillRate: 0,
			vendorRateMarkupPercent: 20,
			createdById: USER_ID.BOB,
		},
		{
			id: SHIFT_TEMPLATE_ID.REHAB_DAY,
			organizationId: orgId,
			templateName: "Rehabilitation Day - PT",
			occupationAcronym: "PT",
			departmentId: DEPT_ID.REHAB,
			locationId: LOCATION_ID.MAIN,
			shiftType: ShiftType.DAYS,
			durationHours: 8,
			baseRate: 75,
			baseBillRate: 0,
			vendorRateMarkupPercent: 20,
			createdById: USER_ID.DAVID_J,
		},
		{
			id: SHIFT_TEMPLATE_ID.MEDSURG_EVENING,
			organizationId: orgId,
			templateName: "Med-Surg Evening - LPN",
			occupationAcronym: "LPN",
			departmentId: DEPT_ID.MEDSURG,
			locationId: LOCATION_ID.MAIN,
			shiftType: ShiftType.EVENINGS,
			durationHours: 8,
			baseRate: 62,
			baseBillRate: 0,
			vendorRateMarkupPercent: 12,
			createdById: USER_ID.CAROL,
		},
		{
			id: SHIFT_TEMPLATE_ID.ICU_NIGHT,
			organizationId: orgId,
			templateName: "ICU Night Shift - RN",
			occupationAcronym: "RN",
			departmentId: DEPT_ID.ICU,
			locationId: LOCATION_ID.MAIN,
			shiftType: ShiftType.NIGHTS,
			durationHours: 12,
			baseRate: 92,
			baseBillRate: 0,
			vendorRateMarkupPercent: 15,
			createdById: USER_ID.ALICE,
		},
	];
};
