"use client";

import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Badge } from "@repo/ui/components/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { Textarea } from "@repo/ui/components/textarea";
import { FormDialogFooter } from "@repo/ui/general/FormDialogFooter";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { cn } from "@repo/ui/lib/utils";
import { useForm, useStore } from "@tanstack/react-form";
import { TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";
import {
	useCreateGrievance,
	useGrievanceLogOptions,
} from "@/queries/grievances.queries";
import { type LogGrievanceFormValues, logGrievanceSchema } from "@/schemas";

const INITIAL_VALUES: LogGrievanceFormValues = {
	type: "CLINICAL",
	workerId: "",
	placementId: "none",
	description: "",
};

export type LogGrievanceDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	orgId: string;
};

export function LogGrievanceDialog({
	open,
	onOpenChange,
	orgId,
}: LogGrievanceDialogProps) {
	const router = useRouter();
	const { data: logOptions, isLoading: optionsLoading } =
		useGrievanceLogOptions(orgId, open);
	const createMutation = useCreateGrievance(orgId);

	const form = useForm({
		defaultValues: INITIAL_VALUES,
		validators: { onSubmit: logGrievanceSchema },
		onSubmitInvalid: () => {
			toast.error("Please complete all required fields.");
		},
		onSubmit: async ({ value }) => {
			return new Promise<void>((resolve, reject) => {
				createMutation.mutate(
					{
						type: value.type,
						candidateId: value.workerId,
						placementId:
							value.placementId === "none" ? undefined : value.placementId,
						description: value.description,
					},
					{
						onSuccess: (data) => {
							toast.success("Grievance logged");
							handleOpenChange(false);
							router.push(`/org/grievances/${data.id}`);
							resolve();
						},
						onError: (err) => {
							toast.error(
								err instanceof Error ? err.message : "Failed to log grievance",
							);
							reject(err instanceof Error ? err : new Error("Request failed"));
						},
					},
				);
			});
		},
	});

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	const workerId = useStore(form.store, (s) => s.values.workerId);

	const workerOptions = logOptions?.candidates ?? [];
	const placementOptions = useMemo(() => {
		const none = {
			value: "none",
			label: "Select a placement (if applicable)",
		} as const;
		if (!logOptions?.placements) return [none];
		const forWorker = workerId
			? logOptions.placements.filter((p) => p.candidateId === workerId)
			: [];
		return [none, ...forWorker.map((p) => ({ value: p.id, label: p.label }))];
	}, [logOptions?.placements, workerId]);

	function handleOpenChange(next: boolean) {
		if (!next) {
			form.reset();
		}
		onOpenChange(next);
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="flex max-h-[min(90vh,800px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
				<DialogHeader className="px-5 py-4 text-left">
					<DialogTitle className="text-xl font-bold">Log Grievance</DialogTitle>
					<DialogDescription>
						Document and track behavioral or clinical concerns
					</DialogDescription>
				</DialogHeader>

				<form
					className="flex min-h-0 flex-1 flex-col"
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						void form.handleSubmit();
					}}
				>
					<div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-4">
						<div className="bg-card space-y-5 rounded-xl border p-4 shadow-sm sm:p-5">
							<form.Field
								name="type"
								validators={{
									onBlur: logGrievanceSchema.shape.type,
								}}
							>
								{(field) => {
									const isInvalid = formFieldShowInvalid(
										field.state.meta.isTouched,
										field.state.meta.isValid,
										submissionAttempts,
									);
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel>
												Grievance type <RequiredStar />
											</FieldLabel>
											<p className="text-muted-foreground mb-3 text-xs">
												Select one of the two standard grievance types (these
												types cannot be customized)
											</p>
											<RadioGroup
												value={field.state.value}
												onValueChange={(v) => {
													field.handleChange(
														v as LogGrievanceFormValues["type"],
													);
													field.handleBlur();
												}}
												className="grid grid-cols-1 gap-3 sm:grid-cols-2"
											>
												<label
													htmlFor="grievance-type-behavioral"
													className={cn(
														"cursor-pointer rounded-lg border p-4 transition-colors",
														field.state.value === "BEHAVIORAL"
															? "border-primary ring-primary/30 ring-2"
															: "hover:border-border/80",
													)}
												>
													<div className="flex items-start gap-3">
														<RadioGroupItem
															id="grievance-type-behavioral"
															value="BEHAVIORAL"
															className="mt-1"
														/>
														<div className="min-w-0 flex-1 space-y-2">
															<div className="flex flex-wrap items-center gap-2">
																<span className="font-semibold text-sm">
																	Behavioral
																</span>
																<Badge variant="warning">Conduct Issue</Badge>
															</div>
															<p className="text-muted-foreground text-sm leading-snug">
																Issues related to worker conduct,
																professionalism, or workplace behavior
															</p>
														</div>
													</div>
												</label>
												<label
													htmlFor="grievance-type-clinical"
													className={cn(
														"cursor-pointer rounded-lg border p-4 transition-colors",
														field.state.value === "CLINICAL"
															? "border-primary ring-primary/30 ring-2"
															: "hover:border-border/80",
													)}
												>
													<div className="flex items-start gap-3">
														<RadioGroupItem
															id="grievance-type-clinical"
															value="CLINICAL"
															className="mt-1"
														/>
														<div className="min-w-0 flex-1 space-y-2">
															<div className="flex flex-wrap items-center gap-2">
																<span className="font-semibold text-sm">
																	Clinical
																</span>
																<Badge variant="error">Patient Safety</Badge>
															</div>
															<p className="text-muted-foreground text-sm leading-snug">
																Concerns related to clinical competency, patient
																care, or safety protocols
															</p>
														</div>
													</div>
												</label>
											</RadioGroup>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>

							<form.Field
								name="workerId"
								validators={{
									onBlur: logGrievanceSchema.shape.workerId,
								}}
							>
								{(field) => {
									const isInvalid = formFieldShowInvalid(
										field.state.meta.isTouched,
										field.state.meta.isValid,
										submissionAttempts,
									);
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel>
												Worker <RequiredStar />
											</FieldLabel>
											<Select
												value={field.state.value || undefined}
												onValueChange={(v) => {
													field.handleChange(v);
													form.setFieldValue("placementId", "none");
													field.handleBlur();
												}}
												disabled={optionsLoading}
											>
												<SelectTrigger
													aria-invalid={isInvalid}
													className="w-full"
												>
													<SelectValue placeholder="Select a worker" />
												</SelectTrigger>
												<SelectContent>
													{workerOptions.map((w) => (
														<SelectItem key={w.id} value={w.id}>
															{w.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>

							<form.Field name="placementId">
								{(field) => (
									<Field>
										<FieldLabel>Placement (optional)</FieldLabel>
										<Select
											value={field.state.value}
											onValueChange={(v) => field.handleChange(v)}
											disabled={optionsLoading || !workerId}
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select a placement (if applicable)" />
											</SelectTrigger>
											<SelectContent>
												{placementOptions.map((p) => (
													<SelectItem key={p.value} value={p.value}>
														{p.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<p className="text-muted-foreground mt-1.5 text-xs">
											Link this grievance to a specific placement assignment if
											relevant
										</p>
									</Field>
								)}
							</form.Field>

							<form.Field
								name="description"
								validators={{
									onBlur: logGrievanceSchema.shape.description,
								}}
							>
								{(field) => {
									const isInvalid = formFieldShowInvalid(
										field.state.meta.isTouched,
										field.state.meta.isValid,
										submissionAttempts,
									);
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>
												Description <RequiredStar />
											</FieldLabel>
											<Textarea
												id={field.name}
												rows={5}
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												onBlur={field.handleBlur}
												placeholder="Provide a detailed description of the grievance, including date, time, location, and specific details about the incident..."
												aria-invalid={isInvalid}
												className="h-28"
											/>
											<Alert
												className="mt-3 border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-50"
												role="note"
											>
												<TriangleAlert className="text-amber-700 dark:text-amber-400" />
												<AlertTitle>Important</AlertTitle>
												<AlertDescription>
													Include factual, objective information. Avoid
													speculation or personal opinions. Document specific
													behaviors, actions, or events with dates and times
													when possible.
												</AlertDescription>
											</Alert>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>
						</div>

						<div className="bg-muted/30 space-y-3 rounded-lg border p-4">
							<p className="font-semibold text-sm">
								What happens after submission?
							</p>
							<ul className="text-muted-foreground list-inside list-disc space-y-1.5 text-sm">
								<li>
									The grievance will be logged in the system with a timestamp.
								</li>
								<li>Relevant managers and HR personnel will be notified.</li>
								<li>
									The grievance will be reviewed and investigated according to
									company policy.
								</li>
								<li>
									You will be contacted if additional information is needed.
								</li>
							</ul>
						</div>
					</div>

					<div className="border-t px-5 py-4">
						<FormDialogFooter
							form={form}
							onCancel={() => handleOpenChange(false)}
							cancelLabel="Cancel"
							submitLabel="Submit Grievance"
							submitLoadingLabel="Submitting..."
							isPending={createMutation.isPending}
						/>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
