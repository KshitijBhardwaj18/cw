import type { Prisma } from "@repo/db";

/**
 * Prisma-driven: Session fields used for profile/session management UI.
 * ipAddress/userAgent are optional to match Better Auth listSessions response.
 */
export type SessionItem = Omit<
	Prisma.SessionGetPayload<{
		select: {
			id: true;
			token: true;
			expiresAt: true;
			ipAddress: true;
			userAgent: true;
			createdAt: true;
			updatedAt: true;
			userId: true;
		};
	}>,
	"ipAddress" | "userAgent"
> & {
	ipAddress?: string | null | undefined;
	userAgent?: string | null | undefined;
};

/**
 * Prisma-driven: profile view of User (subset of fields for profile UI).
 * role is string for API compatibility (Better Auth may return string).
 */
export type ProfileUser = Omit<
	Prisma.UserGetPayload<{
		select: {
			id: true;
			email: true;
			name: true;
			emailVerified: true;
			role: true;
			subRole: true;
			phoneNumber: true;
			officePhone: true;
			timeZone: true;
		};
	}>,
	"role"
> & { role: string };
