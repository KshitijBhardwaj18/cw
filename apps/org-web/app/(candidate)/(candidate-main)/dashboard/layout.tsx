import PageContainer from "@repo/ui/general/PageContainer";
import type { Metadata } from "next";
import CandidateMainShell from "@/components/candidate-layout/CandidateMainShell";

export const metadata: Metadata = {
	title: "Dashboard",
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<CandidateMainShell title="Dashboard">
			<PageContainer>{children}</PageContainer>
		</CandidateMainShell>
	);
};

export default DashboardLayout;
