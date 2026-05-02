import { UserRole } from "@repo/shared";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import VendorMainShell from "@/components/vendor-layout/VendorMainShell";
import { AuthProvider } from "@/contexts/auth.context";
import { authClient } from "@/lib/auth-client";

export default async function VendorMainLayout({
	children,
}: {
	children: React.ReactNode;
}) {
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
			<VendorMainShell title="Vendors and MSPs">{children}</VendorMainShell>
		</AuthProvider>
	);
}
