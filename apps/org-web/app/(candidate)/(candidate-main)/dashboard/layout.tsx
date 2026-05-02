import PageContainer from "@repo/ui/general/PageContainer";
import CandidateMainShell from "@/components/candidate-layout/CandidateMainShell";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<CandidateMainShell title="Dashboard">
			<PageContainer>{children}</PageContainer>
		</CandidateMainShell>
	);
};

export default DashboardLayout;
