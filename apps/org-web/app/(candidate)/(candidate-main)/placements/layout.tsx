import PageContainer from "@repo/ui/general/PageContainer";
import CandidateMainShell from "@/components/candidate-layout/CandidateMainShell";

const PlacementsLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<CandidateMainShell title="Placements">
			<PageContainer>{children}</PageContainer>
		</CandidateMainShell>
	);
};

export default PlacementsLayout;
