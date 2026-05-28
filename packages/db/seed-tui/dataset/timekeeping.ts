import { TimeEntryDataSource, TimesheetEntryStatus } from "@repo/db";
import { getDeterministicId, SEED_PREFIX } from "../utils";
import { CANDIDATE_ID } from "./candidates";
import { DEPT_ID } from "./departments";
import { LOCATION_ID } from "./locations";
import { PayCode } from "./pay-codes";
import { PLACEMENT_ID } from "./placements";
import { USER_ID } from "./users";

export const TIMESHEET_ID = {
	JAMES_0315: getDeterministicId(`${SEED_PREFIX}ts-james-0315`),
	SARAH_0315: getDeterministicId(`${SEED_PREFIX}ts-sarah-0315`),
	ELENA_0315: getDeterministicId(`${SEED_PREFIX}ts-elena-0315`),
	ELENA_0301: getDeterministicId(`${SEED_PREFIX}ts-elena-0301`),
	MARCUS_0315: getDeterministicId(`${SEED_PREFIX}ts-marcus-0315`),
	ISABELLE_0315: getDeterministicId(`${SEED_PREFIX}ts-isabelle-0315`),
} as const;

export const DISPUTE_ID = {
	ELENA_0315: getDeterministicId(`${SEED_PREFIX}dis-elena-0315`),
} as const;

export const TIMEKEEPING_SUMMARY_ID = getDeterministicId(
	`${SEED_PREFIX}timekeeping-summary`,
);

export interface TimesheetEntryData {
	date: string;
	hours: number;
	clockIn: string;
	clockOut: string;
	breakMinutes: number;
	dataSource: TimeEntryDataSource;
	payCode: PayCode;
	overtimeHours?: number;
}

export interface TimesheetData {
	id: string;
	organizationId: string;
	placementId: string;
	candidateId: string;
	locationId: string;
	departmentId: string;
	weekEndingDate: Date;
	status: TimesheetEntryStatus;
	entries: TimesheetEntryData[];
	dispute?: {
		id: string;
		entryIdIndex: number;
		description: string;
		raisedByUserId: string;
		status?: "OPEN" | "RESOLVED" | "REJECTED";
		payCode?: PayCode;
		resolution?: string;
		resolutionCategory?: string;
		resolvedAt?: Date;
		resolvedById?: string;
	};
}

const DISPUTE_REASONS = [
	"Missing break deduction adjustment required.",
	"Clock-in time mismatch with facility logs.",
	"Overtime hours not correctly captured.",
	"Incorrect pay code applied for holiday shift.",
	"Shift duration discrepancy reported by supervisor.",
	"Unapproved early clock-out adjustment.",
];

const RAISING_USERS = [USER_ID.QUINN, USER_ID.ALICE, USER_ID.BOB_J];

