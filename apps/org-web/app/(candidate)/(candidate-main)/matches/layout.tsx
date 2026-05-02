import PageContainer from "@repo/ui/general/PageContainer";
import CandidateMainShell from "@/components/candidate-layout/CandidateMainShell";

const MatchesAndJobSearchLayout = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	return (
		<CandidateMainShell title="Matches & Job Search">
			<PageContainer>{children}</PageContainer>
		</CandidateMainShell>
	);
};

export default MatchesAndJobSearchLayout;
