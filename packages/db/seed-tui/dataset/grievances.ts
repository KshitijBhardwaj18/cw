import { GrievanceStatus, GrievanceTaskStatus, GrievanceType } from "@repo/db";
import { getDeterministicId, SEED_PREFIX } from "../utils";
import { CANDIDATE_ID } from "./candidates";
import { PLACEMENT_ID } from "./placements";
import { USER_ID } from "./users";

export const GRIEV_ID = {
	GRIEV_1: getDeterministicId(`${SEED_PREFIX}griev-1`),
	GRIEV_2: getDeterministicId(`${SEED_PREFIX}griev-2`),
	GRIEV_3: getDeterministicId(`${SEED_PREFIX}griev-3`),
	GRIEV_4: getDeterministicId(`${SEED_PREFIX}griev-4`),
	GRIEV_5: getDeterministicId(`${SEED_PREFIX}griev-5`),
	GRIEV_6: getDeterministicId(`${SEED_PREFIX}griev-6`),
} as const;

export const GRIEV_TASK_ID = {
	TASK_1: getDeterministicId(`${SEED_PREFIX}griev-task-1`),
	TASK_2: getDeterministicId(`${SEED_PREFIX}griev-task-2`),
	TASK_3: getDeterministicId(`${SEED_PREFIX}griev-task-3`),
	TASK_4: getDeterministicId(`${SEED_PREFIX}griev-task-4`),
	TASK_5: getDeterministicId(`${SEED_PREFIX}griev-task-5`),
} as const;

export const getGrievancesDataset = (organizationId: string) => {
	return [
		{
			id: GRIEV_ID.GRIEV_1,
			organizationId,
			grievanceNumber: "GR-1001",
			type: GrievanceType.BEHAVIORAL,
			candidateId: CANDIDATE_ID.ISABELLE,
			placementId: PLACEMENT_ID.ISABELLE,
			description:
				"Candidate arrived late for 3 consecutive shifts without prior notice.",
			status: GrievanceStatus.OPEN,
			createdById: USER_ID.BOB_J,
			createdAt: new Date("2026-03-10T08:00:00Z"),
		},
		{
			id: GRIEV_ID.GRIEV_2,
			organizationId,
			grievanceNumber: "GR-1002",
			type: GrievanceType.CLINICAL,
			candidateId: CANDIDATE_ID.MARCUS,
			placementId: PLACEMENT_ID.MARCUS,
			description:
				"Medication error reported during the night shift. No patient harm, but process violation occurred.",
			status: GrievanceStatus.IN_PROGRESS,
			createdById: USER_ID.ALICE,
			createdAt: new Date("2026-03-12T14:30:00Z"),
			tasks: [
				{
					id: GRIEV_TASK_ID.TASK_1,
					category: "Clinical Review",
					assignedToUserId: USER_ID.BOB_J,
					description:
						"Conduct a secondary clinical review of the incident with the unit manager.",
					status: GrievanceTaskStatus.PENDING,
				},
				{
					id: GRIEV_TASK_ID.TASK_2,
					category: "Documentation",
					assignedToUserId: USER_ID.ALICE,
					description:
						"Attach the facility incident report to this grievance record.",
					status: GrievanceTaskStatus.COMPLETED,
					completedAt: new Date("2026-03-13T10:00:00Z"),
				},
			],
		},
		{
			id: GRIEV_ID.GRIEV_3,
			organizationId,
			grievanceNumber: "GR-1003",
			type: GrievanceType.BEHAVIORAL,
			candidateId: CANDIDATE_ID.ELENA,
			placementId: PLACEMENT_ID.ELENA,
			description:
				"Inappropriate communication with a staff member in the cardio unit.",
			status: GrievanceStatus.RESOLVED,
			createdById: USER_ID.BOB_J,
			createdAt: new Date("2026-02-15T09:00:00Z"),
			tasks: [
				{
					id: GRIEV_TASK_ID.TASK_4,
					category: "Mediation",
					assignedToUserId: USER_ID.ALICE,
					description:
						"Schedule and hold a mediation meeting between the candidate and staff member.",
					status: GrievanceTaskStatus.COMPLETED,
					completedAt: new Date("2026-02-18T14:00:00Z"),
				},
			],
		},
		{
			id: GRIEV_ID.GRIEV_4,
			organizationId,
			grievanceNumber: "GR-1004",
			type: GrievanceType.CLINICAL,
			candidateId: CANDIDATE_ID.SARAH,
			placementId: PLACEMENT_ID.SARAH,
			description:
				"Concerns regarding sterile technique in the peds department.",
			status: GrievanceStatus.OPEN,
			createdById: USER_ID.ALICE,
			createdAt: new Date("2026-03-20T11:00:00Z"),
		},
		{
			id: GRIEV_ID.GRIEV_5,
			organizationId,
			grievanceNumber: "GR-1005",
			type: GrievanceType.BEHAVIORAL,
			candidateId: CANDIDATE_ID.DAVID,
			placementId: null,
			description:
				"Candidate failed to respond to multiple compliance update requests.",
			status: GrievanceStatus.IN_PROGRESS,
			createdById: USER_ID.ALICE,
			createdAt: new Date("2026-03-05T16:00:00Z"),
			tasks: [
				{
					id: GRIEV_TASK_ID.TASK_3,
					category: "Compliance Follow-up",
					assignedToUserId: USER_ID.ALICE,
					description:
						"Call the candidate directly to discuss missing documents.",
					status: GrievanceTaskStatus.PENDING,
				},
			],
		},
		{
			id: GRIEV_ID.GRIEV_6,
			organizationId,
			grievanceNumber: "GR-1006",
			type: GrievanceType.CLINICAL,
			candidateId: CANDIDATE_ID.MICHAEL,
			placementId: null,
			description:
				"Historical clinical competency concern from a previous assignment (2025).",
			status: GrievanceStatus.RESOLVED,
			createdById: USER_ID.BOB_J,
			createdAt: new Date("2025-11-20T10:00:00Z"),
			tasks: [
				{
					id: GRIEV_TASK_ID.TASK_5,
					category: "Review",
					assignedToUserId: USER_ID.BOB_J,
					description:
						"Review performance evaluation from the 2025 assignment.",
					status: GrievanceTaskStatus.COMPLETED,
					completedAt: new Date("2025-11-25T11:00:00Z"),
				},
			],
		},
	];
};
