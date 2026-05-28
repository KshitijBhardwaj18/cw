import {
	formatStaffLogicDocumentTitle,
	isAdminPortalRole,
	ORGANIZATION_PORTAL_DISPLAY_NAME,
	staffLogicDocumentTitleTemplate,
	UserRole,
} from "@repo/shared";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import OrgMainShellWithContext from "@/components/org-layout/OrgMainShellWithContext";
import { AuthProvider } from "@/contexts/auth.context";
import { authClient } from "@/lib/auth-client";
import { OrganizationsService } from "@/services/organizations.service";

export const metadata: Metadata = {
	title: {
		default: formatStaffLogicDocumentTitle(
			"Organization",
			ORGANIZATION_PORTAL_DISPLAY_NAME,
		),
		template: staffLogicDocumentTitleTemplate(ORGANIZATION_PORTAL_DISPLAY_NAME),
	},
};

export default async function OrgLayout({
	children,
}: Readonly<{ children: ReactNode }>) {
	const headersList = await headers();

	const session = await authClient.getSession({
		fetchOptions: {
			headers: headersList,
		},
	});

	if (!session.data) {
		return redirect("/sign-in");
	}

	const hasOrgHost = headersList.get("x-org-slug") !== null;

	if (session.data.user.role === UserRole.CANDIDATE_USER) {
		return redirect("/dashboard");
	}

	if (session.data.user.role === UserRole.VENDOR_USER) {
		return redirect("/vendor/dashboard");
	}

	if (hasOrgHost && !isAdminPortalRole(session.data.user.role)) {
		if (session.data.user.role === UserRole.ORGANIZATION_USER) {
			try {
				await OrganizationsService.getMyMembership();
			} catch {
				return redirect("/not-a-member");
			}
		} else {
			return redirect("/not-a-member");
		}
	}

	return (
		<AuthProvider>
			<OrgMainShellWithContext>{children}</OrgMainShellWithContext>
		</AuthProvider>
	);
}
