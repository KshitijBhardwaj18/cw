import { randomUUID } from "node:crypto";
import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import type { InvoiceStatus, Prisma, RequisitionStatus } from "@repo/db";
import type {
	MspFinancialSummary,
	MspLinkedOrgWithOrganization,
} from "@repo/shared";
import { S3_PREFIX_ORGANIZATION_DOCS, validatePdfDocument } from "@repo/shared";
import { FilesService } from "../../files/files.service";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateMspLinkedOrgDto } from "../dto/create-msp-linked-org.dto";
import type { UpdateMspLinkedOrgDto } from "../dto/update-msp-linked-org.dto";

const ADDENDUM_SIGNED_URL_EXPIRES_IN = 3600;
const ADDENDUM_FOLDER = "addendums";

const PORTFOLIO_REQUISITION_STATUSES: RequisitionStatus[] = [
	"PENDING_APPROVAL",
	"SCHEDULED",
	"PUBLISHED",
];

const INVOICED_STATUSES: InvoiceStatus[] = [
	"SUBMITTED",
	"APPROVED",
	"SENT",
	"PAID",
	"OVERDUE",
	"DISPUTED",
];

type PortfolioRow = { organizationId: string; portfolioValue: number };

@Injectable()
export class MspLinkedOrgsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly filesService: FilesService,
	) {}

	async list(mspId: string): Promise<MspLinkedOrgWithOrganization[]> {
		await this.ensureMspExists(mspId);

		const links = await this.prisma.mSPLinkedOrg.findMany({
			where: { mspId },
			include: { organization: { select: { id: true, name: true } } },
			orderBy: { createdAt: "desc" },
		});

		const orgIds = links.map((l) => l.organizationId);
		const [portfolioByOrg, invoicedByOrg] = await Promise.all([
			this.computePortfolioByOrg(orgIds),
			this.computeYtdInvoicedByOrg(orgIds),
		]);

		return links.map((link) =>
			this.toResponse(link, portfolioByOrg, invoicedByOrg),
		);
	}

	async create(
		mspId: string,
		dto: CreateMspLinkedOrgDto,
	): Promise<MspLinkedOrgWithOrganization> {
		await this.ensureMspExists(mspId);

		const org = await this.prisma.organization.findUnique({
			where: { id: dto.organizationId },
			select: { id: true },
		});
		if (!org) {
			throw new NotFoundException("Organization not found.");
		}

		this.validateAgreementDates(dto.startDate, dto.renewalDate);

		const duplicate = await this.prisma.mSPLinkedOrg.findUnique({
			where: {
				msp_org_unique: {
					mspId,
					organizationId: dto.organizationId,
				},
			},
			select: { id: true },
		});
		if (duplicate) {
			throw new ConflictException(
				"This organization is already linked to the MSP",
			);
		}

		const created = await this.prisma.mSPLinkedOrg.create({
			data: {
				mspId,
				organizationId: dto.organizationId,
				addendumAgreement: dto.addendumAgreement,
				addendumAgreementFileName: dto.addendumAgreementFileName ?? null,
				addendumAgreementUploadedAt: dto.addendumAgreement ? new Date() : null,
				addendumRevisionDate: dto.addendumRevisionDate
					? new Date(dto.addendumRevisionDate)
					: null,
				mspFeePercentage: dto.mspFeePercentage,
				saasFeePercentage: dto.saasFeePercentage,
				startDate: new Date(dto.startDate),
				renewalDate: new Date(dto.renewalDate),
				possibleCancellationDate: dto.possibleCancellationDate
					? new Date(dto.possibleCancellationDate)
					: null,
			},
			include: { organization: { select: { id: true, name: true } } },
		});

		const [portfolioByOrg, invoicedByOrg] = await Promise.all([
			this.computePortfolioByOrg([created.organizationId]),
			this.computeYtdInvoicedByOrg([created.organizationId]),
		]);

		return this.toResponse(created, portfolioByOrg, invoicedByOrg);
	}

	async update(
		mspId: string,
		linkedOrgId: string,
		dto: UpdateMspLinkedOrgDto,
	): Promise<MspLinkedOrgWithOrganization> {
		const existing = await this.findOneOrThrow(mspId, linkedOrgId);

		const nextStart = dto.startDate
			? new Date(dto.startDate)
			: existing.startDate;
		const nextRenewal = dto.renewalDate
			? new Date(dto.renewalDate)
			: existing.renewalDate;
		if (nextRenewal.getTime() <= nextStart.getTime()) {
			throw new BadRequestException("Renewal date must be after start date.");
		}

		const data: Prisma.MSPLinkedOrgUpdateInput = {};
		if (dto.addendumAgreement !== undefined) {
			data.addendumAgreement = dto.addendumAgreement;
			data.addendumAgreementFileName = dto.addendumAgreementFileName ?? null;
			data.addendumAgreementUploadedAt = new Date();
		}
		if (dto.addendumRevisionDate !== undefined) {
			data.addendumRevisionDate = dto.addendumRevisionDate
				? new Date(dto.addendumRevisionDate)
				: null;
		}
		if (dto.mspFeePercentage !== undefined) {
			data.mspFeePercentage = dto.mspFeePercentage;
		}
		if (dto.saasFeePercentage !== undefined) {
			data.saasFeePercentage = dto.saasFeePercentage;
		}
		if (dto.startDate !== undefined) {
			data.startDate = new Date(dto.startDate);
		}
		if (dto.renewalDate !== undefined) {
			data.renewalDate = new Date(dto.renewalDate);
		}
		if (dto.possibleCancellationDate !== undefined) {
			data.possibleCancellationDate = dto.possibleCancellationDate
				? new Date(dto.possibleCancellationDate)
				: null;
		}

		const updated = await this.prisma.mSPLinkedOrg.update({
			where: { id: linkedOrgId },
			data,
			include: { organization: { select: { id: true, name: true } } },
		});

		const [portfolioByOrg, invoicedByOrg] = await Promise.all([
			this.computePortfolioByOrg([updated.organizationId]),
			this.computeYtdInvoicedByOrg([updated.organizationId]),
		]);

		return this.toResponse(updated, portfolioByOrg, invoicedByOrg);
	}

	async delete(mspId: string, linkedOrgId: string): Promise<void> {
		await this.findOneOrThrow(mspId, linkedOrgId);
		await this.prisma.mSPLinkedOrg.delete({ where: { id: linkedOrgId } });
	}

	async getAgreementSignedUrl(
		mspId: string,
		linkedOrgId: string,
	): Promise<string> {
		const link = await this.findOneOrThrow(mspId, linkedOrgId);
		if (!link.addendumAgreement) {
			throw new NotFoundException(
				"Addendum agreement not found for this link.",
			);
		}
		return this.filesService.getSignedUrl(
			link.addendumAgreement,
			ADDENDUM_SIGNED_URL_EXPIRES_IN,
		);
	}

	async getFinancialSummary(mspId: string): Promise<MspFinancialSummary> {
		await this.ensureMspExists(mspId);

		const links = await this.prisma.mSPLinkedOrg.findMany({
			where: { mspId },
			select: {
				organizationId: true,
				mspFeePercentage: true,
				saasFeePercentage: true,
			},
		});

		if (links.length === 0) {
			return {
				totalPortfolioValue: 0,
				totalExpectedMspRevenue: 0,
				totalExpectedSasRevenue: 0,
				totalYtdInvoicedAmount: 0,
				linkedOrgCount: 0,
			};
		}

		const orgIds = links.map((l) => l.organizationId);
		const [portfolioByOrg, invoicedByOrg] = await Promise.all([
			this.computePortfolioByOrg(orgIds),
			this.computeYtdInvoicedByOrg(orgIds),
		]);

		let totalPortfolioValue = 0;
		let totalExpectedMspRevenue = 0;
		let totalExpectedSasRevenue = 0;
		let totalYtdInvoicedAmount = 0;

		for (const link of links) {
			const portfolio = portfolioByOrg.get(link.organizationId) ?? 0;
			const ytd = invoicedByOrg.get(link.organizationId) ?? 0;
			totalPortfolioValue += portfolio;
			totalExpectedMspRevenue += (portfolio * link.mspFeePercentage) / 100;
			totalExpectedSasRevenue += (portfolio * link.saasFeePercentage) / 100;
			totalYtdInvoicedAmount += ytd;
		}

		return {
			totalPortfolioValue: round2(totalPortfolioValue),
			totalExpectedMspRevenue: round2(totalExpectedMspRevenue),
			totalExpectedSasRevenue: round2(totalExpectedSasRevenue),
			totalYtdInvoicedAmount: round2(totalYtdInvoicedAmount),
			linkedOrgCount: links.length,
		};
	}

	async uploadAddendum(
		mspId: string,
		file: Express.Multer.File,
	): Promise<{ key: string; fileName: string }> {
		await this.ensureMspExists(mspId);
		const err = validatePdfDocument(file, "Addendum agreement");
		if (err) throw new BadRequestException(err);
		const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
		const key = `${S3_PREFIX_ORGANIZATION_DOCS}/${ADDENDUM_FOLDER}/${mspId}/${randomUUID()}_${safeName}`;
		const result = await this.filesService.uploadFile(file, key);
		return { key: result.key, fileName: file.originalname };
	}

	private async findOneOrThrow(mspId: string, linkedOrgId: string) {
		const link = await this.prisma.mSPLinkedOrg.findFirst({
			where: { id: linkedOrgId, mspId },
		});
		if (!link) {
			throw new NotFoundException(
				"Linked organization not found for this MSP.",
			);
		}
		return link;
	}

	private async ensureMspExists(mspId: string): Promise<void> {
		const msp = await this.prisma.mSP.findUnique({
			where: { id: mspId },
			select: { id: true },
		});
		if (!msp) {
			throw new NotFoundException("MSP not found.");
		}
	}

	private validateAgreementDates(startISO: string, renewalISO: string) {
		const start = new Date(startISO);
		const renewal = new Date(renewalISO);
		if (Number.isNaN(start.getTime()) || Number.isNaN(renewal.getTime())) {
			throw new BadRequestException("Invalid agreement dates.");
		}
		if (renewal.getTime() <= start.getTime()) {
			throw new BadRequestException("Renewal date must be after start date.");
		}
	}

	private async computePortfolioByOrg(
		orgIds: string[],
	): Promise<Map<string, number>> {
		const result = new Map<string, number>();
		if (orgIds.length === 0) return result;

		const rows = await this.prisma.$queryRaw<PortfolioRow[]>`
			SELECT
				r."organizationId" AS "organizationId",
				COALESCE(SUM(
					r."billRate"
					* r."hoursPerWeek"
					* r."lengthWeeks"
					* r."numberOfPositions"
				), 0)::float8 AS "portfolioValue"
			FROM "requisition" r
			WHERE r."organizationId" = ANY(${orgIds}::uuid[])
				AND r."status"::text = ANY(${PORTFOLIO_REQUISITION_STATUSES}::text[])
				AND r."billRate" IS NOT NULL
				AND r."hoursPerWeek" IS NOT NULL
				AND r."lengthWeeks" IS NOT NULL
			GROUP BY r."organizationId"
		`;

		for (const row of rows) {
			result.set(row.organizationId, round2(Number(row.portfolioValue) || 0));
		}
		return result;
	}

	private async computeYtdInvoicedByOrg(
		orgIds: string[],
	): Promise<Map<string, number>> {
		const result = new Map<string, number>();
		if (orgIds.length === 0) return result;

		const yearStart = new Date(Date.UTC(new Date().getUTCFullYear(), 0, 1));

		const grouped = await this.prisma.invoice.groupBy({
			by: ["organizationId"],
			where: {
				organizationId: { in: orgIds },
				status: { in: INVOICED_STATUSES },
				invoiceDate: { gte: yearStart },
			},
			_sum: { totalAmount: true },
		});

		for (const row of grouped) {
			result.set(row.organizationId, round2(row._sum.totalAmount ?? 0));
		}
		return result;
	}

	private toResponse(
		link: Prisma.MSPLinkedOrgGetPayload<{
			include: { organization: { select: { id: true; name: true } } };
		}>,
		portfolioByOrg: Map<string, number>,
		invoicedByOrg: Map<string, number>,
	): MspLinkedOrgWithOrganization {
		const portfolioValue = portfolioByOrg.get(link.organizationId) ?? 0;
		const ytd = invoicedByOrg.get(link.organizationId) ?? 0;
		const expectedMspRevenue = round2(
			(portfolioValue * link.mspFeePercentage) / 100,
		);
		const expectedSasRevenue = round2(
			(portfolioValue * link.saasFeePercentage) / 100,
		);
		const { addendumAgreement: _addendum, ...rest } = link;
		return {
			...rest,
			hasAddendumAgreement: !!link.addendumAgreement,
			portfolioValue,
			expectedMspRevenue,
			expectedSasRevenue,
			ytdInvoicedAmount: ytd,
		};
	}
}

function round2(value: number): number {
	if (!Number.isFinite(value)) return 0;
	return Math.round(value * 100) / 100;
}
