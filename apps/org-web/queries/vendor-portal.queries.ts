import { useMutation, useQuery } from "@tanstack/react-query";
import type {
	VendorContextResponse,
	VendorPortalCreateUserInput,
	VendorPortalUpdateUserInput,
	VendorPortalUsersQueryParams,
} from "@/services/vendor-portal.service";
import { VendorPortalService } from "@/services/vendor-portal.service";
import type {
	VendorPortalTeamMetrics,
	VendorPortalUsersListResponse,
} from "@/types/vendor-users";

export const vendorContextKey = ["vendor-portal", "context"] as const;

export function useVendorContextQuery() {
	return useQuery<VendorContextResponse>({
		queryKey: vendorContextKey,
		queryFn: () => VendorPortalService.getVendorContext(),
		staleTime: 5 * 60_000,
	});
}

export const vendorPortalUsersKey = (params: VendorPortalUsersQueryParams) =>
	["vendor-portal", "users", params] as const;

export const vendorPortalUsersMetricsKey = [
	"vendor-portal",
	"users",
	"metrics",
] as const;

export function useVendorPortalUsersList(
	params: VendorPortalUsersQueryParams,
	enabled = true,
) {
	const q = useQuery({
		queryKey: vendorPortalUsersKey(params),
		queryFn: () => VendorPortalService.listUsers(params),
		enabled,
	});
	return {
		...q,
		data: q.data as VendorPortalUsersListResponse | undefined,
	};
}

export function useVendorPortalUsersMetrics(enabled = true) {
	return useQuery({
		queryKey: vendorPortalUsersMetricsKey,
		queryFn: (): Promise<VendorPortalTeamMetrics> =>
			VendorPortalService.getUsersMetrics(),
		enabled,
	});
}

export function useVendorPortalCreateUser() {
	return useMutation({
		mutationFn: (body: VendorPortalCreateUserInput) =>
			VendorPortalService.createUser(body),
	});
}

export function useVendorPortalUpdateUser() {
	return useMutation({
		mutationFn: ({
			vendorUserId,
			body,
		}: {
			vendorUserId: string;
			body: VendorPortalUpdateUserInput;
		}) => VendorPortalService.updateUser(vendorUserId, body),
	});
}

export function useVendorPortalRemoveUser() {
	return useMutation({
		mutationFn: (vendorUserId: string) =>
			VendorPortalService.removeUser(vendorUserId),
	});
}
