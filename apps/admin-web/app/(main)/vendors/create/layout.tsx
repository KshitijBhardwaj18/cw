import { Action } from "@repo/casl";
import PermissionsGuard from "@repo/ui/general/PermissionsGuard";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Create Vendor",
};

export default function CreateVendorLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<PermissionsGuard
			permissions={[{ action: Action.Create, subject: "Vendor" }]}
		>
			{children}
		</PermissionsGuard>
	);
}
