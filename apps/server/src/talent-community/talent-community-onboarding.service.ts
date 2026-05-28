import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { CandidateInviteStatus, UserRole } from "@repo/db";
import { BackgroundJobsService } from "src/background-jobs/background-jobs.service";
import { PrismaService } from "src/prisma/prisma.service";
import { INVITE_TOKEN_EXPIRY_HOURS } from "./constants";
import type { OnboardingSelfStartDto } from "./dto/onboarding-self-start.dto";

@Injectable()
export class TalentCommunityOnboardingService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly backgroundJobs: BackgroundJobsService,
	) {}

	async validateInviteToken(token: string) {
		const candidate = await this.prisma.candidate.findFirst({
			where: {
				inviteToken: token,
				inviteStatus: CandidateInviteStatus.PENDING,
			},
			include: {
				user: { select: { email: true, name: true } },
				organization: { select: { id: true, name: true, slug: true } },
				occupation: { select: { id: true, name: true } },
			},
		});

		if (!candidate) {
			throw new BadRequestException("Invalid or expired invite token.");
		}

		await this.assertInviteNotExpired(
			candidate.id,
			this.getInviteExpiry(candidate),
		);

		return {
			valid: true,
			userId: candidate.userId,
			organizationId: candidate.organizationId,
			organizationName: candidate.organization?.name,
			organizationSlug: candidate.organization?.slug,
			candidateId: candidate.id,
			email: candidate.user.email,
			name: candidate.user.name,
			occupationId: candidate.occupationId,
			occupationName: candidate.occupation?.name,
		};
	}

	private getInviteExpiry(candidate: {
		invitedAt: Date | null;
		inviteTokenExpiresAt: Date | null;
	}) {
		const inviteTokenExpiresAt = candidate.inviteTokenExpiresAt;
		if (inviteTokenExpiresAt) return inviteTokenExpiresAt;
		if (!candidate.invitedAt) return null;
		const d = new Date(candidate.invitedAt);
		d.setHours(d.getHours() + INVITE_TOKEN_EXPIRY_HOURS);
		return d;
	}

	private async assertInviteNotExpired(
		candidateId: string,
		expiry: Date | null,
	) {
		const now = new Date();
		if (!expiry || now > expiry) {
			await this.prisma.candidate.update({
				where: { id: candidateId },
				data: {
					inviteStatus: CandidateInviteStatus.EXPIRED,
					inviteToken: null,
					inviteTokenExpiresAt: null,
				},
			});
			throw new BadRequestException("Invite token has expired.");
		}
	}

	async startSelfOnboarding(orgId: string, dto: OnboardingSelfStartDto) {
		const org = await this.prisma.organization.findUnique({
			where: { id: orgId },
			select: { id: true },
		});
		if (!org) {
			throw new NotFoundException("Organization not found.");
		}

		const existing = await this.prisma.user.findUnique({
			where: { email: dto.email },
			select: { id: true },
		});

		if (existing) {
			const alreadyCandidate = await this.prisma.candidate.findFirst({
				where: { userId: existing.id, organizationId: orgId },
				select: { id: true },
			});
			if (alreadyCandidate) {
				return {
					success: true,
					message:
						"Account already exists. Check your email for a one-time code to sign in.",
				};
			}
		}

		const fullName = `${dto.firstName} ${dto.lastName}`.trim();

		const firstOrgOccupation =
			await this.prisma.organizationOccupation.findFirst({
				where: { organizationId: orgId },
				select: { occupationId: true },
			});
		if (!firstOrgOccupation) {
			throw new BadRequestException(
				"Organization has no occupations configured. Please contact your administrator.",
			);
		}

		const newCandidateId = await this.prisma.$transaction(async (tx) => {
			const user = existing
				? await tx.user.update({
						where: { id: existing.id },
						data: { name: fullName },
					})
				: await tx.user.create({
						data: {
							name: fullName,
							email: dto.email,
							role: UserRole.CANDIDATE_USER,
						},
					});

			const created = await tx.candidate.create({
				data: {
					userId: user.id,
					occupationId: firstOrgOccupation.occupationId,
					organizationId: orgId,
					workforceType: null,
					inviteStatus: null,
				},
				select: { id: true },
			});
			await tx.candidateSummary.create({
				data: {
					candidateId: created.id,
					organizationId: orgId,
					occupationId: firstOrgOccupation.occupationId,
				},
			});
			return created.id;
		});

		await this.backgroundJobs.enqueueCandidateSummary(newCandidateId);

		return {
			success: true,
			message:
				"Account created. Check your email for a one-time code to sign in.",
		};
	}
}
