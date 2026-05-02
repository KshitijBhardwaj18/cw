import { isAdminPortalRole, UserRole } from "@repo/shared";
import MainLayoutShell from "@repo/ui/general/MainLayoutShell";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import HeaderUserMenu from "@/components/header/HeaderUserMenu";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { AuthProvider } from "@/contexts/auth.context";
import { authClient } from "@/lib/auth-client";
import { OrganizationsService } from "@/services/organizations.service";

export default async function OrgLayout({ children }: { children: ReactNode }) {
	const headersList = await headers();

	const session = await authClient.getSession({
		fetchOptions: {
			headers: headersList,
		},
	});

	if (!session.data) {
		return redirect("/sign-in");
	}

	if (session.data.user.role === UserRole.CANDIDATE_USER) {
		return redirect("/dashboard");
	}

	if (session.data.user.role === UserRole.VENDOR_USER) {
		return redirect("/vendor/dashboard");
	}

	const orgId = headersList.get("x-org-id");
	if (orgId && !isAdminPortalRole(session.data.user.role)) {
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
			<MainLayoutShell
				sidebar={<AppSidebar />}
				title="Organization Portal"
				headerActions={<HeaderUserMenu />}
			>
				{children}
			</MainLayoutShell>
		</AuthProvider>
	);
}
