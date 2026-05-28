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
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { OrgMetricKpi } from "@/constants/metrics-reporting";

type EditGoalDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	kpi: OrgMetricKpi | null;
	onSave: (kpiId: string, nextGoalEditValue: string) => Promise<boolean>;
};

export function EditGoalDialog({
	open,
	onOpenChange,
	kpi,
	onSave,
}: Readonly<EditGoalDialogProps>) {
	const [value, setValue] = useState("");

	useEffect(() => {
		if (open && kpi) {
			setValue(kpi.goalEditValue);
		}
	}, [open, kpi]);

	const suffix = kpi?.goalInputSuffix ?? "";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="max-h-[90dvh] gap-6 overflow-y-auto sm:max-w-md"
				showCloseButton
			>
				<DialogHeader>
					<DialogTitle>Edit Goal</DialogTitle>
					{kpi && (
						<DialogDescription>
							Update the goal for {kpi.name}
						</DialogDescription>
					)}
				</DialogHeader>

				{kpi && (
					<div className="space-y-2">
						<Label htmlFor="goal-value" className="font-semibold">
							Goal Value
						</Label>
						<div className="relative">
							<Input
								id="goal-value"
								value={value}
								onChange={(e) => setValue(e.target.value)}
								className={suffix ? "pr-12" : undefined}
								placeholder="Enter goal"
								inputMode="numeric"
								autoComplete="off"
							/>
							{suffix ? (
								<span className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm">
									{suffix}
								</span>
							) : null}
						</div>
						<p className="text-muted-foreground text-xs">
							{kpi.goalHelperText}
						</p>
					</div>
				)}

				<DialogFooter className="gap-2 sm:gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={async () => {
							if (!kpi) return;
							const trimmed = value.trim();
							if (!trimmed) {
								toast.error("Enter a goal value");
								return;
							}
							try {
								const saved = await onSave(kpi.id, trimmed);
								if (saved) {
									onOpenChange(false);
								}
							} catch (error) {
								toast.error(
									error instanceof Error
										? error.message
										: "Failed to update goal",
								);
							}
						}}
					>
						Save Goal
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
