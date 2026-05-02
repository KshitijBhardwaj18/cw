import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
} from "@repo/ui/components/card";
import { DatePicker } from "@repo/ui/components/date-picker";
import {
	Field,
	FieldContent,
	FieldError,
	FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { parseISO } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import * as React from "react";
import type { EditTimecardFormApi } from "@/schemas/vendor-claim-shifts.schema";
import { computeShiftHours, formatLocalDateToIso } from "@/utils/time-entry";

interface OvertimeEntryFormSectionProps {
	form: EditTimecardFormApi;
	defaultDate: string;
}

export function OvertimeEntryFormSection({
	form,
	defaultDate,
}: OvertimeEntryFormSectionProps) {
	const initialDate = React.useMemo(() => {
		try {
			return formatLocalDateToIso(parseISO(defaultDate));
		} catch {
			return defaultDate;
		}
	}, [defaultDate]);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<p className="text-sm font-semibold">Overtime Entries</p>
				<form.Field name="overtimeEntries" mode="array">
					{(field) => (
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() =>
								field.pushValue({
									date: initialDate,
									startTime: "",
									endTime: "",
									breakDuration: 0,
								})
							}
						>
							<Plus data-icon="inline-start" className="size-4" />
							Add Overtime
						</Button>
					)}
				</form.Field>
			</div>

			<form.Field name="overtimeEntries" mode="array">
				{(field) => (
					<div className="flex flex-col gap-4">
						{field.state.value.map((_, index) => (
							<Card key={index} className="bg-muted/30 gap-4">
								<CardHeader className="border-b">
									<form.Field name={`overtimeEntries[${index}].date`}>
										{(subField) => (
											<Field className="w-full max-w-[200px]">
												<FieldLabel>Overtime Date</FieldLabel>
												<FieldContent>
													<DatePicker
														value={(() => {
															try {
																return subField.state.value.includes("T")
																	? formatLocalDateToIso(
																			parseISO(subField.state.value),
																		)
																	: subField.state.value;
															} catch {
																return subField.state.value;
															}
														})()}
														onChange={(val) => subField.handleChange(val)}
													/>
													<FieldError errors={subField.state.meta.errors} />
												</FieldContent>
											</Field>
										)}
									</form.Field>
									<CardAction>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
											onClick={() => field.removeValue(index)}
										>
											<Trash2 className="size-4" />
										</Button>
									</CardAction>
								</CardHeader>

								<CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4">
									<form.Field name={`overtimeEntries[${index}].startTime`}>
										{(subField) => (
											<Field>
												<FieldLabel>Start Time</FieldLabel>
												<FieldContent>
													<Input
														value={subField.state.value}
														onChange={(e) =>
															subField.handleChange(e.target.value)
														}
														placeholder="HH:mm"
														className="bg-background"
													/>
													<FieldError errors={subField.state.meta.errors} />
												</FieldContent>
											</Field>
										)}
									</form.Field>

									<form.Field name={`overtimeEntries[${index}].endTime`}>
										{(subField) => (
											<Field>
												<FieldLabel>End Time</FieldLabel>
												<FieldContent>
													<Input
														value={subField.state.value}
														onChange={(e) =>
															subField.handleChange(e.target.value)
														}
														placeholder="HH:mm"
														className="bg-background"
													/>
													<FieldError errors={subField.state.meta.errors} />
												</FieldContent>
											</Field>
										)}
									</form.Field>

									<form.Field name={`overtimeEntries[${index}].breakDuration`}>
										{(subField) => (
											<Field>
												<FieldLabel>Break (min)</FieldLabel>
												<FieldContent>
													<Input
														type="number"
														min="0"
														value={
															Number.isNaN(subField.state.value)
																? ""
																: subField.state.value
														}
														onChange={(e) =>
															subField.handleChange(e.target.valueAsNumber)
														}
														className="bg-background"
													/>
													<FieldError errors={subField.state.meta.errors} />
												</FieldContent>
											</Field>
										)}
									</form.Field>

									<Field>
										<FieldLabel>Total hours</FieldLabel>
										<form.Subscribe
											selector={(state) => [
												state.values.overtimeEntries[index]?.startTime,
												state.values.overtimeEntries[index]?.endTime,
												state.values.overtimeEntries[index]?.breakDuration,
											]}
										>
											{([start, end, br]) => {
												const startTime = String(start || "");
												const endTime = String(end || "");
												const b = Number(br);
												const hours = computeShiftHours(
													startTime.includes(":") ? startTime : "",
													endTime.includes(":") ? endTime : "",
													Number.isNaN(b) ? 0 : b,
												);
												return (
													<div className="flex h-9 items-center justify-center rounded border bg-primary/5 px-3 font-bold text-primary">
														{hours.toFixed(2)}h
													</div>
												);
											}}
										</form.Subscribe>
									</Field>
								</CardContent>
							</Card>
						))}

						{field.state.value.length === 0 && (
							<p className="text-sm italic text-muted-foreground">
								No overtime entries added
							</p>
						)}
					</div>
				)}
			</form.Field>
		</div>
	);
}
