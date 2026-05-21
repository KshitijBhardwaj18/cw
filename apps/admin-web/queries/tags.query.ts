import {
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import type { CreateTagPayload } from "@/schemas/tag.schema";
import type { TagsListParams } from "@/services/tags.service";
import { TagsService } from "@/services/tags.service";

export const tagsKeys = {
	all: ["tags"] as const,
	list: (params: TagsListParams) => [...tagsKeys.all, "list", params] as const,
	detail: (id: string) => [...tagsKeys.all, "detail", id] as const,
};

export const useTags = (params: TagsListParams = {}) => {
	return useQuery({
		queryKey: tagsKeys.list(params),
		queryFn: () => TagsService.getTags(params),
	});
};

export const useTag = (id: string) => {
	return useSuspenseQuery({
		queryKey: tagsKeys.detail(id),
		queryFn: () => TagsService.getTagById(id),
	});
};

export const useCreateTag = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateTagPayload) => TagsService.createTag(data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: tagsKeys.all });
		},
	});
};

export const useUpdateTag = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: Partial<CreateTagPayload>;
		}) => TagsService.updateTag(id, data),
		onSuccess: (_, { id }) => {
			void queryClient.invalidateQueries({ queryKey: tagsKeys.all });
			void queryClient.invalidateQueries({
				queryKey: tagsKeys.detail(id),
			});
		},
	});
};

export const useDeleteTag = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => TagsService.deleteTag(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: tagsKeys.all });
		},
	});
};
