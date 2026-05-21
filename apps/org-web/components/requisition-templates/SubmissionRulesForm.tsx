"use client";

import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader } from "@repo/ui/components/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@repo/ui/components/field";
import {
	MultiSelect,
	MultiSelectContent,
	MultiSelectItem,
	MultiSelectTrigger,
	MultiSelectValue,
} from "@repo/ui/components/multi-select";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { Textarea } from "@repo/ui/components/textarea";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { cn } from "@repo/ui/lib/utils";
import { useForm, useStore } from "@tanstack/react-form";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
	REQUISITION_TEMPLATE_APPROVER_ROLE_OPTIONS,
	REQUISITION_TEMPLATE_WORKFLOW_TYPE_OPTIONS,
} from "@/constants/requisition-template-submission-rules";
import {
	type RequisitionTemplateSubmissionRulesFormValues,
	requisitionTemplateSubmissionRulesBaseSchema,
	requisitionTemplateSubmissionRulesSchema,
} from "@/schemas/requisition-template-submission-rules.schema";
import { STEP_VALIDATION_TOAST } from "./CreateRequisitionTemplatePageContent";

const defaultValues: RequisitionTemplateSubmissionRulesFormValues = {
	approvalRequired: false,
	approverRole: "HIRING_MANAGER",
	workflowType: "VENDOR_CANDIDATE",
	whoCanSubmit: "ALL_VENDORS",
	selectedVendorIds: [],
	internalNotes: "",
};

interface SubmissionRulesFormProps {
	onSubmit: (values: RequisitionTemplateSubmissionRulesFormValues) => void;
	onCancel: () => void;
	onBack?: () => void;
	isPending?: boolean;
	vendors: { id: string; name: string }[];
	initialValues?: RequisitionTemplateSubmissionRulesFormValues;
	readOnly?: boolean;
}

