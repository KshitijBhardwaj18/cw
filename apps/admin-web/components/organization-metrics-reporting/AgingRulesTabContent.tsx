"use client";

import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { PageSubheading } from "@repo/ui/general/PageSubheading";
import { Plus } from "lucide-react";
import { useCallback, useState } from "react";
import type { AgingRuleRow } from "@/constants/metrics-reporting";
import { MOCK_AGING_RULES } from "@/constants/metrics-reporting";
import { useAgingRuleColumns } from "@/hooks/tables/use-aging-rule-columns";
import { AgingRuleDialog } from "./AgingRuleDialog";
import { RequisitionAttentionRulesCard } from "./RequisitionAttentionRulesCard";

export function AgingRulesTabContent() {
	const [rules, setRules] = useState<AgingRuleRow[]>(MOCK_AGING_RULES);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
	const [editingRule, setEditingRule] = useState<AgingRuleRow | null>(null);

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

	const onEnabledChange = useCallback((id: string, enabled: boolean) => {
		setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled } : r)));
	}, []);

	const { columns } = useAgingRuleColumns({
		onEnabledChange,
		onEdit: openEdit,
	});

	return (
		<div className="space-y-6">
			<Card>
				<CardContent>
					<PageSubheading
						title="Aging Rules"
						subtitle="Configure workflow stage aging rules to define when stages become overdue."
						rightContent={
							<Button type="button" onClick={openCreate}>
								<Plus className="size-4" />
								Create Rule
							</Button>
						}
					/>
				</CardContent>
			</Card>

			<CustomTable columns={columns} data={rules} />

			<RequisitionAttentionRulesCard />

			<AgingRuleDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				mode={dialogMode}
				rule={editingRule}
				onSave={(next) => {
					setRules((prev) => {
						const idx = prev.findIndex((r) => r.id === next.id);
						if (idx === -1) return [...prev, next];
						const copy = [...prev];
						copy[idx] = next;
						return copy;
					});
				}}
			/>
		</div>
	);
}
