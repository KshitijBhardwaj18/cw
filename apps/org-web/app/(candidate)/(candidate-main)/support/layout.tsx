import PageContainer from "@repo/ui/general/PageContainer";
import type { Metadata } from "next";
import CandidateMainShell from "@/components/candidate-layout/CandidateMainShell";

export const metadata: Metadata = {
	title: "Support",
};

const SupportLayout = ({
	children,
}: Readonly<{ children: React.ReactNode }>) => {
	return (
		<CandidateMainShell title="Support">
			<PageContainer>{children}</PageContainer>
		</CandidateMainShell>
	);
};

export default SupportLayout;
