import { Action } from "@repo/casl";
import PageContainer from "@repo/ui/general/PageContainer";
import PermissionsGuard from "@repo/ui/general/PermissionsGuard";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Candidates",
};

const CandidatesLayout = ({
	children,
}: Readonly<{ children: React.ReactNode }>) => {
	return (
		<PermissionsGuard
			permissions={[{ action: Action.List, subject: "Candidate" }]}
		>
			<PageContainer>{children}</PageContainer>
		</PermissionsGuard>
	);
};

export default CandidatesLayout;
