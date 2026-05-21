"use client";

import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { Textarea } from "@repo/ui/components/textarea";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { useStore } from "@tanstack/react-form";
import { MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { useCandidateSupportRequestForm } from "@/hooks/candidate/use-candidate-support-request-form";
import { SUPPORT_CATEGORY_OPTIONS } from "@/schemas/candidate-support.schema";

export function SupportDirectAssistanceCard() {
	const [open, setOpen] = useState(false);
	const { form, resetToDefaults } = useCandidateSupportRequestForm({
		onSubmitted: () => setOpen(false),
	});

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	return (
		<Collapsible open={open} onOpenChange={setOpen}>
			<Card className="rounded-xl border shadow-sm">
				<CardHeader className="gap-2">
					<div className="space-y-1.5">
						<CardTitle className="text-xl font-semibold">
							Need Direct Assistance?
						</CardTitle>
						<CardDescription className="text-base font-normal">
							Submit a support request and we&apos;ll get back to you
						</CardDescription>
					</div>
					<CardAction>
						<CollapsibleTrigger asChild>
							<Button
								type="button"
								size="sm"
								className="w-full gap-2 sm:w-auto"
							>
								<MessageSquare className="size-4" aria-hidden />
								Contact Support
							</Button>
						</CollapsibleTrigger>
					</CardAction>
				</CardHeader>

				<CollapsibleContent>
					<CardContent className="border-t pt-6">
						<form
							className="space-y-5"
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								void form.handleSubmit();
							}}
						>
							<form.Field name="category">
								{(field) => (
									<Field
										data-invalid={formFieldShowInvalid(
											field.state.meta.isTouched,
											field.state.meta.isValid,
											submissionAttempts,
										)}
									>
										<FieldLabel htmlFor={field.name}>
											Category <RequiredStar />
										</FieldLabel>
										<Select
											value={field.state.value || undefined}
											onValueChange={(v) => field.handleChange(v)}
										>
											<SelectTrigger
												id={field.name}
												className="w-full"
												onBlur={field.handleBlur}
												aria-invalid={formFieldShowInvalid(
													field.state.meta.isTouched,
													field.state.meta.isValid,
													submissionAttempts,
												)}
											>
												<SelectValue placeholder="Select a category..." />
											</SelectTrigger>
											<SelectContent>
												{SUPPORT_CATEGORY_OPTIONS.map((opt) => (
													<SelectItem key={opt.value} value={opt.value}>
														{opt.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FieldError errors={field.state.meta.errors} />
									</Field>
								)}
							</form.Field>

							<form.Field name="subject">
								{(field) => (
									<Field
										data-invalid={formFieldShowInvalid(
											field.state.meta.isTouched,
											field.state.meta.isValid,
											submissionAttempts,
										)}
									>
										<FieldLabel htmlFor={field.name}>
											Subject <RequiredStar />
										</FieldLabel>
										<Input
											id={field.name}
											value={field.state.value}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											onBlur={field.handleBlur}
											placeholder="Brief description of your issue"
										/>
										<FieldError errors={field.state.meta.errors} />
									</Field>
								)}
							</form.Field>

							<form.Field name="message">
								{(field) => (
									<Field
										data-invalid={formFieldShowInvalid(
											field.state.meta.isTouched,
											field.state.meta.isValid,
											submissionAttempts,
										)}
									>
										<FieldLabel htmlFor={field.name}>
											Message <RequiredStar />
										</FieldLabel>
										<Textarea
											id={field.name}
											rows={5}
											value={field.state.value}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											onBlur={field.handleBlur}
											placeholder="Provide details about your question or issue..."
										/>
										<FieldError errors={field.state.meta.errors} />
									</Field>
								)}
							</form.Field>

							<div className="flex flex-wrap gap-3 pt-1">
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										resetToDefaults();
										setOpen(false);
									}}
								>
									Cancel
								</Button>
								<Button type="submit" className="gap-2">
									<Send className="size-4" aria-hidden />
									Submit Request
								</Button>
							</div>
						</form>
					</CardContent>
				</CollapsibleContent>
			</Card>
		</Collapsible>
	);
}
