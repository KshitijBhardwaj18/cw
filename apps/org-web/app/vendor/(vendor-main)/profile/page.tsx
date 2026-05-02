import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { authClient } from "@/lib/auth-client";

export default async function ProfilePage() {
	const session = await authClient.getSession({
		fetchOptions: {
			headers: await headers(),
		},
	});

	if (!session.data) {
		return redirect("/sign-in");
	}

	const { user, session: sessionData } = session.data;

	return (
		<ProfileSection
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
			currentSessionToken={sessionData.token}
		/>
	);
}
