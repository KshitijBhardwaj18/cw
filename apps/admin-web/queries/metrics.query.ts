import {
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { MetricsService } from "@/services/metrics.service";

export const metricsKeys = {
	all: ["metrics"] as const,
	list: () => [...metricsKeys.all, "list"] as const,
	organization: (organizationId: string) =>
		[...metricsKeys.all, "organization", organizationId] as const,
};

export const useMetrics = () => {
	return useSuspenseQuery({
		queryKey: metricsKeys.list(),
		queryFn: () => MetricsService.getMetrics(),
		refetchOnMount: "always",
	});
};

export const useUpdateMetricStatus = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, status }: { id: string; status: boolean }) =>
			MetricsService.updateMetricStatus(id, status),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: metricsKeys.all });
		},
	});
};

export const useOrganizationMetrics = (
	organizationId: string,
	options?: { enabled?: boolean },
) => {
	return useQuery({
		queryKey: metricsKeys.organization(organizationId),
		queryFn: () => MetricsService.getOrganizationMetrics(organizationId),
		enabled: (options?.enabled ?? true) && !!organizationId,
	});
};

export const useUpsertOrganizationMetric = (organizationId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: {
			metricId: string;
			goal: number;
			isActive?: boolean;
		}) => MetricsService.upsertOrganizationMetric(organizationId, payload),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: metricsKeys.organization(organizationId),
			});
		},
	});
};

export const useUpdateOrganizationMetric = (organizationId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			metricId,
			payload,
		}: {
			metricId: string;
			payload: {
				goal?: number;
				isActive?: boolean;
			};
		}) =>
			MetricsService.updateOrganizationMetric(
				organizationId,
				metricId,
				payload,
			),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: metricsKeys.organization(organizationId),
			});
		},
	});
};
