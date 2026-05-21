import MainLayoutShell from "@repo/ui/general/MainLayoutShell";
import type React from "react";
import { CandidateProfileCompleteBanner } from "@/components/candidate-placements/CandidateProfileCompleteBanner";
import HeaderUserMenu from "@/components/header/HeaderUserMenu";
import { CandidateAppSidebar } from "@/components/sidebar/CandidateAppSidebar";

export type CandidateMainShellProps = {
	title: string;
	children: React.ReactNode;
};

const CandidateMainShell = ({ title, children }: CandidateMainShellProps) => {
	return (
		<MainLayoutShell
			sidebar={<CandidateAppSidebar />}
			title={title}
			headerActions={<HeaderUserMenu />}
		>
			<div>
				<div className="mx-auto w-full max-w-5xl px-3 pt-3 sm:px-4 sm:pt-4 sm:pb-0 md:px-6 md:pt-6 md:pb-0 lg:px-8 lg:pt-8 lg:pb-0">
					<CandidateProfileCompleteBanner />
				</div>
				{children}
			</div>
		</MainLayoutShell>
	);
};

export default CandidateMainShell;
