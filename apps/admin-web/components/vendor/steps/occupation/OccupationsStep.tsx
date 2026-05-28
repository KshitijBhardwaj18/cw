"use client";

import type { Occupation } from "@repo/db";
import { Card, CardContent } from "@repo/ui/components/card";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	useOccupationsForStepQuery,
	useSetOccupationsMutation,
	useVendorDetailQuery,
} from "@/queries/vendor.queries";
import { OccupationColumn } from "./OccupationColumn";
import { OccupationStepFooter } from "./OccupationStepFooter";
import { OccupationTransferButtons } from "./OccupationTransferButtons";

function filterBySearch(
	occupations: Occupation[],
	search: string,
): Occupation[] {
	const term = search.trim().toLowerCase();
	if (!term) return occupations;
	return occupations.filter(
		(o) =>
			o.name.toLowerCase().includes(term) ||
			(o.acronym?.toLowerCase().includes(term) ?? false) ||
			(o.code?.toLowerCase().includes(term) ?? false),
	);
}

interface OccupationsStepProps {
	vendorId: string;
}

export function OccupationsStep({ vendorId }: Readonly<OccupationsStepProps>) {
	const router = useRouter();
	const { data: vendor } = useVendorDetailQuery(vendorId);
	const setOccupationsMutation = useSetOccupationsMutation();
	const { data: allOccupations = [], isLoading } = useOccupationsForStepQuery();

	const existingOccupationIds = useMemo(
		() =>
			vendor?.vendorOccupationSpecializations.map((s) => s.occupationId) ?? [],
		[vendor?.vendorOccupationSpecializations],
	);

	const [selectedIds, setSelectedIds] = useState<string[]>(
		existingOccupationIds,
	);
	const [availableSearch, setAvailableSearch] = useState("");
	const [selectedSearch, setSelectedSearch] = useState("");
	const [checkedAvailable, setCheckedAvailable] = useState<string[]>([]);
	const [checkedSelected, setCheckedSelected] = useState<string[]>([]);

	useEffect(() => {
		setSelectedIds(existingOccupationIds);
	}, [existingOccupationIds]);

	const availableOccupations = useMemo(() => {
		const available = allOccupations.filter((o) => !selectedIds.includes(o.id));
		return filterBySearch(available, availableSearch);
	}, [allOccupations, selectedIds, availableSearch]);

	const selectedOccupations = useMemo(() => {
		const selected = allOccupations.filter((o) => selectedIds.includes(o.id));
		return filterBySearch(selected, selectedSearch);
	}, [allOccupations, selectedIds, selectedSearch]);

	const moveToSelected = () => {
		const idsToMove = checkedAvailable.filter((id) =>
			availableOccupations.some((o) => o.id === id),
		);
		setSelectedIds((prev) => [...prev, ...idsToMove]);
		setCheckedAvailable((prev) => prev.filter((id) => !idsToMove.includes(id)));
	};

	const moveToAvailable = () => {
		const idsToMove = checkedSelected.filter((id) =>
			selectedOccupations.some((o) => o.id === id),
		);
		setSelectedIds((prev) => prev.filter((id) => !idsToMove.includes(id)));
		setCheckedSelected((prev) => prev.filter((id) => !idsToMove.includes(id)));
	};

	const handleNext = () => {
		setOccupationsMutation.mutate(
			{ vendorId, payload: { occupationIds: selectedIds } },
			{
				onSuccess: () => {
					toast.success("Occupations saved");
					router.push(`/vendors/create?step=2&vendorId=${vendorId}`);
				},
				onError: (err) =>
					toast.error(
						err instanceof Error ? err.message : "Failed to save occupations",
					),
			},
		);
	};

	const handleBack = () => {
		router.push(`/vendors/create?step=0&vendorId=${vendorId}`);
	};

	return (
		<Card>
			<CardContent className="p-6">
				<h2 className="mb-6 text-lg font-semibold">
					Vendor Occupation Specialization
				</h2>

				<div className="grid grid-cols-[1fr_auto_1fr] gap-4">
					<OccupationColumn
						title={`${availableOccupations.length} Items Available`}
						searchValue={availableSearch}
						onSearchChange={setAvailableSearch}
						occupations={availableOccupations}
						checkedIds={checkedAvailable}
						onCheckedChange={(id, checked) => {
							if (checked) {
								setCheckedAvailable((prev) => [...prev, id]);
							} else {
								setCheckedAvailable((prev) => prev.filter((x) => x !== id));
							}
						}}
						emptyMessage="No occupations available"
						checkboxIdPrefix="available-occ"
						isLoading={isLoading}
					/>

					<OccupationTransferButtons
						onMoveToSelected={moveToSelected}
						onMoveToAvailable={moveToAvailable}
						canMoveToSelected={checkedAvailable.length > 0}
						canMoveToAvailable={checkedSelected.length > 0}
					/>

					<OccupationColumn
						title={`${selectedOccupations.length} Items Selected`}
						searchValue={selectedSearch}
						onSearchChange={setSelectedSearch}
						occupations={selectedOccupations}
						checkedIds={checkedSelected}
						onCheckedChange={(id, checked) => {
							if (checked) {
								setCheckedSelected((prev) => [...prev, id]);
							} else {
								setCheckedSelected((prev) => prev.filter((x) => x !== id));
							}
						}}
						emptyMessage="No occupations selected"
						checkboxIdPrefix="selected-occ"
						isLoading={isLoading}
					/>
				</div>

				<OccupationStepFooter
					onBack={handleBack}
					onNext={handleNext}
					isNextPending={setOccupationsMutation.isPending}
				/>
			</CardContent>
		</Card>
	);
}
