"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";
import { toast } from "sonner";
import { useUpdateRoutingSettings } from "@/queries/shift-routing.queries";
import type { DelayFormValues } from "@/schemas/shift-routing.schema";
import { delaySchema } from "@/schemas/shift-routing.schema";
import type { UpdateRoutingSettingsInput } from "@/services/shift-routing.service";

interface RoutingDelaySettings {
	enableRoutingDelay: boolean;
	delayDuration: number;
	delayUnit: string;
}

export function useRoutingDelayForm(
	orgId: string,
	settings: RoutingDelaySettings | null | undefined,
) {
	const mutation = useUpdateRoutingSettings(orgId);

	const defaultValues: DelayFormValues = {
		enableRoutingDelay: settings?.enableRoutingDelay ?? false,
		delayDuration: settings?.delayDuration ?? 24,
		delayUnit: (settings?.delayUnit as DelayFormValues["delayUnit"]) ?? "HOURS",
	};

	const form = useForm({
		defaultValues,
		validators: { onSubmit: delaySchema },
		onSubmitInvalid: () => toast.error("Please fill in all required fields"),
		onSubmit: ({ value }) => {
			mutation.mutate(value as UpdateRoutingSettingsInput, {
				onSuccess: () => {
					toast.success("Routing delay settings saved");
				},
				onError: (err) => {
					toast.error(
						err instanceof Error ? err.message : "Something went wrong",
					);
				},
			});
		},
	});

	useEffect(() => {
		if (settings) {
			form.reset({
				enableRoutingDelay: settings.enableRoutingDelay,
				delayDuration: settings.delayDuration,
				delayUnit: settings.delayUnit as DelayFormValues["delayUnit"],
			});
		}
	}, [settings, form]);

	return {
		form,
		isSaving: mutation.isPending,
	};
}
