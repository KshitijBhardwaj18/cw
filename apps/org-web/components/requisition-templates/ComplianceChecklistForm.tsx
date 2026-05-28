"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader } from "@repo/ui/components/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@repo/ui/components/field";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { SearchBar } from "@repo/ui/general/SearchBar";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { cn } from "@repo/ui/lib/utils";
import { useForm, useStore } from "@tanstack/react-form";
import { SquarePen } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
	type RequisitionTemplateComplianceChecklistFormValues,
	requisitionTemplateComplianceChecklistSchema,
} from "@/schemas/requisition-template-compliance-checklist.schema";
import type {
	ComplianceItemOption,
	RequisitionComplianceChecklistCardItem,
} from "@/types/requisition-compliance-checklist";
import { STEP_VALIDATION_TOAST } from "./CreateRequisitionTemplatePageContent";
import {
	type ComplianceItemUsageRow,
	type ComplianceItemUsageType,
	EditComplianceItemUsageDialog,
} from "./EditComplianceItemUsageDialog";

const defaultValues: RequisitionTemplateComplianceChecklistFormValues = {
	complianceChecklistId: "",
	itemUsages: {},
};

function buildUsageRows(
	complianceItemIds: string[] = [],
	itemOptions: ComplianceItemOption[] = [],
): ComplianceItemUsageRow[] {
	const byId = new Map(itemOptions.map((c) => [c.id, c]));
	return complianceItemIds.map((id) => {
		const item = byId.get(id);
		return {
			id,
			name: item?.name ?? id,
			category: item?.category ?? "Other",
			expirationRequired: item?.tracksExpiration ?? false,
			displayToCandidate: item?.displayToCandidate ?? false,
		};
	});
}

interface ComplianceChecklistFormProps {
	onSubmit: (values: RequisitionTemplateComplianceChecklistFormValues) => void;
	onCancel: () => void;
	onBack?: () => void;
	isPending?: boolean;
	checklists: RequisitionComplianceChecklistCardItem[];
	itemOptions?: ComplianceItemOption[];
	initialValues?: RequisitionTemplateComplianceChecklistFormValues;
	readOnly?: boolean;
}

type ChecklistListItem = RequisitionComplianceChecklistCardItem & {
	occupationName?: string;
	specialtyName?: string;
	requiredItemCount?: number;
};

