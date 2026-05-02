import {
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { requisitionsKeys } from "@/queries/requisitions.queries";
import {
	buildProjectRequisitionsRequestParams,
	type CreateProjectPayload,
	type ProjectRequisitionsListParams,
	type ProjectsListParams,
	ProjectsService,
	type UpdateProjectPayload,
} from "@/services/projects.service";

export const projectsKeys = {
	all: ["projects"] as const,
	lists: (orgId: string) => [...projectsKeys.all, "list", orgId] as const,
	list: (orgId: string, params: Record<string, string | number | undefined>) =>
		[...projectsKeys.lists(orgId), params] as const,
	detailPrefix: (orgId: string, projectId: string) =>
		[...projectsKeys.all, "detail", orgId, projectId] as const,
	detailMeta: (orgId: string, projectId: string) =>
		[...projectsKeys.detailPrefix(orgId, projectId), "meta"] as const,
	detailStats: (orgId: string, projectId: string) =>
		[...projectsKeys.detailPrefix(orgId, projectId), "stats"] as const,
	detailRequisitions: (
		orgId: string,
		projectId: string,
		params: ProjectRequisitionsListParams,
	) =>
		[
			...projectsKeys.detailPrefix(orgId, projectId),
			"requisitions",
			buildProjectRequisitionsRequestParams(params),
		] as const,
};

export function useProjectsList(orgId: string, params: ProjectsListParams) {
	return useSuspenseQuery({
		queryKey: projectsKeys.list(orgId, {
			search: params.search,
			projectStatus: params.projectStatus,
			page: params.page,
			limit: params.limit,
		}),
		queryFn: () => ProjectsService.list(params),
		refetchOnMount: "always",
	});
}

export function useProjectMeta(orgId: string, projectId: string | null) {
	return useQuery({
		queryKey: projectsKeys.detailMeta(orgId, projectId ?? ""),
		queryFn: () => ProjectsService.getMeta(projectId as string),
		enabled: !!orgId && !!projectId,
		refetchOnMount: "always",
	});
}

export function useProjectStats(orgId: string, projectId: string | null) {
	return useQuery({
		queryKey: projectsKeys.detailStats(orgId, projectId ?? ""),
		queryFn: () => ProjectsService.getStats(projectId as string),
		enabled: !!orgId && !!projectId,
		refetchOnMount: "always",
	});
}

export function useProjectRequisitions(
	orgId: string,
	projectId: string | null,
	params: ProjectRequisitionsListParams,
) {
	return useQuery({
		queryKey: projectsKeys.detailRequisitions(orgId, projectId ?? "", params),
		queryFn: () =>
			ProjectsService.listRequisitions(projectId as string, params),
		enabled: !!orgId && !!projectId,
		refetchOnMount: "always",
	});
}

export function useCreateProject(orgId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateProjectPayload) =>
			ProjectsService.create(payload),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: projectsKeys.lists(orgId),
			});
		},
	});
}

export function useUpdateProject(orgId: string, projectId: string | undefined) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: UpdateProjectPayload) => {
			if (!projectId) throw new Error("Missing project id");
			return ProjectsService.update(projectId, payload);
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: projectsKeys.lists(orgId),
			});
			if (projectId) {
				void queryClient.invalidateQueries({
					queryKey: projectsKeys.detailPrefix(orgId, projectId),
				});
			}
		},
	});
}

export function useDeleteProject(orgId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (projectId: string) => ProjectsService.delete(projectId),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: projectsKeys.lists(orgId),
			});
		},
	});
}

export function useAddProjectRequisitions(
	orgId: string,
	projectId: string | undefined,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (requisitionIds: string[]) => {
			if (!projectId) throw new Error("Missing project id");
			return ProjectsService.addRequisitions(projectId, requisitionIds);
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: projectsKeys.lists(orgId),
			});
			void queryClient.invalidateQueries({
				queryKey: requisitionsKeys.lists(orgId),
			});
			if (projectId) {
				void queryClient.invalidateQueries({
					queryKey: projectsKeys.detailPrefix(orgId, projectId),
				});
			}
		},
	});
}

export function useRemoveProjectRequisition(
	orgId: string,
	projectId: string | undefined,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (requisitionId: string) => {
			if (!projectId) throw new Error("Missing project id");
			return ProjectsService.removeRequisition(projectId, requisitionId);
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: projectsKeys.lists(orgId),
			});
			void queryClient.invalidateQueries({
				queryKey: requisitionsKeys.lists(orgId),
			});
			if (projectId) {
				void queryClient.invalidateQueries({
					queryKey: projectsKeys.detailPrefix(orgId, projectId),
				});
			}
		},
	});
}
