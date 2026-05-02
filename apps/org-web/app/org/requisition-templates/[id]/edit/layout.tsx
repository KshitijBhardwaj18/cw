import { Action } from "@repo/casl";
import PermissionsGuard from "@repo/ui/general/PermissionsGuard";

export default function EditRequisitionTemplateLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<PermissionsGuard
			permissions={[{ action: Action.Update, subject: "RequisitionTemplate" }]}
		>
			{children}
		</PermissionsGuard>
	);
}
