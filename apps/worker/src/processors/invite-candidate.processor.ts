import type { PrismaClient } from "@repo/db";
import { BackGroundJobStatus, CandidateInviteStatus } from "@repo/db";
import { candidateInviteTemplate, sendMail } from "@repo/mail";
import type {
	InviteCandidateJobResult,
	InviteCandidatePayload,
} from "@repo/shared";
import { config } from "../config.js";

export async function runInviteCandidateProcessor(
	prisma: PrismaClient,
	payload: InviteCandidatePayload,
): Promise<void> {
	const { jobId, organizationId, candidateId, magicLinkUrl } = payload;

	const candidate = await prisma.candidate.findFirst({
		where: { id: candidateId, organizationId },
		include: {
			user: { select: { email: true, name: true } },
			organization: { select: { name: true } },
		},
	});

	if (!candidate?.organization) {
		const jobResult: InviteCandidateJobResult = {
			sent: false,
			error: "Candidate not found",
		};
		await prisma.backGroundJob.update({
			where: { id: jobId },
			data: {
				status: BackGroundJobStatus.FAILED,
				result: jobResult as object,
				completedAt: new Date(),
			},
		});
		throw new Error("Candidate not found");
	}

	const email = candidate.user.email;
	const orgName = candidate.organization.name;
	const { subject, text } = candidateInviteTemplate(orgName, magicLinkUrl);

	try {
		await sendMail(config.mail, { to: email, subject, text });
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
			prisma.candidate.update({
				where: { id: candidateId },
				data: { invitedAt: now },
			}),
		]);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Failed to send email";
		const jobResult: InviteCandidateJobResult = { sent: false, error: message };
		await Promise.all([
			prisma.backGroundJob.update({
				where: { id: jobId },
				data: {
					status: BackGroundJobStatus.FAILED,
					result: jobResult as object,
					completedAt: new Date(),
				},
			}),
			prisma.candidate.update({
				where: { id: candidateId },
				data: { inviteStatus: CandidateInviteStatus.EXPIRED },
			}),
		]);
		throw err;
	}
}