const generateHistory = (organizationId: string): TimesheetData[] => {
	const history: TimesheetData[] = [];
	const workers = [
		{
			id: CANDIDATE_ID.SARAH,
			placementId: PLACEMENT_ID.SARAH,
			deptId: DEPT_ID.PEDS,
			locId: LOCATION_ID.URGENT,
			baseShift: { in: "07:00 AM", out: "03:30 PM", break: 30 },
		},
		{
			id: CANDIDATE_ID.JAMES,
			placementId: PLACEMENT_ID.JAMES,
			deptId: DEPT_ID.ONCO,
			locId: LOCATION_ID.MAIN,
			baseShift: { in: "07:00 PM", out: "07:30 AM", break: 30 },
		},
		{
			id: CANDIDATE_ID.ELENA,
			placementId: PLACEMENT_ID.ELENA,
			deptId: DEPT_ID.CARDIO,
			locId: LOCATION_ID.MAIN,
			baseShift: { in: "08:00 AM", out: "04:30 PM", break: 30 },
		},
		{
			id: CANDIDATE_ID.MARCUS,
			placementId: PLACEMENT_ID.MARCUS,
			deptId: DEPT_ID.ED,
			locId: LOCATION_ID.URGENT,
			baseShift: { in: "11:00 AM", out: "07:30 PM", break: 30 },
		},
		{
			id: CANDIDATE_ID.ISABELLE,
			placementId: PLACEMENT_ID.ISABELLE,
			deptId: DEPT_ID.ICU,
			locId: LOCATION_ID.MAIN,
			baseShift: { in: "06:00 AM", out: "02:30 PM", break: 30 },
		},
		{
			id: CANDIDATE_ID.JENNIFER,
			placementId: PLACEMENT_ID.JENNIFER,
			deptId: DEPT_ID.LAB,
			locId: LOCATION_ID.DOWNTOWN,
			baseShift: { in: "09:00 AM", out: "05:30 PM", break: 30 },
		},
		{
			id: CANDIDATE_ID.EMILY,
			placementId: PLACEMENT_ID.EMILY,
			deptId: DEPT_ID.REHAB,
			locId: LOCATION_ID.REHAB,
			baseShift: { in: "08:30 AM", out: "05:00 PM", break: 30 },
		},
		{
			id: CANDIDATE_ID.MARCUS_V,
			placementId: PLACEMENT_ID.QUINN_MARCUS_V,
			deptId: DEPT_ID.ICU,
			locId: LOCATION_ID.MAIN,
			baseShift: { in: "07:00 PM", out: "07:30 AM", break: 30 },
		},
		{
			id: CANDIDATE_ID.SARAH_P,
			placementId: PLACEMENT_ID.QUINN_SARAH_P,
			deptId: DEPT_ID.ED,
			locId: LOCATION_ID.URGENT,
			baseShift: { in: "07:00 AM", out: "07:30 PM", break: 30 },
		},
		{
			id: CANDIDATE_ID.DAVID_L,
			placementId: PLACEMENT_ID.QUINN_DAVID_L,
			deptId: DEPT_ID.REHAB,
			locId: LOCATION_ID.MAIN,
			baseShift: { in: "08:00 AM", out: "04:30 PM", break: 30 },
		},
	];

	const now = new Date();
	for (let i = 1; i <= 4; i++) {
		const weekEnding = new Date(now);
		weekEnding.setDate(now.getDate() - i * 7);

		let status: TimesheetEntryStatus = TimesheetEntryStatus.APPROVED;
		if (i === 1) status = TimesheetEntryStatus.PENDING;
		if (i === 2) status = TimesheetEntryStatus.DISPUTED;

		workers.forEach((worker, workerIdx) => {
			const invoiceNum = `HIST-${weekEnding.getFullYear()}-${(weekEnding.getMonth() + 1).toString().padStart(2, "0")}-${worker.id.slice(0, 4)}-${i}`;
			const timesheetId = getDeterministicId(
				`${SEED_PREFIX}ts-hist-${invoiceNum}`,
			);

			const dataSource =
				workerIdx % 2 === 0
					? TimeEntryDataSource.MOBILE_APP
					: TimeEntryDataSource.FILE_UPLOAD;

			const entries: TimesheetEntryData[] = [];
			for (let d = 0; d < 5; d++) {
				const entryDate = new Date(weekEnding);
				entryDate.setDate(weekEnding.getDate() - (4 - d));

				const dayVariation = d % 3 === 0 ? 0.5 : d % 3 === 1 ? -0.5 : 0;
				const currentHours = 8 + dayVariation;

				entries.push({
					date: entryDate.toISOString().split("T")[0],
					clockIn: worker.baseShift.in,
					clockOut: worker.baseShift.out,
					hours: currentHours,
					breakMinutes: worker.baseShift.break + (d === 2 ? 15 : 0),
					dataSource,
					payCode: d === 4 && i === 2 ? PayCode.OT : PayCode.REG,
				});
			}

			let dispute: TimesheetData["dispute"];
			if (status === TimesheetEntryStatus.DISPUTED) {
				const combined = i + workerIdx;
				const disputeStatus =
					combined % 3 === 0
						? "RESOLVED"
						: combined % 3 === 1
							? "REJECTED"
							: "OPEN";
				dispute = {
					id: getDeterministicId(`${SEED_PREFIX}dis-hist-${invoiceNum}`),
					entryIdIndex: workerIdx % 5,
					description: DISPUTE_REASONS[combined % DISPUTE_REASONS.length],
					raisedByUserId: RAISING_USERS[combined % RAISING_USERS.length],
					status: disputeStatus as "OPEN" | "RESOLVED" | "REJECTED",
					payCode: combined % 4 === 0 ? PayCode.OT : PayCode.REG,
					resolution:
						disputeStatus === "OPEN"
							? undefined
							: "Seeded historical resolution.",
					resolutionCategory:
						disputeStatus === "REJECTED"
							? "REJECTED"
							: disputeStatus === "RESOLVED"
								? "ADJUSTMENT"
								: undefined,
					resolvedAt: disputeStatus === "OPEN" ? undefined : weekEnding,
					resolvedById:
						disputeStatus === "OPEN"
							? undefined
							: RAISING_USERS[(combined + 1) % RAISING_USERS.length],
				};
			}

			history.push({
				id: timesheetId,
				organizationId,
				placementId: worker.placementId,
				candidateId: worker.id,
				locationId: worker.locId,
				departmentId: worker.deptId,
				weekEndingDate: weekEnding,
				status,
				entries,
				dispute,
			});
		});
	}
	return history;
};

