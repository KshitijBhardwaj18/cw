import PageContainer from "@repo/ui/general/PageContainer";
import type { Metadata } from "next";
import CandidateMainShell from "@/components/candidate-layout/CandidateMainShell";

export const metadata: Metadata = {
	title: "Shifts",
};

const ShiftsLayout = ({
	children,
}: Readonly<{ children: React.ReactNode }>) => {
	return (
		<CandidateMainShell title="Shifts">
			<PageContainer>{children}</PageContainer>
		</CandidateMainShell>
	);
};

export default ShiftsLayout;
