"use client";

import { type AgingRuleStageTransition, AgingRuleUnit } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	AGING_RULE_UNIT_OPTIONS,
	type AgingRuleRow,
	STAGE_TRANSITION_OPTIONS,
} from "@/constants/metrics-reporting";
import { useUpsertAgingRulesMutation } from "@/queries/aging-rules.query";

const EMPTY_STAGE = "__none__";

type AgingRuleDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: "create" | "edit";
	organizationId: string;
	rule: AgingRuleRow | null;
	existingStageValues?: `${AgingRuleStageTransition}`[];
};

export function AgingRuleDialog({
	open,
	onOpenChange,
	mode,
	organizationId,
	rule,
	existingStageValues = [],
}: Readonly<AgingRuleDialogProps>) {
	const [stageValue, setStageValue] = useState(EMPTY_STAGE);
	const [overdueAfter, setOverdueAfter] = useState("");
	const [unit, setUnit] = useState<AgingRuleRow["unit"]>("Days");

	const upsertMutation = useUpsertAgingRulesMutation(organizationId);

	useEffect(() => {
		if (!open) return;
		if (mode === "edit" && rule) {
			setStageValue(rule.stageValue);
			setOverdueAfter(String(rule.overdueAfter));
			setUnit(rule.unit);
			return;
		}
		setStageValue(EMPTY_STAGE);
		setOverdueAfter("");
		setUnit("Days");
	}, [open, mode, rule]);

	const handleSubmit = () => {
		const stageTransition =
			stageValue === EMPTY_STAGE
				? null
				: (stageValue as `${AgingRuleStageTransition}`);
		if (!stageTransition) {
			toast.error("Select a stage");
			return;
		}
		const n = Number.parseInt(overdueAfter, 10);
		if (!Number.isFinite(n) || n < 1 || n > 365) {
			toast.error("Enter a value between 1 and 365");
			return;
		}
		upsertMutation.mutate(
			{
				rules: [
					{
						stageTransition,
						thresholdValue: n,
						thresholdUnit:
							unit === "Hours" ? AgingRuleUnit.HOURS : AgingRuleUnit.DAYS,
						isEnabled: rule?.enabled ?? true,
					},
				],
			},
			{
				onSuccess: () => {
					toast.success(mode === "create" ? "Rule created" : "Rule updated");
					onOpenChange(false);
				},
				onError: (err) =>
					toast.error(err instanceof Error ? err.message : "Save failed"),
			},
		);
	};

	const stageOptions = STAGE_TRANSITION_OPTIONS.filter((o) => o.value !== "");

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="max-h-[90dvh] gap-6 overflow-y-auto sm:max-w-md"
				showCloseButton
			>
				<DialogHeader>
					<DialogTitle>
						{mode === "create" ? "Create Rule" : "Edit Rule"}
					</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-4">
					<div className="space-y-2">
						<Label htmlFor="aging-stage">Stage</Label>
						<Select
							value={stageValue}
							onValueChange={setStageValue}
							disabled={mode === "edit"}
						>
							<SelectTrigger id="aging-stage" className="w-full min-w-0">
								<SelectValue placeholder="Select a stage" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={EMPTY_STAGE}>Select a stage</SelectItem>
								{stageOptions.map((o) => {
									const isTaken =
										mode === "create" &&
										existingStageValues.includes(
											o.value as `${AgingRuleStageTransition}`,
										);
									return (
										<SelectItem
											key={o.value}
											value={o.value}
											disabled={isTaken}
										>
											{o.label}
											{isTaken ? " (already configured)" : ""}
										</SelectItem>
									);
								})}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="aging-overdue">Overdue After</Label>
						<Input
							id="aging-overdue"
							inputMode="numeric"
							placeholder="e.g., 2"
							value={overdueAfter}
							onChange={(e) => setOverdueAfter(e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="aging-unit">Unit</Label>
						<Select
							value={unit}
							onValueChange={(v) => setUnit(v as AgingRuleRow["unit"])}
						>
							<SelectTrigger id="aging-unit" className="w-full min-w-0">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{AGING_RULE_UNIT_OPTIONS.map((o) => (
									<SelectItem key={o.value} value={o.value}>
										{o.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<DialogFooter className="gap-2 sm:justify-end">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={upsertMutation.isPending}
					>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleSubmit}
						disabled={upsertMutation.isPending}
					>
						{upsertMutation.isPending
							? "Saving…"
							: mode === "create"
								? "Create"
								: "Save"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
