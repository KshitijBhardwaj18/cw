import MainLayoutShell from "@repo/ui/general/MainLayoutShell";
import type React from "react";
import { CandidateProfileCompleteBanner } from "@/components/candidate-placements/CandidateProfileCompleteBanner";
import HeaderUserMenu from "@/components/header/HeaderUserMenu";
import { CandidateAppSidebar } from "@/components/sidebar/CandidateAppSidebar";

export type CandidateMainShellProps = {
	title: string;
	children: React.ReactNode;
};

const CandidateMainShell = ({
	title,
	children,
}: Readonly<CandidateMainShellProps>) => {
	return (
		<MainLayoutShell
			sidebar={<CandidateAppSidebar />}
			title={title}
			headerActions={<HeaderUserMenu />}
		>
			<CandidateProfileCompleteBanner />
			{children}
		</MainLayoutShell>
	);
};

export default CandidateMainShell;
