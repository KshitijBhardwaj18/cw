"use client";

import NavSidebar from "@repo/ui/general/NavSidebar";
import { candidateSidebarGroups } from "@/constants/candidate/sidebar";
import SidebarLogo from "./SidebarLogo";

export function CandidateAppSidebar() {
	return (
		<NavSidebar
			sidebarHeader={<SidebarLogo />}
			groups={candidateSidebarGroups}
		/>
	);
}
