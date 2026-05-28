import type { PrismaClient } from "@repo/db";
import { BackGroundJobStatus, MemberInviteStatus } from "@repo/db";
import { inviteTemplate, orgMailBranding, sendMail } from "@repo/mail";
import type {
	InviteBulkJobResult,
	InviteBulkPayload,
	InviteSingleJobResult,
	InviteSinglePayload,
} from "@repo/shared";
import { config } from "../config.js";

function buildOrgSignInUrl(baseUrl: string, slug: string): string {
	const url = new URL(baseUrl);
	url.hostname = `${slug}.${url.hostname}`;
	return `${url.origin}/sign-in`;
}

export async function runInviteSingleProcessor(
	prisma: PrismaClient,
	payload: InviteSinglePayload,
): Promise<void> {
	const { jobId, organizationId, memberId } = payload;
	const member = await prisma.member.findFirst({
		where: { id: memberId, organizationId },
		include: {
			user: { select: { email: true, name: true } },
			organization: { select: { name: true, slug: true, logo: true } },
		},
	});
	if (!member) {
		const jobResult: InviteSingleJobResult = {
			sent: false,
			error: "Member not found",
		};
		await prisma.backGroundJob.update({
			where: { id: jobId },
			data: {
				status: BackGroundJobStatus.FAILED,
				result: jobResult as object,
				completedAt: new Date(),
			},
		});
		throw new Error("Member not found");
	}
	const email = member.user.email;
	const orgName = member.organization.name;
	const signInUrl = buildOrgSignInUrl(
		config.orgPortalBaseUrl,
		member.organization.slug,
	);
	const branding = orgMailBranding({
		orgName: orgName,
		orgLogoUrl: member.organization.logo,
		staffLogicLogoUrl: config.mail.staffLogicLogoUrl,
		portal: "organization",
	});
	const { subject, text, html } = inviteTemplate(branding, signInUrl);
	try {
		await sendMail(config.mail, {
			to: email,
			subject,
			text,
			html,
		});
		const now = new Date();
		await Promise.all([
			prisma.backGroundJob.update({
				where: { id: jobId },
				data: {
					status: BackGroundJobStatus.COMPLETED,
					result: { sent: true } as object,
					completedAt: now,
				},
			}),
			prisma.member.update({
				where: { id: memberId },
				data: {
					lastInviteStatus: MemberInviteStatus.SENT,
					lastInviteAt: now,
					lastInviteScheduledFor: null,
				},
			}),
		]);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Failed to send email";
		const jobResult: InviteSingleJobResult = { sent: false, error: message };
		await Promise.all([
			prisma.backGroundJob.update({
				where: { id: jobId },
				data: {
					status: BackGroundJobStatus.FAILED,
					result: jobResult as object,
					completedAt: new Date(),
				},
			}),
			prisma.member.update({
				where: { id: memberId },
				data: { lastInviteStatus: MemberInviteStatus.FAILED },
			}),
		]);
		throw err;
	}
}

export async function runInviteBulkProcessor(
	prisma: PrismaClient,
	payload: InviteBulkPayload,
): Promise<void> {
	const { jobId, organizationId, memberIds } = payload;
	await prisma.backGroundJob.update({
		where: { id: jobId },
		data: { status: BackGroundJobStatus.PROCESSING },
	});
	const members = await prisma.member.findMany({
		where: { id: { in: memberIds }, organizationId },
		include: {
			user: { select: { email: true, name: true } },
			organization: { select: { name: true, slug: true, logo: true } },
		},
	});
	const result: InviteBulkJobResult = {
		sent: 0,
		failed: 0,
		errors: [],
	};
	for (const member of members) {
		const email = member.user.email;
		const orgName = member.organization.name;
		const signInUrl = buildOrgSignInUrl(
			config.orgPortalBaseUrl,
			member.organization.slug,
		);
		const branding = orgMailBranding({
			orgName,
			orgLogoUrl: member.organization.logo,
			staffLogicLogoUrl: config.mail.staffLogicLogoUrl,
			portal: "organization",
		});
		const { subject, text, html } = inviteTemplate(branding, signInUrl);
		try {
			await sendMail(config.mail, { to: email, subject, text, html });
			const now = new Date();
			result.sent += 1;
			await prisma.member.update({
				where: { id: member.id },
				data: {
					lastInviteStatus: MemberInviteStatus.SENT,
					lastInviteAt: now,
					lastInviteScheduledFor: null,
				},
			});
		} catch (err) {
			result.failed += 1;
			result.errors.push({
				memberId: member.id,
				email,
				message: err instanceof Error ? err.message : "Failed to send",
			});
			await prisma.member.update({
				where: { id: member.id },
				data: { lastInviteStatus: MemberInviteStatus.FAILED },
			});
		}
	}
	await prisma.backGroundJob.update({
		where: { id: jobId },
		data: {
			status: BackGroundJobStatus.COMPLETED,
			result: result as object,
			completedAt: new Date(),
		},
	});
}
