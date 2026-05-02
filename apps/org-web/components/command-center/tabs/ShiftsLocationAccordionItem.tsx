import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@repo/ui/components/accordion";
import { Badge } from "@repo/ui/components/badge";
import { MapPin } from "lucide-react";
import { ShiftCard } from "@/components/shifts/ShiftCard";
import type { Shift } from "@/constants/shifts";

type ShiftsLocationAccordionItemProps = {
	locationId: string;
	locationName: string;
	shifts: Shift[];
	onViewDetails: (shift: Shift) => void;
	onCancelShift: (shift: Shift) => void;
};

export const ShiftsLocationAccordionItem = ({
	locationId,
	locationName,
	shifts,
	onViewDetails,
	onCancelShift,
}: ShiftsLocationAccordionItemProps) => {
	const filledCount = shifts.filter((shift) => shift.claimedBy != null).length;
	const openCount = shifts.filter((shift) => shift.status === "OPEN").length;
	const inProgressCount = shifts.filter(
		(shift) => shift.status === "IN_PROGRESS",
	).length;
	const needsAttention = openCount > 0;

	return (
		<AccordionItem
			value={locationId}
			className="rounded-md border px-4 py-1 last:border-b"
		>
			<AccordionTrigger className="hover:no-underline">
				<div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
					<div>
						<p className="flex items-center gap-2 text-sm font-semibold">
							<MapPin className="text-muted-foreground size-4" />
							{locationName}
						</p>
						<p className="text-muted-foreground text-xs">
							{shifts.length} shifts over next 3 days
						</p>
					</div>

					<div className="flex items-center gap-5 pr-2 text-xs">
						<div className="text-center">
							<p className="text-3xl leading-none font-semibold text-green-700">
								{filledCount}
							</p>
							<p className="text-green-700">Filled</p>
						</div>
						<div className="text-center">
							<p className="text-3xl leading-none font-semibold text-red-600">
								{openCount}
							</p>
							<p className="text-red-600">Open</p>
						</div>
						<div className="text-center">
							<p className="text-3xl leading-none font-semibold text-amber-700">
								{inProgressCount}
							</p>
							<p className="text-amber-700">In Progress</p>
						</div>
						{needsAttention ? (
							<Badge variant="error">Needs Attention</Badge>
						) : (
							<Badge variant="success">Healthy</Badge>
						)}
					</div>
				</div>
			</AccordionTrigger>
			<AccordionContent className="space-y-2">
				{shifts.map((shift) => (
					<ShiftCard
						key={shift.id}
						shift={shift}
						onViewDetails={onViewDetails}
						onCancelShift={onCancelShift}
						showActionsMenu={false}
						showBottomDetails={false}
					/>
				))}
			</AccordionContent>
		</AccordionItem>
	);
};
