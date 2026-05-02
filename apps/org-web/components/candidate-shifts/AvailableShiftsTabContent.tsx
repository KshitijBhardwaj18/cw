"use client";

import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";
import PaginationControls from "@repo/ui/general/PaginationControls";
import { Info, Layers } from "lucide-react";
import { useState } from "react";
import type {
	CandidateShiftListItem,
	CandidateWorkerType,
} from "@/types/candidate-shifts";
import { ShiftCard } from "./ShiftCard";
import { ShiftDetailsDialog } from "./ShiftDetailsDialog";

interface AvailableShiftsTabContentProps {
	workerType: CandidateWorkerType;
	shifts: CandidateShiftListItem[];
	pagination: {
		currentPage: number;
		pageCount: number;
		goToPage: (page: number) => void;
		limit: number;
		setLimit: (limit: number) => void;
	};
	onAction: (
		shiftId: string,
		action: "claim" | "mark-interest" | "submit-timecard",
	) => void;
	isActionLoading?: boolean;
}

export function AvailableShiftsTabContent({
	workerType,
	shifts,
	pagination,
	onAction,
	isActionLoading,
}: AvailableShiftsTabContentProps) {
	const [confirmShiftId, setConfirmShiftId] = useState<string | null>(null);
	const [selectedShift, setSelectedShift] =
		useState<CandidateShiftListItem | null>(null);
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);

	const handleAction = (
		shiftId: string,
		action: "claim" | "mark-interest" | "submit-timecard",
	) => {
		if (action === "mark-interest") {
			setConfirmShiftId(shiftId);
		} else {
			onAction(shiftId, action);
		}
	};

	const handleCardClick = (shift: CandidateShiftListItem) => {
		setSelectedShift(shift);
		setIsDetailsOpen(true);
	};

	const onConfirmInterest = () => {
		if (confirmShiftId) {
			onAction(confirmShiftId, "mark-interest");
			setConfirmShiftId(null);
		}
	};

	if (shifts.length === 0) {
		return (
			<Empty className="border py-12">
				<EmptyMedia variant="icon">
					<Layers />
				</EmptyMedia>
				<EmptyHeader>
					<EmptyTitle>No shifts available</EmptyTitle>
					<EmptyDescription>
						There are no open shifts matching your current filters.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	return (
		<div className="space-y-4">
			<CustomAlertDialog
				isOpen={!!confirmShiftId}
				onClose={() => setConfirmShiftId(null)}
				onConfirm={onConfirmInterest}
				title="Mark Interest"
				description="An interest request will be sent to your vendor. They will review your profile and notify you once they've responded."
				confirmText="Send Request"
				cancelText="Cancel"
				icon={<Info className="size-8 text-primary" />}
				iconContainerClassName="bg-primary/10"
				confirmButtonClassName="bg-primary hover:bg-primary/80 text-white"
			/>
			<ShiftDetailsDialog
				shift={selectedShift}
				isOpen={isDetailsOpen}
				onClose={() => {
					setIsDetailsOpen(false);
					setSelectedShift(null);
				}}
				workerType={workerType}
				onAction={handleAction}
				isActionLoading={isActionLoading}
			/>
			{shifts.map((shift) => (
				<ShiftCard
					key={shift.id}
					shift={shift}
					workerType={workerType}
					onAction={handleAction}
					onClick={handleCardClick}
					isActionLoading={isActionLoading}
				/>
			))}

			<PaginationControls {...pagination} />
		</div>
	);
}
