"use client";

import {
	REQUISITION_ATTENTION_RULE_DEFAULTS,
	REQUISITION_ATTENTION_RULE_KEYS,
	RequisitionAttentionRuleKey,
	type RequisitionAttentionRuleUnit,
	RULE_KEY_ALLOWED_UNITS,
} from "@repo/shared";
import { Button } from "@repo/ui/components/button";
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
import LoadingScreen from "@repo/ui/general/LoadingScreen";
import { cn } from "@repo/ui/lib/utils";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import {
	useRequisitionAttentionRulesQuery,
	useUpsertRequisitionAttentionRulesMutation,
} from "@/queries/requisition-attention-rules.query";
import type { RequisitionAttentionRule } from "@/services/requisition-attention-rules.service";

type FormState = Record<string, RequisitionAttentionRule>;

function buildInitialState(rules?: RequisitionAttentionRule[]): FormState {
	const out: FormState = {};
	for (const key of REQUISITION_ATTENTION_RULE_KEYS) {
		const fromApi = rules?.find((r) => r.key === key);
		if (fromApi) {
			out[key] = fromApi;
			continue;
		}
		const def = REQUISITION_ATTENTION_RULE_DEFAULTS[key];
		out[key] = {
			key,
			thresholdValue: def.thresholdValue,
			thresholdUnit: def.thresholdUnit,
			isEnabled: def.isEnabled,
			isConfigured: false,
		};
	}
	return out;
}

function ConfigShell({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<div className="bg-muted/80 mt-3 space-y-3 rounded-md border p-3">
			{children}
		</div>
	);
}

type RequisitionAttentionRulesCardProps = {
	organizationId: string;
};

