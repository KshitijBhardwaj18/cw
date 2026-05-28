"use client";

import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Separator } from "@repo/ui/components/separator";
import { cn } from "@repo/ui/lib/utils";
import {
	BriefcaseBusiness,
	Calendar,
	Clock,
	DollarSign,
	FileText,
	MapPin,
	Search,
} from "lucide-react";
import { useJobPostingTemplateSelectionStepForm } from "@/hooks/job-posting/use-job-posting-template-selection-step-form";
import type { JobPostingTemplateSelectionValues } from "@/schemas/job-posting-template-selection.schema";
import type { JobPostingTypeSelectionValues } from "@/schemas/job-posting-type-selection.schema";
import type { JobPostingTemplateListItem } from "@/types/job-posting-flow";

interface TemplateSelectionStepProps {
	type: JobPostingTypeSelectionValues["type"];
	templates: JobPostingTemplateListItem[];
	isLoadingTemplates?: boolean;
	initialValues: JobPostingTemplateSelectionValues;
	onBack: () => void;
	onCancel: () => void;
	onSubmit: (values: JobPostingTemplateSelectionValues) => void | Promise<void>;
	isPending?: boolean;
	/** Edit mode pins the requisition's template — only the already-selected card is shown and inputs are disabled. */
	locked?: boolean;
}

export function TemplateSelectionStep({
	type,
	templates,
	isLoadingTemplates = false,
	initialValues,
	onBack,
	onCancel,
	onSubmit,
	isPending = false,
	locked = false,
}: Readonly<TemplateSelectionStepProps>) {
	const {
		form,
		lockFields,
		search,
		setSearch,
		filteredTemplates,
		handleFormSubmit,
	} = useJobPostingTemplateSelectionStepForm({
		type,
		templates,
		initialValues,
		onSubmit,
		isPending,
	});

	const fieldsDisabled = lockFields || locked;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Select a Requisition Template</CardTitle>
			</CardHeader>
			<CardContent>
				<form className="space-y-4" onSubmit={handleFormSubmit}>
					<div className="relative">
						<Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
						<Input
							className="pl-9"
							placeholder="Search templates by occupation, location, department..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							disabled={fieldsDisabled}
						/>
					</div>

					<form.Field name="templateId">
						{(field) => (
							<div className="space-y-3">
								{isLoadingTemplates && (
									<p className="text-muted-foreground text-sm">
										Loading templates…
									</p>
								)}
								{!isLoadingTemplates && filteredTemplates.length === 0 && (
									<p className="text-muted-foreground text-sm">
										No templates match this type or search. Create a requisition
										template first.
									</p>
								)}
								{filteredTemplates.map((template) => {
									const selected = field.state.value === template.id;
									const [shiftName, durationLabel] = template.shiftSummary
										.split("•")
										.map((item) => item.trim());
									return (
										<button
											key={template.id}
											type="button"
											onClick={() => field.handleChange(template.id)}
											disabled={fieldsDisabled}
											className={cn(
												"w-full border p-4 text-left transition-all",
												selected
													? "border-primary bg-primary/5 ring-1 ring-primary/20"
													: "hover:bg-muted/30",
												fieldsDisabled && !selected && "opacity-50",
											)}
										>
											<div className="flex flex-col gap-4">
												<div className="flex items-start gap-4">
													<div className="bg-primary/80 text-primary-foreground flex size-16 shrink-0 items-center justify-center">
														<FileText className="size-7" />
													</div>

													<div className="min-w-0 flex-1 space-y-4">
														<h3 className="text-base font-semibold leading-snug">
															{template.title}
														</h3>

														<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
															<div>
																<p className="text-muted-foreground mb-1 flex items-center gap-2 text-xs font-medium">
																	<BriefcaseBusiness className="size-4 text-primary" />
																	Occupation
																</p>
																<p className="text-sm font-medium">
																	{template.occupation}
																</p>
																<p className="text-muted-foreground text-sm">
																	{template.specialty}
																</p>
															</div>

															<div>
																<p className="text-muted-foreground mb-1 flex items-center gap-2 text-xs font-medium">
																	<MapPin className="size-4 text-primary" />
																	Location
																</p>
																<p className="text-sm font-medium">
																	{template.location}
																</p>
																<p className="text-muted-foreground text-sm">
																	{template.departmentLabel}
																</p>
															</div>

															<div>
																<p className="text-muted-foreground mb-1 flex items-center gap-2 text-xs font-medium">
																	<Calendar className="size-4 text-primary" />
																	Shift & Duration
																</p>
																<p className="text-sm font-medium">
																	{shiftName ?? template.shiftSummary}
																</p>
																<p className="text-muted-foreground text-sm">
																	{durationLabel ?? "-"}
																</p>
															</div>

															<div>
																<p className="text-muted-foreground mb-1 flex items-center gap-2 text-xs font-medium">
																	<DollarSign className="size-4 text-primary" />
																	Bill Rate
																</p>
																<p className="text-sm font-medium">
																	{template.billRateLabel}
																</p>
															</div>
														</div>
													</div>
												</div>

												<Separator />

												<div className="text-muted-foreground flex flex-wrap items-center gap-6 text-sm">
													<span className="flex items-center gap-2">
														<Clock className="size-4" />
														{template.lastUsedLabel}
													</span>
													<span>{`Used ${template.usedCount} times`}</span>
													<span className="text-primary font-medium">
														{template.complianceTemplateName}
													</span>
												</div>
											</div>
										</button>
									);
								})}
							</div>
						)}
					</form.Field>

					<div className="flex justify-end gap-3 pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={onBack}
							disabled={isPending}
						>
							Back
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={onCancel}
							disabled={isPending}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={
								form.state.isSubmitting ||
								isPending ||
								isLoadingTemplates ||
								filteredTemplates.length === 0
							}
						>
							{form.state.isSubmitting || isPending
								? "Saving..."
								: "Next \u2192"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
