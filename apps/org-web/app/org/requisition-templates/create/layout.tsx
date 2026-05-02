import { Action } from "@repo/casl";
import PermissionsGuard from "@repo/ui/general/PermissionsGuard";

export default function CreateRequisitionTemplateLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<PermissionsGuard
			permissions={[{ action: Action.Create, subject: "RequisitionTemplate" }]}
		>
			{children}
		</PermissionsGuard>
	);
}
