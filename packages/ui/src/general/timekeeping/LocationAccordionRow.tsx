"use client";

import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { ChevronDown, MapPin } from "lucide-react";
import { useState } from "react";
import { DepartmentAccordionRow } from "./DepartmentAccordionRow";
import type {
	DepartmentTimekeeping,
	LocationTimekeeping,
	TimeLog,
	WorkerTimekeeping,
} from "./types";

interface LocationAccordionRowProps {
	location: LocationTimekeeping;
	onApproveLog: (
		log: TimeLog,
		worker: WorkerTimekeeping,
		department: DepartmentTimekeeping,
		location: LocationTimekeeping,
	) => void;
	onDisputeLog: (
		log: TimeLog,
		worker: WorkerTimekeeping,
		department: DepartmentTimekeeping,
		location: LocationTimekeeping,
	) => void;
	defaultOpen?: boolean;
	approvalActionsEnabled?: boolean;
}

export function LocationAccordionRow({
	location,
	onApproveLog,
	onDisputeLog,
	defaultOpen = true,
	approvalActionsEnabled = true,
}: Readonly<LocationAccordionRowProps>) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<div className="border border-t-0 first:border-t first:rounded-t-lg last:rounded-b-lg">
			<Button
				type="button"
				variant="ghost"
				onClick={() => setIsOpen((prev) => !prev)}
				className={cn(
					"h-auto w-full justify-start rounded-lg px-4 py-3 text-left font-normal",
					isOpen && "border-border/50 rounded-b-none border-b",
				)}
			>
				<ChevronDown
					className={cn(
						"text-muted-foreground mr-2 size-4 shrink-0 transition-transform",
						!isOpen && "-rotate-90",
					)}
				/>
				<MapPin className="text-primary mr-1.5 size-4 shrink-0" />
				<span className="min-w-0 flex-1 text-sm font-semibold">
					{location.name}
				</span>
				<span className="text-muted-foreground ml-2 text-sm">
					({location.entryCount} entries, {location.totalHours} hours)
				</span>
			</Button>

			{isOpen && (
				<div>
					{location.departments.map((department) => (
						<DepartmentAccordionRow
							key={department.id}
							department={department}
							onApproveLog={(log, worker, dept) =>
								onApproveLog(log, worker, dept, location)
							}
							onDisputeLog={(log, worker, dept) =>
								onDisputeLog(log, worker, dept, location)
							}
							approvalActionsEnabled={approvalActionsEnabled}
						/>
					))}
				</div>
			)}
		</div>
	);
}