export function SubmissionRulesForm({
	onSubmit,
	onCancel,
	onBack,
	isPending = false,
	vendors,
	initialValues,
	readOnly = false,
}: SubmissionRulesFormProps) {
	const initialValuesKey = useMemo(
		() => (initialValues ? JSON.stringify(initialValues) : ""),
		[initialValues],
	);

	const form = useForm({
		defaultValues: initialValues ?? defaultValues,
		validators: {
			onSubmit: requisitionTemplateSubmissionRulesSchema,
		},
		onSubmitInvalid: () => {
			toast.error(STEP_VALIDATION_TOAST);
		},
		onSubmit: ({ value }) => {
			onSubmit(value);
		},
	});

	useEffect(() => {
		if (!initialValuesKey) return;
		form.reset(
			JSON.parse(
				initialValuesKey,
			) as RequisitionTemplateSubmissionRulesFormValues,
		);
	}, [initialValuesKey, form.reset]);

	const whoCanSubmit = useStore(form.store, (s) => s.values.whoCanSubmit);
	const approvalRequired = useStore(
		form.store,
		(s) => s.values.approvalRequired,
	);
	const workflowType = useStore(form.store, (s) => s.values.workflowType);
	const isCandidateOnly = workflowType === "CANDIDATE_ONLY";

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	return (
		<Card>
			<CardHeader>
				<ConfigPageHeader
					title="Submission Rules & Approval"
					total={0}
					itemLabel="rule"
					itemLabelPlural="rules"
					description="Define the submission rules and approval process for this requisition template."
				/>
			</CardHeader>

			<CardContent>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						void form.handleSubmit();
					}}
					className="space-y-8"
				>
					<FieldGroup className="space-y-6">
						{/* Approval Settings */}
						<div className="rounded-xl border border-cyan-200/80 bg-cyan-50/60 p-4 dark:border-cyan-900/50 dark:bg-cyan-950/40">
							<div className="mb-4 flex gap-3">
								<div className="text-cyan-600 dark:text-cyan-400">
									<CheckCircle2 className="size-6 shrink-0" aria-hidden />
								</div>
								<div>
									<h3 className="font-semibold text-foreground">
										Approval Settings
									</h3>
									<p className="text-muted-foreground mt-1 text-sm">
										Configure approval requirements for jobs created from this
										template.
									</p>
								</div>
							</div>

							<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
								<form.Field
									name="approvalRequired"
									validators={{
										onChange:
											requisitionTemplateSubmissionRulesBaseSchema.shape
												.approvalRequired,
									}}
								>
									{(field) => (
										<Field>
											<FieldLabel className="text-sm font-medium">
												Approval Required?
											</FieldLabel>
											<RadioGroup
												className="mt-3 flex flex-wrap gap-6"
												value={field.state.value ? "yes" : "no"}
												onValueChange={(v) => {
													if (readOnly) return;
													field.handleChange(v === "yes");
												}}
											>
												<div className="flex items-center gap-2">
													<RadioGroupItem value="no" id="approval-no" />
													<label
														htmlFor="approval-no"
														className="cursor-pointer text-sm font-medium leading-none"
													>
														No
													</label>
												</div>
												<div className="flex items-center gap-2">
													<RadioGroupItem value="yes" id="approval-yes" />
													<label
														htmlFor="approval-yes"
														className="cursor-pointer text-sm font-medium leading-none"
													>
														Yes
													</label>
												</div>
											</RadioGroup>
											<p className="text-muted-foreground mt-3 text-sm">
												{field.state.value
													? "Jobs will require approval before being published to vendors."
													: "Jobs created from this template will be automatically published."}
											</p>
										</Field>
									)}
								</form.Field>

								{approvalRequired && (
									<div className="mt-5 space-y-4 border-t border-border pt-5">
										<form.Field name="approverRole">
											{(field) => {
												const isInvalid = formFieldShowInvalid(
													field.state.meta.isTouched,
													field.state.meta.isValid,
													submissionAttempts,
												);
												return (
													<Field data-invalid={isInvalid}>
														<FieldLabel>
															Approver Role <RequiredStar />
														</FieldLabel>
														<Select
															value={field.state.value ?? ""}
															onValueChange={(value) => {
																if (readOnly) return;
																field.handleChange(
																	value as typeof field.state.value,
																);
															}}
														>
															<SelectTrigger
																id={field.name}
																aria-invalid={isInvalid}
															>
																<SelectValue placeholder="Select approver role" />
															</SelectTrigger>
															<SelectContent>
																{REQUISITION_TEMPLATE_APPROVER_ROLE_OPTIONS.map(
																	(opt) => (
																		<SelectItem
																			key={opt.value}
																			value={opt.value}
																		>
																			{opt.label}
																		</SelectItem>
																	),
																)}
															</SelectContent>
														</Select>
														{isInvalid && (
															<FieldError errors={field.state.meta.errors} />
														)}
													</Field>
												);
											}}
										</form.Field>
									</div>
								)}
							</div>
						</div>

						<div className="space-y-6">
							<div>
								<h3 className="text-lg font-semibold">Submission Settings</h3>
								<p className="text-muted-foreground text-sm">
									Configure workflow settings, vendor submission rules and
									acceptance criteria
								</p>
							</div>

							<div className="space-y-5">
								<h4 className="font-semibold">Workflow Settings</h4>
								<form.Field
									name="workflowType"
									validators={{
										onChange:
											requisitionTemplateSubmissionRulesBaseSchema.shape
												.workflowType,
									}}
								>
									{(field) => {
										const selected = field.state.value;
										const isInvalid = formFieldShowInvalid(
											field.state.meta.isTouched,
											field.state.meta.isValid,
											submissionAttempts,
										);
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel>
													Submission Type <RequiredStar />
												</FieldLabel>
												<RadioGroup
													value={selected}
													onValueChange={(v) => {
														if (readOnly) return;
														const next =
															v as RequisitionTemplateSubmissionRulesFormValues["workflowType"];
														field.handleChange(next);
														if (next === "CANDIDATE_ONLY") {
															form.setFieldValue("whoCanSubmit", "ALL_VENDORS");
															form.setFieldValue("selectedVendorIds", []);
														}
													}}
													className="space-y-3"
												>
													{REQUISITION_TEMPLATE_WORKFLOW_TYPE_OPTIONS.map(
														(opt) => (
															<label
																key={opt.value}
																htmlFor={`workflow-${opt.value}`}
																className={cn(
																	"flex cursor-pointer gap-4 rounded-lg border p-4 transition-colors",
																	selected === opt.value
																		? "border-primary bg-primary/5"
																		: "hover:bg-muted/50",
																)}
															>
																<RadioGroupItem
																	value={opt.value}
																	id={`workflow-${opt.value}`}
																	className="mt-0.5"
																/>
																<div>
																	<div className="text-sm font-semibold">
																		{opt.label}
																	</div>
																	<p className="text-muted-foreground mt-1 text-sm">
																		{opt.description}
																	</p>
																</div>
															</label>
														),
													)}
												</RadioGroup>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								</form.Field>
							</div>

							{!isCandidateOnly && (
								<div className="space-y-5 border-t pt-5">
									<h4 className="font-semibold">Vendor Submission Rules</h4>

									<form.Field
										name="whoCanSubmit"
										validators={{
											onChange:
												requisitionTemplateSubmissionRulesBaseSchema.shape
													.whoCanSubmit,
										}}
									>
										{(field) => {
											const who = field.state.value;
											return (
												<Field>
													<FieldLabel>
														Vendor Access <RequiredStar />
													</FieldLabel>
													<RadioGroup
														value={who}
														onValueChange={(v) => {
															if (readOnly) return;
															const next =
																v as RequisitionTemplateSubmissionRulesFormValues["whoCanSubmit"];
															field.handleChange(next);
															if (next === "ALL_VENDORS") {
																form.setFieldValue("selectedVendorIds", []);
															}
														}}
														className="space-y-3"
													>
														<label
															htmlFor="who-all"
															className={cn(
																"flex cursor-pointer gap-4 rounded-lg border p-4 transition-colors",
																who === "ALL_VENDORS"
																	? "border-primary bg-primary/5"
																	: "hover:bg-muted/50",
															)}
														>
															<RadioGroupItem
																value="ALL_VENDORS"
																id="who-all"
																className="mt-0.5"
															/>
															<div>
																<div className="text-sm font-semibold">
																	All Vendors
																</div>
																<p className="text-muted-foreground mt-1 text-sm">
																	All active vendors in this organization can
																	submit candidates.
																</p>
															</div>
														</label>

														<label
															htmlFor="who-selected"
															className={cn(
																"flex cursor-pointer gap-4 rounded-lg border p-4 transition-colors",
																who === "SELECTED_VENDORS"
																	? "border-primary bg-primary/5"
																	: "hover:bg-muted/50",
															)}
														>
															<RadioGroupItem
																value="SELECTED_VENDORS"
																id="who-selected"
																className="mt-0.5"
															/>
															<div>
																<div className="text-sm font-semibold">
																	Selected Vendors
																</div>
																<p className="text-muted-foreground mt-1 text-sm">
																	Choose specific vendors who can submit.
																</p>
															</div>
														</label>
													</RadioGroup>
												</Field>
											);
										}}
									</form.Field>

									{whoCanSubmit === "SELECTED_VENDORS" && (
										<form.Field
											name="selectedVendorIds"
											validators={{
												onSubmit: ({ value }) => {
													if (value.length === 0) {
														return "Select at least one vendor";
													}
												},
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
														<FieldLabel>Select Vendors</FieldLabel>
														<MultiSelect
															values={field.state.value}
															onValuesChange={(v) => {
																if (readOnly) return;
																field.handleChange(v);
															}}
														>
															<MultiSelectTrigger
																id={field.name}
																className={cn(
																	"h-auto min-h-10 w-full justify-between border-teal-500/40 py-2 whitespace-normal focus-visible:border-teal-600 focus-visible:ring-teal-500/25 dark:border-teal-600/50",
																)}
																aria-invalid={isInvalid}
															>
																<MultiSelectValue placeholder="Choose one or more vendors" />
															</MultiSelectTrigger>
															<MultiSelectContent
																search={{ placeholder: "Search vendors..." }}
															>
																{vendors.map((v) => (
																	<MultiSelectItem
																		key={v.id}
																		value={v.id}
																		badgeLabel={v.name}
																	>
																		<span className="flex min-w-0 flex-1 items-center gap-2">
																			<span className="truncate">{v.name}</span>
																		</span>
																	</MultiSelectItem>
																))}
															</MultiSelectContent>
														</MultiSelect>
														{isInvalid && (
															<FieldError errors={field.state.meta.errors} />
														)}
													</Field>
												);
											}}
										</form.Field>
									)}

									<form.Field
										name="internalNotes"
										validators={{
											onChange:
												requisitionTemplateSubmissionRulesBaseSchema.shape
													.internalNotes,
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
													<FieldLabel htmlFor="internal-notes">
														Internal Notes (Vendors cannot see this)
													</FieldLabel>
													<Textarea
														id="internal-notes"
														placeholder="Add internal notes..."
														rows={4}
														value={field.state.value ?? ""}
														onBlur={field.handleBlur}
														onChange={(e) => {
															if (readOnly) return;
															field.handleChange(e.target.value);
														}}
														aria-invalid={isInvalid}
														className="resize-y"
													/>
													{isInvalid && (
														<FieldError errors={field.state.meta.errors} />
													)}
												</Field>
											);
										}}
									</form.Field>
								</div>
							)}
						</div>
					</FieldGroup>

					<div className="flex justify-end gap-3 pt-4">
						{onBack && (
							<Button
								type="button"
								variant="outline"
								onClick={onBack}
								disabled={isPending}
							>
								Back
							</Button>
						)}
						<Button
							type="button"
							variant="outline"
							onClick={onCancel}
							disabled={isPending}
						>
							Cancel
						</Button>
						<form.Subscribe selector={(s) => s.isSubmitting}>
							{(isSubmitting) => (
								<Button type="submit" disabled={isSubmitting || isPending}>
									{isSubmitting || isPending ? "Saving..." : "Finish"}
								</Button>
							)}
						</form.Subscribe>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
