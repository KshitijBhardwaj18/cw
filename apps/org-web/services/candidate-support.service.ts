import { ApiClient } from "@/lib/api-client";
import type { SupportRequestFormValues } from "@/schemas/candidate-support.schema";

export type SubmitSupportRequestResponse = {
	ok: true;
};

export class CandidateSupportService {
	static async submitRequest(
		payload: SupportRequestFormValues,
	): Promise<SubmitSupportRequestResponse> {
		return ApiClient.post<SubmitSupportRequestResponse>(
			"/api/candidates/me/support-request",
			payload,
		);
	}
}
