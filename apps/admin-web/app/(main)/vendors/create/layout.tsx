import { Action } from "@repo/casl";
import PermissionsGuard from "@repo/ui/general/PermissionsGuard";

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
