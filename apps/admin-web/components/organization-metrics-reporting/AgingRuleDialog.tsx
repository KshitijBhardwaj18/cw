"use client";

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

const EMPTY_STAGE = "__none__";

type AgingRuleDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: "create" | "edit";
	rule: AgingRuleRow | null;
	onSave: (rule: AgingRuleRow) => void;
};

function stageLabelForValue(value: string): string {
	const found = STAGE_TRANSITION_OPTIONS.find((o) => o.value === value);
	return found?.label ?? value;
}

export function AgingRuleDialog({
	open,
	onOpenChange,
	mode,
	rule,
	onSave,
}: AgingRuleDialogProps) {
	const [stageValue, setStageValue] = useState(EMPTY_STAGE);
	const [overdueAfter, setOverdueAfter] = useState("");
	const [unit, setUnit] = useState<AgingRuleRow["unit"]>("Days");

	useEffect(() => {
		if (!open) return;
		if (mode === "edit" && rule) {
			setStageValue(rule.stageValue || EMPTY_STAGE);
			setOverdueAfter(String(rule.overdueAfter));
			setUnit(rule.unit);
			return;
		}
		setStageValue(EMPTY_STAGE);
		setOverdueAfter("");
		setUnit("Days");
	}, [open, mode, rule]);

	const handleSubmit = () => {
		const stage = stageValue === EMPTY_STAGE || !stageValue ? "" : stageValue;
		if (!stage) {
			toast.error("Select a stage");
			return;
		}
		const n = Number.parseInt(overdueAfter, 10);
		if (Number.isNaN(n) || n < 1) {
			toast.error("Enter a valid overdue amount");
			return;
		}
		const row: AgingRuleRow = {
			id:
				mode === "edit" && rule
					? rule.id
					: `ar-${crypto.randomUUID().slice(0, 8)}`,
			stageValue: stage,
			stageLabel: stageLabelForValue(stage),
			overdueAfter: n,
			unit,
			indicator:
				mode === "edit" && rule ? rule.indicator : "overdue_submissions",
			enabled: mode === "edit" && rule ? rule.enabled : true,
		};
		onSave(row);
		toast.success(mode === "create" ? "Rule created" : "Rule updated");
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="gap-6 sm:max-w-md" showCloseButton>
				<DialogHeader>
					<DialogTitle>
						{mode === "create" ? "Create Rule" : "Edit Rule"}
					</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-4">
					<div className="space-y-2">
						<Label htmlFor="aging-stage">Stage</Label>
						<Select value={stageValue} onValueChange={setStageValue}>
							<SelectTrigger id="aging-stage" className="w-full min-w-0">
								<SelectValue placeholder="Select a stage" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={EMPTY_STAGE}>Select a stage</SelectItem>
								{STAGE_TRANSITION_OPTIONS.filter((o) => o.value !== "").map(
									(o) => (
										<SelectItem key={o.value} value={o.value}>
											{o.label}
										</SelectItem>
									),
								)}
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
					>
						Cancel
					</Button>
					<Button type="button" onClick={handleSubmit}>
						{mode === "create" ? "Create" : "Save"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
