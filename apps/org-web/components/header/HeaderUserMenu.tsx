"use client";

import { isCandidate, isOrganizationUser, isVendor } from "@repo/shared";
import HeaderUserMenu from "@repo/ui/general/HeaderUserMenu";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth.context";
import { authClient } from "@/lib/auth-client";

export type HeaderUserMenuProps = {
	profileLink?: string;
};
const OrgHeaderUserMenu = ({ profileLink }: Readonly<HeaderUserMenuProps>) => {
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

	const getDefaultProfileLink = () => {
		const role = session?.user?.role;
		if (isCandidate(role)) return "/profile";
		if (isVendor(role)) return "/vendor/profile";
		if (isOrganizationUser(role)) return "/org/profile";
		return "/not-a-member";
	};

	return (
		<HeaderUserMenu
			user={session?.user}
			onLogout={handleLogout}
			profileLink={profileLink ?? getDefaultProfileLink()}
		/>
	);
};

export default OrgHeaderUserMenu;
