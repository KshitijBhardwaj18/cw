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
	locations: () => ["organizations", "locations"] as const,
	members: () => ["organizations", "members"] as const,
	membersPicker: (role?: MemberRole) =>
		[...organizationsKeys.members(), "picker", role ?? "_"] as const,
	membersList: (params: Record<string, string | number | undefined>) =>
		[...organizationsKeys.members(), "list", params] as const,
	departments: () => ["organizations", "departments"] as const,
};

export function useOrganizationLocationsForOnboarding() {
	return useQuery({
		queryKey: organizationsKeys.locations(),
		queryFn: () => OnboardingService.getLocationsForOrg(),
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

export function useOrgMembersForPicker(options?: { role?: MemberRole }) {
	const role = options?.role;
	return useQuery({
		queryKey: organizationsKeys.membersPicker(role),
		queryFn: () =>
			OrganizationsService.listMembers({
				limit: 100,
				...(role ? { role } : {}),
			}),
		staleTime: 60_000,
	});
}

export function useOrgMembersList(params: OrgMembersListParams) {
	return useQuery({
		queryKey: organizationsKeys.membersList({
			search: params.search,
			page: params.page,
			limit: params.limit,
			type: params.type,
			role: params.role,
		}),
		queryFn: () => OrganizationsService.listMembers(params),
		refetchOnMount: "always",
	});
}

export function useEnrollOrgUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: EnrollOrgUserPayload) =>
			OrganizationsService.enrollOrgUser(payload),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: organizationsKeys.members(),
			});
		},
	});
}

export function useRemoveOrgMember() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (memberId: string) =>
			OrganizationsService.removeMember(memberId),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: organizationsKeys.members(),
			});
		},
	});
}

export function useUpdateOrgMember() {
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
				queryKey: organizationsKeys.members(),
			});
		},
	});
}

export function useBulkEnrollOrgUsers() {
	return useMutation({
		mutationFn: (file: File): Promise<BulkEnrollmentSubmitResponse> =>
			OrganizationsService.submitBulkEnrollment(file),
	});
}

export function useOrgDepartmentsForUsers() {
	return useQuery({
		queryKey: organizationsKeys.departments(),
		queryFn: () => ShiftTemplatesService.getDepartments(),
		staleTime: 60_000,
	});
}
