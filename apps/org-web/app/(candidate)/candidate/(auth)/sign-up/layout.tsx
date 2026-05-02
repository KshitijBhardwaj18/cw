import { UserRole } from "@repo/shared";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { ApiClient } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";

export default async function CandidateSignUpLayout({
	children,
}: {
	children: ReactNode;
}) {
	const headersList = await headers();

	const session = await authClient.getSession({
		fetchOptions: {
			headers: headersList,
		},
	});

	if (session?.data) {
		const role = session.data.user.role;
		if (role === UserRole.CANDIDATE_USER) {
			return redirect("/dashboard");
		}
		if (role === UserRole.VENDOR_USER) {
			return redirect("/vendor/dashboard");
		}
		if (role !== UserRole.ORGANIZATION_USER) {
			return redirect("/not-a-member");
		}
		const orgId = headersList.get("x-org-id");
		if (orgId) {
			try {
				await ApiClient.get<{ memberId: string; status: string }>(
					"/api/organizations/me/membership",
					{ orgId },
				);
			} catch {
				return redirect("/not-a-member");
			}
		}
		return redirect("/org/command-center");
	}

	return children;
}
