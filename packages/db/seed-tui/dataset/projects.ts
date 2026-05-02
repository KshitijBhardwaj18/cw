import { ProjectStatus } from "@repo/db";
import { getDeterministicId, SEED_PREFIX } from "../utils";

export const PROJECT_ID = {
	NURSING_EXPANSION: getDeterministicId(
		`${SEED_PREFIX}project-nursing-expansion`,
	),
	ED_STAFFING: getDeterministicId(`${SEED_PREFIX}project-ed-staffing`),
	ICU_COVERAGE: getDeterministicId(`${SEED_PREFIX}project-icu-coverage`),
} as const;

export const getProjectsDataset = (organizationId: string) => [
	{
		id: PROJECT_ID.NURSING_EXPANSION,
		organizationId,
		name: "Q1 2026 Nursing Expansion",
		description:
			"Expanding nursing staff across all departments for the first quarter",
		status: ProjectStatus.ACTIVE,
	},
	{
		id: PROJECT_ID.ED_STAFFING,
		organizationId,
		name: "Emergency Department Staffing",
		description: "Critical hiring initiative for ED coverage during peak hours",
		status: ProjectStatus.ACTIVE,
	},
	{
		id: PROJECT_ID.ICU_COVERAGE,
		organizationId,
		name: "ICU Summer Coverage",
		description: "Seasonal staffing for ICU to cover summer vacation periods",
		status: ProjectStatus.INACTIVE,
	},
];
