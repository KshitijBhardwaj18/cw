"use client";

import { Action, useAbility } from "@repo/casl";
import { getComplianceListItemCategoryLabel } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
} from "@repo/ui/components/empty";
import { Progress } from "@repo/ui/components/progress";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
	ArrowLeft,
	BriefcaseBusiness,
	CalendarDays,
	CircleAlert,
	CircleCheck,
	Clock3,
	MapPin,
	TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ComplianceRejectDialog } from "@/components/document-wallet/ComplianceRejectDialog";
import { useCredentialEntryDetails } from "@/hooks/use-credential-entry-details";
import type {
	CredentialComplianceItem,
	CredentialEntryDetailType,
} from "@/types/credential-entry-details";
import { CredentialComplianceActionDialog } from "./details/CredentialComplianceActionDialog";
import { CredentialComplianceCategorySection } from "./details/CredentialComplianceCategorySection";

type CredentialEntryDetailsPageContentProps = {
	entryType: CredentialEntryDetailType;
	entryId: string;
};

type ActionDialogState = {
	open: boolean;
	item: CredentialComplianceItem | null;
};

export function CredentialEntryDetailsPageContent({
	entryType,
	entryId,
}: Readonly<CredentialEntryDetailsPageContentProps>) {
	const {
		record,
		isLoading,
		isUploading,
		itemsRequired,
		updateStatus,
		uploadDocument,
	} = useCredentialEntryDetails({
		entryType,
		entryId,
	});
	const ability = useAbility();
	const canEditCredentials = ability.can(Action.Update, "Credentials");
	const [actionDialog, setActionDialog] = useState<ActionDialogState>({
		open: false,
		item: null,
	});
	const [rejectItem, setRejectItem] = useState<CredentialComplianceItem | null>(
		null,
	);

	const handleStatusChange = (
		item: CredentialComplianceItem,
		status: CredentialComplianceItem["status"],
	) => {
		if (status === "REJECTED") {
			setRejectItem(item);
			return;
		}
		updateStatus({ itemId: item.id, status });
	};

	const handleRejectConfirm = (reason: string) => {
		if (!rejectItem) return;
		updateStatus({ itemId: rejectItem.id, status: "REJECTED", notes: reason });
		setRejectItem(null);
	};

	const searchParams = useSearchParams();
	const highlightComplianceItemId = searchParams.get("item");

	useEffect(() => {
		if (!highlightComplianceItemId || !record) return;
		const el = document.getElementById(
			`compliance-item-${highlightComplianceItemId}`,
		);
		el?.scrollIntoView({ behavior: "smooth", block: "start" });
	}, [highlightComplianceItemId, record]);

	const backHref =
		entryType === "upcoming-placement"
			? "/org/credentials?tab=upcoming-placements"
			: "/org/credentials";
	const backLabel =
		entryType === "upcoming-placement"
			? "Back to Upcoming Placements"
			: "Back to Credentials";

	const openUploadDialog = (item: CredentialComplianceItem) => {
		setActionDialog({ open: true, item });
	};

	const closeActionDialog = () => {
		setActionDialog((current) => ({ ...current, open: false }));
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-4 w-40" />
				<Skeleton className="h-6 w-64" />
				<Skeleton className="h-48 w-full rounded-xl" />
				<Skeleton className="h-48 w-full rounded-xl" />
			</div>
		);
	}

	if (!record) {
		return (
			<div className="space-y-6">
				<Link
					href={backHref}
					className="flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
				>
					<ArrowLeft className="size-4" data-icon="inline-start" />
					{backLabel}
				</Link>

				<Card>
					<CardContent className="p-8">
						<p className="text-muted-foreground text-sm">Details not found.</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<Link
				href={record.backHref}
				className="flex items-center gap-2 text-xs font-medium text-primary underline-offset-4 hover:underline"
			>
				<ArrowLeft className="size-4" data-icon="inline-start" />
				{record.backLabel}
			</Link>

			<div>
				<h1 className="text-xl font-semibold">{record.title}</h1>
				<p className="text-muted-foreground mt-1 text-sm">{record.subtitle}</p>
			</div>

			<Card>
				<CardContent className="space-y-6 p-6">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
						<div className="flex min-w-0 items-center gap-4">
							<div className="bg-primary/90 flex size-12 items-center justify-center rounded-full text-sm font-semibold text-white">
								{record.name
									.trim()
									.split(/\s+/)
									.map((part) => part[0])
									.filter(Boolean)
									.join("")
									.slice(0, 2)
									.toUpperCase()}
							</div>
							<div>
								<h2 className="text-lg font-semibold">{record.name}</h2>
								<p className="text-muted-foreground mt-0.5 text-sm">
									{record.role}
								</p>
							</div>
						</div>

						<Badge
							variant="success"
							className="w-fit shrink-0 px-3 py-1 sm:self-center"
						>
							<CircleCheck className="mr-2 size-4" />
							{record.summary.percentComplete}% Complete
						</Badge>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<p className="text-muted-foreground flex items-center gap-2 text-xs">
								<BriefcaseBusiness className="size-4" />
								Job / Requisition
							</p>
							<p className="text-sm font-medium">
								{record.placementContext.jobOrRequisition}
							</p>
						</div>

						<div>
							<p className="text-muted-foreground flex items-center gap-2 text-xs">
								<MapPin className="size-4" />
								Location
							</p>
							<p className="text-sm font-medium">
								{record.placementContext.location}
							</p>
						</div>

						<div>
							<p className="text-muted-foreground flex items-center gap-2 text-xs">
								<CalendarDays className="size-4" />
								{record.placementContext.dateLabel}
							</p>
							<p className="text-sm font-medium">
								{record.placementContext.dateValue}
							</p>
						</div>

						<div>
							<p className="text-muted-foreground flex items-center gap-2 text-xs">
								<Clock3 className="size-4" />
								Placement Status
							</p>
							<p className="text-sm font-medium">
								{record.placementContext.statusLabel}
							</p>
						</div>

						<div>
							<p className="text-muted-foreground text-xs">Department</p>
							<p className="text-sm font-medium">
								{record.placementContext.department ?? "—"}
							</p>
						</div>

						<div>
							<p className="text-muted-foreground text-xs">Vendor</p>
							<p className="text-sm font-medium">
								{record.placementContext.vendor ?? "—"}
							</p>
						</div>

						<div>
							<p className="text-muted-foreground text-xs">Hiring Manager</p>
							<p className="text-sm font-medium">
								{record.placementContext.hiringManager ?? "—"}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg font-semibold">
						Compliance Progress
					</CardTitle>
					<CardDescription className="text-sm">
						Track completion, missing, and expired compliance items.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<p className="text-muted-foreground text-xs">Overall Completion</p>
						<p className="text-primary text-sm font-semibold">
							{record.summary.percentComplete}%
						</p>
					</div>
					<Progress value={record.summary.percentComplete} className="h-2.5" />

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
						<div className="bg-muted/50 rounded-lg px-4 py-3 text-center">
							<p className="text-xl font-bold">{record.summary.totalItems}</p>
							<p className="text-muted-foreground text-xs">Total Items</p>
						</div>
						<div className="rounded-lg bg-green-50 px-4 py-3 text-center text-green-700">
							<p className="text-xl font-bold">
								{record.summary.completedItems}
							</p>
							<p className="text-xs">Completed</p>
						</div>
						<div className="rounded-lg bg-sky-50 px-4 py-3 text-center text-sky-800">
							<p className="text-xl font-bold">
								{record.summary.pendingReviewCount}
							</p>
							<p className="text-xs">Pending review</p>
						</div>
						<div className="rounded-lg bg-red-50 px-4 py-3 text-center text-red-700">
							<p className="text-xl font-bold">
								{record.summary.missingItemsCount}
							</p>
							<p className="text-xs">Missing</p>
						</div>
						<div className="rounded-lg bg-red-50 px-4 py-3 text-center text-red-700">
							<p className="text-xl font-bold">
								{record.summary.expiredItemsCount}
							</p>
							<p className="text-xs">Expired</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{itemsRequired.length > 0 && (
				<Card className="border-red-200 bg-red-50/40">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base font-semibold text-red-800">
							<CircleAlert className="size-5" />
							Items Required Before Start Date
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{itemsRequired.map((required, index) => (
							<div
								key={`${required.name}-${index}`}
								className="flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-white p-4"
							>
								<div>
									<p className="flex items-center gap-2 text-sm font-medium text-red-900">
										<TriangleAlert className="size-4 text-red-600" />
										{required.name}
									</p>
									<p className="text-muted-foreground mt-1 text-xs">
										Category:{" "}
										{getComplianceListItemCategoryLabel(required.category)}
									</p>
								</div>
								<div className="text-right">
									<p className="text-muted-foreground text-xs">Required by</p>
									<p className="text-sm font-semibold text-red-700">
										{required.requiredBy}
									</p>
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader>
					<CardTitle className="text-lg font-semibold">
						Compliance Items by Category
					</CardTitle>
					<CardDescription className="text-sm">
						Manage item status and document uploads for placement readiness.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{!record.complianceCategories?.length && (
						<Empty className="p-8">
							<EmptyHeader>
								<EmptyDescription>
									No compliance categories found for this entry.
								</EmptyDescription>
							</EmptyHeader>
						</Empty>
					)}
					{record.complianceCategories.map((category) => (
						<CredentialComplianceCategorySection
							key={category.name}
							category={category}
							canEdit={canEditCredentials}
							onStatusChange={handleStatusChange}
							onUploadDocument={openUploadDialog}
						/>
					))}
				</CardContent>
			</Card>

			<CredentialComplianceActionDialog
				open={actionDialog.open}
				item={actionDialog.item}
				isUploading={isUploading}
				onOpenChange={(open) => {
					if (!open) {
						closeActionDialog();
					}
				}}
				onSubmitUpload={uploadDocument}
			/>

			<ComplianceRejectDialog
				open={!!rejectItem}
				onOpenChange={(o) => !o && setRejectItem(null)}
				itemName={rejectItem?.name ?? null}
				onConfirm={handleRejectConfirm}
			/>
		</div>
	);
}
