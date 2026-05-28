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
	lists: () => [...projectsKeys.all, "list"] as const,
	list: (params: Record<string, string | number | undefined>) =>
		[...projectsKeys.lists(), params] as const,
	detailPrefix: (projectId: string) =>
		[...projectsKeys.all, "detail", projectId] as const,
	detailMeta: (projectId: string) =>
		[...projectsKeys.detailPrefix(projectId), "meta"] as const,
	detailStats: (projectId: string) =>
		[...projectsKeys.detailPrefix(projectId), "stats"] as const,
	detailRequisitions: (
		projectId: string,
		params: ProjectRequisitionsListParams,
	) =>
		[
			...projectsKeys.detailPrefix(projectId),
			"requisitions",
			buildProjectRequisitionsRequestParams(params),
		] as const,
};

export function useProjectsList(params: ProjectsListParams) {
	return useSuspenseQuery({
		queryKey: projectsKeys.list({
			search: params.search,
			projectStatus: params.projectStatus,
			page: params.page,
			limit: params.limit,
		}),
		queryFn: () => ProjectsService.list(params),
		refetchOnMount: "always",
	});
}

export function useProjectMeta(projectId: string | null) {
	return useQuery({
		queryKey: projectsKeys.detailMeta(projectId ?? ""),
		queryFn: () => ProjectsService.getMeta(projectId as string),
		enabled: !!projectId,
		refetchOnMount: "always",
	});
}

export function useProjectStats(projectId: string | null) {
	return useQuery({
		queryKey: projectsKeys.detailStats(projectId ?? ""),
		queryFn: () => ProjectsService.getStats(projectId as string),
		enabled: !!projectId,
		refetchOnMount: "always",
	});
}

export function useProjectRequisitions(
	projectId: string | null,
	params: ProjectRequisitionsListParams,
) {
	return useQuery({
		queryKey: projectsKeys.detailRequisitions(projectId ?? "", params),
		queryFn: () =>
			ProjectsService.listRequisitions(projectId as string, params),
		enabled: !!projectId,
		refetchOnMount: "always",
	});
}

export function useCreateProject() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateProjectPayload) =>
			ProjectsService.create(payload),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: projectsKeys.lists(),
			});
		},
	});
}

export function useUpdateProject(projectId: string | undefined) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: UpdateProjectPayload) => {
			if (!projectId) throw new Error("Missing project id");
			return ProjectsService.update(projectId, payload);
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: projectsKeys.lists(),
			});
			if (projectId) {
				void queryClient.invalidateQueries({
					queryKey: projectsKeys.detailPrefix(projectId),
				});
			}
		},
	});
}

export function useDeleteProject() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (projectId: string) => ProjectsService.delete(projectId),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: projectsKeys.lists(),
			});
		},
	});
}

export function useAddProjectRequisitions(projectId: string | undefined) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (requisitionIds: string[]) => {
			if (!projectId) throw new Error("Missing project id");
			return ProjectsService.addRequisitions(projectId, requisitionIds);
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: projectsKeys.lists(),
			});
			void queryClient.invalidateQueries({
				queryKey: requisitionsKeys.lists(),
			});
			if (projectId) {
				void queryClient.invalidateQueries({
					queryKey: projectsKeys.detailPrefix(projectId),
				});
			}
		},
	});
}

export function useRemoveProjectRequisition(projectId: string | undefined) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (requisitionId: string) => {
			if (!projectId) throw new Error("Missing project id");
			return ProjectsService.removeRequisition(projectId, requisitionId);
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: projectsKeys.lists(),
			});
			void queryClient.invalidateQueries({
				queryKey: requisitionsKeys.lists(),
			});
			if (projectId) {
				void queryClient.invalidateQueries({
					queryKey: projectsKeys.detailPrefix(projectId),
				});
			}
		},
	});
}
