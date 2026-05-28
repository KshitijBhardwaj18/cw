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
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useCloseCandidateAccount } from "@/queries/candidate-account.queries";

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
	const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
	const [isSigningOut, setIsSigningOut] = useState(false);
	const closeAccountMutation = useCloseCandidateAccount();

	const handleSignOut = async () => {
		try {
			setIsSigningOut(true);
			await authClient.signOut();
			router.push("/sign-in");
		} finally {
			setIsSigningOut(false);
			setIsLogoutDialogOpen(false);
		}
	};

	const handleCloseAccount = () => {
		closeAccountMutation.mutate(undefined, {
			onSuccess: async () => {
				setIsCloseDialogOpen(false);
				await authClient.signOut();
				router.push("/sign-in");
			},
			onError: (err) => {
				setIsCloseDialogOpen(false);
				toast.error(
					err instanceof Error ? err.message : "Failed to close account",
				);
			},
		});
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
			label: "Close Account",
			icon: Trash2,
			variant: "danger",
			onClick: () => setIsCloseDialogOpen(true),
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
				isLoading={isSigningOut}
				title="Sign Out"
				description="Are you sure you want to sign out of your account?"
				confirmText="Sign Out"
				cancelText="Cancel"
			/>

			<CustomAlertDialog
				isOpen={isCloseDialogOpen}
				onClose={() => setIsCloseDialogOpen(false)}
				onConfirm={handleCloseAccount}
				isLoading={closeAccountMutation.isPending}
				title="Close your account?"
				description="Closing your account will sign you out, disable sign-in, hide your profile from vendors and organizations, and withdraw any pending job applications. Existing placements, timecards, and approved compliance records will be retained as required by employment regulations. Contact support if you need to permanently erase your data after closing."
				confirmText="Close Account"
				cancelText="Cancel"
			/>
		</>
	);
}
