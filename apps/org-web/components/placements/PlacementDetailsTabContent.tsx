"use client";

import { Calendar, Clock, DollarSign, MapPin, Users } from "lucide-react";
import type { PlacementDetailItem } from "@/types/placement";
import { PlacementDetailSection } from "./PlacementDetailSection";

interface PlacementDetailsTabContentProps {
	placement: PlacementDetailItem;
}

export function PlacementDetailsTabContent({
	placement,
}: PlacementDetailsTabContentProps) {
	return (
		<div className="space-y-8">
			<PlacementDetailSection
				icon={<Calendar className="text-primary size-4" />}
				title="Assignment Period"
				items={[
					{ label: "Start Date", value: placement.startDate },
					{ label: "End Date", value: placement.endDate },
					{ label: "Current Status", value: placement.currentStatus },
				]}
				gridCols={3}
				className="border-b pb-8"
			/>

			<PlacementDetailSection
				icon={<MapPin className="text-primary size-4" />}
				title="Location & Role"
				items={[
					{ label: "Location", value: placement.location },
					{ label: "Department / Unit", value: placement.departmentUnit },
					{ label: "Workforce Group", value: placement.workforceGroup },
				]}
				gridCols={3}
				className="border-b pb-8"
			/>

			<PlacementDetailSection
				icon={<Clock className="text-primary size-4" />}
				title="Schedule & Shift"
				items={[
					{ label: "Shift Type", value: placement.shiftType },
					{ label: "Shift Schedule", value: placement.shiftSchedule },
					{ label: "Hours Per Week", value: placement.hoursPerWeek },
				]}
				gridCols={3}
				className="border-b pb-8"
			/>

			<PlacementDetailSection
				icon={<DollarSign className="text-primary size-4" />}
				title="Rates & Compensation"
				items={[
					{ label: "Bill Rate", value: placement.billRate ?? "—" },
					{ label: "Pay Rate", value: placement.payRate ?? "—" },
					{
						label: "Overtime Eligible",
						value: placement.overtimeEligible ? "Yes" : "No",
					},
				]}
				gridCols={3}
				className="border-b pb-8"
			/>

			<PlacementDetailSection
				icon={<Users className="text-primary size-4" />}
				title="Vendor & Contacts"
				items={[
					{ label: "Vendor", value: placement.vendor ?? "—" },
					{
						label: "Vendor Contact",
						value: placement.vendorContact ?? "—",
					},
					{
						label: "Contact Info",
						value: placement.vendorContactInfo ? (
							<span className="whitespace-pre-line">
								{placement.vendorContactInfo}
							</span>
						) : (
							"—"
						),
					},
				]}
				gridCols={3}
			/>
		</div>
	);
}
