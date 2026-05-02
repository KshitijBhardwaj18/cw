"use client";

import { Badge } from "@repo/ui/components/badge";
import { cn } from "@repo/ui/lib/utils";

interface RoleBadgeProps {
	role: string;
	className?: string;
}

export const RoleBadge = ({ role, className }: RoleBadgeProps) => {
	const getRoleVariant = (role: string) => {
		const normalizedRole = role.toLowerCase().trim();

		switch (normalizedRole) {
			case "owner":
				return {
					className:
						"bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
					label: "Owner",
				};
			case "admin":
				return {
					className:
						"bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
					label: "Admin",
				};
			case "member":
				return {
					className: "bg-muted text-muted-foreground border-border",
					label: "Member",
				};
			default:
				return {
					className: "bg-muted text-muted-foreground border-border",
					label: role.charAt(0).toUpperCase() + role.slice(1),
				};
		}
	};

	const { className: variantClass, label } = getRoleVariant(role);

	return (
		<Badge variant="outline" className={cn(variantClass, className)}>
			{label}
		</Badge>
	);
};