export const getTimekeepingDataset = (organizationId: string) => {
	const history = generateHistory(organizationId);
	const weekEnding = history[0].weekEndingDate;

	const currentTimesheets: TimesheetData[] = [
		{
			id: TIMESHEET_ID.SARAH_0315,
			organizationId,
			placementId: PLACEMENT_ID.SARAH,
			candidateId: CANDIDATE_ID.SARAH,
			locationId: LOCATION_ID.URGENT,
			departmentId: DEPT_ID.PEDS,
			weekEndingDate: weekEnding,
			status: TimesheetEntryStatus.APPROVED,
			entries: [
				{
					date: "2026-03-09",
					clockIn: "07:05 AM",
					clockOut: "03:35 PM",
					hours: 8,
					breakMinutes: 30,
					dataSource: TimeEntryDataSource.MOBILE_APP,
					payCode: PayCode.REG,
				},
				{
					date: "2026-03-10",
					clockIn: "06:55 AM",
					clockOut: "03:25 PM",
					hours: 8,
					breakMinutes: 30,
					dataSource: TimeEntryDataSource.MOBILE_APP,
					payCode: PayCode.REG,
				},
				{
					date: "2026-03-11",
					clockIn: "07:00 AM",
					clockOut: "04:00 PM",
					hours: 8.5,
					breakMinutes: 30,
					dataSource: TimeEntryDataSource.MOBILE_APP,
					payCode: PayCode.REG,
				},
				{
					date: "2026-03-12",
					clockIn: "07:00 AM",
					clockOut: "03:30 PM",
					hours: 8,
					breakMinutes: 30,
					dataSource: TimeEntryDataSource.MOBILE_APP,
					payCode: PayCode.REG,
				},
				{
					date: "2026-03-13",
					clockIn: "07:15 AM",
					clockOut: "03:45 PM",
					hours: 8,
					breakMinutes: 30,
					dataSource: TimeEntryDataSource.MOBILE_APP,
					payCode: PayCode.REG,
				},
			],
		},
		{
			id: TIMESHEET_ID.JAMES_0315,
			organizationId,
			placementId: PLACEMENT_ID.JAMES,
			candidateId: CANDIDATE_ID.JAMES,
			locationId: LOCATION_ID.MAIN,
			departmentId: DEPT_ID.ONCO,
			weekEndingDate: weekEnding,
			status: TimesheetEntryStatus.APPROVED,
			entries: [
				{
					date: "2026-03-09",
					clockIn: "07:00 PM",
					clockOut: "07:00 AM",
					hours: 12,
					breakMinutes: 0,
					dataSource: TimeEntryDataSource.MOBILE_APP,
					payCode: PayCode.REG,
				},
				{
					date: "2026-03-10",
					clockIn: "07:10 PM",
					clockOut: "07:10 AM",
					hours: 12,
					breakMinutes: 0,
					dataSource: TimeEntryDataSource.MOBILE_APP,
					payCode: PayCode.REG,
				},
				{
					date: "2026-03-11",
					clockIn: "06:50 PM",
					clockOut: "07:20 AM",
					hours: 12.5,
					breakMinutes: 0,
					dataSource: TimeEntryDataSource.MOBILE_APP,
					payCode: PayCode.REG,
				},
				{
					date: "2026-03-12",
					clockIn: "07:00 PM",
					clockOut: "01:00 AM",
					hours: 4,
					breakMinutes: 0,
					dataSource: TimeEntryDataSource.MOBILE_APP,
					payCode: PayCode.REG,
				},
			],
		},
		{
			id: TIMESHEET_ID.ISABELLE_0315,
			organizationId,
			placementId: PLACEMENT_ID.ISABELLE,
			candidateId: CANDIDATE_ID.ISABELLE,
			locationId: LOCATION_ID.MAIN,
			departmentId: DEPT_ID.ICU,
			weekEndingDate: weekEnding,
			status: TimesheetEntryStatus.APPROVED,
			entries: [
				{
					date: "2026-03-09",
					clockIn: "06:00 AM",
					clockOut: "02:30 PM",
					hours: 8,
					breakMinutes: 30,
					dataSource: TimeEntryDataSource.MOBILE_APP,
					payCode: PayCode.REG,
				},
				{
					date: "2026-03-10",
					clockIn: "06:05 AM",
					clockOut: "02:35 PM",
					hours: 8,
					breakMinutes: 30,
					dataSource: TimeEntryDataSource.MOBILE_APP,
					payCode: PayCode.REG,
				},
				{
					date: "2026-03-11",
					clockIn: "05:55 AM",
					clockOut: "02:25 PM",
					hours: 8,
					breakMinutes: 30,
					dataSource: TimeEntryDataSource.MOBILE_APP,
					payCode: PayCode.REG,
				},
				{
					date: "2026-03-12",
					clockIn: "06:00 AM",
					clockOut: "02:30 PM",
					hours: 8,
					breakMinutes: 30,
					dataSource: TimeEntryDataSource.MOBILE_APP,
					payCode: PayCode.REG,
				},
				{
					date: "2026-03-13",
					clockIn: "06:00 AM",
					clockOut: "02:30 PM",
					hours: 8,
					breakMinutes: 30,
					dataSource: TimeEntryDataSource.MOBILE_APP,
					payCode: PayCode.REG,
				},
			],
		},
		{
			id: TIMESHEET_ID.MARCUS_0315,
			organizationId,
			placementId: PLACEMENT_ID.MARCUS,
			candidateId: CANDIDATE_ID.MARCUS,
			locationId: LOCATION_ID.URGENT,
			departmentId: DEPT_ID.ED,
			weekEndingDate: weekEnding,
			status: TimesheetEntryStatus.APPROVED,
			entries: [
				{
					date: "2026-03-09",
					clockIn: "11:00 AM",
					clockOut: "07:30 PM",
					hours: 8,
					breakMinutes: 30,
					dataSource: TimeEntryDataSource.MOBILE_APP,
					payCode: PayCode.REG,
				},
				{
					date: "2026-03-10",
					clockIn: "10:45 AM",
					clockOut: "07:15 PM",
					hours: 8,
					breakMinutes: 30,
					dataSource: TimeEntryDataSource.MOBILE_APP,
					payCode: PayCode.REG,
				},
				{
					date: "2026-03-11",
					clockIn: "11:15 AM",
					clockOut: "07:45 PM",
					hours: 8,
					breakMinutes: 30,
					dataSource: TimeEntryDataSource.MOBILE_APP,
					payCode: PayCode.REG,
				},
				{
					date: "2026-03-12",
					clockIn: "11:00 AM",
					clockOut: "07:30 PM",
					hours: 8,
					breakMinutes: 30,
					dataSource: TimeEntryDataSource.MOBILE_APP,
					payCode: PayCode.REG,
				},
				{
					date: "2026-03-13",
					clockIn: "11:00 AM",
					clockOut: "07:30 PM",
					hours: 8,
					breakMinutes: 30,
					dataSource: TimeEntryDataSource.MOBILE_APP,
					payCode: PayCode.REG,
				},
			],
		},
		{
			id: TIMESHEET_ID.ELENA_0315,
			organizationId,
			placementId: PLACEMENT_ID.ELENA,
			candidateId: CANDIDATE_ID.ELENA,
			locationId: LOCATION_ID.MAIN,
			departmentId: DEPT_ID.CARDIO,
			weekEndingDate: weekEnding,
			status: TimesheetEntryStatus.DISPUTED,
			entries: [
				{
					date: "2026-03-09",
					clockIn: "08:00 AM",
					clockOut: "04:30 PM",
					hours: 8,
					breakMinutes: 30,
					dataSource: TimeEntryDataSource.MOBILE_APP,
					payCode: PayCode.REG,
				},
				{
					date: "2026-03-10",
					clockIn: "08:15 AM",
					clockOut: "04:45 PM",
					hours: 8,
					breakMinutes: 30,
					dataSource: TimeEntryDataSource.MOBILE_APP,
					payCode: PayCode.REG,
				},
				{
					date: "2026-03-11",
					clockIn: "08:00 AM",
					clockOut: "05:00 PM",
					hours: 8.5,
					breakMinutes: 30,
					dataSource: TimeEntryDataSource.MOBILE_APP,
					payCode: PayCode.REG,
				},
				{
					date: "2026-03-12",
					clockIn: "08:00 AM",
					clockOut: "04:30 PM",
					hours: 8,
					breakMinutes: 30,
					dataSource: TimeEntryDataSource.MOBILE_APP,
					payCode: PayCode.REG,
				},
				{
					date: "2026-03-13",
					clockIn: "07:45 AM",
					clockOut: "04:15 PM",
					hours: 8,
					breakMinutes: 30,
					dataSource: TimeEntryDataSource.MOBILE_APP,
					payCode: PayCode.REG,
				},
			],
			dispute: {
				id: DISPUTE_ID.ELENA_0315,
				entryIdIndex: 2,
				description: "Inaccurate clock-in time reported by mobile app.",
				raisedByUserId: USER_ID.QUINN,
				status: "OPEN",
				payCode: PayCode.REG,
				resolution: undefined,
				resolutionCategory: undefined,
				resolvedAt: undefined,
				resolvedById: undefined,
			},
		},
		{
			id: TIMESHEET_ID.ELENA_0301,
			organizationId,
			placementId: PLACEMENT_ID.ELENA,
			candidateId: CANDIDATE_ID.ELENA,
			locationId: LOCATION_ID.MAIN,
			departmentId: DEPT_ID.CARDIO,
			weekEndingDate: new Date("2026-03-01"),
			status: TimesheetEntryStatus.APPROVED,
			entries: [
				{
					date: "2026-02-23",
					clockIn: "08:00 AM",
					clockOut: "04:30 PM",
					hours: 8,
					breakMinutes: 30,
					dataSource: TimeEntryDataSource.MOBILE_APP,
					payCode: PayCode.REG,
				},
				{
					date: "2026-02-24",
					clockIn: "08:00 AM",
					clockOut: "04:30 PM",
					hours: 8,
					breakMinutes: 30,
					dataSource: TimeEntryDataSource.MOBILE_APP,
					payCode: PayCode.REG,
				},
				{
					date: "2026-02-25",
					clockIn: "08:00 AM",
					clockOut: "04:30 PM",
					hours: 8,
					breakMinutes: 30,
					dataSource: TimeEntryDataSource.MOBILE_APP,
					payCode: PayCode.REG,
				},
				{
					date: "2026-02-26",
					clockIn: "08:00 AM",
					clockOut: "04:30 PM",
					hours: 8,
					breakMinutes: 30,
					dataSource: TimeEntryDataSource.MOBILE_APP,
					payCode: PayCode.REG,
				},
				{
					date: "2026-02-27",
					clockIn: "08:00 AM",
					clockOut: "04:30 PM",
					hours: 8,
					breakMinutes: 30,
					dataSource: TimeEntryDataSource.MOBILE_APP,
					payCode: PayCode.REG,
				},
			],
		},
	];

	const allTimesheets = [...currentTimesheets, ...history];

	let totalEntries = 0;
	let mobileAppEntries = 0;
	let totalHours = 0;
	let regularHours = 0;
	let overtimeHours = 0;

	allTimesheets.forEach((ts) => {
		ts.entries.forEach((entry) => {
			totalEntries++;
			if (entry.dataSource === TimeEntryDataSource.MOBILE_APP) {
				mobileAppEntries++;
			}
			totalHours += entry.hours;
			const ot = entry.overtimeHours || 0;
			overtimeHours += ot;
			regularHours += entry.hours - ot;
		});
	});

	return {
		timesheets: allTimesheets,
		summary: {
			id: TIMEKEEPING_SUMMARY_ID,
			organizationId,
			weekEndingDate: weekEnding,
			totalEntries,
			fileUploadEntries: totalEntries - mobileAppEntries,
			mobileAppEntries,
			totalHours,
			regularHours,
			overtimeHours,
			totalTimesheets: allTimesheets.length,
			submittedTimesheets: allTimesheets.filter(
				(ts) => ts.status === TimesheetEntryStatus.PENDING,
			).length,
			approvedTimesheets: allTimesheets.filter(
				(ts) => ts.status === TimesheetEntryStatus.APPROVED,
			).length,
			openDisputes: allTimesheets.filter(
				(ts) =>
					ts.status === TimesheetEntryStatus.DISPUTED &&
					(!ts.dispute || ts.dispute.status === "OPEN"),
			).length,
			resolvedDisputes: allTimesheets.filter(
				(ts) =>
					ts.status === TimesheetEntryStatus.DISPUTED &&
					ts.dispute &&
					ts.dispute.status === "RESOLVED",
			).length,
		},
	};
};
