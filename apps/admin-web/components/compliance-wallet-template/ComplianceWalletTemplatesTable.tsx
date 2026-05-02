"use client";

import type { CombinationRow } from "@repo/shared";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { useComplianceWalletTemplateColumns } from "@/hooks/tables/use-compliance-wallet-template-columns";

export interface ComplianceWalletTemplatesTableProps {
	data: CombinationRow[];
	organizationId: string;
	canUpdate: boolean;
	canDelete: boolean;
	onDelete?: (row: CombinationRow) => void;
}

export function ComplianceWalletTemplatesTable({
	data,
	organizationId,
	canUpdate,
	canDelete,
	onDelete,
}: ComplianceWalletTemplatesTableProps) {
	const { columns } = useComplianceWalletTemplateColumns({
		organizationId,
		canUpdate,
		canDelete,
		onDelete,
	});

	return <CustomTable columns={columns} data={data} enableSorting={false} />;
}
