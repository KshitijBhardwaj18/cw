import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { UserRole } from "@repo/db";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) {}

	async getMspOptions() {
		return this.prisma.mSP.findMany({
			select: { id: true, name: true },
		});
	}

	async validateMspExists(mspId: string) {
		const msp = await this.prisma.mSP.findUnique({
			where: { id: mspId },
			select: { id: true },
		});
		if (!msp) {
			throw new NotFoundException("MSP not found.");
		}
		return msp;
	}

	async getProgramUsers() {
		return this.prisma.user.findMany({
			where: {
				role: {
					notIn: [
						UserRole.VENDOR_USER,
						UserRole.ORGANIZATION_USER,
						UserRole.CANDIDATE_USER,
					],
				},
			},
		});
	}

	async getVendorUsers() {
		return this.prisma.user.findMany({
			where: {
				role: UserRole.VENDOR_USER,
				vendorUser: { isNot: null },
			},
			include: {
				vendorUser: { include: { vendor: true } },
			},
		});
	}

	async getOrganizationUsers() {
		return this.prisma.user.findMany({
			where: {
				role: UserRole.ORGANIZATION_USER,
				members: { some: {} },
			},
			include: {
				members: { include: { organization: true } },
			},
		});
	}

	/**
	 * Admin-side: directly bind the admin's session to any organization without
	 * a per-org access check — admins have access to all organizations.
	 */
	async setActiveOrganizationForAdmin(
		session: UserSession,
		organizationId: string,
	): Promise<void> {
		const userId = session.user.id;
		const actor = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { role: true },
		});
		if (
			!actor ||
			(actor.role !== UserRole.SUPER_ADMIN &&
				actor.role !== UserRole.GENERAL_ADMIN)
		) {
			throw new ForbiddenException(
				"You don't have permission to switch organizations.",
			);
		}

		await this.assertOrganizationExists(organizationId);

		const sessionRowId = await this.resolveSessionRowId(session, userId);

		await this.prisma.session.update({
			where: { id: sessionRowId },
			data: { activeOrganizationId: organizationId },
		});
	}

	private async resolveSessionRowId(
		session: UserSession,
		userId: string,
	): Promise<string> {
		const sessionPayload = session.session as { id?: string };
		let sessionRowId: string | undefined = sessionPayload?.id?.trim();

		if (sessionRowId) {
			const row = await this.prisma.session.findFirst({
				where: { id: sessionRowId, userId },
				select: { id: true },
			});
			if (!row) {
				sessionRowId = undefined;
			}
		}

		if (!sessionRowId) {
			const latest = await this.prisma.session.findFirst({
				where: { userId },
				orderBy: { createdAt: "desc" },
				select: { id: true },
			});
			if (!latest) {
				throw new ForbiddenException("No session found.");
			}
			sessionRowId = latest.id;
		}

		return sessionRowId;
	}

	private async assertOrganizationExists(
		organizationId: string,
	): Promise<void> {
		const org = await this.prisma.organization.findUnique({
			where: { id: organizationId },
			select: { id: true },
		});
		if (!org) {
			throw new NotFoundException("Organization not found.");
		}
	}
}
