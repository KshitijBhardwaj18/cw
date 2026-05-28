"use client";

import type {
	CandidateWorkforceType,
	ShiftRoutingSettingsType,
	ShiftRoutingTierType,
} from "@repo/shared";
import { CANDIDATE_WORKFORCE_TYPE_OPTIONS, getLabel } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import { Field, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { Switch } from "@repo/ui/components/switch";
import { Info, Save } from "lucide-react";
import { DELAY_UNIT_OPTIONS } from "@/constants/shifts";
import { useRoutingDelayForm } from "@/hooks/use-routing-delay-form";
import type { DelayFormValues } from "@/schemas/shift-routing.schema";

function getUnitLabel(unit: string): string {
	return (
		DELAY_UNIT_OPTIONS.find((o) => o.value === unit)?.label.toLowerCase() ??
		unit.toLowerCase()
	);
}

function formatTimelineTime(totalMinutes: number): string {
	const hours = Math.floor(totalMinutes / 60);
	const mins = totalMinutes % 60;
	return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function toMinutes(duration: number, unit: string): number {
	if (unit === "DAYS") return duration * 24 * 60;
	if (unit === "HOURS") return duration * 60;
	return duration;
}

interface RoutingDelayTabProps {
	settings: ShiftRoutingSettingsType;
	tiers: ShiftRoutingTierType[];
	readOnly?: boolean;
}

export function RoutingDelayTab({
	settings,
	tiers,
	readOnly = false,
}: Readonly<RoutingDelayTabProps>) {
	const { form, isSaving } = useRoutingDelayForm(settings);

	const orderedTiers = [...tiers].sort(
		(a, b) => a.priorityOrder - b.priorityOrder,
	);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				void form.handleSubmit();
			}}
			className="space-y-5"
		>
			<div>
				<h2 className="text-base font-semibold">Routing Delay Settings</h2>
				<p className="text-muted-foreground mt-0.5 text-sm">
					Set a delay between routing tiers to give higher priority workforce
					types time to respond before offering to the next tier.
				</p>
			</div>

			<div className="flex items-center justify-between gap-4 rounded-xl border p-4">
				<div>
					<Label className="text-sm font-semibold">Enable Routing Delay</Label>
					<p className="text-muted-foreground mt-0.5 text-xs">
						When enabled, shifts will wait the specified duration before routing
						to the next workforce type
					</p>
				</div>
				<form.Field name="enableRoutingDelay">
					{(field) => (
						<Switch
							checked={field.state.value}
							disabled={readOnly}
							onCheckedChange={(v) => field.handleChange(v)}
						/>
					)}
				</form.Field>
			</div>

			<form.Subscribe
				selector={(s) =>
					[
						s.values.enableRoutingDelay,
						s.values.delayDuration,
						s.values.delayUnit,
					] as [boolean, number, string]
				}
			>
				{([enabled, duration, unit]) =>
					enabled && (
						<div className="rounded-xl border p-4">
							<h3 className="mb-4 text-sm font-semibold">Delay Duration</h3>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<form.Field name="delayDuration">
									{(field) => (
										<Field>
											<FieldLabel htmlFor={field.name}>Duration</FieldLabel>
											<Input
												id={field.name}
												type="number"
												min={1}
												disabled={readOnly}
												value={String(field.state.value)}
												onChange={(e) =>
													field.handleChange(
														e.target.value ? Number(e.target.value) : 1,
													)
												}
											/>
										</Field>
									)}
								</form.Field>
								<form.Field name="delayUnit">
									{(field) => (
										<Field>
											<FieldLabel>Unit</FieldLabel>
											<Select
												value={field.state.value}
												disabled={readOnly}
												onValueChange={(v) =>
													field.handleChange(v as DelayFormValues["delayUnit"])
												}
											>
												<SelectTrigger className="w-full">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{DELAY_UNIT_OPTIONS.map((o) => (
														<SelectItem key={o.value} value={o.value}>
															{o.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</Field>
									)}
								</form.Field>
							</div>

							<div className="mt-4 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm dark:border-blue-900/40 dark:bg-blue-950/30">
								<Info className="mt-0.5 size-4 shrink-0 text-blue-500" />
								<p className="text-blue-800 dark:text-blue-300">
									<span className="font-medium">Current Setting:</span> Shifts
									will wait{" "}
									<strong>
										{duration} {getUnitLabel(unit)}
									</strong>{" "}
									before routing to the next workforce type.
								</p>
							</div>

							{orderedTiers.length > 0 && (
								<div className="mt-5">
									<h3 className="mb-3 text-sm font-semibold">
										Example Routing Timeline
									</h3>
									<div className="space-y-2">
										{orderedTiers.map((tier, i) => {
											const cumulativeMinutes = i * toMinutes(duration, unit);
											const label = getLabel(
												CANDIDATE_WORKFORCE_TYPE_OPTIONS,
												tier.workforceType as CandidateWorkforceType,
											);
											return (
												<div key={tier.id} className="flex items-center gap-4">
													<span className="text-muted-foreground w-12 shrink-0 text-right text-xs tabular-nums">
														{formatTimelineTime(cumulativeMinutes)}
													</span>
													<div className="bg-muted flex-1 rounded-lg px-4 py-2.5 text-sm">
														{label}
													</div>
												</div>
											);
										})}
									</div>
								</div>
							)}
						</div>
					)
				}
			</form.Subscribe>

			<div className="flex justify-end">
				<Button type="submit" disabled={readOnly || isSaving}>
					<Save className="mr-2 size-4" />
					{isSaving ? "Saving..." : "Save Delay Settings"}
				</Button>
			</div>
		</form>
	);
}
