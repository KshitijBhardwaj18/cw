import {
	ADMIN_PORTAL_DISPLAY_NAME,
	formatStaffLogicDocumentTitle,
} from "@repo/shared";
import type { Metadata } from "next";
import { OrganizationsService } from "@/services/organizations.service";
import OrgDetailLayoutClient from "./OrgDetailLayoutClient";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ organizationId: string }>;
}): Promise<Metadata> {
	const { organizationId } = await params;
	try {
		const org = await OrganizationsService.getOrganizationById(organizationId);
		if (org?.name) {
			return {
				title: org.name,
				description: `Workforce settings for ${org.name}`,
			};
		}
	} catch {
		// fall through to default
	}
	return {
		title: formatStaffLogicDocumentTitle(
			"Organization",
			ADMIN_PORTAL_DISPLAY_NAME,
		),
		description: "Organization details and workforce configuration",
	};
}

export default function OrganizationDetailLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <OrgDetailLayoutClient>{children}</OrgDetailLayoutClient>;
}
