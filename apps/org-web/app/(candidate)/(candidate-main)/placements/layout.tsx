import PageContainer from "@repo/ui/general/PageContainer";
import type { Metadata } from "next";
import CandidateMainShell from "@/components/candidate-layout/CandidateMainShell";

export const metadata: Metadata = {
	title: "Placements",
};

const PlacementsLayout = ({
	children,
}: Readonly<{ children: React.ReactNode }>) => {
	return (
		<CandidateMainShell title="Placements">
			<PageContainer>{children}</PageContainer>
		</CandidateMainShell>
	);
};

export default PlacementsLayout;
