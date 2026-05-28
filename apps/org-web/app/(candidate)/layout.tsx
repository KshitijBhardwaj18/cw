import {
	CANDIDATE_PORTAL_DISPLAY_NAME,
	formatStaffLogicDocumentTitle,
	staffLogicDocumentTitleTemplate,
} from "@repo/shared";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: {
		default: formatStaffLogicDocumentTitle(
			"Candidate",
			CANDIDATE_PORTAL_DISPLAY_NAME,
		),
		template: staffLogicDocumentTitleTemplate(CANDIDATE_PORTAL_DISPLAY_NAME),
	},
};

export default function CandidatePortalRouteGroupLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return children;
}
