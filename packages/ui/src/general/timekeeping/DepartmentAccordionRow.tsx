"use client";

import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { Building2, ChevronRight } from "lucide-react";
import { useState } from "react";
import type {
	DepartmentTimekeeping,
	TimeLog,
	WorkerTimekeeping,
} from "./types";
import { WorkerAccordionRow } from "./WorkerAccordionRow";

interface DepartmentAccordionRowProps {
	department: DepartmentTimekeeping;
	onApproveLog: (
		log: TimeLog,
		worker: WorkerTimekeeping,
		department: DepartmentTimekeeping,
	) => void;
	onDisputeLog: (
		log: TimeLog,
		worker: WorkerTimekeeping,
		department: DepartmentTimekeeping,
	) => void;
	defaultOpen?: boolean;
	approvalActionsEnabled?: boolean;
}

export function DepartmentAccordionRow({
	department,
	onApproveLog,
	onDisputeLog,
	defaultOpen = false,
	approvalActionsEnabled = true,
}: Readonly<DepartmentAccordionRowProps>) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	const totalRegular = department.workers.reduce(
		(sum, w) => sum + w.regularHours,
		0,
	);
	const totalOT = department.workers.reduce(
		(sum, w) => sum + w.overtimeHours,
		0,
	);

	return (
		<div className="border-border/50 border-b last:border-b-0">
			<Button
				type="button"
				variant="ghost"
				onClick={() => setIsOpen((prev) => !prev)}
				className="h-auto w-full justify-start rounded-none py-3 px-4 text-left font-normal bg-muted/10"
			>
				<span className="w-6 shrink-0" />
				<ChevronRight
					className={cn(
						"text-muted-foreground mr-2 size-4 shrink-0 transition-transform",
						isOpen && "rotate-90",
					)}
				/>
				<Building2 className="text-muted-foreground mr-1.5 size-4 shrink-0" />
				<span className="min-w-0 flex-1 text-sm font-medium">
					{department.name}
				</span>
				<span className="text-muted-foreground ml-2 text-sm">
					({department.workerCount}{" "}
					{department.workerCount === 1 ? "worker" : "workers"},{" "}
					{department.totalHours} hours)
				</span>
			</Button>

			{isOpen && (
				<div className="bg-muted/5 border-border/30 border-t">
					{department.workers.map((worker) => (
						<WorkerAccordionRow
							key={worker.id}
							worker={worker}
							onApproveLog={(log, w) => onApproveLog(log, w, department)}
							onDisputeLog={(log, w) => onDisputeLog(log, w, department)}
							approvalActionsEnabled={approvalActionsEnabled}
						/>
					))}

					<div className="border-border/30 flex items-center justify-between border-t px-4 py-3">
						<div className="flex items-center gap-2">
							<span className="w-6 shrink-0" />
							<span className="text-muted-foreground text-sm font-semibold">
								Department Totals:
							</span>
						</div>
						<div className="text-muted-foreground flex gap-4 text-sm">
							<span>
								Regular:{" "}
								<span className="text-foreground font-medium">
									{totalRegular}h
								</span>
							</span>
							<span>
								OT:{" "}
								<span className="text-foreground font-medium">{totalOT}h</span>
							</span>
							<span>
								Total:{" "}
								<span className="text-foreground font-semibold">
									{department.totalHours}h
								</span>
							</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
