import { MatchingCriterionKey } from "../enums/matching-criterion-key.enum";

export const DEFAULT_MATCHING_LOGIC_WEIGHTS: Partial<
	Record<MatchingCriterionKey, number>
> = {
	[MatchingCriterionKey.PREFERRED_LOCATION]: 40,
	[MatchingCriterionKey.SHIFT_TYPE]: 35,
	[MatchingCriterionKey.CONTRACT_LENGTH]: 25,
};
