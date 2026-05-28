import type { PerDiemShiftStatus, ShiftType } from "@repo/db";
import { getDeterministicId, SEED_PREFIX } from "../utils";
import { CANDIDATE_ID } from "./candidates";
import { DEPT_ID } from "./departments";
import { LOCATION_ID } from "./locations";
import { OCCUPATION_ID } from "./occupations";
import { SHIFT_TEMPLATE_ID } from "./shift-templates";
import { SPECIALTY_ID } from "./specialties";
import { VENDOR_ID } from "./vendors";

export const SHIFT_ID = {
	ICU_DAY: getDeterministicId(`${SEED_PREFIX}shift-icu-day`),
	EMERGENCY_NIGHT: getDeterministicId(`${SEED_PREFIX}shift-emergency-night`),
	REHAB_DAY: getDeterministicId(`${SEED_PREFIX}shift-rehab-day`),
	MEDSURG_EVENING: getDeterministicId(`${SEED_PREFIX}shift-medsurg-evening`),
	ICU_NIGHT_CONFLICT: getDeterministicId(
		`${SEED_PREFIX}shift-icu-night-conflict`,
	),
} as const;

export interface SeedShiftData {
	id: string;
	organizationId: string;
	shiftTemplateId: string;
	shiftNumber: string;
	shiftDate: Date;
	startTime: string;
	endTime: string;
	totalShiftHours: number;
	shiftType: ShiftType;
	occupationId: string;
	specialtyIds: string[];
	departmentId: string;
	locationId: string;
	shiftRate: number;
	vendorRate: number;
	totalCost: number;
	status: PerDiemShiftStatus;
	isUrgent?: boolean;
	assignments?: {
		candidateId: string;
		vendorId: string;
		status: string;
		assignedAt: Date;
	}[];
}

export const getShiftsDataset = (orgId: string): SeedShiftData[] => {
	const shifts: SeedShiftData[] = [];
	const now = new Date();
	const todayStart = new Date(now);
	todayStart.setUTCHours(0, 0, 0, 0);

	const locations = [
		{ id: LOCATION_ID.MAIN, name: "Main Campus" },
		{ id: LOCATION_ID.DOWNTOWN, name: "Downtown Clinic" },
		{ id: LOCATION_ID.URGENT, name: "Nova Urgent Care" },
		{ id: LOCATION_ID.REHAB, name: "Nova Rehabilitation Center" },
	];

	const templates = [
		{
			id: SHIFT_TEMPLATE_ID.ICU_DAY,
			name: "ICU Day Shift",
			occId: OCCUPATION_ID.RN,
			deptId: DEPT_ID.ICU,
			type: "DAY" as ShiftType,
			hours: 12,
			rate: 85,
		},
		{
			id: SHIFT_TEMPLATE_ID.EMERGENCY_NIGHT,
			name: "ER Night Shift",
			occId: OCCUPATION_ID.RN,
			deptId: DEPT_ID.ED,
			type: "NIGHT" as ShiftType,
			hours: 12,
			rate: 95,
		},
		{
			id: SHIFT_TEMPLATE_ID.REHAB_DAY,
			name: "Rehab Day Shift",
			occId: OCCUPATION_ID.PT,
			deptId: DEPT_ID.REHAB,
			type: "DAY" as ShiftType,
			hours: 8,
			rate: 75,
		},
		{
			id: SHIFT_TEMPLATE_ID.MEDSURG_EVENING,
			name: "Med-Surg Evening",
			occId: OCCUPATION_ID.LPN,
			deptId: DEPT_ID.MEDSURG,
			type: "FLEXIBLE" as ShiftType,
			hours: 8,
			rate: 62,
		},
	];

	const candidates = [
		{ id: CANDIDATE_ID.SARAH_P, vendorId: VENDOR_ID.GLOBAL },
		{ id: CANDIDATE_ID.MARCUS_V, vendorId: VENDOR_ID.GLOBAL },
		{ id: CANDIDATE_ID.EMILY, vendorId: VENDOR_ID.ALLIED },
		{ id: CANDIDATE_ID.JENNIFER, vendorId: VENDOR_ID.ELITE },
	];

	let shiftCounter = 1000;

	for (let i = 0; i < 2; i++) {
		shiftCounter++;
		const template = templates[i % templates.length];
		const location = locations[i % locations.length];
		const candidate = candidates[i % candidates.length];
		const shiftDate = new Date(todayStart);
		shiftDate.setUTCDate(todayStart.getUTCDate() - 1);

		shifts.push({
			id: getDeterministicId(`${SEED_PREFIX}shift-past-${i}`),
			organizationId: orgId,
			shiftTemplateId: template.id,
			shiftNumber: `SFT-${shiftCounter}`,
			shiftDate,
			startTime: "07:00",
			endTime: "19:00",
			totalShiftHours: template.hours,
			shiftType: template.type,
			occupationId: template.occId,
			specialtyIds: [SPECIALTY_ID.GEN],
			departmentId: template.deptId,
			locationId: location.id,
			shiftRate: template.rate,
			vendorRate: template.rate - 5,
			totalCost: template.hours * template.rate,
			status: "COMPLETED",
			isUrgent: i === 1,
			assignments: [
				{
					candidateId: candidate.id,
					vendorId: candidate.vendorId,
					status: "assigned",
					assignedAt: new Date(shiftDate.getTime() - 2 * 24 * 60 * 60 * 1000),
				},
			],
		});
	}

	for (let d = 0; d < 3; d++) {
		const shiftDate = new Date(todayStart);
		shiftDate.setUTCDate(todayStart.getUTCDate() + d);

		for (let i = 0; i < 4; i++) {
			shiftCounter++;
			const template = templates[(d * 4 + i) % templates.length];
			const location = locations[(d * 4 + i) % locations.length];
			const status = i < 2 ? "OPEN" : "IN_PROGRESS";
			const isUrgent = i % 2 === 1;

			const shift: SeedShiftData = {
				id: getDeterministicId(`${SEED_PREFIX}shift-auto-${d}-${i}`),
				organizationId: orgId,
				shiftTemplateId: template.id,
				shiftNumber: `SFT-${shiftCounter}`,
				shiftDate,
				startTime: template.type === "NIGHT" ? "19:00" : "07:00",
				endTime: template.type === "NIGHT" ? "07:00" : "19:00",
				totalShiftHours: template.hours,
				shiftType: template.type,
				occupationId: template.occId,
				specialtyIds: [SPECIALTY_ID.GEN],
				departmentId: template.deptId,
				locationId: location.id,
				shiftRate: template.rate,
				vendorRate: template.rate - 5,
				totalCost: template.hours * template.rate,
				status: status as PerDiemShiftStatus,
				isUrgent,
			};

			if (status === "IN_PROGRESS") {
				const candidate = candidates[(d * 4 + i) % candidates.length];
				shift.assignments = [
					{
						candidateId: candidate.id,
						vendorId: candidate.vendorId,
						status: "assigned",
						assignedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
					},
				];
			}

			shifts.push(shift);
		}
	}

	return shifts;
};
