import { ForbiddenException } from "@nestjs/common";
import { UserRole } from "@repo/db";
import { isAdminPortalRole, VendorUserRole } from "@repo/shared";
import type { UserSession } from "@thallesp/nestjs-better-auth";

export type VendorActorContext = {
	vendorId: string;
	vendorUserId: string;
	vendorUserRole: VendorUserRole | null;
};

export function resolveVendorActor(session?: UserSession): VendorActorContext {
	if (!session?.session) {
		throw new ForbiddenException("Sign in required.");
	}

	const roleRaw = session.user.role;
	const role = Array.isArray(roleRaw) ? roleRaw[0] : roleRaw;

	if (role === UserRole.ORGANIZATION_USER || isAdminPortalRole(role)) {
		return {
			vendorId: "",
			vendorUserId: "",
			vendorUserRole: null,
		};
	}

	if (role !== UserRole.VENDOR_USER) {
		throw new ForbiddenException("Vendor profile required.");
	}

	const s = session.session as {
		vendorId?: string | null;
		vendorUserId?: string | null;
	};

	const vendorId = s.vendorId?.trim() ?? "";
	const vendorUserId = s.vendorUserId?.trim() ?? "";
	const userWithSubRole = session.user as typeof session.user & {
		subRole?: VendorUserRole | null;
	};
	const vendorUserRole = userWithSubRole?.subRole;

	if (!vendorId || !vendorUserId || !vendorUserRole) {
		throw new ForbiddenException(
			"Vendor session is incomplete. Please sign out and sign in again.",
		);
	}

	return {
		vendorId,
		vendorUserId,
		vendorUserRole,
	};
}

export function requireVendorPortalActor(
	session: UserSession,
): VendorActorContext {
	const ctx = resolveVendorActor(session);
	const roleRaw = session.user.role;
	const role = Array.isArray(roleRaw) ? roleRaw[0] : roleRaw;
	if (role !== UserRole.VENDOR_USER || !ctx.vendorId) {
		throw new ForbiddenException("Vendor portal access required.");
	}
	return ctx;
}
