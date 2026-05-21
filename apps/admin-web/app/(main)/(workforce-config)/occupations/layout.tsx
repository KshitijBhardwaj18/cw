import { Action } from "@repo/casl";
import PermissionsGuard from "@repo/ui/general/PermissionsGuard";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Occupations",
};

export default function OccupationsSegmentLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<PermissionsGuard
			permissions={[{ action: Action.Read, subject: "Occupation" }]}
		>
			{children}
		</PermissionsGuard>
	);
}
