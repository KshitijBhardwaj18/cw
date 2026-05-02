import { ApiClient } from "@/lib/api-client";
import type {
	MatchingCriterionWithLogic,
	SaveMatchingLogicItem,
} from "@/types";

export class MatchingLogicService {
	static async getMatchingLogic(
		organizationId: string,
	): Promise<MatchingCriterionWithLogic[]> {
		return ApiClient.get<MatchingCriterionWithLogic[]>(
			`/api/organizations/${organizationId}/matching-logic`,
		);
	}

	static async saveMatchingLogic(
		organizationId: string,
		items: SaveMatchingLogicItem[],
	): Promise<MatchingCriterionWithLogic[]> {
		return ApiClient.post<
			MatchingCriterionWithLogic[],
			{ items: SaveMatchingLogicItem[] }
		>(`/api/organizations/${organizationId}/matching-logic`, { items });
	}
}
