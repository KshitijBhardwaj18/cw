"use client";

import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import PaginationControls from "@repo/ui/general/PaginationControls";
import { SHIFT_EMPTY_STATES } from "@/constants/vendor/shift-claiming";
import type { ClaimableShift } from "@/types/vendor-claim-shifts";
import { ShiftCard } from "./ShiftCard";

interface VendorShiftClaimingTabContentProps {
	shifts: ClaimableShift[];
	totalCount: number;
	type: "available" | "assigned";
	onAction: (shift: ClaimableShift) => void;
	currentPage: number;
	pageCount: number;
	goToPage: (page: number) => void;
	limit: number;
	setLimit: (limit: number) => void;
	isFilteredEmpty: boolean;
	/** Claim Shift / Edit Timecard visibility. */
	showPrimaryAction?: boolean;
}

export function VendorShiftClaimingTabContent({
	shifts,
	totalCount,
	type,
	onAction,
	currentPage,
	pageCount,
	goToPage,
	limit,
	setLimit,
	isFilteredEmpty,
	showPrimaryAction = true,
}: Readonly<VendorShiftClaimingTabContentProps>) {
	const isEmptyState = totalCount === 0;

	const currentEmptyState = isEmptyState
		? isFilteredEmpty
			? SHIFT_EMPTY_STATES.filtered
			: SHIFT_EMPTY_STATES.initial[
					type as keyof typeof SHIFT_EMPTY_STATES.initial
				]
		: SHIFT_EMPTY_STATES.filtered;

	const Icon = currentEmptyState.icon;

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4">
				{shifts.length > 0 ? (
					shifts.map((shift) => (
						<ShiftCard
							key={shift.id}
							shift={shift}
							type={type}
							showPrimaryAction={showPrimaryAction}
							onAction={() => onAction(shift)}
						/>
					))
				) : (
					<Empty className="border-2">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<Icon />
							</EmptyMedia>
							<EmptyTitle>{currentEmptyState.title}</EmptyTitle>
							<EmptyDescription>
								{currentEmptyState.description}
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				)}
			</div>

			{totalCount > 0 && (
				<PaginationControls
					currentPage={currentPage}
					pageCount={pageCount}
					goToPage={goToPage}
					limit={limit}
					setLimit={setLimit}
					pageSizeOptions={[5, 10, 20, 50]}
					totalItems={totalCount}
					itemLabel="shift"
					itemLabelPlural="shifts"
				/>
			)}
		</div>
	);
}
