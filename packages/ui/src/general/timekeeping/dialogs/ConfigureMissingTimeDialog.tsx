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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { Switch } from "@repo/ui/components/switch";
import { Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TIMEKEEPING_POLICY_DEFAULTS } from "../constants";

export type ConfigureMissingTimePolicyPayload = {
	submissionDeadlineDays: number;
	reminderIntervalDays: number;
	autoCreateMissingCases: boolean;
};

interface ConfigureMissingTimeDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Current policy values (e.g. from API). */
	submissionDeadlineDays: number;
	reminderIntervalDays: number;
	autoCreateMissingCases: boolean;
	onSave: (payload: ConfigureMissingTimePolicyPayload) => void;
	isSaving?: boolean;
}

export function ConfigureMissingTimeDialog({
	open,
	onOpenChange,
	submissionDeadlineDays,
	reminderIntervalDays,
	autoCreateMissingCases,
	onSave,
	isSaving = false,
}: Readonly<ConfigureMissingTimeDialogProps>) {
	const [deadlineDays, setDeadlineDays] = useState(
		String(submissionDeadlineDays),
	);
	const [autoReminders, setAutoReminders] = useState(autoCreateMissingCases);
	const [reminderInterval, setReminderInterval] = useState(
		String(reminderIntervalDays),
	);

	useEffect(() => {
		if (open) {
			setDeadlineDays(String(submissionDeadlineDays));
			setAutoReminders(autoCreateMissingCases);
			setReminderInterval(String(reminderIntervalDays));
		}
	}, [
		open,
		submissionDeadlineDays,
		reminderIntervalDays,
		autoCreateMissingCases,
	]);

	const handleSave = () => {
		const submissionDeadlineDaysNum = Number.parseInt(deadlineDays, 10);
		const reminderIntervalDaysNum = Number.parseInt(reminderInterval, 10);

		if (
			Number.isNaN(submissionDeadlineDaysNum) ||
			submissionDeadlineDaysNum < 1 ||
			submissionDeadlineDaysNum > 30
		) {
			toast.error("Deadline must be between 1 and 30 days");
			return;
		}

		onSave({
			submissionDeadlineDays: submissionDeadlineDaysNum,
			reminderIntervalDays: Number.isNaN(reminderIntervalDaysNum)
				? TIMEKEEPING_POLICY_DEFAULTS.reminderIntervalDays
				: reminderIntervalDaysNum,
			autoCreateMissingCases: autoReminders,
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
							<Settings2 className="text-primary size-5" />
						</div>
						<div className="space-y-0.5">
							<DialogTitle>Submission Policy</DialogTitle>
							<DialogDescription>
								Manage thresholds and automated reminder settings.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="space-y-6 py-4">
					<div className="space-y-3">
						<Label htmlFor="deadline" className="text-sm font-semibold">
							Submission Deadline Threshold
						</Label>
						<div className="flex items-center gap-3">
							<Input
								id="deadline"
								type="number"
								min={1}
								max={30}
								className="w-20 font-medium"
								value={deadlineDays}
								onChange={(e) => setDeadlineDays(e.target.value)}
							/>
							<span className="text-muted-foreground text-sm">
								days after shift completion
							</span>
						</div>
						<p className="text-muted-foreground text-sm leading-relaxed">
							Entries exceeding this limit will be automatically flagged as
							"Overdue" in reporting across the organization.
						</p>
					</div>

					<div className="border-t pt-6">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label className="text-sm font-semibold">
									Auto-create Missing Cases
								</Label>
								<p className="text-muted-foreground text-sm leading-relaxed">
									Automatically flag missing time when deadline passes.
								</p>
							</div>
							<Switch
								checked={autoReminders}
								onCheckedChange={setAutoReminders}
							/>
						</div>
					</div>

					<div className="space-y-3">
						<Label className="text-sm font-semibold">Reminder Interval</Label>
						<Select
							value={reminderInterval}
							onValueChange={setReminderInterval}
							disabled={!autoReminders}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select interval" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="1">Every 1 day</SelectItem>
								<SelectItem value="2">Every 2 days</SelectItem>
								<SelectItem value="3">Every 3 days</SelectItem>
								<SelectItem value="7">Every 7 days</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="ghost"
						onClick={() => onOpenChange(false)}
						className="text-muted-foreground"
					>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={isSaving} className="px-8">
						{isSaving ? "Saving…" : "Save Changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
