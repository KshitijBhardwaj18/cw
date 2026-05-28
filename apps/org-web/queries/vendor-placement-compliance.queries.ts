import { useMutation, useQueryClient } from "@tanstack/react-query";
import { VendorPlacementComplianceService } from "@/services/vendor-placement-compliance.service";
import { placementsKeys } from "./placements.queries";

export function useVendorUpdatePlacementComplianceStatus(placementId: string) {
	const queryClient = useQueryClient();
	return useMutation<
		void,
		Error,
		{
			complianceListItemId: string;
			body: { status: string; notes?: string; expiryDate?: string };
		}
	>({
		mutationFn: ({ complianceListItemId, body }) =>
			VendorPlacementComplianceService.updateStatus(
				placementId,
				complianceListItemId,
				body,
			),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: placementsKeys.all });
		},
	});
}

export function useVendorUploadPlacementComplianceDocument(
	placementId: string,
) {
	const queryClient = useQueryClient();
	return useMutation<
		{ success: true },
		Error,
		{
			complianceListItemId: string;
			file: File;
			expiryDate?: string;
			issueDate?: string;
		}
	>({
		mutationFn: async (vars) => {
			await VendorPlacementComplianceService.uploadDocument(
				placementId,
				vars.complianceListItemId,
				vars.file,
				{ expiryDate: vars.expiryDate, issueDate: vars.issueDate },
			);
			return { success: true } as const;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: placementsKeys.all });
		},
	});
}

export function useVendorMarkPlacementComplianceLinkSubmitted(
	placementId: string,
) {
	const queryClient = useQueryClient();
	return useMutation<void, Error, string>({
		mutationFn: (complianceListItemId: string) =>
			VendorPlacementComplianceService.markLinkSubmitted(
				placementId,
				complianceListItemId,
			),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: placementsKeys.all });
		},
	});
}
