import type { MatchingCriterionKey } from "@repo/shared";

export type MatchingCriterionWithLogic = {
	matchingCriterionId: string;
	key: MatchingCriterionKey;
	name: string;
	description: string | null;
	active: boolean;
	weight: number;
	matchingLogicId: string | null;
};

export type SaveMatchingLogicItem = {
	matchingCriterionId: string;
	active: boolean;
	weight: number;
};
