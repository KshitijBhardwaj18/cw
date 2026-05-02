import type { MemberRole } from "@repo/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { OrgLocation } from "@/services/onboarding.service";
import { OnboardingService } from "@/services/onboarding.service";
import type {
	BulkEnrollmentSubmitResponse,
	EnrollOrgUserPayload,
	UpdateOrgMemberPayload,
} from "@/services/organizations.service";
import { OrganizationsService } from "@/services/organizations.service";
import { ShiftTemplatesService } from "@/services/shift-templates.service";

export const organizationsKeys = {
	locations: (orgId: string) => ["organizations", "locations", orgId] as const,
	members: (orgId: string) => ["organizations", "members", orgId] as const,
	membersPicker: (orgId: string, role?: MemberRole) =>
		[...organizationsKeys.members(orgId), "picker", role ?? "_"] as const,
	membersList: (
		orgId: string,
		params: Record<string, string | number | undefined>,
	) => [...organizationsKeys.members(orgId), "list", params] as const,
	departments: (orgId: string) =>
		["organizations", "departments", orgId] as const,
};

export function useOrganizationLocationsForOnboarding(
	orgId: string | undefined,
) {
	return useQuery({
		queryKey: organizationsKeys.locations(orgId ?? ""),
		queryFn: () => OnboardingService.getLocationsForOrg(),
		enabled: !!orgId,
		staleTime: 60_000,
	});
}

export type OrganizationLocation = OrgLocation;

export type OrgMembersListParams = {
	search?: string;
	page?: number;
	limit?: number;
	/** Defaults to organization users (ORGANIZATION_USER) when listing the Users page. */
	type?: string;
	role?: MemberRole;
};

export function useOrgMembersForPicker(
	orgId: string,
	options?: { role?: MemberRole },
) {
	const role = options?.role;
	return useQuery({
		queryKey: organizationsKeys.membersPicker(orgId, role),
		queryFn: () =>
			OrganizationsService.listMembers({
				limit: 100,
				...(role ? { role } : {}),
			}),
		enabled: !!orgId,
		staleTime: 60_000,
	});
}

export function useOrgMembersList(orgId: string, params: OrgMembersListParams) {
	return useQuery({
		queryKey: organizationsKeys.membersList(orgId, {
			search: params.search,
			page: params.page,
			limit: params.limit,
			type: params.type,
			role: params.role,
		}),
		queryFn: () => OrganizationsService.listMembers(params),
		enabled: !!orgId,
		refetchOnMount: "always",
	});
}

export function useEnrollOrgUser(orgId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: EnrollOrgUserPayload) =>
			OrganizationsService.enrollOrgUser(payload),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: organizationsKeys.members(orgId),
			});
		},
	});
}

export function useRemoveOrgMember(orgId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (memberId: string) =>
			OrganizationsService.removeMember(memberId),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: organizationsKeys.members(orgId),
			});
		},
	});
}

export function useUpdateOrgMember(orgId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			memberId,
			payload,
		}: {
			memberId: string;
			payload: UpdateOrgMemberPayload;
		}) => OrganizationsService.updateMember(memberId, payload),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: organizationsKeys.members(orgId),
			});
		},
	});
}

export function useBulkEnrollOrgUsers(_orgId: string) {
	return useMutation({
		mutationFn: (file: File): Promise<BulkEnrollmentSubmitResponse> =>
			OrganizationsService.submitBulkEnrollment(file),
	});
}

export function useOrgDepartmentsForUsers(orgId: string) {
	return useQuery({
		queryKey: organizationsKeys.departments(orgId),
		queryFn: () => ShiftTemplatesService.getDepartments(),
		enabled: !!orgId,
		staleTime: 60_000,
	});
}
