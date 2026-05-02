import { OrganizationMemberStatus, UserRole } from "@repo/db";
import type { PrismaService } from "src/prisma/prisma.service";

export async function resolveUserSubRole(
	prisma: PrismaService,
	userId: string,
	userRole: UserRole,
	organizationId: string,
): Promise<string | null> {
	switch (userRole) {
		case UserRole.ORGANIZATION_USER: {
			const member = await prisma.member.findFirst({
				where: {
					userId,
					organizationId,
					status: OrganizationMemberStatus.ACTIVE,
				},
				select: { role: true },
			});
			return member?.role ?? null;
		}
		case UserRole.VENDOR_USER: {
			const vendorUser = await prisma.vendorUser.findUnique({
				where: { userId },
				select: { role: true },
			});
			return vendorUser?.role ?? null;
		}
		case UserRole.CANDIDATE_USER: {
			const candidate = await prisma.candidate.findFirst({
				where: { userId, organizationId },
				select: { workforceType: true },
			});
			return candidate?.workforceType ?? null;
		}
		default:
			return null;
	}
}
