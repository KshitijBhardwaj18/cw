import { UserRole } from "@repo/shared";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthProvider } from "@/contexts/auth.context";
import { authClient } from "@/lib/auth-client";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
	const headersList = await headers();

	const session = await authClient.getSession({
		fetchOptions: {
			headers: headersList,
		},
	});

	if (!session.data) {
		return redirect("/sign-in");
	}

	if (session.data.user.role !== UserRole.CANDIDATE_USER) {
		if (session.data.user.role === UserRole.ORGANIZATION_USER) {
			return redirect("/org/command-center");
		}
		if (session.data.user.role === UserRole.VENDOR_USER) {
			return redirect("/vendor/dashboard");
		}
		return redirect("/not-a-member");
	}

	return <AuthProvider>{children}</AuthProvider>;
};

export default MainLayout;
