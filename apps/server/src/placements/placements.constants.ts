import { PlacementStatus } from "@repo/db";
import type { PlacementTabQuery } from "./dto/query-placements.dto";

/**
 *   UPCOMING   - placement created, startDate hasn't arrived yet.
 *   ACTIVE     - cron-flipped once startDate <= today, OR manually active.
 *   ON_HOLD    - manually paused mid-engagement.
 *   COMPLETED  - manually completed, or cron-flipped past endDate.
 *   TERMINATED - manually ended via End Placement.
 */
export const PLACEMENT_TAB_STATUS: Record<
	PlacementTabQuery,
	PlacementStatus[]
> = {
	upcoming: [PlacementStatus.UPCOMING],
	active: [PlacementStatus.ACTIVE, PlacementStatus.ON_HOLD],
	completed: [PlacementStatus.COMPLETED, PlacementStatus.TERMINATED],
};

export const ENDABLE_PLACEMENT_STATUSES: PlacementStatus[] = [
	PlacementStatus.ACTIVE,
	PlacementStatus.ON_HOLD,
	PlacementStatus.UPCOMING,
];
