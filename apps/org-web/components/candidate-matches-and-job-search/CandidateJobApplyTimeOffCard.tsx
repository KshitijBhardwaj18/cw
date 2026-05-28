"use client";

import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { DatePicker } from "@repo/ui/components/date-picker";
import { Label } from "@repo/ui/components/label";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { Calendar, Plus, X } from "lucide-react";

export interface TimeOffEntry {
	id: string;
	label: string;
}

export interface CandidateJobApplyTimeOffCardProps {
	timeOff: {
		open: boolean;
		type: "single" | "range";
		setType: (v: "single" | "range") => void;
		startDate: string;
		setStartDate: (v: string) => void;
		endDate: string;
		setEndDate: (v: string) => void;
		entries: TimeOffEntry[];
		startId: string;
		endId: string;
		add: () => void;
		remove: (entryId: string) => void;
		toggleForm: () => void;
		resetForm: () => void;
	};
}

export function CandidateJobApplyTimeOffCard({
	timeOff,
}: Readonly<CandidateJobApplyTimeOffCardProps>) {
	const t = timeOff;

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
				<div className="flex items-center gap-2">
					<Calendar className="text-primary size-5 shrink-0" aria-hidden />
					<CardTitle className="text-lg">Requested Time Off</CardTitle>
				</div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="gap-1"
					onClick={t.toggleForm}
				>
					<Plus className="size-4" aria-hidden />
					Add
				</Button>
			</CardHeader>
			<CardContent className="space-y-4">
				{t.open ? (
					<div className="bg-muted/50 space-y-4 rounded-lg border p-4">
						<div className="space-y-2">
							<Label>Type</Label>
							<ToggleGroup
								type="single"
								variant="outline"
								value={t.type}
								onValueChange={(v) => {
									if (v === "single" || v === "range") t.setType(v);
								}}
								className="grid w-full max-w-md grid-cols-1 sm:grid-cols-2"
							>
								<ToggleGroupItem value="single" className="px-3">
									Single Date
								</ToggleGroupItem>
								<ToggleGroupItem value="range" className="px-3">
									Date Range
								</ToggleGroupItem>
							</ToggleGroup>
						</div>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor={t.startId}>Start Date</Label>
								<DatePicker
									id={t.startId}
									value={t.startDate}
									onChange={t.setStartDate}
									placeholder="dd/mm/yyyy"
									clearable
									className="text-xs"
								/>
							</div>
							{t.type === "range" ? (
								<div className="space-y-2">
									<Label htmlFor={t.endId}>End Date</Label>
									<DatePicker
										id={t.endId}
										value={t.endDate}
										onChange={t.setEndDate}
										placeholder="dd/mm/yyyy"
										min={t.startDate || undefined}
										clearable
										className="text-xs"
									/>
								</div>
							) : null}
						</div>
						<div className="flex flex-wrap gap-2">
							<Button type="button" variant="outline" onClick={t.resetForm}>
								Cancel
							</Button>
							<Button
								type="button"
								disabled={
									t.type === "single"
										? !t.startDate
										: !t.startDate || !t.endDate
								}
								onClick={t.add}
							>
								Add
							</Button>
						</div>
					</div>
				) : null}

				{t.entries.length === 0 && !t.open ? (
					<p className="text-muted-foreground text-sm italic">
						No time off requested
					</p>
				) : null}

				{t.entries.length > 0 ? (
					<ul className="space-y-2">
						{t.entries.map((entry) => (
							<li
								key={entry.id}
								className="bg-muted/60 flex items-center justify-between gap-3 rounded-lg border px-4 py-3"
							>
								<div className="flex min-w-0 items-center gap-2">
									<Calendar
										className="text-muted-foreground size-4 shrink-0"
										aria-hidden
									/>
									<span className="text-foreground font-medium text-sm">
										{entry.label}
									</span>
								</div>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="text-muted-foreground hover:text-foreground size-8 shrink-0"
									onClick={() => t.remove(entry.id)}
									aria-label={`Remove time off ${entry.label}`}
								>
									<X className="size-4" />
								</Button>
							</li>
						))}
					</ul>
				) : null}
			</CardContent>
		</Card>
	);
}