export function ComplianceChecklistForm({
	onSubmit,
	onCancel,
	onBack,
	isPending = false,
	checklists,
	itemOptions = [],
	initialValues,
	readOnly = false,
}: Readonly<ComplianceChecklistFormProps>) {
	const [search, setSearch] = useState("");
	const [editUsageChecklistId, setEditUsageChecklistId] = useState<
		string | null
	>(null);
	const form = useForm({
		defaultValues: initialValues ?? defaultValues,
		validators: {
			onSubmit: requisitionTemplateComplianceChecklistSchema,
		},
		onSubmitInvalid: () => {
			toast.error(STEP_VALIDATION_TOAST);
		},
		onSubmit: ({ value }) => {
			onSubmit(value);
		},
	});

	const itemUsages = useStore(form.store, (s) => s.values.itemUsages);

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	const filteredChecklists = useMemo(() => {
		const q = search.toLowerCase().trim();
		if (!q) return checklists;
		return checklists.filter((c: ChecklistListItem) => {
			const ext = c;
			return (
				c.name.toLowerCase().includes(q) ||
				c.description?.toLowerCase().includes(q) ||
				ext.occupationName?.toLowerCase().includes(q) ||
				ext.specialtyName?.toLowerCase().includes(q)
			);
		});
	}, [checklists, search]);

	const editChecklist = editUsageChecklistId
		? checklists.find((c) => c.id === editUsageChecklistId)
		: null;

	const editUsageItems = useMemo(() => {
		if (!editChecklist?.complianceItemIds) return [];
		return buildUsageRows(editChecklist.complianceItemIds, itemOptions);
	}, [editChecklist, itemOptions]);

	const handleEditUsageSave = (
		usages: Record<string, ComplianceItemUsageType>,
	) => {
		if (editUsageChecklistId) {
			form.setFieldValue("itemUsages", (prev) => ({
				...(prev ?? {}),
				[editUsageChecklistId]: usages,
			}));
		}
		setEditUsageChecklistId(null);
	};

	if (checklists.length === 0) {
		return (
			<Card>
				<CardHeader>
					<ConfigPageHeader
						title="Requisition Compliance Checklist"
						total={0}
						itemLabel="checklist"
						itemLabelPlural="checklists"
						description="No compliance checklists are available for this organization yet."
					/>
				</CardHeader>
				<CardContent>
					<div className="text-muted-foreground rounded-lg border border-dashed p-6 text-sm">
						Create a compliance checklist template first, then come back to
						select it here.
					</div>
					<div className="mt-6 flex justify-end gap-3">
						{onBack && (
							<Button type="button" variant="outline" onClick={onBack}>
								Back
							</Button>
						)}
						<Button type="button" variant="outline" onClick={onCancel}>
							Cancel
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<Card>
				<CardHeader>
					<ConfigPageHeader
						title="Requisition Compliance Checklist"
						total={0}
						itemLabel="checklist"
						itemLabelPlural="checklists"
						description="Select which compliance requirements are needed for this specific job requisition. This checklist is job-specific and defines what documents candidates must provide to be considered for this position."
					/>{" "}
				</CardHeader>

				<CardContent>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							void form.handleSubmit();
						}}
						className="space-y-6"
					>
						<FieldGroup>
							<form.Field
								name="complianceChecklistId"
								validators={{
									onChange:
										requisitionTemplateComplianceChecklistSchema.shape
											.complianceChecklistId,
								}}
							>
								{(field) => {
									const handleSelect = (checklistId: string) => {
										field.handleChange(checklistId);
										field.handleBlur();
									};
									const selectedId = field.state.value;
									const isInvalid = formFieldShowInvalid(
										field.state.meta.isTouched,
										field.state.meta.isValid,
										submissionAttempts,
									);
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel>
												Select Requisition Compliance Checklist <RequiredStar />
											</FieldLabel>
											<p className="text-muted-foreground mb-3 text-sm">
												Choose the compliance checklist that matches the
												requirements for this job role
											</p>

											<SearchBar
												placeholder="Search compliance templates..."
												value={search}
												onChange={setSearch}
												disabled={isPending || readOnly}
											/>

											<RadioGroup
												value={selectedId}
												onValueChange={handleSelect}
												className="mt-4 space-y-3"
											>
												{filteredChecklists.map((checklist) => {
													const ext = checklist as ChecklistListItem;
													const requiredCount =
														ext.requiredItemCount ??
														checklist.checklistItemCount;
													const isSelected = selectedId === checklist.id;

													return (
														<label
															key={checklist.id}
															htmlFor={`checklist-${checklist.id}`}
															className={cn(
																"flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors",
																isSelected
																	? "border-primary bg-primary/5"
																	: "hover:bg-muted/50",
															)}
														>
															<RadioGroupItem
																value={checklist.id}
																id={`checklist-${checklist.id}`}
															/>
															<div className="min-w-0 flex-1">
																<div className="flex flex-wrap items-center gap-2">
																	<span className="font-semibold">
																		{checklist.name}
																	</span>
																	{ext.occupationName && (
																		<span className="text-muted-foreground text-sm">
																			{ext.occupationName}
																		</span>
																	)}
																	{ext.specialtyName && (
																		<span className="text-muted-foreground text-sm">
																			• {ext.specialtyName}
																		</span>
																	)}
																</div>
																<div className="mt-1 flex items-center gap-3 text-sm">
																	<span>
																		{checklist.checklistItemCount} items
																	</span>
																	<span className="text-orange-500 font-medium dark:text-orange-400">
																		{requiredCount} required
																	</span>
																</div>
															</div>
															<Badge variant="success">Active</Badge>
															<Button
																type="button"
																variant="outline"
																size="sm"
																onClick={(e) => {
																	e.preventDefault();
																	e.stopPropagation();
																	if (readOnly) return;
																	setEditUsageChecklistId(checklist.id);
																}}
																disabled={readOnly}
															>
																<SquarePen
																	className="size-4"
																	data-icon="inline-start"
																/>
																Edit Usage
															</Button>
														</label>
													);
												})}
											</RadioGroup>

											{filteredChecklists.length === 0 && (
												<p className="text-muted-foreground mt-4 text-sm">
													No compliance templates found. Try adjusting your
													search.
												</p>
											)}

											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>
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
										{isSubmitting || isPending ? "Saving..." : "Next →"}
									</Button>
								)}
							</form.Subscribe>
						</div>
					</form>
				</CardContent>
			</Card>

			<EditComplianceItemUsageDialog
				key={editUsageChecklistId ?? "closed"}
				open={Boolean(editUsageChecklistId)}
				onOpenChange={(open) => !open && setEditUsageChecklistId(null)}
				templateName={editChecklist?.name ?? ""}
				items={editUsageItems}
				initialUsages={
					editUsageChecklistId && editChecklist
						? ({
								...Object.fromEntries(
									editChecklist.checklistItems.map((i) => [
										i.complianceListItemId,
										i.phase,
									]),
								),
								...(itemUsages[editUsageChecklistId] ?? {}),
							} as Record<string, ComplianceItemUsageType>)
						: undefined
				}
				onSave={handleEditUsageSave}
			/>
		</>
	);
}
