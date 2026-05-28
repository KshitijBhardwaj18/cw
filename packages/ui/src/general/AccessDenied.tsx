"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { ShieldXIcon } from "lucide-react";

interface AccessDeniedProps {
	permissions?: {
		action: string;
		subject: string;
	}[];
}

export const AccessDenied = ({ permissions }: Readonly<AccessDeniedProps>) => {
	const formatPermission = (
		permission: NonNullable<AccessDeniedProps["permissions"]>[number],
	) => `${permission.action} ${permission.subject.toLowerCase()}`;

	const formatPermissions = () => {
		if (!permissions?.length) {
			return "You don't have permission to access this page.";
		}

		const permissionLabels = permissions.map((permission) =>
			formatPermission(permission),
		);

		if (permissionLabels.length === 1) {
			return `You don't have permission to access this page. This page requires ${permissionLabels[0]} permission.`;
		}

		if (permissionLabels.length === 2) {
			return `You don't have permission to access this page. This page requires ${permissionLabels[0]} and ${permissionLabels[1]} permissions.`;
		}

		const lastPermission = permissionLabels[permissionLabels.length - 1];
		const otherPermissions = permissionLabels.slice(0, -1).join(", ");
		return `You don't have permission to access this page. This page requires ${otherPermissions}, and ${lastPermission} permissions.`;
	};

	return (
		<div className="flex min-h-[60vh] items-center justify-center">
			<Card className="max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
						<ShieldXIcon className="h-6 w-6 text-destructive" />
					</div>
					<CardTitle>Access Denied</CardTitle>
					<CardDescription>{formatPermissions()}</CardDescription>
				</CardHeader>
				<CardContent className="text-center text-sm text-muted-foreground">
					Contact your organization owner if you believe this is a mistake.
				</CardContent>
			</Card>
		</div>
	);
};
