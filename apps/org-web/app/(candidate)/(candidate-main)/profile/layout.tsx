import PageContainer from "@repo/ui/general/PageContainer";
import CandidateMainShell from "@/components/candidate-layout/CandidateMainShell";

const ProfileLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<CandidateMainShell title="Profile">
			<PageContainer>{children}</PageContainer>
		</CandidateMainShell>
	);
};

export default ProfileLayout;
