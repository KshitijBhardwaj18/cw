import { randomUUID } from "node:crypto";
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import {
	type CandidateComplianceStatus,
	type CandidateWorkforceType,
	ComplianceListItemResponseStyle,
} from "@repo/db";
import { S3_PREFIX_COMPLIANCE_DOCS } from "@repo/shared";
import { FilesService } from "src/files/files.service";
import { PrismaService } from "src/prisma/prisma.service";
import { resolveComplianceStatusOnUpload } from "../utils/resolve-compliance-status-on-upload";
import { resolveExpiryForUpload } from "../utils/resolve-expiry-for-upload";

type WorkforceTypeArg = `${CandidateWorkforceType}` | null;

export type CandidateComplianceWriteResult = {
	candidateId: string;
	complianceListItemId: string;
	status: CandidateComplianceStatus;
};

export type WriteUploadInput = {
	candidateId: string;
	workforceType: WorkforceTypeArg;
	complianceListItemId: string;
	file: Express.Multer.File;
	expiryDateRaw?: string;
	issueDateRaw?: string;
	userId: string;
	/**
	 * S3 key path segment between the global compliance prefix and the random
	 * filename. Examples:
	 *   `${orgId}/candidate-wallet/${candidateId}/${complianceListItemId}`
	 *   `${orgId}/${placementId}/${complianceListItemId}`
	 */
	s3KeyPath: string;
};

export type WriteMarkLinkSubmittedInput = {
	candidateId: string;
	workforceType: WorkforceTypeArg;
	complianceListItemId: string;
	userId: string;
};

