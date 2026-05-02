"use client";

import { CANDIDATE_WORKFORCE_TYPE_OPTIONS } from "@repo/shared";
import { useForm } from "@tanstack/react-form";
import type { RowSelectionState } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAddExistingTalentColumns } from "@/hooks/tables/use-add-existing-talent-columns";
import {
	useAddExistingTalent,
	useExistingTalent,
} from "@/queries/talent-community.queries";
import type { ExistingTalentQuery } from "@/services/talent-community.service";

export function useAddExistingTalentDialog({
	orgId,
	onOpenChange,
}: {
	orgId: string;
	onOpenChange: (open: boolean) => void;
}) {
	const [search, setSearch] = useState("");
	const [workforceType, setWorkforceType] =
		useState<ExistingTalentQuery["workforceType"]>("all");
	const [status, setStatus] = useState<ExistingTalentQuery["status"]>("all");
	const [source, setSource] = useState<ExistingTalentQuery["source"]>("all");
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const columns = useAddExistingTalentColumns();
	const { data } = useExistingTalent(orgId, {
		search: search || undefined,
		workforceType,
		status,
		source,
		page: 1,
		limit: 100,
	});
	const addExistingMutation = useAddExistingTalent(orgId);
	const selectedIds = useMemo(
		() => Object.keys(rowSelection).filter((key) => rowSelection[key]),
		[rowSelection],
	);
	const selectedCount = selectedIds.length;
	const rows = data?.data ?? [];

	const resetFilters = useCallback(() => {
		setRowSelection({});
		setSearch("");
		setWorkforceType("all");
		setStatus("all");
		setSource("all");
	}, []);

	const handleClose = useCallback(() => {
		onOpenChange(false);
		resetFilters();
	}, [onOpenChange, resetFilters]);

	const form = useForm({
		defaultValues: {
			candidateIds: [] as string[],
		},
		onSubmit: () => {
			addExistingMutation.mutate(selectedIds, {
				onSuccess: (response) => {
					toast.success(
						`Added ${response.addedCount} candidate${response.addedCount === 1 ? "" : "s"} to Talent Community`,
					);
					handleClose();
				},
				onError: (err) => {
					toast.error(
						err instanceof Error ? err.message : "Something went wrong",
					);
				},
			});
		},
	});

	const workforceTypeSelectOptions = useMemo(
		() => [
			{ value: "all" as const, label: "All Types" },
			...CANDIDATE_WORKFORCE_TYPE_OPTIONS,
		],
		[],
	);

	return {
		form,
		search,
		setSearch,
		workforceType,
		setWorkforceType,
		status,
		setStatus,
		source,
		setSource,
		rowSelection,
		setRowSelection,
		columns,
		rows,
		selectedCount,
		handleClose,
		addExistingMutation,
		workforceTypeSelectOptions,
	};
}
