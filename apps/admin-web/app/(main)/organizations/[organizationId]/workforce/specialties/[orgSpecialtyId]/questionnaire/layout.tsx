import { Action } from "@repo/casl";
import PermissionsGuard from "@repo/ui/general/PermissionsGuard";

export default function SpecialtyQuestionnaireLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<PermissionsGuard
			permissions={[{ action: Action.Read, subject: "Questionnaire" }]}
		>
			{children}
		</PermissionsGuard>
	);
}
