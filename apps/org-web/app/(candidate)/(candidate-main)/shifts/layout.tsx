import PageContainer from "@repo/ui/general/PageContainer";
import CandidateMainShell from "@/components/candidate-layout/CandidateMainShell";

const ShiftsLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<CandidateMainShell title="Shifts">
			<PageContainer>{children}</PageContainer>
		</CandidateMainShell>
	);
};

export default ShiftsLayout;
