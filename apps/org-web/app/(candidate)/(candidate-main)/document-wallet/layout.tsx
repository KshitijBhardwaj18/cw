import PageContainer from "@repo/ui/general/PageContainer";
import CandidateMainShell from "@/components/candidate-layout/CandidateMainShell";

const DocumentWalletLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<CandidateMainShell title="Document Wallet">
			<PageContainer>{children}</PageContainer>
		</CandidateMainShell>
	);
};

export default DocumentWalletLayout;
