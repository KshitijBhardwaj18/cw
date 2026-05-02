import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UsersService } from "@/services";
import type {
	CreateProgramUserInput,
	CreateProgramUsersInput,
	EditProgramUserInput,
	UserDto,
} from "@/types";
import { dashboardKeys } from "./dashboard.query";
import { organizationsKeys, useOrgMembers } from "./organizations.query";

export const usersKeys = {
	all: ["users"] as const,
	program: ["users", "program"] as const,
	vendor: ["users", "vendor"] as const,
	organization: ["users", "organization"] as const,
	mspOptions: ["users", "mspOptions"] as const,
};

export const useProgramUsers = () => {
	return useQuery({
		queryKey: usersKeys.program,
		queryFn: () => UsersService.getProgramUsers(),
	});
};

export const useMspOptions = () => {
	return useQuery({
		queryKey: usersKeys.mspOptions,
		queryFn: () => UsersService.getMspOptions(),
	});
};

export const useVendorUsers = () => {
	return useQuery({
		queryKey: usersKeys.vendor,
		queryFn: () => UsersService.getVendorUsers(),
	});
};

export const useOrganizationUsers = () => {
	return useQuery({
		queryKey: usersKeys.organization,
		queryFn: () => UsersService.getOrganizationUsers(),
	});
};

export const useOrganizationEnrolledUsers = (
	organizationId: string,
	search?: string,
	page = 1,
	limit = 10,
) => {
	return useOrgMembers(organizationId, "organization", search, page, limit);
};

export const useCreateProgramUser = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateProgramUserInput) =>
			UsersService.createProgramUser(data),
		onSuccess: (createdUser) => {
			queryClient.setQueryData<UserDto[]>(
				usersKeys.program,
				(existingUsers) => {
					if (!existingUsers) {
						return [createdUser];
					}
					return [createdUser, ...existingUsers];
				},
			);
			void queryClient.invalidateQueries({ queryKey: dashboardKeys.summary });
		},
	});
};

export const useCreateBulkProgramUsers = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateProgramUsersInput) =>
			UsersService.createBulkProgramUsers(data),
		onSuccess: (createdUsers) => {
			queryClient.setQueryData<UserDto[]>(
				usersKeys.program,
				(existingUsers) => {
					if (!existingUsers) {
						return createdUsers;
					}
					return [...createdUsers, ...existingUsers];
				},
			);
			void queryClient.invalidateQueries({ queryKey: dashboardKeys.summary });
		},
	});
};

export const useUpdateProgramUser = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: EditProgramUserInput }) =>
			UsersService.updateProgramUser(id, data),
		onSuccess: (updatedUser) => {
			queryClient.setQueryData<UserDto[]>(
				usersKeys.program,
				(existingUsers) => {
					if (!existingUsers) {
						return [updatedUser];
					}
					return existingUsers.map((user) =>
						user.id === updatedUser.id ? updatedUser : user,
					);
				},
			);
			void queryClient.invalidateQueries({ queryKey: organizationsKeys.all });
		},
	});
};

export const useDeleteProgramUser = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => UsersService.deleteProgramUser(id),
		onSuccess: (_deleted, id) => {
			queryClient.setQueryData<UserDto[]>(
				usersKeys.program,
				(existingUsers) => {
					if (!existingUsers) {
						return existingUsers;
					}
					return existingUsers.filter((user) => user.id !== id);
				},
			);
			void queryClient.invalidateQueries({ queryKey: dashboardKeys.summary });
		},
	});
};
