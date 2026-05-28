"use client";

import type { Action, AppSubjects } from "@repo/casl";
import { useAbility } from "@repo/casl";
import { AccessDenied } from "./AccessDenied";

interface PermissionsGuardProps {
	permissions: {
		action: Action;
		subject: AppSubjects;
	}[];
	/** When `"any"`, at least one permission must pass (default: all must pass). */
	match?: "all" | "any";
	children: React.ReactNode;
	fallback?: React.ReactNode;
}

export function PermissionsGuard({
	permissions,
	match = "all",
	children,
	fallback,
}: Readonly<PermissionsGuardProps>) {
	const ability = useAbility();
	const canAccess =
		match === "any"
			? permissions.some((permission) =>
					ability.can(permission.action, permission.subject),
				)
			: permissions.every((permission) =>
					ability.can(permission.action, permission.subject),
				);
	if (!canAccess) {
		return (
			fallback || (
				<AccessDenied
					permissions={permissions.map((permission) => ({
						action: permission.action.toString(),
						subject: permission.subject.toString(),
					}))}
				/>
			)
		);
	}
	return children;
}

export default PermissionsGuard;
