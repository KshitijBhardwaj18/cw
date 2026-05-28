"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@repo/ui/components/tabs";
import { PageBackLink } from "@repo/ui/general/PageBackLink";
import { ScrollableLineTabsRow } from "@repo/ui/general/ScrollableLineTabsRow";
import { useTabSwitch } from "@repo/ui/hooks/use-tab-switch";
import { FileText, Shield, StickyNote, User } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { PLACEMENT_STATUS_VARIANTS } from "@/constants/placement-status";
import {
	usePlacementDetailSuspense,
	usePlacementNotes,
	usePlacementTasks,
} from "@/queries/placements.queries";
import type { PlacementStatus } from "@/types/placement";
import { PlacementComplianceTabContent } from "./PlacementComplianceTabContent";
import { PlacementDetailSection } from "./PlacementDetailSection";
import { PlacementDetailsTabContent } from "./PlacementDetailsTabContent";
import { PlacementNotesTasksTabContent } from "./PlacementNotesTasksTabContent";
import { PlacementOfferHistoryTabContent } from "./PlacementOfferHistoryTabContent";

function getStatusConfig(status: PlacementStatus) {
	return PLACEMENT_STATUS_VARIANTS[status] ?? PLACEMENT_STATUS_VARIANTS.PENDING;
}

interface PlacementDetailsPageContentProps {
	placementId: string;
	backLinkHref: string;
	complianceMode?: "org" | "vendor";
}

export function PlacementDetailsPageContent({
	placementId,
	backLinkHref,
	complianceMode = "org",
}: Readonly<PlacementDetailsPageContentProps>) {
	const { data: placement } = usePlacementDetailSuspense(placementId);
	const { data: notesForTabBadge = [] } = usePlacementNotes(placementId);
	const { data: tasksForTabBadge = [] } = usePlacementTasks(placementId);

	const [tab, setTab] = useTabSwitch([
		"placement-details",
		"compliance",
		"offer-history",
		"notes-tasks",
	]);

	const notesTasksBadgeCount =
		notesForTabBadge.length +
		tasksForTabBadge.filter((t) => t.status === "pending").length;

	if (!placement) {
		return (
			<Empty className="border py-16">
				<EmptyMedia variant="icon">
					<FileText />
				</EmptyMedia>
				<EmptyHeader>
					<EmptyTitle>Placement not found</EmptyTitle>
					<EmptyDescription>
						The placement you&apos;re looking for doesn&apos;t exist or has been
						removed.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button asChild variant="outline">
						<Link href={backLinkHref}>Back to Placements</Link>
					</Button>
				</EmptyContent>
			</Empty>
		);
	}

	const statusConfig = getStatusConfig(placement.status);

	return (
		<div className="space-y-6">
			<PageBackLink href={backLinkHref}>Back to Placements</PageBackLink>

			<Card>
				<CardHeader>
					<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:gap-3">
						<div className="min-w-0">
							<CardTitle className="text-xl sm:text-2xl">
								Placement Details
							</CardTitle>
							<CardDescription className="mt-1 wrap-break-word">
								{placement.statusSubtext}
							</CardDescription>
						</div>
						<Badge
							variant="secondary"
							className={`w-fit shrink-0 self-start text-xs font-medium ${statusConfig.className}`}
						>
							{statusConfig.label}
						</Badge>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
						<PlacementDetailSection
							icon={<User className="text-primary size-4" />}
							title="Candidate Information"
							items={[
								{ label: "Candidate Name", value: placement.candidateName },
								{ label: "Email", value: placement.candidateEmail },
								{ label: "Phone", value: placement.candidatePhone },
								{ label: "Occupation", value: placement.occupation },
								{ label: "Specialty", value: placement.specialty },
								{
									label: "License Number",
									value: placement.licenseNumber ?? "—",
								},
							]}
						/>
						<PlacementDetailSection
							icon={<FileText className="text-primary size-4" />}
							title="Job / Requisition Details"
							items={[
								{ label: "Job Title", value: placement.jobTitle },
								{ label: "Requisition", value: placement.requisition },
								{ label: "Location", value: placement.location },
								{ label: "Department", value: placement.department },
								{ label: "Hiring Manager", value: placement.hiringManager },
								{ label: "Vendor", value: placement.vendor ?? "—" },
							]}
						/>
					</div>
				</CardContent>
			</Card>

			<Tabs
				value={tab}
				onValueChange={setTab}
				className="w-full flex-col space-y-6"
			>
				<ScrollableLineTabsRow>
					<TabsList
						variant="line"
						className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-0 rounded-none border-0 bg-transparent p-0"
					>
						<TabsTrigger
							value="placement-details"
							className="flex flex-none items-center gap-1.5 rounded-none border-0 px-2 py-3 text-sm sm:gap-2 sm:px-4"
						>
							<FileText className="size-4" />
							Placement Details
						</TabsTrigger>
						<TabsTrigger
							value="compliance"
							className="flex flex-none items-center gap-1.5 rounded-none border-0 px-2 py-3 text-sm sm:gap-2 sm:px-4"
						>
							<Shield className="size-4" />
							Compliance
						</TabsTrigger>
						<TabsTrigger
							value="offer-history"
							className="flex flex-none items-center gap-1.5 rounded-none border-0 px-2 py-3 text-sm sm:gap-2 sm:px-4"
						>
							<FileText className="size-4" />
							Offer History
						</TabsTrigger>
						<TabsTrigger
							value="notes-tasks"
							className="flex flex-none items-center gap-1.5 rounded-none border-0 px-2 py-3 text-sm sm:gap-2 sm:px-4"
						>
							<StickyNote className="size-4" />
							Notes & Tasks
							{notesTasksBadgeCount > 0 ? (
								<Badge
									variant="secondary"
									className="ml-0.5 min-w-6 px-1.5 py-0 text-xs tabular-nums"
								>
									{notesTasksBadgeCount > 99 ? "99+" : notesTasksBadgeCount}
								</Badge>
							) : null}
						</TabsTrigger>
					</TabsList>
				</ScrollableLineTabsRow>

				<TabsContent value="placement-details" className="mt-6">
					<PlacementDetailsTabContent placement={placement} />
				</TabsContent>
				<TabsContent value="compliance" className="mt-6">
					<PlacementComplianceTabContent
						placementId={placementId}
						mode={complianceMode}
					/>
				</TabsContent>
				<TabsContent value="offer-history" className="mt-6">
					<Suspense
						fallback={
							<div className="space-y-6">
								<Skeleton className="h-7 w-56" />
								<Skeleton className="h-32 w-full rounded-lg" />
								<div className="space-y-4">
									{Array.from({ length: 3 }).map((_, i) => (
										<Skeleton key={i} className="h-24 w-full rounded-lg" />
									))}
								</div>
							</div>
						}
					>
						<PlacementOfferHistoryTabContent placementId={placementId} />
					</Suspense>
				</TabsContent>
				<TabsContent value="notes-tasks" className="mt-6">
					<PlacementNotesTasksTabContent placementId={placementId} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
