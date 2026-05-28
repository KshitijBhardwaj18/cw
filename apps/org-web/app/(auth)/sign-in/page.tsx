import { isAdminPortalRole, UserRole } from "@repo/shared";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthPage } from "@/components/auth/AuthPage";
import { ApiClient } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";

export const metadata: Metadata = {
	description: "Sign in to your Staff Logic organization portal",
};

function isKnownPortalRole(role: string | null | undefined): boolean {
	return (
		role === UserRole.ORGANIZATION_USER ||
		role === UserRole.VENDOR_USER ||
		role === UserRole.CANDIDATE_USER ||
		isAdminPortalRole(role)
	);
}

function homeRouteForRole(role: string | null | undefined): string {
	if (role === UserRole.CANDIDATE_USER) return "/dashboard";
	if (role === UserRole.VENDOR_USER) return "/vendor/dashboard";
	return "/org/command-center";
}

async function hasActiveMembershipInHostOrg(): Promise<boolean> {
	try {
		await ApiClient.get<{ memberId: string; status: string }>(
			"/api/organizations/me/membership",
		);
		return true;
	} catch {
		return false;
	}
}

export default async function SignInPage() {
	const headersList = await headers();

	const session = await authClient.getSession({
		fetchOptions: { headers: headersList },
	});

	if (!session?.data) {
		return <AuthPage />;
	}

	const { role } = session.data.user;
	if (!isKnownPortalRole(role)) {
		return redirect("/not-a-member");
	}

	const hasOrgHost = headersList.get("x-org-slug") !== null;
	if (
		role === UserRole.ORGANIZATION_USER &&
		hasOrgHost &&
		!(await hasActiveMembershipInHostOrg())
	) {
		return redirect("/not-a-member");
	}

	return redirect(homeRouteForRole(role));
}
