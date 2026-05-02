import { headers } from "next/headers";
import { redirect } from "next/navigation";
import CandidateProfilePageContent from "@/components/candidate-profile/CandidateProfilePageContent";
import { authClient } from "@/lib/auth-client";

export default async function CandidateProfilePage() {
	const session = await authClient.getSession({
		fetchOptions: { headers: await headers() },
	});

	if (!session.data) {
		return redirect("/sign-in");
	}

	const { user } = session.data;

	return (
		<CandidateProfilePageContent
			user={{
				id: user.id,
				email: user.email ?? "",
				name: user.name ?? "",
				emailVerified: user.emailVerified ?? false,
				role: user.role ?? "",
				subRole: user.subRole ?? null,
				phoneNumber: user.phoneNumber ?? "",
				officePhone: user.officePhone ?? "",
				timeZone: user.timeZone ?? "",
			}}
		/>
	);
}
