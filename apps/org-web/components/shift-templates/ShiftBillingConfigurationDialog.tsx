"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
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
import { Label } from "@repo/ui/components/label";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { Switch } from "@repo/ui/components/switch";
import { FormDialogFooter } from "@repo/ui/general/FormDialogFooter";
import { useShiftBillingConfigurationDialog } from "@/hooks/use-shift-billing-configuration-dialog";
import type { ShiftBillingConfigurationFormValues } from "@/schemas/shift-template.schema";

interface ShiftBillingConfigurationDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	templateName: string;
	initialValues?: Partial<ShiftBillingConfigurationFormValues> | null;
	onSubmit: (values: ShiftBillingConfigurationFormValues) => Promise<void>;
	isSubmitting?: boolean;
}

export function ShiftBillingConfigurationDialog({
	open,
	onOpenChange,
	templateName,
	initialValues,
	onSubmit,
	isSubmitting,
}: ShiftBillingConfigurationDialogProps) {
	const { form, handleOpenChange } = useShiftBillingConfigurationDialog({
		open,
		onOpenChange,
		initialValues,
		onSubmit,
	});

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-xl overflow-hidden p-0">
				<DialogHeader className="px-6 pt-6">
					<DialogTitle>Billing Configuration</DialogTitle>
					<DialogDescription>{templateName}</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						void form.handleSubmit();
					}}
					className="flex flex-col"
				>
					<ScrollArea className="max-h-[calc(90vh-14rem)]">
						<div className="space-y-6 px-6 pb-6">
							<FieldGroup>
								<form.Field name="baseBillRate">
									{(field) => (
										<Field
											data-invalid={
												field.state.meta.isTouched && !field.state.meta.isValid
											}
										>
											<FieldLabel htmlFor={field.name}>
												Base Bill Rate ($/hour)
											</FieldLabel>
											<Input
												id={field.name}
												type="number"
												min={0}
												step="0.01"
												value={String(field.state.value ?? 0)}
												onChange={(e) =>
													field.handleChange(
														e.target.value ? Number(e.target.value) : 0,
													)
												}
											/>
											<p className="text-muted-foreground mt-1 text-xs">
												The hourly rate charged to the client for this shift.
											</p>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									)}
								</form.Field>

								<form.Field name="vendorRateMarkupPercent">
									{(field) => (
										<Field
											data-invalid={
												field.state.meta.isTouched && !field.state.meta.isValid
											}
										>
											<FieldLabel htmlFor={field.name}>
												Vendor Rate Markup (%)
											</FieldLabel>
											<div className="flex items-center gap-2">
												<Input
													id={field.name}
													type="number"
													min={0}
													step="0.01"
													value={String(field.state.value ?? 0)}
													onChange={(e) =>
														field.handleChange(
															e.target.value ? Number(e.target.value) : 0,
														)
													}
												/>
												<span className="text-muted-foreground text-sm">%</span>
											</div>
											<p className="text-muted-foreground mt-1 text-xs">
												Percentage markup applied to base bill rate for vendor
												calculations.
											</p>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									)}
								</form.Field>
							</FieldGroup>

							<form.Subscribe
								selector={(state) => ({
									baseBillRate: state.values.baseBillRate,
									vendorRateMarkupPercent: state.values.vendorRateMarkupPercent,
								})}
							>
								{({ baseBillRate, vendorRateMarkupPercent }) => {
									const base = baseBillRate ?? 0;
									const markup = vendorRateMarkupPercent ?? 0;
									const vendorRate = base * (1 + markup / 100);
									return (
										<div className="bg-muted rounded-lg px-4 py-3">
											<p className="text-muted-foreground mb-1 text-xs">
												Calculated Vendor Rate (Read-only)
											</p>
											<p className="text-primary text-2xl font-semibold">
												${vendorRate.toFixed(2)}{" "}
												<span className="text-muted-foreground text-base font-normal">
													/hour
												</span>
											</p>
											<p className="text-muted-foreground mt-1 text-xs">
												Base Bill Rate + {markup.toFixed(0)}% markup
											</p>
										</div>
									);
								}}
							</form.Subscribe>

							<div className="space-y-4 pt-2">
								<div className="flex items-center justify-between gap-4">
									<div>
										<Label>Offer Incentive</Label>
										<p className="text-muted-foreground mt-0.5 text-xs">
											Enable additional incentive payments for this shift.
										</p>
									</div>
									<form.Field name="offerIncentive">
										{(field) => (
											<Switch
												checked={field.state.value}
												onCheckedChange={(value) => field.handleChange(value)}
											/>
										)}
									</form.Field>
								</div>

								<form.Subscribe
									selector={(state) => state.values.offerIncentive}
								>
									{(offerIncentive) =>
										offerIncentive && (
											<FieldGroup>
												<form.Field name="incentiveByHour">
													{(field) => (
														<Field>
															<FieldLabel htmlFor={field.name}>
																Incentive by Hour ($/hour)
															</FieldLabel>
															<Input
																id={field.name}
																type="number"
																min={0}
																step="0.01"
																value={String(field.state.value ?? 0)}
																onChange={(e) =>
																	field.handleChange(
																		e.target.value ? Number(e.target.value) : 0,
																	)
																}
															/>
															<p className="text-muted-foreground mt-1 text-xs">
																Additional payment per hour worked.
															</p>
														</Field>
													)}
												</form.Field>
												<form.Field name="incentiveByShift">
													{(field) => (
														<Field>
															<FieldLabel htmlFor={field.name}>
																Incentive by Shift ($/shift)
															</FieldLabel>
															<Input
																id={field.name}
																type="number"
																min={0}
																step="0.01"
																value={String(field.state.value ?? 0)}
																onChange={(e) =>
																	field.handleChange(
																		e.target.value ? Number(e.target.value) : 0,
																	)
																}
															/>
															<p className="text-muted-foreground mt-1 text-xs">
																One-time bonus for completing the shift.
															</p>
														</Field>
													)}
												</form.Field>
											</FieldGroup>
										)
									}
								</form.Subscribe>
							</div>
						</div>
					</ScrollArea>

					<div className="shrink-0 px-6 pb-6 pt-4">
						<FormDialogFooter
							form={form}
							submitLabel="Save Configuration"
							submitLoadingLabel="Saving..."
							onCancel={() => handleOpenChange(false)}
							isPending={isSubmitting}
						/>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
