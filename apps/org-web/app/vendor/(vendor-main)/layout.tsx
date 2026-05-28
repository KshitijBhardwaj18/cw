import {
	formatStaffLogicDocumentTitle,
	staffLogicDocumentTitleTemplate,
	UserRole,
	VENDOR_PORTAL_DISPLAY_NAME,
} from "@repo/shared";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import VendorMainShellWithContext from "@/components/vendor-layout/VendorMainShellWithContext";
import { AuthProvider } from "@/contexts/auth.context";
import { authClient } from "@/lib/auth-client";

export const metadata: Metadata = {
	title: {
		default: formatStaffLogicDocumentTitle(
			"Vendor",
			VENDOR_PORTAL_DISPLAY_NAME,
		),
		template: staffLogicDocumentTitleTemplate(VENDOR_PORTAL_DISPLAY_NAME),
	},
};

export default async function VendorMainLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const headersList = await headers();

	const session = await authClient.getSession({
		fetchOptions: {
			headers: headersList,
		},
	});

	if (!session.data) {
		return redirect("/sign-in");
	}

	if (session.data.user.role !== UserRole.VENDOR_USER) {
		if (session.data.user.role === UserRole.ORGANIZATION_USER) {
			return redirect("/org/command-center");
		}
		if (session.data.user.role === UserRole.CANDIDATE_USER) {
			return redirect("/dashboard");
		}
		return redirect("/not-a-member");
	}

	return (
		<AuthProvider>
			<VendorMainShellWithContext>{children}</VendorMainShellWithContext>
		</AuthProvider>
	);
}
