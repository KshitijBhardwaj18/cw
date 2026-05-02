import PageContainer from "@repo/ui/general/PageContainer";
import CandidateMainShell from "@/components/candidate-layout/CandidateMainShell";

const SubmissionLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<CandidateMainShell title="Submission">
			<PageContainer>{children}</PageContainer>
		</CandidateMainShell>
	);
};

export default SubmissionLayout;
