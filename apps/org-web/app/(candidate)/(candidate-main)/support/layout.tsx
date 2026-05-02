import PageContainer from "@repo/ui/general/PageContainer";
import CandidateMainShell from "@/components/candidate-layout/CandidateMainShell";

const SupportLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<CandidateMainShell title="Support">
			<PageContainer>{children}</PageContainer>
		</CandidateMainShell>
	);
};

export default SupportLayout;
