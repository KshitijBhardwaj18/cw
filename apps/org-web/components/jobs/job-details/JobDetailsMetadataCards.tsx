"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { DetailItem } from "@repo/ui/components/detail-item";
import { FileText } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

const cardSectionTitleClassName =
	"text-muted-foreground text-sm font-semibold tracking-wide uppercase";
const detailItemLabelClassName =
	"text-xs font-semibold uppercase tracking-wider text-muted-foreground";

function StackedCard({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<Card className="h-full">
			<CardHeader className="pb-0">
				<CardTitle className={cardSectionTitleClassName}>{title}</CardTitle>
			</CardHeader>
			<CardContent className="divide-y px-0 pb-0">{children}</CardContent>
		</Card>
	);
}

function StackedItem({
	children,
	isFirst = false,
}: {
	children: ReactNode;
	isFirst?: boolean;
}) {
	return (
		<div className={`px-6 ${isFirst ? "pt-2 pb-4" : "py-4"}`}>{children}</div>
	);
}

export interface JobDetailsMetadataCardsProps {
	templateId: string;
	templateName: string;
	occupation: string;
	department: string;
	location: string;
	hiringManager: string;
	startDate: string;
	endDate: string;
	billRate: string;
	shiftType: string;
	hoursPerWeek: string;
	schedule: string;
	visibility: string;
	submissionRule: string;
	postedOrPublishLabel: string;
}

export function JobDetailsMetadataCards({
	templateId,
	templateName,
	occupation,
	department,
	location,
	hiringManager,
	startDate,
	endDate,
	billRate,
	shiftType,
	hoursPerWeek,
	schedule,
	visibility,
	submissionRule,
	postedOrPublishLabel,
}: JobDetailsMetadataCardsProps) {
	const templateIdTrim = templateId?.trim() ?? "";
	const templateHref = `/org/requisition-templates/${templateIdTrim}`;

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle className={cardSectionTitleClassName}>
						Requisition template
					</CardTitle>
				</CardHeader>
				<CardContent>
					{templateIdTrim ? (
						<Link
							href={templateHref}
							className="text-primary inline-flex items-start gap-2 text-sm font-medium hover:underline"
						>
							<FileText className="text-primary mt-0.5 size-4 shrink-0" />
							<span>{templateName || "View template"}</span>
						</Link>
					) : (
						<div className="text-muted-foreground inline-flex items-start gap-2 text-sm">
							<FileText className="mt-0.5 size-4 shrink-0" />
							<span>No requisition template linked</span>
						</div>
					)}
					<p className="text-muted-foreground mt-2 text-xs">
						Compliance settings source
					</p>
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				<StackedCard title="Job information">
					<StackedItem isFirst>
						<DetailItem
							label="Occupation"
							value={occupation}
							labelClassName={detailItemLabelClassName}
						/>
					</StackedItem>
					<StackedItem>
						<DetailItem
							label="Department"
							value={department}
							labelClassName={detailItemLabelClassName}
						/>
					</StackedItem>
					<StackedItem>
						<DetailItem
							label="Location"
							value={location}
							labelClassName={detailItemLabelClassName}
						/>
					</StackedItem>
					<StackedItem>
						<DetailItem
							label="Hiring leader"
							value={hiringManager}
							labelClassName={detailItemLabelClassName}
						/>
					</StackedItem>
				</StackedCard>

				<StackedCard title="Employment details">
					<StackedItem isFirst>
						<DetailItem
							label="Start date"
							value={startDate}
							labelClassName={detailItemLabelClassName}
						/>
					</StackedItem>
					<StackedItem>
						<DetailItem
							label="End date"
							value={endDate}
							labelClassName={detailItemLabelClassName}
						/>
					</StackedItem>
					<StackedItem>
						<DetailItem
							label="Bill rate"
							value={billRate}
							labelClassName={detailItemLabelClassName}
						/>
					</StackedItem>
					<StackedItem>
						<DetailItem
							label="Shift type"
							value={shiftType}
							labelClassName={detailItemLabelClassName}
						/>
					</StackedItem>
					<StackedItem>
						<DetailItem
							label="Hours per week"
							value={hoursPerWeek}
							labelClassName={detailItemLabelClassName}
						/>
					</StackedItem>
					<StackedItem>
						<DetailItem
							label="Schedule"
							value={schedule}
							labelClassName={detailItemLabelClassName}
						/>
					</StackedItem>
				</StackedCard>

				<StackedCard title="Publishing settings">
					<StackedItem isFirst>
						<DetailItem
							label="Visibility"
							value={visibility}
							labelClassName={detailItemLabelClassName}
						/>
					</StackedItem>
					<StackedItem>
						<DetailItem
							label="Submission rule"
							value={submissionRule}
							labelClassName={detailItemLabelClassName}
						/>
					</StackedItem>
					<StackedItem>
						<DetailItem
							label="Posted date"
							value={postedOrPublishLabel}
							labelClassName={detailItemLabelClassName}
						/>
					</StackedItem>
				</StackedCard>
			</div>
		</div>
	);
}
