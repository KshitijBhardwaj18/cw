import { PlacementStatus } from "@repo/db";
import type { PlacementTabQuery } from "./dto/query-placements.dto";

export const PLACEMENT_TAB_STATUS: Record<
	PlacementTabQuery,
	PlacementStatus[]
> = {
	upcoming: [
		PlacementStatus.UPCOMING,
		PlacementStatus.PENDING,
		PlacementStatus.ON_HOLD,
	],
	active: [PlacementStatus.ACTIVE, PlacementStatus.ENDING_SOON],
	completed: [
		PlacementStatus.COMPLETED,
		PlacementStatus.TERMINATED,
		PlacementStatus.INACTIVE,
	],
};

export const ENDABLE_PLACEMENT_STATUSES: PlacementStatus[] = [
	PlacementStatus.ACTIVE,
	PlacementStatus.ENDING_SOON,
	PlacementStatus.ON_HOLD,
	PlacementStatus.UPCOMING,
	PlacementStatus.PENDING,
];
