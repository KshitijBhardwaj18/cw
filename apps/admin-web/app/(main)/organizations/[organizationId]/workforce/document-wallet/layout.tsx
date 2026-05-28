import { Action } from "@repo/casl";
import PermissionsGuard from "@repo/ui/general/PermissionsGuard";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Document Wallet",
};

export default function OrgDocumentWalletLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
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
