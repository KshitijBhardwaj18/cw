"use client";

import { getLabel, ORGANIZATION_INDUSTRY_OPTIONS } from "@repo/shared";
import {
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@repo/ui/components/sidebar";
import { OrganizationBrandBlock } from "@repo/ui/general/OrganizationBrandBlock";
import { cn } from "@repo/ui/lib/utils";
import { Building } from "lucide-react";
import Image from "next/image";
import { useOptionalOrgContext } from "@/contexts/org-context";

const PRODUCT_LOGO = "/images/logo.png";

const SidebarLogo = () => {
	const { open, openMobile } = useSidebar();
	const org = useOptionalOrgContext();
	const expanded = open || openMobile;
	const orgName = org?.name?.trim() ?? "";
	const industryLabel = org
		? getLabel(ORGANIZATION_INDUSTRY_OPTIONS, org.industry)
		: "";

	return (
		<SidebarHeader className="h-14 justify-center border-b p-0 px-2">
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton
						size="lg"
						className={cn(
							"h-10 items-center hover:bg-transparent flex w-full",
							!open && "text-sm group-data-[collapsible=icon]:p-0!",
						)}
					>
						{expanded ? (
							org && orgName ? (
								<OrganizationBrandBlock
									size="sm"
									name={orgName}
									avatarUrl={org.logo ?? ""}
									subtitle={industryLabel}
								/>
							) : (
								<Image
									src={PRODUCT_LOGO}
									alt="Logo"
									width={200}
									height={40}
									className="h-10 w-auto object-contain rounded-lg"
								/>
							)
						) : org && orgName ? (
							<OrganizationBrandBlock
								size="sm"
								showText={false}
								name={orgName}
								avatarUrl={org.logo ?? ""}
								avatarClassName="size-8"
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