@Injectable()
export class CandidateComplianceWriteService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly filesService: FilesService,
	) {}

	async listAllowedComplianceItemsForRequisition(
		organizationId: string,
		requisitionId: string,
	): Promise<Set<string>> {
		const req = await this.prisma.requisition.findFirst({
			where: { id: requisitionId, organizationId },
			select: {
				id: true,
				acceptanceCriteria: {
					select: {
						complianceListItemId: true,
						complianceListItem: {
							select: {
								displayToCandidate: true,
								responseStyle: true,
							},
						},
					},
				},
			},
		});
		if (!req) throw new NotFoundException("Job not found.");

		const allowed = new Set<string>();
		for (const c of req.acceptanceCriteria) {
			if (
				c.complianceListItem.displayToCandidate &&
				c.complianceListItem.responseStyle !==
					ComplianceListItemResponseStyle.INTERNAL_TASK
			) {
				allowed.add(c.complianceListItemId);
			}
		}
		return allowed;
	}

	async listAllowedComplianceItemsForPlacement(
		organizationId: string,
		placementId: string,
	): Promise<Set<string>> {
		const placement = await this.prisma.placement.findFirst({
			where: { id: placementId, organizationId },
			select: {
				id: true,
				requisitionId: true,
				placementComplianceItems: {
					where: { removedAt: null },
					select: {
						complianceListItemId: true,
						complianceListItem: {
							select: {
								displayToCandidate: true,
								responseStyle: true,
							},
						},
					},
				},
			},
		});
		if (!placement) throw new NotFoundException("Placement not found.");

		const allowed = new Set<string>();
		for (const p of placement.placementComplianceItems) {
			if (
				p.complianceListItem.displayToCandidate &&
				p.complianceListItem.responseStyle !==
					ComplianceListItemResponseStyle.INTERNAL_TASK
			) {
				allowed.add(p.complianceListItemId);
			}
		}

		if (placement.requisitionId) {
			const reqAllowed = await this.listAllowedComplianceItemsForRequisition(
				organizationId,
				placement.requisitionId,
			);
			for (const id of reqAllowed) allowed.add(id);
		}

		return allowed;
	}

	async assertComplianceListItemOnPlacement(
		organizationId: string,
		placementId: string,
		complianceListItemId: string,
	): Promise<void> {
		const allowed = await this.listAllowedComplianceItemsForPlacement(
			organizationId,
			placementId,
		);
		if (!allowed.has(complianceListItemId)) {
			throw new NotFoundException(
				"This compliance item is not part of this placement",
			);
		}
	}

	async writeUpload(
		input: WriteUploadInput,
	): Promise<CandidateComplianceWriteResult> {
		const listItem = await this.prisma.complianceListItem.findUnique({
			where: { id: input.complianceListItemId },
			select: {
				expirationType: true,
				expirationRuleValue: true,
				expirationRuleUnit: true,
			},
		});
		if (!listItem) {
			throw new NotFoundException("Compliance list item not found.");
		}

		const { issueDate, expiryDate } = resolveExpiryForUpload(
			listItem,
			input.expiryDateRaw,
			input.issueDateRaw,
		);

		const original = input.file.originalname ?? "upload";
		const ext =
			original.includes(".") && original.lastIndexOf(".") < original.length - 1
				? original.slice(original.lastIndexOf(".") + 1).replace(/[^\w.-]/g, "")
				: "bin";
		const safeExt = ext.length > 16 ? "bin" : ext || "bin";
		const key = `${S3_PREFIX_COMPLIANCE_DOCS}/${input.s3KeyPath}/${randomUUID()}.${safeExt}`;

		const { key: documentUrl } = await this.filesService.uploadFileBuffer(
			input.file.buffer,
			key,
			input.file.mimetype || "application/octet-stream",
		);
		const documentFileName = original || "document";

		const now = new Date();
		const statusOnUpload = resolveComplianceStatusOnUpload(
			input.workforceType,
			input.userId,
			now,
		);

		await this.prisma.candidateCompliance.upsert({
			where: {
				candidateId_complianceListItemId: {
					candidateId: input.candidateId,
					complianceListItemId: input.complianceListItemId,
				},
			},
			update: {
				documentUrl,
				documentFileName,
				uploadedById: input.userId,
				uploadedAt: now,
				issueDate,
				expiryDate,
				status: statusOnUpload.status,
				verifiedById: statusOnUpload.verifiedById,
				verifiedAt: statusOnUpload.verifiedAt,
			},
			create: {
				candidateId: input.candidateId,
				complianceListItemId: input.complianceListItemId,
				documentUrl,
				documentFileName,
				uploadedById: input.userId,
				uploadedAt: now,
				issueDate,
				expiryDate,
				status: statusOnUpload.status,
				verifiedById: statusOnUpload.verifiedById,
				verifiedAt: statusOnUpload.verifiedAt,
			},
		});

		return {
			candidateId: input.candidateId,
			complianceListItemId: input.complianceListItemId,
			status: statusOnUpload.status,
		};
	}

	async writeMarkLinkSubmitted(
		input: WriteMarkLinkSubmittedInput,
	): Promise<CandidateComplianceWriteResult> {
		const listItem = await this.prisma.complianceListItem.findUnique({
			where: { id: input.complianceListItemId },
			select: { responseStyle: true },
		});
		if (!listItem) {
			throw new NotFoundException("Compliance list item not found.");
		}
		if (listItem.responseStyle !== ComplianceListItemResponseStyle.LINK) {
			throw new BadRequestException(
				"This compliance item is not a link-based response",
			);
		}

		const now = new Date();
		const statusOnUpload = resolveComplianceStatusOnUpload(
			input.workforceType,
			input.userId,
			now,
		);

		await this.prisma.candidateCompliance.upsert({
			where: {
				candidateId_complianceListItemId: {
					candidateId: input.candidateId,
					complianceListItemId: input.complianceListItemId,
				},
			},
			update: {
				documentUrl: null,
				documentFileName: null,
				uploadedById: input.userId,
				uploadedAt: now,
				issueDate: null,
				expiryDate: null,
				status: statusOnUpload.status,
				verifiedById: statusOnUpload.verifiedById,
				verifiedAt: statusOnUpload.verifiedAt,
			},
			create: {
				candidateId: input.candidateId,
				complianceListItemId: input.complianceListItemId,
				uploadedById: input.userId,
				uploadedAt: now,
				status: statusOnUpload.status,
				verifiedById: statusOnUpload.verifiedById,
				verifiedAt: statusOnUpload.verifiedAt,
			},
		});

		return {
			candidateId: input.candidateId,
			complianceListItemId: input.complianceListItemId,
			status: statusOnUpload.status,
		};
	}
}
