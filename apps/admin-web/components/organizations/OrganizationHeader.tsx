"use client";

import { getLabel, type OrganizationResponseType } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import { OrganizationBrandBlock } from "@repo/ui/general/OrganizationBrandBlock";
import { ArrowLeft, Globe } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ORGANIZATION_TYPE_OPTIONS } from "@/constants/organization";
import { UsersService } from "@/services/users.service";

type OrganizationHeaderProps = {
	organization: OrganizationResponseType;
};

export function OrganizationHeader({
	organization,
}: Readonly<OrganizationHeaderProps>) {
	const [opening, setOpening] = useState(false);
	const orgTypeLabel = getLabel(
		ORGANIZATION_TYPE_OPTIONS,
		organization.organizationType,
	);

	const openOrgPortal = async () => {
		const newTab = window.open("about:blank", "_blank");
		if (!newTab) {
			toast.error("Popup blocked", {
				description:
					"Allow popups for this site, or open the org portal in a new tab yourself.",
			});
			return;
		}
		setOpening(true);
		try {
			const { url } = await UsersService.createOrgPortalDelegation(
				organization.id,
			);
			newTab.location.href = url;
		} catch {
			try {
				newTab.close();
			} catch {
				/* ignore */
			}
			toast.error("Could not open organization portal", {
				description: "Try again in a moment.",
			});
		} finally {
			setOpening(false);
		}
	};

	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
			<div className="flex items-center gap-4">
				<Button
					variant="ghost"
					size="icon"
					asChild
					aria-label="Back to Organizations"
				>
					<Link href="/organizations">
						<ArrowLeft className="size-4" />
					</Link>
				</Button>
				<OrganizationBrandBlock
					name={organization.name}
					avatarUrl={organization.logo ?? ""}
					subtitle={orgTypeLabel}
				/>
			</div>
			<Button
				className="self-end"
				variant="link"
				size="sm"
				disabled={opening}
				onClick={() => void openOrgPortal()}
			>
				<Globe className="size-4" />
				<span>View Organization Portal</span>
			</Button>
		</div>
	);
}
