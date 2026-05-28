import { isAfterOrEqual, isFutureDate } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import { DatePicker } from "@repo/ui/components/date-picker";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@repo/ui/components/field";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
import { Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import type { ReviewSubmitFormApi } from "@/schemas/vendor-jobs-board.schema";

export interface RtoSectionProps {
	form: ReviewSubmitFormApi;
	isEditing: boolean;
}

export function RtoSection({ form, isEditing }: Readonly<RtoSectionProps>) {
	const { fmtShortDate } = useUserTimezone();
	const [pendingRto, setPendingRto] = useState<{
		startDate: string;
		endDate: string;
		type: "single" | "range";
	}>({
		startDate: "",
		endDate: "",
		type: "range",
	});

	const todayStr = useMemo(() => {
		const now = new Date();
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
	}, []);

	return (
		<div className="space-y-4">
			<h4 className="font-bold text-foreground text-base">
				Requested Time Off (RTO)
			</h4>

			<RadioGroup
				value={pendingRto.type}
				onValueChange={(val) =>
					setPendingRto((prev) => ({
						...prev,
						type: val as "single" | "range",
						endDate: val === "single" ? "" : prev.endDate,
					}))
				}
				disabled={!isEditing}
				className="flex items-center gap-8"
			>
				<div className="flex items-center gap-3">
					<RadioGroupItem value="single" id="single-review" />
					<FieldLabel
						htmlFor="single-review"
						className="text-sm cursor-pointer"
					>
						Single Date
					</FieldLabel>
				</div>
				<div className="flex items-center gap-3">
					<RadioGroupItem value="range" id="range-review" />
					<FieldLabel htmlFor="range-review" className="text-sm cursor-pointer">
						Date Range
					</FieldLabel>
				</div>
			</RadioGroup>

			<FieldGroup className="mt-6">
				<div className="flex flex-col md:flex-row gap-4 items-end">
					<Field className="flex-1">
						<FieldLabel className="font-medium">Start Date</FieldLabel>
						<DatePicker
							value={pendingRto.startDate}
							onChange={(val) =>
								setPendingRto((prev) => ({ ...prev, startDate: val }))
							}
							min={todayStr}
							placeholder="Pick a date"
							disabled={!isEditing}
						/>
					</Field>
					{pendingRto.type === "range" && (
						<Field className="flex-1">
							<FieldLabel className="font-medium">End Date</FieldLabel>
							<DatePicker
								value={pendingRto.endDate}
								onChange={(val) =>
									setPendingRto((prev) => ({ ...prev, endDate: val }))
								}
								min={pendingRto.startDate || todayStr}
								placeholder="Pick a date"
								disabled={!isEditing}
							/>
						</Field>
					)}
					<form.Field name="rto">
						{(field) => (
							<Button
								type="button"
								variant="outline"
								className="h-9"
								disabled={
									!isEditing ||
									!pendingRto.startDate ||
									(pendingRto.type === "range" && !pendingRto.endDate)
								}
								onClick={() => {
									if (!isFutureDate(pendingRto.startDate)) return;
									if (
										pendingRto.type === "range" &&
										!isAfterOrEqual(pendingRto.endDate, pendingRto.startDate)
									)
										return;

									field.pushValue({
										startDate: pendingRto.startDate,
										endDate:
											pendingRto.type === "range"
												? pendingRto.endDate
												: undefined,
										type: pendingRto.type,
									});
									setPendingRto({
										startDate: "",
										endDate: "",
										type: pendingRto.type,
									});
								}}
							>
								Add RTO
							</Button>
						)}
					</form.Field>
				</div>
			</FieldGroup>

			<div className="flex flex-col gap-3 mt-6">
				<p className="font-semibold text-sm text-foreground">Added RTOs:</p>
				<form.Field name="rto">
					{(field) => (
						<div className="flex flex-col gap-2">
							{field.state.value?.length === 0 && (
								<p className="text-sm text-muted-foreground italic">
									No RTOs added yet.
								</p>
							)}
							{Array.isArray(field.state.value) &&
								field.state.value.map((rto, index) => (
									<div
										key={`${rto.startDate}-${index}`}
										className="flex items-center justify-between py-2 px-3 rounded border bg-muted"
									>
										<span className="text-sm font-medium">
											{rto.type === "single"
												? fmtShortDate(rto.startDate)
												: `${fmtShortDate(rto.startDate)} - ${fmtShortDate(rto.endDate || "")}`}
										</span>
										<Button
											variant="ghost"
											size="icon"
											className="size-8 text-muted-foreground hover:text-destructive"
											disabled={!isEditing}
											onClick={() => field.removeValue(index)}
										>
											<Trash2 className="size-4" />
										</Button>
									</div>
								))}
							{field.state.meta.errors.length > 0 && (
								<FieldError errors={field.state.meta.errors} />
							)}
						</div>
					)}
				</form.Field>
			</div>
		</div>
	);
}
