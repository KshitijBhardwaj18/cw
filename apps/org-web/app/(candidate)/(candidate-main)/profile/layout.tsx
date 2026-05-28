import PageContainer from "@repo/ui/general/PageContainer";
import type { Metadata } from "next";
import CandidateMainShell from "@/components/candidate-layout/CandidateMainShell";

export const metadata: Metadata = {
	title: "Profile",
	description: "Your candidate profile and account details",
};

const ProfileLayout = ({
	children,
}: Readonly<{ children: React.ReactNode }>) => {
	return (
		<CandidateMainShell title="Profile">
			<PageContainer>{children}</PageContainer>
		</CandidateMainShell>
	);
};

export default ProfileLayout;
