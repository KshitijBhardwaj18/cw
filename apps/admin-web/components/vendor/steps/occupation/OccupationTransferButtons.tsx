"use client";

import { Button } from "@repo/ui/components/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface OccupationTransferButtonsProps {
	onMoveToSelected: () => void;
	onMoveToAvailable: () => void;
	canMoveToSelected: boolean;
	canMoveToAvailable: boolean;
}

export function OccupationTransferButtons({
	onMoveToSelected,
	onMoveToAvailable,
	canMoveToSelected,
	canMoveToAvailable,
}: Readonly<OccupationTransferButtonsProps>) {
	return (
		<div className="flex flex-col items-center justify-center gap-2 pt-16">
			<Button
				type="button"
				variant="outline"
				size="icon"
				onClick={onMoveToSelected}
				disabled={!canMoveToSelected}
				aria-label="Move to selected"
			>
				<ChevronRight className="size-4" />
			</Button>
			<Button
				type="button"
				variant="outline"
				size="icon"
				onClick={onMoveToAvailable}
				disabled={!canMoveToAvailable}
				aria-label="Move to available"
			>
				<ChevronLeft className="size-4" />
			</Button>
		</div>
	);
}
