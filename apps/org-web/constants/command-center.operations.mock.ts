import type { BadgeVariants } from "@repo/ui/components/badge";
import type {
	CandidateProcessingFilterKey,
	CandidateProcessingIssueTableItem,
	RequisitionPerformanceFilterKey,
	RequisitionPerformanceTableItem,
} from "@/types/command-center";

export const COMPLIANCE_STATUS_MAP: Record<
	string,
	{
		type: "pending" | "overdue" | "complete";
		badge: BadgeVariants;
	}
> = {
	pending: { type: "pending", badge: "warning" },
	overdue: { type: "overdue", badge: "error" },
	complete: { type: "complete", badge: "success" },
};

const buildRequisitionRows = (
	filterKey: RequisitionPerformanceFilterKey,
	count: number,
	seedRows: Omit<RequisitionPerformanceTableItem, "id" | "filterKey">[],
	offset: number,
): RequisitionPerformanceTableItem[] =>
	Array.from({ length: count }, (_, index) => {
		const seed = seedRows[index % seedRows.length];
		const serial = offset + index + 1;

		return {
			category: "Pre-Employment Screening",
			assignedTo: "HR Compliance Team",
			progress: 35,
			dueDate: "2026-03-27",
			daysOverdue: 21,
			priority: "High Priority",
			documents: [
				{
					name: "Consent Form",
					status: "Complete",
					sub: "Received and verified",
					variant: "success",
				},
				{
					name: "Government ID",
					status: "Pending",
					sub: "Awaiting submission",
					variant: "warning",
				},
				{
					name: "Background Check Report",
					status: "Pending",
					sub: "Awaiting submission",
					variant: "warning",
				},
			],
			activity: [
				{
					action: "First document received",
					date: "2026-04-17",
					user: "HR Compliance Team",
					status: "success",
				},
				{
					action: "Item assigned to compliance team",
					date: "2026-04-15",
					user: "System",
					status: "info",
				},
				{
					action: "Compliance item created",
					date: "2026-04-14",
					user: "Recruitment Team",
					status: "muted",
				},
			],
			...seed,
			id: `${filterKey}-${serial}`,
			filterKey,
			requisitionId: `REQ-${1200 + serial}`,
		};
	});

const buildCandidateRows = (
	filterKey: CandidateProcessingFilterKey,
	count: number,
	seedRows: Omit<CandidateProcessingIssueTableItem, "id" | "filterKey">[],
	offset: number,
): CandidateProcessingIssueTableItem[] =>
	Array.from({ length: count }, (_, index) => {
		const seed = seedRows[index % seedRows.length];
		const serial = offset + index + 1;

		return {
			...seed,
			id: `${filterKey}-${serial}`,
			filterKey,
		};
	});

export const REQUISITION_PERFORMANCE_ROWS: RequisitionPerformanceTableItem[] = [
	...buildRequisitionRows(
		"slow-time-to-fill",
		8,
		[
			{
				requisitionId: "",
				requisitionName: "Registered Nurse - ICU",
				checklistItem: "Background Check",
				daysOpen: 28,
				submissions: 4,
				status: "Reviewing",
				progress: 45,
				priority: "High Priority",
				assignedTo: "Critical Care Onboarding",
			},
			{
				requisitionId: "",
				requisitionName: "Physical Therapist",
				checklistItem: "License Verification",
				daysOpen: 24,
				submissions: 5,
				status: "Sourcing",
				progress: 20,
				priority: "Medium Priority",
				assignedTo: "Allied Health Team",
			},
			{
				requisitionId: "",
				requisitionName: "Respiratory Therapist",
				checklistItem: "Reference Check",
				daysOpen: 22,
				submissions: 3,
				status: "Reviewing",
				progress: 60,
				priority: "Medium Priority",
				assignedTo: "Clinical Ops Team",
			},
		],
		0,
	),
	...buildRequisitionRows(
		"no-submissions",
		5,
		[
			{
				requisitionId: "",
				requisitionName: "Nurse Practitioner - Cardiology",
				checklistItem: "DEA License",
				daysOpen: 12,
				submissions: 0,
				status: "Sourcing",
				progress: 10,
				priority: "High Priority",
			},
			{
				requisitionId: "",
				requisitionName: "Speech Language Pathologist",
				checklistItem: "ASHA Certification",
				daysOpen: 10,
				submissions: 0,
				status: "Sourcing",
				progress: 5,
				priority: "Medium Priority",
			},
			{
				requisitionId: "",
				requisitionName: "Clinical Pharmacist",
				checklistItem: "Board Certification",
				daysOpen: 9,
				submissions: 0,
				status: "Sourcing",
				progress: 15,
				priority: "High Priority",
			},
		],
		100,
	),
	...buildRequisitionRows(
		"low-submissions",
		12,
		[
			{
				requisitionId: "",
				requisitionName: "Medical Lab Technologist",
				checklistItem: "Skill Assessment",
				daysOpen: 16,
				submissions: 2,
				status: "Reviewing",
				progress: 30,
			},
			{
				requisitionId: "",
				requisitionName: "Radiology Technologist",
				checklistItem: "License Validation",
				daysOpen: 18,
				submissions: 1,
				status: "Interviewing",
				progress: 50,
			},
			{
				requisitionId: "",
				requisitionName: "Certified Nursing Assistant",
				checklistItem: "Work Authorization",
				daysOpen: 15,
				submissions: 2,
				status: "Reviewing",
				progress: 80,
			},
		],
		200,
	),
];

