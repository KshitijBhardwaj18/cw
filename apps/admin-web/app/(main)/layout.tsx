import MainLayoutShell from "@repo/ui/general/MainLayoutShell";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import HeaderUserMenu from "@/components/header/HeaderUserMenu";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { AuthProvider } from "@/contexts/auth.context";
import { authClient } from "@/lib/auth-client";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
	const session = await authClient.getSession({
		fetchOptions: {
			headers: await headers(),
		},
		query: {
			disableCookieCache: true,
		},
	});

	if (!session.data) {
		return redirect("/sign-in");
	}

	return (
		<AuthProvider>
			<MainLayoutShell
				sidebar={<AppSidebar />}
				title="Admin Panel"
				headerActions={<HeaderUserMenu />}
			>
				{children}
			</MainLayoutShell>
		</AuthProvider>
	);
};

export default MainLayout;
