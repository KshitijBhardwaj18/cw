import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
	title: "Complete Your Profile",
	description: "Complete your candidate profile",
};

export default async function CandidateOnboardingPage({
	searchParams,
}: {
	searchParams: Promise<{ token?: string }>;
}) {
	const { token } = await searchParams;
	if (token) {
		redirect(`/candidate/sign-up?token=${encodeURIComponent(token)}`);
	}
	redirect("/candidate/sign-up");
}
