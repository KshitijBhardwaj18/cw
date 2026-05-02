import {
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@repo/ui/components/sidebar";
import { cn } from "@repo/ui/lib/utils";
import { Building } from "lucide-react";
import Image from "next/image";

const SidebarLogo = () => {
	const { open, openMobile } = useSidebar();
	return (
		<SidebarHeader className={cn(open && "p-0 mb-2")}>
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton
						size="lg"
						className={cn(
							!open && "h-12 text-sm group-data-[collapsible=icon]:p-0!",
							open &&
								"h-14 group-data-[collapsible=icon]:my-4 hover:bg-transparent border-b flex items-center",
						)}
					>
						{open || openMobile ? (
							<Image
								src={"/images/logo.png"}
								alt="Logo"
								width={200}
								height={40}
								className="h-10 w-auto object-contain"
							/>
						) : (
							<div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
								<Building className="size-4" />
							</div>
						)}
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarHeader>
	);
};

export default SidebarLogo;
