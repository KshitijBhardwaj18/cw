"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { ActionBar } from "@repo/ui/general/ActionBar";
import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";
import { cn } from "@repo/ui/lib/utils";
import {
	FileText,
	HelpCircle,
	LogOut,
	type LucideIcon,
	Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export interface SettingsItem {
	type: "link" | "button";
	label: string;
	icon: LucideIcon;
	href?: string;
	onClick?: () => void;
	variant?: "default" | "danger";
}

export function SettingsCard() {
	const router = useRouter();
	const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleSignOut = async () => {
		try {
			setIsLoading(true);
			await authClient.signOut();
			router.push("/sign-in");
		} finally {
			setIsLoading(false);
			setIsLogoutDialogOpen(false);
		}
	};

	const items: SettingsItem[] = [
		{
			type: "link",
			label: "Help & Support",
			icon: HelpCircle,
			href: "/support",
		},
		{
			type: "link",
			label: "Privacy & Terms",
			icon: FileText,
			href: "/legal",
		},
		{
			type: "button",
			label: "Logout",
			icon: LogOut,
			variant: "danger",
			onClick: () => setIsLogoutDialogOpen(true),
		},
		{
			type: "button",
			label: "Delete Account",
			icon: Trash2,
			variant: "danger",
			onClick: () => {
				// TODO: Implement delete account
			},
		},
	];

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle className="text-xl">Settings</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					{items.map((item) => (
						<ActionBar
							key={item.label}
							type={item.type}
							href={item.href}
							onClick={item.onClick}
							variant={item.variant}
							innerClassName="gap-3"
						>
							<item.icon
								className={cn(
									"size-4",
									item.variant === "danger"
										? "text-red-500"
										: "text-muted-foreground",
								)}
							/>
							<span className="text-sm">{item.label}</span>
						</ActionBar>
					))}
				</CardContent>
			</Card>

			<CustomAlertDialog
				isOpen={isLogoutDialogOpen}
				onClose={() => setIsLogoutDialogOpen(false)}
				onConfirm={handleSignOut}
				isLoading={isLoading}
				title="Sign Out"
				description="Are you sure you want to sign out of your account?"
				confirmText="Sign Out"
				cancelText="Cancel"
			/>
		</>
	);
}
