import { useMutation } from "@tanstack/react-query";
import {
	CandidateAccountService,
	type CloseCandidateAccountResponse,
} from "@/services/candidate-account.service";

export function useCloseCandidateAccount() {
	return useMutation<CloseCandidateAccountResponse, Error>({
		mutationFn: () => CandidateAccountService.closeAccount(),
	});
}
