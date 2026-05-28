"use client";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import { ChevronRight, Shield } from "lucide-react";
import type {
	CredentialComplianceCategory,
	CredentialComplianceItem,
} from "@/types/credential-entry-details";
import { CredentialComplianceItemCard } from "./CredentialComplianceItemCard";

interface CredentialComplianceCategorySectionProps {
	category: CredentialComplianceCategory;
	canEdit: boolean;
	onStatusChange: (
		item: CredentialComplianceItem,
		status: CredentialComplianceItem["status"],
	) => void;
	onUploadDocument: (item: CredentialComplianceItem) => void;
}

export function CredentialComplianceCategorySection({
	category,
	canEdit,
	onStatusChange,
	onUploadDocument,
}: Readonly<CredentialComplianceCategorySectionProps>) {
	const completedCount = category.items.filter(
		(item) => item.status === "APPROVED",
	).length;

	return (
		<Collapsible defaultOpen>
			<div className="rounded-lg border bg-card">
				<CollapsibleTrigger className="group flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50">
					<ChevronRight className="size-4 shrink-0 transition-transform group-data-[state=open]:rotate-90" />
					<Shield className="text-primary size-4 shrink-0" />
					<span className="flex-1 text-sm font-medium">{category.name}</span>
					<span className="text-muted-foreground text-xs">
						Completed {completedCount} / Total {category.items.length}
					</span>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<div className="divide-y border-t">
						{category.items.map((item) => (
							<CredentialComplianceItemCard
								key={item.id}
								item={item}
								canEdit={canEdit}
								onStatusChange={onStatusChange}
								onUploadDocument={onUploadDocument}
							/>
						))}
					</div>
				</CollapsibleContent>
			</div>
		</Collapsible>
	);
}
