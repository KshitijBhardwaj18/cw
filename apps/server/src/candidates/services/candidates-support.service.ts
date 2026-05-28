import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import {
	candidateSupportRequestTemplate,
	orgMailBranding,
	sendMail,
} from "@repo/mail";
import { config } from "src/common/config";
import { PrismaService } from "src/prisma/prisma.service";
import {
	CANDIDATE_SUPPORT_CATEGORY_LABELS,
	type CandidateSupportCategory,
	type CandidateSupportRequestDto,
} from "../dto/candidate-support-request.dto";

@Injectable()
export class CandidatesSupportService {
	private readonly logger = new Logger(CandidatesSupportService.name);

	constructor(private readonly prisma: PrismaService) {}

	async submitSupportRequest(
		userId: string,
		organizationId: string,
		dto: CandidateSupportRequestDto,
	): Promise<{ ok: true }> {
		const [candidate, organization] = await Promise.all([
			this.prisma.candidate.findFirst({
				where: { userId, organizationId },
				select: {
					id: true,
					user: { select: { name: true, email: true } },
				},
			}),
			this.prisma.organization.findUnique({
				where: { id: organizationId },
				select: { name: true, logo: true },
			}),
		]);

		if (!candidate) {
			throw new NotFoundException(
				"Candidate profile not found for this organization.",
			);
		}
		if (!organization) {
			throw new NotFoundException("Organization not found.");
		}

		const candidateEmail = candidate.user?.email?.trim();
		if (!candidateEmail) {
			throw new BadRequestException(
				"Your account is missing an email address. Please contact support directly.",
			);
		}

		const supportEmail = config.mail.supportEmail?.trim();
		if (!supportEmail) {
			this.logger.error("Support email is not configured (SUPPORT_EMAIL).");
			throw new BadRequestException(
				"Support requests are not available right now. Please try again later.",
			);
		}

		const branding = orgMailBranding({
			orgName: organization.name,
			orgLogoUrl: organization.logo,
			staffLogicLogoUrl: config.mail.staffLogicLogoUrl,
			portal: "candidate",
		});

		const { subject, text, html } = candidateSupportRequestTemplate(branding, {
			candidateName: candidate.user?.name ?? "",
			candidateEmail,
			categoryLabel: this.categoryLabel(dto.category),
			subject: dto.subject,
			message: dto.message,
		});

		try {
			await sendMail(config.mail, {
				to: supportEmail,
				replyTo: candidateEmail,
				subject,
				text,
				html,
			});
		} catch (err) {
			this.logger.error(
				`Failed to send candidate support email (org=${organizationId}, candidate=${candidate.id})`,
				err instanceof Error ? err.stack : String(err),
			);
			throw new BadRequestException(
				"Could not send your support request right now. Please try again in a moment.",
			);
		}

		return { ok: true };
	}

	private categoryLabel(category: CandidateSupportCategory): string {
		return CANDIDATE_SUPPORT_CATEGORY_LABELS[category];
	}
}
