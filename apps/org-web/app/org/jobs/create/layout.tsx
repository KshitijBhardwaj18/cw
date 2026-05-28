import { Action } from "@repo/casl";
import PermissionsGuard from "@repo/ui/general/PermissionsGuard";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Create Job",
};

export default function CreateJobLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<PermissionsGuard
			permissions={[{ action: Action.Create, subject: "Requisition" }]}
		>
			{children}
		</PermissionsGuard>
	);
}
