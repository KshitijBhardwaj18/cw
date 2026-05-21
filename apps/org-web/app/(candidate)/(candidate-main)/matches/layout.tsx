import PageContainer from "@repo/ui/general/PageContainer";
import type { Metadata } from "next";
import CandidateMainShell from "@/components/candidate-layout/CandidateMainShell";

export const metadata: Metadata = {
	title: "Matches & Job Search",
};

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