export const CANDIDATE_PROCESSING_ISSUE_ROWS: CandidateProcessingIssueTableItem[] =
	[
		...buildCandidateRows(
			"overdue-submissions",
			6,
			[
				{
					candidate: "James Wilson",
					jobTitle: "Registered Nurse - Med-Surg",
					occupation: "Registered Nurse",
					submittedBy: "Premier Health Staffing",
					billRate: "$95/hr",
				},
				{
					candidate: "Lisa Anderson",
					jobTitle: "Physical Therapist Assistant",
					occupation: "Physical Therapist Assistant",
					submittedBy: "Nationwide Healthcare",
					billRate: "$85/hr",
				},
				{
					candidate: "Daniel Taylor",
					jobTitle: "Occupational Therapist",
					occupation: "Occupational Therapist",
					submittedBy: "CareerMed Staffing",
					billRate: "$85/hr",
				},
			],
			0,
		),
		...buildCandidateRows(
			"aging-qualified",
			9,
			[
				{
					candidate: "Daniel Taylor",
					jobTitle: "Registered Nurse - ICU",
					occupation: "Registered Nurse",
					submittedBy: "CareerMed Staffing",
					billRate: "$95/hr",
				},
				{
					candidate: "Lisa Anderson",
					jobTitle: "Physical Therapist",
					occupation: "Physical Therapist",
					submittedBy: "Nationwide Healthcare",
					billRate: "$85/hr",
				},
				{
					candidate: "James Wilson",
					jobTitle: "Occupational Therapist",
					occupation: "Occupational Therapist",
					submittedBy: "Premier Health Staffing",
					billRate: "$85/hr",
				},
			],
			100,
		),
		...buildCandidateRows(
			"aging-shortlisted",
			9,
			[
				{
					candidate: "Alicia Brown",
					jobTitle: "Medical Lab Technologist",
					occupation: "Medical Lab Technologist",
					submittedBy: "MedStaff Partners",
					billRate: "$55/hr",
				},
				{
					candidate: "Christopher Lee",
					jobTitle: "Medical Assistant",
					occupation: "Medical Assistant",
					submittedBy: "MedStaff Partners",
					billRate: "$45/hr",
				},
				{
					candidate: "Amanda Davis",
					jobTitle: "Radiologic Technologist",
					occupation: "Radiologic Technologist",
					submittedBy: "Healthcare Staffing Solutions",
					billRate: "$55/hr",
				},
			],
			200,
		),
		...buildCandidateRows(
			"overdue-offers",
			9,
			[
				{
					candidate: "Robert Martinez",
					jobTitle: "Respiratory Therapist",
					occupation: "Respiratory Therapist",
					submittedBy: "CareerMed Staffing",
					billRate: "$50/hr",
				},
				{
					candidate: "Amanda Davis",
					jobTitle: "Surgical Technologist",
					occupation: "Surgical Technologist",
					submittedBy: "Healthcare Staffing Solutions",
					billRate: "$55/hr",
				},
				{
					candidate: "Robert Martinez",
					jobTitle: "Ultrasound Technologist",
					occupation: "Ultrasound Technologist",
					submittedBy: "CareerMed Staffing",
					billRate: "$55/hr",
				},
			],
			300,
		),
		...buildCandidateRows(
			"delayed-onboarding",
			4,
			[
				{
					candidate: "James Wilson",
					jobTitle: "Registered Nurse - Emergency",
					occupation: "Registered Nurse",
					submittedBy: "Premier Health Staffing",
					billRate: "$95/hr",
				},
				{
					candidate: "Jennifer Brown",
					jobTitle: "Licensed Practical Nurse",
					occupation: "Licensed Practical Nurse",
					submittedBy: "Elite Medical Recruiting",
					billRate: "$65/hr",
				},
				{
					candidate: "Christopher Lee",
					jobTitle: "Physical Therapist",
					occupation: "Physical Therapist",
					submittedBy: "MedStaff Partners",
					billRate: "$85/hr",
				},
			],
			400,
		),
	];
