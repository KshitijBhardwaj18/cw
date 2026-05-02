import {
	ForbiddenException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from "@nestjs/common";
import { UserRole } from "@repo/db";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { authOrgInternal } from "src/common/auth";
import { config } from "src/common/config";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class OrgPortalDelegationService {
	constructor(private readonly prisma: PrismaService) {}

	async createDelegationLink(
		session: UserSession,
		organizationId: string,
	): Promise<{ url: string }> {
		const adminUserId = session.user.id;
		const actor = await this.prisma.user.findUnique({
			where: { id: adminUserId },
			select: { id: true, role: true, email: true },
		});
		if (!actor) {
			throw new ForbiddenException();
		}
		if (
			actor &&
			actor.role !== UserRole.SUPER_ADMIN &&
			actor.role !== UserRole.GENERAL_ADMIN
		) {
			const membership = await this.prisma.member.findFirst({
				where: { userId: actor.id, organizationId: organizationId },
			});
			if (!membership) {
				throw new ForbiddenException();
			}
		}

		const org = await this.prisma.organization.findUnique({
			where: { id: organizationId },
			select: { id: true, slug: true },
		});
		if (!org) {
			throw new NotFoundException("Organization not found");
		}

		const callbackURL = this.buildOrgPortalUrl(org.slug);

		const result = await authOrgInternal.api.createOrgDelegation({
			body: {
				userId: actor.id,
				organizationId: org.id,
				callbackURL,
				issuedByUserId: actor.id,
			},
		});
		if (!result?.url) {
			throw new InternalServerErrorException(
				"Failed to create delegation link",
			);
		}
		return { url: result.url };
	}

	private buildOrgPortalUrl(slug: string): string {
		const base = config.urls.orgPortalBaseUrl;
		try {
			const url = new URL(base);
			url.hostname = `${slug}.${url.hostname}`;
			url.pathname = "/org/command-center";
			url.search = "";
			url.hash = "";
			return url.toString();
		} catch {
			return base;
		}
	}
}
