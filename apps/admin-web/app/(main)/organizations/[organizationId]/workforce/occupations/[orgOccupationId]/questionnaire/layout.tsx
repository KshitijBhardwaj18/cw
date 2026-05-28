import { Action } from "@repo/casl";
import PermissionsGuard from "@repo/ui/general/PermissionsGuard";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Questionnaire",
};

export default function OccupationQuestionnaireLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<PermissionsGuard
			permissions={[{ action: Action.Read, subject: "Questionnaire" }]}
		>
			{children}
		</PermissionsGuard>
	);
}
