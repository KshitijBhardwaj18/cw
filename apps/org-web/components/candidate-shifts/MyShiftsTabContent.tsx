"use client";

import { ConfigPageEmptyState } from "@repo/ui/general/ConfigPageEmptyState";
import PaginationControls from "@repo/ui/general/PaginationControls";
import { Clock } from "lucide-react";
import { useState } from "react";
import type {
	CandidateShiftListItem,
	CandidateWorkerType,
} from "@/types/candidate-shifts";
import { ShiftCard } from "./ShiftCard";
import { ShiftDetailsDialog } from "./ShiftDetailsDialog";
import { SubmitTimecardDialog } from "./SubmitTimecardDialog";

interface MyShiftsTabContentProps {
	workerType: CandidateWorkerType;
	shifts: CandidateShiftListItem[];
	pagination: {
		currentPage: number;
		pageCount: number;
		goToPage: (page: number) => void;
		limit: number;
		setLimit: (limit: number) => void;
	};
}

export function MyShiftsTabContent({
	workerType,
	shifts,
	pagination,
}: MyShiftsTabContentProps) {
	const [isTimecardOpen, setIsTimecardOpen] = useState(false);
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);
	const [selectedShift, setSelectedShift] =
		useState<CandidateShiftListItem | null>(null);

	const handleAction = (
		shiftId: string,
		action: "claim" | "mark-interest" | "submit-timecard",
	) => {
		if (action === "submit-timecard") {
			const shift = shifts.find((s) => s.id === shiftId);
			if (shift) {
				setSelectedShift(shift);
				setIsTimecardOpen(true);
			}
		}
	};

	const handleCardClick = (shift: CandidateShiftListItem) => {
		setSelectedShift(shift);
		setIsDetailsOpen(true);
	};

	if (shifts.length === 0) {
		return (
			<ConfigPageEmptyState
				className="py-12"
				hasSearch={false}
				emptyTitle="No active shifts"
				emptyMessage={
					workerType === "internal"
						? "Claim shifts from the Available Shifts tab."
						: "Mark interest in shifts from the Available Shifts tab and wait for vendor approval."
				}
				icon={Clock}
			/>
		);
	}

	return (
		<div className="space-y-4">
			<SubmitTimecardDialog
				key={selectedShift?.id ?? "none"}
				isOpen={isTimecardOpen}
				onClose={(open) => {
					if (!open) {
						setIsTimecardOpen(false);
						setSelectedShift(null);
					}
				}}
				shift={selectedShift}
			/>
			<ShiftDetailsDialog
				shift={selectedShift}
				isOpen={isDetailsOpen}
				onClose={() => {
					setIsDetailsOpen(false);
					setSelectedShift(null);
				}}
				workerType={workerType}
			/>
			{shifts.map((shift) => (
				<ShiftCard
					key={shift.id}
					shift={shift}
					workerType={workerType}
					onAction={handleAction}
					onClick={handleCardClick}
				/>
			))}

			<PaginationControls {...pagination} />
		</div>
	);
}
