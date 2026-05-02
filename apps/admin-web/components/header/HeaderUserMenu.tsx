"use client";

import HeaderUserMenu from "@repo/ui/general/HeaderUserMenu";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/contexts";
import { authClient } from "@/lib/auth-client";

const AdminHeaderUserMenu = () => {
	const { session } = useAuth();
	const router = useRouter();

	const handleLogout = async () => {
		const response = await authClient.signOut();
		if (response.data?.success) {
			router.push("/sign-in");
		} else {
			toast.error(response.error?.message ?? "Failed to logout");
		}
	};

	return (
		<HeaderUserMenu
			user={session?.user}
			onLogout={handleLogout}
			profileLink="/profile"
		/>
	);
};

export default AdminHeaderUserMenu;
