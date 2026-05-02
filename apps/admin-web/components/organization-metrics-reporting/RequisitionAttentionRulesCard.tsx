"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
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
import { cn } from "@repo/ui/lib/utils";
import { AlertCircle, AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

function ConfigShell({ children }: { children: ReactNode }) {
	return (
		<div className="bg-muted/80 mt-3 space-y-3 rounded-md border p-3">
			{children}
		</div>
	);
}

export function RequisitionAttentionRulesCard() {
	const [slowEnabled, setSlowEnabled] = useState(true);
	const [slowHours, setSlowHours] = useState("24");
	const [slowUnit, setSlowUnit] = useState("Hours");

	const [lowEnabled, setLowEnabled] = useState(true);
	const [lowSubmissionMax, setLowSubmissionMax] = useState("4");

	const [noSubEnabled, setNoSubEnabled] = useState(true);
	const [noSubDays, setNoSubDays] = useState("2");
	const [noSubUnit, setNoSubUnit] = useState("Days");

	return (
		<Card>
			<CardHeader className="border-b">
				<CardTitle className="text-lg">
					Rules for Requisition Attention:
				</CardTitle>
				<CardDescription>
					Configure thresholds for requisition attention flags. Only threshold
					values are editable—core logic is fixed.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Slow Time to Fill */}
				<div className="rounded-lg border p-4">
					<div className="flex items-start justify-between gap-4">
						<div className="flex gap-3">
							<AlertTriangle
								className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400"
								strokeWidth={2}
								aria-hidden
							/>
							<div>
								<p className="font-semibold">Slow Time to Fill</p>
								<p className="text-muted-foreground mt-1 text-sm">
									Flags requisitions open with 0 offers beyond threshold
								</p>
							</div>
						</div>
						<Switch
							checked={slowEnabled}
							onCheckedChange={setSlowEnabled}
							aria-label="Toggle Slow Time to Fill rule"
						/>
					</div>
					<ConfigShell>
						<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
							<p className="text-sm leading-snug sm:max-w-[min(100%,26rem)]">
								Time requisition open with 0 offers extended is &gt;=
							</p>
							<div className="flex flex-wrap items-center gap-2 sm:ms-auto">
								<Input
									className="w-20"
									value={slowHours}
									onChange={(e) => setSlowHours(e.target.value)}
									inputMode="numeric"
									disabled={!slowEnabled}
								/>
								<Select
									value={slowUnit}
									onValueChange={setSlowUnit}
									disabled={!slowEnabled}
								>
									<SelectTrigger className="w-[120px]">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Hours">Hours</SelectItem>
										<SelectItem value="Days">Days</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</ConfigShell>
				</div>

				{/* Low Submission Count */}
				<div className="rounded-lg border p-4">
					<div className="flex items-start justify-between gap-4">
						<div className="flex gap-3">
							<AlertTriangle
								className="mt-0.5 size-5 shrink-0 text-violet-600 dark:text-violet-400"
								strokeWidth={2}
								aria-hidden
							/>
							<div>
								<p className="font-semibold">Low Submission Count</p>
								<p className="text-muted-foreground mt-1 text-sm">
									Flags requisitions with low submission activity
								</p>
							</div>
						</div>
						<Switch
							checked={lowEnabled}
							onCheckedChange={setLowEnabled}
							aria-label="Toggle Low Submission Count rule"
						/>
					</div>
					<ConfigShell>
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
							<Label className="text-muted-foreground shrink-0 font-normal sm:max-w-56">
								Requisition was created &gt;=
							</Label>
							<div className="flex flex-wrap items-center gap-2">
								<Input
									className="w-28 bg-muted/50"
									value="10 days"
									disabled
									readOnly
								/>
								<span className="text-muted-foreground text-sm">(fixed)</span>
							</div>
						</div>
						<div className="flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:gap-3">
							<Label className="font-normal sm:max-w-56">
								Submission received are &lt;=
							</Label>
							<Input
								className="w-20"
								value={lowSubmissionMax}
								onChange={(e) => setLowSubmissionMax(e.target.value)}
								inputMode="numeric"
								disabled={!lowEnabled}
							/>
						</div>
					</ConfigShell>
				</div>

				{/* No Submissions */}
				<div className="rounded-lg border p-4">
					<div className="flex items-start justify-between gap-4">
						<div className="flex gap-3">
							<AlertCircle
								className="mt-0.5 size-5 shrink-0"
								strokeWidth={2}
								aria-hidden
							/>
							<div>
								<p className="font-semibold">No Submissions</p>
								<p className="text-muted-foreground mt-1 text-sm">
									Flags requisitions with zero submissions beyond threshold
								</p>
							</div>
						</div>
						<Switch
							checked={noSubEnabled}
							onCheckedChange={setNoSubEnabled}
							aria-label="Toggle No Submissions rule"
						/>
					</div>
					<ConfigShell>
						<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
							<p className="text-sm leading-snug lg:max-w-xs">
								Requisitions was created &gt;=
							</p>
							<div className="flex flex-wrap items-center gap-2 lg:ms-auto">
								<Input
									className="w-20"
									value={noSubDays}
									onChange={(e) => setNoSubDays(e.target.value)}
									inputMode="numeric"
									disabled={!noSubEnabled}
								/>
								<Select
									value={noSubUnit}
									onValueChange={setNoSubUnit}
									disabled={!noSubEnabled}
								>
									<SelectTrigger className="w-[120px]">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Hours">Hours</SelectItem>
										<SelectItem value="Days">Days</SelectItem>
									</SelectContent>
								</Select>
								<span
									className={cn(
										"text-muted-foreground text-sm",
										!noSubEnabled && "pointer-events-none opacity-50",
									)}
								>
									ago and submission count is 0
								</span>
							</div>
						</div>
					</ConfigShell>
				</div>
			</CardContent>
		</Card>
	);
}
