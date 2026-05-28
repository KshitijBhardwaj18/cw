"use client";

import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Progress } from "@repo/ui/components/progress";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { Textarea } from "@repo/ui/components/textarea";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { SearchBar } from "@repo/ui/general/SearchBar";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { useStore } from "@tanstack/react-form";
import { ChevronRight, Save } from "lucide-react";
import { useCreateChecklistTemplateDialog } from "@/hooks/use-create-checklist-template-dialog";

const CATEGORY_COLORS: Record<string, string> = {
	Licensing: "bg-violet-500",
	Certifications: "bg-blue-500",
	"Employee Health": "bg-emerald-500",
	"Background and Identification": "bg-amber-500",
};

export interface CreateChecklistTemplateDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit?: (payload: {
		templateName: string;
		description?: string;
		complianceItemIds: string[];
	}) => void | Promise<void>;
	initialValues?: {
		templateName?: string;
		description?: string;
		complianceItemIds?: string[];
	};
	/** When true, all fields are disabled (read-only view) */
	viewMode?: boolean;
	isSubmitting?: boolean;
}

export function CreateChecklistTemplateDialog({
	open,
	onOpenChange,
	onSubmit,
	initialValues,
	viewMode = false,
	isSubmitting = false,
}: Readonly<CreateChecklistTemplateDialogProps>) {
	const {
		form,
		step,
		search,
		setSearch,
		selectedIds,
		grouped,
		toggleItem,
		toggleCategory,
		handleClose,
		handleOpenChange,
		handleContinue,
		handleBack,
		handleSave,
		selectedCount,
		editMode,
	} = useCreateChecklistTemplateDialog({
		open,
		onOpenChange,
		onSubmit,
		initialValues,
		viewMode,
	});

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="flex max-h-[72vh] max-w-2xl flex-col overflow-hidden p-0">
				<DialogHeader className="px-6 pt-6">
					<DialogTitle>
						{viewMode
							? "View Checklist Template"
							: editMode
								? "Edit Checklist Template"
								: "Create Checklist Template"}
					</DialogTitle>
					<p className="text-muted-foreground text-sm">
						Step {step} of 2:{" "}
						{step === 1 ? "Template Information" : "Select Compliance Items"}
					</p>
					<Progress value={step === 1 ? 50 : 100} className="mt-2" />
				</DialogHeader>

				{step === 1 ? (
					<div className="flex flex-col gap-4 px-6 pb-6">
						<form
							onSubmit={(e) => {
								e.preventDefault();
								handleContinue();
							}}
							className="space-y-4"
						>
							<FieldGroup>
								<form.Field name="templateName">
									{(field) => (
										<Field
											data-invalid={formFieldShowInvalid(
												field.state.meta.isTouched,
												field.state.meta.isValid,
												submissionAttempts,
											)}
										>
											<FieldLabel htmlFor={field.name}>
												Template Name <RequiredStar />
											</FieldLabel>
											<Input
												id={field.name}
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												onBlur={field.handleBlur}
												placeholder="e.g., RN Compliance Checklist"
												readOnly={viewMode}
												disabled={viewMode}
											/>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									)}
								</form.Field>

								<form.Field name="description">
									{(field) => (
										<Field>
											<FieldLabel htmlFor={field.name}>
												Description (Optional)
											</FieldLabel>
											<Textarea
												id={field.name}
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												onBlur={field.handleBlur}
												placeholder="Brief description of this compliance checklist template"
												rows={3}
												readOnly={viewMode}
												disabled={viewMode}
											/>
										</Field>
									)}
								</form.Field>
							</FieldGroup>

							<DialogFooter className="flex-row justify-end gap-2 sm:justify-end">
								<Button type="button" variant="outline" onClick={handleClose}>
									{viewMode ? "Close" : "Cancel"}
								</Button>
								<Button type="submit">Continue to Step 2</Button>
							</DialogFooter>
						</form>
					</div>
				) : (
					<div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-6 pb-6">
						<div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
							<div className="flex-1">
								<SearchBar
									placeholder="Search compliance items..."
									value={search}
									onChange={setSearch}
									disabled={viewMode}
								/>
							</div>
							{selectedCount > 0 && (
								<span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
									{selectedCount} item{selectedCount !== 1 ? "s" : ""} selected
								</span>
							)}
						</div>

						<ScrollArea className="min-h-0 flex-1 overflow-y-auto rounded-md border">
							<div className="divide-y">
								{Array.from(grouped.entries()).map(([category, items]) => {
									const selectedInCategory = items.filter((i) =>
										selectedIds.has(i.id),
									).length;

									return (
										<Collapsible
											key={category}
											defaultOpen={category === "Licensing"}
										>
											<div className="border-b last:border-b-0">
												<CollapsibleTrigger asChild>
													<div className="group flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-muted/50">
														<div className="flex items-center gap-3">
															<ChevronRight className="size-4 shrink-0 transition-transform group-data-[state=open]:rotate-90" />
															<span
																className={`size-2 shrink-0 rounded-full ${CATEGORY_COLORS[category] ?? "bg-muted-foreground"}`}
															/>
															<span className="font-medium">
																{category} ({selectedInCategory}/{items.length})
															</span>
														</div>
														{!viewMode && (
															<Button
																type="button"
																variant="link"
																className="h-auto p-0 text-primary text-sm font-medium hover:underline"
																onClick={(e) => {
																	e.preventDefault();
																	e.stopPropagation();
																	toggleCategory(category);
																}}
															>
																Select All
															</Button>
														)}
													</div>
												</CollapsibleTrigger>
												<CollapsibleContent>
													<div className="divide-y border-t bg-muted/20">
														{items.map((item) => (
															<label
																key={item.id}
																className={`flex items-start gap-3 px-4 py-3 ${!viewMode ? "cursor-pointer hover:bg-muted/30" : ""}`}
																htmlFor={item.id}
															>
																<Checkbox
																	checked={selectedIds.has(item.id)}
																	onCheckedChange={() => toggleItem(item.id)}
																	disabled={viewMode}
																/>
																<div className="min-w-0 flex-1">
																	<p className="font-medium text-sm">
																		{item.name}
																	</p>
																	{item.description && (
																		<p className="text-muted-foreground text-sm">
																			{item.description}
																		</p>
																	)}
																	{item.tracksExpiration && (
																		<span className="mt-1 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
																			Tracks expiration
																		</span>
																	)}
																</div>
															</label>
														))}
													</div>
												</CollapsibleContent>
											</div>
										</Collapsible>
									);
								})}
							</div>
						</ScrollArea>

						<DialogFooter className="flex shrink-0 flex-row justify-end gap-2 border-t pt-4 sm:justify-end">
							<Button type="button" variant="outline" onClick={handleClose}>
								{viewMode ? "Close" : "Cancel"}
							</Button>
							{!viewMode && (
								<>
									<Button type="button" variant="outline" onClick={handleBack}>
										Back
									</Button>
									<Button
										type="button"
										onClick={handleSave}
										disabled={selectedCount === 0 || isSubmitting}
									>
										<Save className="size-4" data-icon="inline-start" />
										{isSubmitting
											? "Saving..."
											: `${editMode ? "Update" : "Save"} Template (${selectedCount} item${selectedCount !== 1 ? "s" : ""})`}
									</Button>
								</>
							)}
							{viewMode && (
								<Button type="button" variant="outline" onClick={handleBack}>
									Back
								</Button>
							)}
						</DialogFooter>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
