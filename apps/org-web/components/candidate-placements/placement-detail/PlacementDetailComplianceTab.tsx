"use client";

import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { Skeleton } from "@repo/ui/components/skeleton";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { ComplianceCategorySection } from "@/components/placements/ComplianceCategorySection";
import { ComplianceStatusCard } from "@/components/placements/ComplianceStatusCard";
import { useCandidatePlacementCompliance } from "@/queries/candidate-placements.queries";
export function PlacementDetailComplianceTab({
	placementId,
}: {
	placementId: string;
}) {
	const [expandedAuditItemId, setExpandedAuditItemId] = useState<string | null>(
		null,
	);
	const { data, isPending, isError, error } = useCandidatePlacementCompliance(
		placementId,
		true,
	);

	const toggleAudit = (id: string) => {
		setExpandedAuditItemId((prev) => (prev === id ? null : id));
	};

	const noopRemove = (_itemId: string) => {};

	if (isPending) {
		return (
			<div className="space-y-6">
				<div className="grid gap-4 sm:grid-cols-3">
					<Skeleton className="h-24 rounded-lg" />
					<Skeleton className="h-24 rounded-lg" />
					<Skeleton className="h-24 rounded-lg" />
				</div>
				<Skeleton className="h-48 rounded-lg" />
			</div>
		);
	}

	if (isError) {
		return (
			<Empty className="border py-12">
				<EmptyMedia variant="icon">
					<AlertCircle />
				</EmptyMedia>
				<EmptyHeader>
					<EmptyTitle>Failed to load compliance</EmptyTitle>
					<EmptyDescription>
						{error instanceof Error
							? error.message
							: "An error occurred. Please try again."}
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	if (!data) {
		return null;
	}

	const { summary, categories } = data;
	const { complete, missing, expired, total } = summary;

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Compliance</h2>
				<p className="text-muted-foreground mt-1 text-sm">
					{complete} complete, {missing} missing, {expired} expired ({total}{" "}
					total)
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-3">
				<ComplianceStatusCard variant="complete" count={complete} />
				<ComplianceStatusCard variant="missing" count={missing} />
				<ComplianceStatusCard variant="expired" count={expired} />
			</div>

			<div className="space-y-4">
				{categories.map((category) => (
					<ComplianceCategorySection
						key={category.categoryKey}
						category={category}
						expandedAuditItemId={expandedAuditItemId}
						mode="org"
						onRemoveItem={noopRemove}
						onToggleAudit={toggleAudit}
					/>
				))}
			</div>
		</div>
	);
}
