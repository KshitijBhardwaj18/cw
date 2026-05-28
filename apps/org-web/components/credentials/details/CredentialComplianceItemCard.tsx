"use client";

import {
	formatTzApiDate,
	getCandidateComplianceStatusLabel,
	getCandidateComplianceStatusVariant,
} from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import {
	getCandidateComplianceStatusIcon,
	getCandidateComplianceStatusIconColor,
} from "@repo/ui/lib/compliance-status-icon";
import { Upload } from "lucide-react";
import { CREDENTIAL_COMPLIANCE_STATUS_OPTIONS } from "@/hooks/use-credential-entry-details";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import type { CredentialComplianceItem } from "@/types/credential-entry-details";

interface CredentialComplianceItemCardProps {
	item: CredentialComplianceItem;
	canEdit: boolean;
	onStatusChange: (
		item: CredentialComplianceItem,
		status: CredentialComplianceItem["status"],
	) => void;
	onUploadDocument: (item: CredentialComplianceItem) => void;
}

export function CredentialComplianceItemCard({
	item,
	canEdit,
	onStatusChange,
	onUploadDocument,
}: Readonly<CredentialComplianceItemCardProps>) {
	const { tz } = useUserTimezone();
	const StatusIcon = getCandidateComplianceStatusIcon(item.status);
	const iconColor = getCandidateComplianceStatusIconColor(item.status);
	const dateBits: string[] = [];
	if (item.issueDate) {
		dateBits.push(`Issued: ${formatTzApiDate(item.issueDate, tz)}`);
	}
	if (item.expirationDate) {
		dateBits.push(`Expires: ${formatTzApiDate(item.expirationDate, tz)}`);
	}
	const secondaryLine = dateBits.length
		? `${item.sourceLabel ?? "Placement-specific"} • ${dateBits.join(" • ")}`
		: (item.sourceLabel ?? "Placement-specific");

	return (
		<div
			id={`compliance-item-${item.id}`}
			className="rounded-xl bg-muted/20 px-4 py-4"
		>
			<div className="flex items-start gap-3">
				<StatusIcon className={`mt-0.5 size-4 shrink-0 ${iconColor}`} />
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-3">
						<p className="truncate text-sm font-medium">{item.name}</p>
						<Badge
							variant={getCandidateComplianceStatusVariant(item.status)}
							className="px-3"
						>
							{getCandidateComplianceStatusLabel(item.status)}
						</Badge>
					</div>
					<p className="text-muted-foreground mt-1 text-xs">{secondaryLine}</p>
				</div>
			</div>

			{canEdit && (
				<>
					<div className="my-3 border-t" />

					<div className="flex flex-wrap items-center gap-4">
						<Button size="sm" onClick={() => onUploadDocument(item)}>
							<Upload className="size-4" data-icon="inline-start" />
							Upload Document
						</Button>
						<span className="text-muted-foreground text-xs">Status:</span>
						<Select
							value={item.status}
							onValueChange={(value) =>
								onStatusChange(
									item,
									value as CredentialComplianceItem["status"],
								)
							}
						>
							<SelectTrigger className="h-8 w-37.5 text-sm" aria-label="Status">
								<SelectValue placeholder="Select status" />
							</SelectTrigger>
							<SelectContent>
								{CREDENTIAL_COMPLIANCE_STATUS_OPTIONS.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</>
			)}
		</div>
	);
}
