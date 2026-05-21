"use client";

import { Button } from "@repo/ui/components/button";
import { DatePicker } from "@repo/ui/components/date-picker";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Field, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { useForm } from "@tanstack/react-form";

export interface OfferAdjustmentValues {
	startDate?: string;
	endDate?: string;
	billRate?: number;
}

interface OfferAdjustmentDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	defaultValues?: OfferAdjustmentValues;
	onSubmit: (values: OfferAdjustmentValues) => void | Promise<void>;
	isPending?: boolean;
}

export function OfferAdjustmentDialog({
	open,
	onOpenChange,
	defaultValues,
	onSubmit,
	isPending = false,
}: OfferAdjustmentDialogProps) {
	const form = useForm({
		defaultValues: {
			startDate: defaultValues?.startDate ?? "",
			endDate: defaultValues?.endDate ?? "",
			billRate:
				defaultValues?.billRate != null ? String(defaultValues.billRate) : "",
		},
		onSubmit: async ({ value }) => {
			try {
				await onSubmit({
					startDate: value.startDate || undefined,
					endDate: value.endDate || undefined,
					billRate: value.billRate ? Number(value.billRate) : undefined,
				});
			} catch {
				// Parent shows error toast; keep dialog open.
			}
		},
	});

	const handleOpenChange = (next: boolean) => {
		if (!next) form.reset();
		onOpenChange(next);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-h-[90dvh] max-w-md overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-xl">Offer Adjustment</DialogTitle>
					<DialogDescription>
						Configure placement information for qualified candidate
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						void form.handleSubmit();
					}}
					className="space-y-5"
				>
					<form.Field name="startDate">
						{(field) => (
							<Field>
								<FieldLabel
									htmlFor={field.name}
									className="text-sm font-semibold"
								>
									Start Date
								</FieldLabel>
								<DatePicker
									id={field.name}
									value={field.state.value}
									onChange={(v) => field.handleChange(v)}
									onBlur={field.handleBlur}
									placeholder="MM/DD/YYYY"
									clearable
								/>
							</Field>
						)}
					</form.Field>

					<form.Field name="endDate">
						{(field) => (
							<Field>
								<FieldLabel
									htmlFor={field.name}
									className="text-sm font-semibold"
								>
									End Date
								</FieldLabel>
								<DatePicker
									id={field.name}
									value={field.state.value}
									onChange={(v) => field.handleChange(v)}
									onBlur={field.handleBlur}
									placeholder="MM/DD/YYYY"
									clearable
								/>
							</Field>
						)}
					</form.Field>

					<form.Field name="billRate">
						{(field) => (
							<Field>
								<FieldLabel
									htmlFor={field.name}
									className="text-sm font-semibold"
								>
									Adjust Bill Rate
								</FieldLabel>
								<div className="relative flex items-center">
									<span className="text-muted-foreground absolute left-3 text-sm">
										$
									</span>
									<Input
										id={field.name}
										type="number"
										min={0}
										step={0.01}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="0.00"
										className="pr-12 pl-7"
									/>
									<span className="text-muted-foreground absolute right-3 text-sm">
										/hr
									</span>
								</div>
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
							{isPending ? "Saving…" : "Save Details"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
