import { Action } from "@repo/casl";
import PermissionsGuard from "@repo/ui/general/PermissionsGuard";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Specialties",
};

export default function SpecialtiesSegmentLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<PermissionsGuard
			permissions={[{ action: Action.Read, subject: "Specialty" }]}
		>
			{children}
		</PermissionsGuard>
	);
}