export function RequisitionAttentionRulesCard({
	organizationId,
}: Readonly<RequisitionAttentionRulesCardProps>) {
	const { data, isLoading, isError } =
		useRequisitionAttentionRulesQuery(organizationId);
	const upsertMutation =
		useUpsertRequisitionAttentionRulesMutation(organizationId);
	const [form, setForm] = useState<FormState>(() => buildInitialState());

	useEffect(() => {
		if (data?.rules) {
			setForm(buildInitialState(data.rules));
		}
	}, [data]);

	if (isLoading) {
		return <LoadingScreen />;
	}
	if (isError) {
		return (
			<Card>
				<CardContent className="text-sm text-destructive">
					Failed to load rules.
				</CardContent>
			</Card>
		);
	}

	const slow = form[RequisitionAttentionRuleKey.SLOW_TIME_TO_FILL];
	const low = form[RequisitionAttentionRuleKey.LOW_SUBMISSION_COUNT];
	const noSub = form[RequisitionAttentionRuleKey.NO_SUBMISSIONS];

	const anyUnconfigured = REQUISITION_ATTENTION_RULE_KEYS.some(
		(k) => form[k].isConfigured === false,
	);

	const updateRule = (
		key: RequisitionAttentionRuleKey,
		patch: Partial<RequisitionAttentionRule>,
	) => {
		setForm((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
	};

	const parseValue = (v: string): number => {
		const n = Number.parseInt(v, 10);
		return Number.isFinite(n) && n > 0 ? n : 0;
	};

	const handleSave = () => {
		const rules = REQUISITION_ATTENTION_RULE_KEYS.map((k) => form[k]);
		for (const r of rules) {
			if (r.thresholdValue < 1 || r.thresholdValue > 365) {
				toast.error(`${r.key}: value must be between 1 and 365`);
				return;
			}
		}
		upsertMutation.mutate(
			{ rules },
			{
				onSuccess: () => toast.success("Rules saved"),
				onError: (err) =>
					toast.error(err instanceof Error ? err.message : "Save failed"),
			},
		);
	};

	const slowUnits =
		RULE_KEY_ALLOWED_UNITS[RequisitionAttentionRuleKey.SLOW_TIME_TO_FILL];
	const noSubUnits =
		RULE_KEY_ALLOWED_UNITS[RequisitionAttentionRuleKey.NO_SUBMISSIONS];

	return (
		<Card>
			<CardHeader className="border-b">
				<CardTitle className="text-lg">
					Rules for Requisition Attention
				</CardTitle>
				<CardDescription>
					Configure thresholds for requisition attention flags. Only threshold
					values are editable—core logic is fixed.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{anyUnconfigured && (
					<div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
						<AlertCircle className="mt-0.5 size-4 shrink-0" />
						<div>
							<p className="font-medium">Rules not yet configured</p>
							<p>
								Default values are shown for reference. Save these rules to
								enable the Operations Management cards in the org portal command
								center.
							</p>
						</div>
					</div>
				)}
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
									Flags requisitions open with 0 offers extended beyond
									threshold
								</p>
							</div>
						</div>
						<Switch
							checked={slow.isEnabled}
							onCheckedChange={(checked) =>
								updateRule(RequisitionAttentionRuleKey.SLOW_TIME_TO_FILL, {
									isEnabled: checked,
								})
							}
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
									value={String(slow.thresholdValue)}
									onChange={(e) =>
										updateRule(RequisitionAttentionRuleKey.SLOW_TIME_TO_FILL, {
											thresholdValue: parseValue(e.target.value),
										})
									}
									inputMode="numeric"
									disabled={!slow.isEnabled}
								/>
								<Select
									value={slow.thresholdUnit}
									onValueChange={(v) =>
										updateRule(RequisitionAttentionRuleKey.SLOW_TIME_TO_FILL, {
											thresholdUnit: v as `${RequisitionAttentionRuleUnit}`,
										})
									}
									disabled={!slow.isEnabled}
								>
									<SelectTrigger className="w-[120px]">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{slowUnits.map((u) => (
											<SelectItem key={u} value={u}>
												{u.charAt(0) + u.slice(1).toLowerCase()}
											</SelectItem>
										))}
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
							checked={low.isEnabled}
							onCheckedChange={(checked) =>
								updateRule(RequisitionAttentionRuleKey.LOW_SUBMISSION_COUNT, {
									isEnabled: checked,
								})
							}
							aria-label="Toggle Low Submission Count rule"
						/>
					</div>
					<ConfigShell>
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
							<Label className="font-normal sm:max-w-56">
								Submission count is less than
							</Label>
							<Input
								className="w-20"
								value={String(low.thresholdValue)}
								onChange={(e) =>
									updateRule(RequisitionAttentionRuleKey.LOW_SUBMISSION_COUNT, {
										thresholdValue: parseValue(e.target.value),
									})
								}
								inputMode="numeric"
								disabled={!low.isEnabled}
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
							checked={noSub.isEnabled}
							onCheckedChange={(checked) =>
								updateRule(RequisitionAttentionRuleKey.NO_SUBMISSIONS, {
									isEnabled: checked,
								})
							}
							aria-label="Toggle No Submissions rule"
						/>
					</div>
					<ConfigShell>
						<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
							<p className="text-sm leading-snug lg:max-w-xs">
								Requisition was created &gt;=
							</p>
							<div className="flex flex-wrap items-center gap-2 lg:ms-auto">
								<Input
									className="w-20"
									value={String(noSub.thresholdValue)}
									onChange={(e) =>
										updateRule(RequisitionAttentionRuleKey.NO_SUBMISSIONS, {
											thresholdValue: parseValue(e.target.value),
										})
									}
									inputMode="numeric"
									disabled={!noSub.isEnabled}
								/>
								<Select
									value={noSub.thresholdUnit}
									onValueChange={(v) =>
										updateRule(RequisitionAttentionRuleKey.NO_SUBMISSIONS, {
											thresholdUnit: v as `${RequisitionAttentionRuleUnit}`,
										})
									}
									disabled={!noSub.isEnabled}
								>
									<SelectTrigger className="w-[120px]">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{noSubUnits.map((u) => (
											<SelectItem key={u} value={u}>
												{u.charAt(0) + u.slice(1).toLowerCase()}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<span
									className={cn(
										"text-muted-foreground text-sm",
										!noSub.isEnabled && "pointer-events-none opacity-50",
									)}
								>
									ago and submission count is 0
								</span>
							</div>
						</div>
					</ConfigShell>
				</div>

				<div className="flex justify-end pt-2">
					<Button
						type="button"
						onClick={handleSave}
						disabled={upsertMutation.isPending}
					>
						{upsertMutation.isPending
							? "Saving…"
							: anyUnconfigured
								? "Configure Rules"
								: "Save Rules"}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
