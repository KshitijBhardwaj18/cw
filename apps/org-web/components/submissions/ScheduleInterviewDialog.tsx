"use client";

import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import { useForm } from "@tanstack/react-form";

export interface ScheduleInterviewValues {
	/** ISO datetime string */
	interviewDate: string;
	interviewLocation?: string;
	interviewNotes?: string;
}

interface ScheduleInterviewDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	candidateName?: string;
	jobTitle?: string;
	onSubmit: (values: ScheduleInterviewValues) => void | Promise<void>;
	isPending?: boolean;
}

/**
 * Browser `datetime-local` value (`YYYY-MM-DDTHH:mm`) plus +1 minute, so the
 * native `min=` attribute prevents users from picking a moment that's already
 * in the past by the time the form submits. We deliberately use local time
 * here because that's what the picker shows the user.
 */
function nowLocalDatetimeMin(): string {
	const d = new Date(Date.now() + 60_000);
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ScheduleInterviewDialog({
	open,
	onOpenChange,
	candidateName,
	jobTitle,
	onSubmit,
	isPending = false,
}: Readonly<ScheduleInterviewDialogProps>) {
	const minDateTime = nowLocalDatetimeMin();

	const form = useForm({
		defaultValues: {
			interviewDate: "",
			interviewLocation: "",
			interviewNotes: "",
		},
		onSubmit: async ({ value }) => {
			const local = value.interviewDate.trim();
			if (!local) return;
			const parsed = new Date(local);
			if (Number.isNaN(parsed.getTime())) return;
			try {
				await onSubmit({
					interviewDate: parsed.toISOString(),
					interviewLocation: value.interviewLocation.trim() || undefined,
					interviewNotes: value.interviewNotes.trim() || undefined,
				});
			} catch {
				// Parent surfaces the toast and keeps the dialog open for retry.
			}
		},
	});

	const handleOpenChange = (next: boolean) => {
		if (!next) form.reset();
		onOpenChange(next);
	};

	const subtitle =
		candidateName && jobTitle
			? `${candidateName} · ${jobTitle}`
			: candidateName || jobTitle || "Set when the interview will take place.";

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-h-[80dvh] max-w-md overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-xl">Schedule Interview</DialogTitle>
					<DialogDescription>{subtitle}</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						void form.handleSubmit();
					}}
					className="space-y-5"
				>
					<form.Field
						name="interviewDate"
						validators={{
							onSubmit: ({ value }) => {
								const trimmed = value.trim();
								if (!trimmed) return "Interview date and time are required";
								const parsed = new Date(trimmed);
								if (Number.isNaN(parsed.getTime())) return "Invalid date/time";
								if (parsed.getTime() <= Date.now()) {
									return "Interview date must be in the future";
								}
								return undefined;
							},
						}}
					>
						{(field) => {
							const errors: string[] = [];
							for (const e of field.state.meta.errors) {
								if (typeof e === "string") errors.push(e);
							}
							const isInvalid = errors.length > 0;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel
										htmlFor={field.name}
										className="text-sm font-semibold"
									>
										Date & Time <span className="text-destructive">*</span>
									</FieldLabel>
									<Input
										id={field.name}
										type="datetime-local"
										min={minDateTime}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
									/>
									{isInvalid ? <FieldError errors={errors} /> : null}
								</Field>
							);
						}}
					</form.Field>

					<form.Field name="interviewLocation">
						{(field) => (
							<Field>
								<FieldLabel
									htmlFor={field.name}
									className="text-sm font-semibold"
								>
									Location (optional)
								</FieldLabel>
								<Input
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Zoom link, office address, etc."
									maxLength={500}
								/>
							</Field>
						)}
					</form.Field>

					<form.Field name="interviewNotes">
						{(field) => (
							<Field>
								<FieldLabel
									htmlFor={field.name}
									className="text-sm font-semibold"
								>
									Notes (optional)
								</FieldLabel>
								<Textarea
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Agenda, interviewers, prep instructions…"
									rows={3}
									maxLength={2000}
								/>
							</Field>
						)}
					</form.Field>

					<DialogFooter className="gap-3 pt-2 sm:gap-3">
						<Button
							type="button"
							variant="outline"
							className="flex-1"
							onClick={() => handleOpenChange(false)}
							disabled={isPending}
						>
							Cancel
						</Button>
						<Button type="submit" className="flex-1" disabled={isPending}>
							{isPending ? "Scheduling…" : "Schedule interview"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
