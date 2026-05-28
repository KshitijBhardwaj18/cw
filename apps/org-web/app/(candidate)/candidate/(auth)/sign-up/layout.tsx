import { UserRole } from "@repo/shared";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { ApiClient } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { OnboardingService } from "@/services/onboarding.service";

export default async function CandidateSignUpLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	const headersList = await headers();

	const session = await authClient.getSession({
		fetchOptions: {
			headers: headersList,
		},
	});

	if (session?.data) {
		const hasOrgHost = headersList.get("x-org-slug") !== null;

		const role = session.data.user.role;
		if (role === UserRole.CANDIDATE_USER) {
			let onboardingCompletedAt: string | null = null;
			try {
				const onboarding = await OnboardingService.getMeOnboarding();
				onboardingCompletedAt = onboarding.onboardingCompletedAt;
			} catch {
				return children;
			}
			if (onboardingCompletedAt) {
				return redirect("/dashboard");
			}
			return children;
		}
		if (role === UserRole.VENDOR_USER) {
			return redirect("/vendor/dashboard");
		}
		if (role !== UserRole.ORGANIZATION_USER) {
			return redirect("/not-a-member");
		}
		if (hasOrgHost) {
			try {
				await ApiClient.get<{ memberId: string; status: string }>(
					"/api/organizations/me/membership",
				);
			} catch {
				return redirect("/not-a-member");
			}
		}
		return redirect("/org/command-center");
	}

	return children;
}
