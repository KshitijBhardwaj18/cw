"use client";

import {
	getInitials,
	getLabel,
	LocationType,
	type OrganizationResponseType,
} from "@repo/shared";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import { Calendar, Globe, MapPin, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ORGANIZATION_TYPE_OPTIONS } from "@/constants/organization";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import { OrganizationDeleteDialog } from "./OrganizationDeleteDialog";

type OrganizationCardProps = {
	org: OrganizationResponseType;
	canDelete?: boolean;
};

function getHeadquarters(org: OrganizationResponseType): string | null {
	const hq = org.locations.find(
		(loc) => loc.locationType === LocationType.HEADQUARTERS,
	);
	if (hq) return `${hq.city}, ${hq.state}`;
	const first = org.locations[0];
	return first ? `${first.city}, ${first.state}` : null;
}

export function OrganizationCard({
	org,
	canDelete = false,
}: Readonly<OrganizationCardProps>) {
	const [deleteOpen, setDeleteOpen] = useState(false);
	const { fmtShortDate } = useUserTimezone();
	const orgTypeLabel = getLabel(
		ORGANIZATION_TYPE_OPTIONS,
		org.organizationType,
	);
	const headquarters = getHeadquarters(org);
	const vendorCount = org._count?.organizationVendors ?? 0;

	return (
		<>
			<Link
				href={`/organizations/${org.id}`}
				className="group relative flex gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
			>
				<Avatar className="size-12 shrink-0 rounded-lg bg-primary/15">
					<AvatarImage src={org.logo ?? undefined} />
					<AvatarFallback className="rounded-lg bg-primary/15 text-primary">
						{getInitials(org.name)}
					</AvatarFallback>
				</Avatar>
				<div className="min-w-0 flex-1 space-y-2">
					<div className="flex items-start justify-between gap-2">
						<div>
							<h3 className="font-semibold">{org.name}</h3>
							<p className="text-muted-foreground text-sm">{orgTypeLabel}</p>
						</div>
						{canDelete && (
							<Button
								variant="ghost"
								size="icon"
								className="size-8 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									setDeleteOpen(true);
								}}
								aria-label={`Delete ${org.name}`}
							>
								<Trash2 className="size-4" />
							</Button>
						)}
					</div>
					<div className="flex flex-col gap-1 text-muted-foreground text-sm">
						{org.website && (
							<span className="flex items-center gap-2">
								<Globe className="size-3.5 shrink-0" />
								{org.website.replace(/^https?:\/\//, "")}
							</span>
						)}
						{headquarters && (
							<span className="flex items-center gap-2">
								<MapPin className="size-3.5 shrink-0" />
								{headquarters}
							</span>
						)}

						<span className="flex items-center gap-2">
							<Calendar className="size-3.5 shrink-0" />
							{fmtShortDate(org.createdAt)}
						</span>
						{org.agreementRenewalDate && (
							<span className="flex items-center gap-2">
								<Calendar className="size-3.5 shrink-0" />
								{fmtShortDate(org.agreementRenewalDate)}
							</span>
						)}
						<span className="flex items-center gap-2">
							<MapPin className="size-3.5 shrink-0" />
							{org.locations.length} location
							{org.locations.length !== 1 ? "s" : ""}
						</span>
						<span className="flex items-center gap-2">
							<Users className="size-3.5 shrink-0" />
							{vendorCount} vendor{vendorCount !== 1 ? "s" : ""}
						</span>
					</div>
				</div>
			</Link>

			<OrganizationDeleteDialog
				organization={org}
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
			/>
		</>
	);
}
