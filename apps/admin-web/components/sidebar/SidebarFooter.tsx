import {
	SidebarFooter as CnSidebarFooter,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@repo/ui/components/sidebar";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const SidebarFooter = () => {
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
		<CnSidebarFooter>
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton
						className="text-red-500 hover:text-red-500"
						onClick={handleLogout}
						size={"lg"}
					>
						<LogOut />
						<span>Logout</span>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</CnSidebarFooter>
	);
};

export default SidebarFooter;
