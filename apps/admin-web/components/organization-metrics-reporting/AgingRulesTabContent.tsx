"use client";

import {
	AGING_RULE_STAGE_TRANSITION_LABEL,
	type AgingRuleStageTransition,
	AgingRuleUnit,
} from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { CustomTable } from "@repo/ui/general/CustomTable";
import LoadingScreen from "@repo/ui/general/LoadingScreen";
import { PageSubheading } from "@repo/ui/general/PageSubheading";
import { Plus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	ACTIVE_AGING_RULE_TRANSITION_COUNT,
	type AgingRuleRow,
	indicatorForTransition,
} from "@/constants/metrics-reporting";
import { useAgingRuleColumns } from "@/hooks/tables/use-aging-rule-columns";
import {
	useAgingRulesQuery,
	useDeleteAgingRuleMutation,
	useUpsertAgingRulesMutation,
} from "@/queries/aging-rules.query";
import type { AgingRule } from "@/services/aging-rules.service";
import { AgingRuleDialog } from "./AgingRuleDialog";
import { AgingRuleIndicatorLegend } from "./AgingRuleIndicatorLegend";
import { RequisitionAttentionRulesCard } from "./RequisitionAttentionRulesCard";

function apiRuleToRow(rule: AgingRule): AgingRuleRow {
	const stageValue = rule.stageTransition;
	return {
		id: stageValue,
		stageValue,
		stageLabel:
			AGING_RULE_STAGE_TRANSITION_LABEL[stageValue as AgingRuleStageTransition],
		overdueAfter: rule.thresholdValue,
		unit: rule.thresholdUnit === AgingRuleUnit.HOURS ? "Hours" : "Days",
		indicator: indicatorForTransition(stageValue),
		enabled: rule.isEnabled,
	};
}

type AgingRulesTabContentProps = {
	organizationId: string;
};

export function AgingRulesTabContent({
	organizationId,
}: Readonly<AgingRulesTabContentProps>) {
	const { data, isLoading } = useAgingRulesQuery(organizationId);
	const upsertMutation = useUpsertAgingRulesMutation(organizationId);
	const deleteMutation = useDeleteAgingRuleMutation(organizationId);

	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
	const [editingRule, setEditingRule] = useState<AgingRuleRow | null>(null);

	const configuredRules = useMemo(
		() => (data?.rules ?? []).filter((r) => r.isConfigured === true),
		[data?.rules],
	);
	const rows = useMemo(
		() => configuredRules.map(apiRuleToRow),
		[configuredRules],
	);
	const existingStageValues = useMemo(
		() => rows.map((r) => r.stageValue),
		[rows],
	);

	const openCreate = () => {
		setDialogMode("create");
		setEditingRule(null);
		setDialogOpen(true);
	};

	const openEdit = useCallback((row: AgingRuleRow) => {
		setDialogMode("edit");
		setEditingRule(row);
		setDialogOpen(true);
	}, []);

	const handleEnabledChange = useCallback(
		(row: AgingRuleRow, enabled: boolean) => {
			upsertMutation.mutate(
				{
					rules: [
						{
							stageTransition: row.stageValue,
							thresholdValue: row.overdueAfter,
							thresholdUnit:
								row.unit === "Hours" ? AgingRuleUnit.HOURS : AgingRuleUnit.DAYS,
							isEnabled: enabled,
						},
					],
				},
				{
					onError: (err) =>
						toast.error(err instanceof Error ? err.message : "Save failed"),
				},
			);
		},
		[upsertMutation],
	);

	const handleDelete = useCallback(
		(row: AgingRuleRow) => {
			deleteMutation.mutate(row.stageValue, {
				onSuccess: () => toast.success("Rule removed"),
				onError: (err) =>
					toast.error(err instanceof Error ? err.message : "Delete failed"),
			});
		},
		[deleteMutation],
	);

	const { columns } = useAgingRuleColumns({
		onEnabledChange: handleEnabledChange,
		onEdit: openEdit,
		onDelete: handleDelete,
	});

	const allStagesConfigured =
		existingStageValues.length === ACTIVE_AGING_RULE_TRANSITION_COUNT;

	if (isLoading) {
		return <LoadingScreen />;
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardContent>
					<PageSubheading
						title="Aging Rules"
						subtitle="Configure workflow stage aging rules to define when stages become overdue."
						rightContent={
							<Button
								type="button"
								onClick={openCreate}
								disabled={allStagesConfigured}
								title={
									allStagesConfigured
										? "All stages already configured"
										: undefined
								}
							>
								<Plus className="size-4" />
								Create Rule
							</Button>
						}
					/>
				</CardContent>
			</Card>

			<CustomTable columns={columns} data={rows} />

			<AgingRuleIndicatorLegend />

			<RequisitionAttentionRulesCard organizationId={organizationId} />

			<AgingRuleDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				mode={dialogMode}
				organizationId={organizationId}
				rule={editingRule}
				existingStageValues={existingStageValues}
			/>
		</div>
	);
}
