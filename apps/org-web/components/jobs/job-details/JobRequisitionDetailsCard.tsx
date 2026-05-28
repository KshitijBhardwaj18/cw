"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { DetailItem } from "@repo/ui/components/detail-item";
import type { ReactNode } from "react";

const detailItemLabelClassName =
	"text-xs font-semibold uppercase tracking-wider text-muted-foreground";

function DetailBlock({
	children,
	className = "",
}: Readonly<{
	children: ReactNode;
	className?: string;
}>) {
	return (
		<div
			className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 ${className}`}
		>
			{children}
		</div>
	);
}

export interface JobRequisitionDetailsCardProps {
	location: string;
	department: string;
	occupation: string;
	specialty: string;
	billRate: string;
	vendorRate: string;
	startDate: string;
	endDate: string;
	shiftType: string;
	shiftHours: string;
	hoursPerWeek: string;
	schedule: string;
	interviewRequired: string;
}

export function JobRequisitionDetailsCard({
	location,
	department,
	occupation,
	specialty,
	billRate,
	vendorRate,
	startDate,
	endDate,
	shiftType,
	shiftHours,
	hoursPerWeek,
	schedule,
	interviewRequired,
}: Readonly<JobRequisitionDetailsCardProps>) {
	return (
		<Card>
			<CardHeader className="border-b">
				<CardTitle className="text-xl">Requisition details</CardTitle>
			</CardHeader>
			<CardContent className="space-y-0 divide-y px-0 pb-0">
				<div className="px-6 pt-0 pb-4">
					<DetailBlock>
						<DetailItem
							label="Location"
							value={location}
							labelClassName={detailItemLabelClassName}
						/>
						<DetailItem
							label="Department"
							value={department}
							labelClassName={detailItemLabelClassName}
						/>
						<DetailItem
							label="Occupation"
							value={occupation}
							labelClassName={detailItemLabelClassName}
						/>
						<DetailItem
							label="Specialty"
							value={specialty}
							labelClassName={detailItemLabelClassName}
						/>
						<DetailItem
							label="Bill rate"
							value={billRate}
							labelClassName={detailItemLabelClassName}
						/>
						<DetailItem
							label="Vendor rate"
							value={vendorRate}
							labelClassName={detailItemLabelClassName}
						/>
					</DetailBlock>
				</div>
				<div className="px-6 py-4">
					<DetailBlock>
						<DetailItem
							label="Start date"
							value={startDate}
							labelClassName={detailItemLabelClassName}
						/>
						<DetailItem
							label="End date"
							value={endDate}
							labelClassName={detailItemLabelClassName}
						/>
						<DetailItem
							label="Shift type"
							value={shiftType}
							labelClassName={detailItemLabelClassName}
						/>
						<DetailItem
							label="Shift hours"
							value={shiftHours}
							labelClassName={detailItemLabelClassName}
						/>
						<DetailItem
							label="Hours per week"
							value={hoursPerWeek}
							labelClassName={detailItemLabelClassName}
						/>
						<DetailItem
							label="Schedule"
							value={schedule}
							labelClassName={detailItemLabelClassName}
						/>
					</DetailBlock>
				</div>
				<div className="px-6 py-4">
					<DetailItem
						label="Interview required"
						value={interviewRequired}
						labelClassName={detailItemLabelClassName}
					/>
				</div>
			</CardContent>
		</Card>
	);
}
