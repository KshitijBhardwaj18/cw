import PageContainer from "@repo/ui/general/PageContainer";
import type { Metadata } from "next";
import CandidateMainShell from "@/components/candidate-layout/CandidateMainShell";

export const metadata: Metadata = {
	title: "Submissions",
};

const SubmissionLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<CandidateMainShell title="Submission">
			<PageContainer>{children}</PageContainer>
		</CandidateMainShell>
	);
};

export default SubmissionLayout;
