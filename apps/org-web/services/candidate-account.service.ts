import { ApiClient } from "@/lib/api-client";

export type CloseCandidateAccountResponse = {
	closedAt: string;
};

export class CandidateAccountService {
	static async closeAccount(): Promise<CloseCandidateAccountResponse> {
		return ApiClient.post<CloseCandidateAccountResponse>(
			"/api/candidates/me/close-account",
		);
	}
}
