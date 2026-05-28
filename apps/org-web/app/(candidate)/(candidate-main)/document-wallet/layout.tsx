import PageContainer from "@repo/ui/general/PageContainer";
import type { Metadata } from "next";
import CandidateMainShell from "@/components/candidate-layout/CandidateMainShell";

export const metadata: Metadata = {
	title: "Document Wallet",
};

const DocumentWalletLayout = ({
	children,
}: Readonly<{ children: React.ReactNode }>) => {
	return (
		<CandidateMainShell title="Document Wallet">
			<PageContainer>{children}</PageContainer>
		</CandidateMainShell>
	);
};

export default DocumentWalletLayout;
