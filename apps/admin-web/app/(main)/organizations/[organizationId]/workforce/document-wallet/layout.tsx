import { Action } from "@repo/casl";
import PermissionsGuard from "@repo/ui/general/PermissionsGuard";

export default function OrgDocumentWalletLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<PermissionsGuard
			permissions={[
				{ action: Action.Read, subject: "ComplianceWalletTemplate" },
			]}
		>
			{children}
		</PermissionsGuard>
	);
}
