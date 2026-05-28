import { randomUUID } from "node:crypto";
import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import type { DocumentType } from "@repo/db";
import {
	S3_PREFIX_ORGANIZATION_DOCS,
	S3_PREFIX_ORGANIZATION_DOCUMENTS,
	S3_PREFIX_VENDOR_DOCUMENTS,
	validatePdfDocument,
} from "@repo/shared";
import { FilesService } from "../files/files.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDocumentDto } from "./dto/create-document.dto";

const DOCUMENT_SIGNED_URL_EXPIRES_IN = 3600;

@Injectable()
export class DocumentsService {
	private readonly logger = new Logger(DocumentsService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly filesService: FilesService,
	) {}

	async findByVendorId(
		vendorId: string,
		filters?: {
			search?: string;
			type?: DocumentType;
			dateFrom?: string;
			dateTo?: string;
		},
	) {
		const where: Record<string, unknown> = { vendorId };

		if (filters?.search?.trim()) {
			where.OR = [
				{
					name: {
						contains: filters.search.trim(),
						mode: "insensitive" as const,
					},
				},
				{
					description: {
						contains: filters.search.trim(),
						mode: "insensitive" as const,
					},
				},
			];
		}

		if (filters?.type) {
			where.type = filters.type;
		}

		if (filters?.dateFrom || filters?.dateTo) {
			where.uploadedAt = {};
			if (filters.dateFrom) {
				(where.uploadedAt as Record<string, Date>).gte = new Date(
					filters.dateFrom,
				);
			}
			if (filters.dateTo) {
				const toDate = new Date(filters.dateTo);
				toDate.setUTCHours(23, 59, 59, 999);
				(where.uploadedAt as Record<string, Date>).lte = toDate;
			}
		}

		return this.prisma.document.findMany({
			where,
			include: { user: true },
			orderBy: { name: "asc" },
		});
	}

	async createForVendor(
		vendorId: string,
		dto: Omit<CreateDocumentDto, "vendorId">,
		userId: string,
	) {
		const doc = await this.prisma.document.create({
			data: {
				name: dto.name,
				type: dto.type,
				url: dto.url,
				description: dto.description,
				uploadedBy: userId,
				vendorId,
			},
		});

		this.logger.log(`Added document "${dto.name}" to vendor ${vendorId}`);
		return doc;
	}

	async createForVendorWithFile(
		vendorId: string,
		dto: {
			name: string;
			type: CreateDocumentDto["type"];
			description?: string;
		},
		userId: string,
		file: Express.Multer.File | undefined,
	) {
		if (!file?.buffer) {
			throw new BadRequestException("Document file is required.");
		}
		const err = validatePdfDocument(file, "Document");
		if (err) throw new BadRequestException(err);

		const fileKey = await this.uploadDocument(file, vendorId);

		const doc = await this.prisma.document.create({
			data: {
				name: dto.name,
				type: dto.type,
				url: fileKey,
				description: dto.description,
				uploadedBy: userId,
				vendorId,
			},
		});

		this.logger.log(`Added document "${dto.name}" to vendor ${vendorId}`);
		return doc;
	}

	private async uploadDocument(
		file: Express.Multer.File,
		vendorId: string,
	): Promise<string> {
		const key = `${S3_PREFIX_VENDOR_DOCUMENTS}/${vendorId}/${randomUUID()}.pdf`;
		const result = await this.filesService.uploadFile(file, key);
		return result.key;
	}

	async getDocumentSignedUrl(documentId: string): Promise<string> {
		const doc = await this.prisma.document.findFirst({
			where: { id: documentId },
		});
		if (!doc) {
			throw new NotFoundException("Document not found.");
		}
		return this.filesService.getSignedUrl(
			doc.url,
			DOCUMENT_SIGNED_URL_EXPIRES_IN,
		);
	}

	async delete(id: string): Promise<void> {
		const doc = await this.prisma.document.findUnique({
			where: { id },
		});
		if (!doc) {
			throw new NotFoundException("Document not found.");
		}
		await this.prisma.document.delete({ where: { id } });
		this.logger.log(`Deleted document "${doc.name}" (${id})`);
	}

	async findByMspId(mspId: string, search?: string) {
		const where = search?.trim()
			? {
					mspId,
					OR: [
						{
							name: {
								contains: search.trim(),
								mode: "insensitive" as const,
							},
						},
						{
							description: {
								contains: search.trim(),
								mode: "insensitive" as const,
							},
						},
					],
				}
			: { mspId };

		return this.prisma.document.findMany({
			where,
			include: { user: true },
			orderBy: { name: "asc" },
		});
	}

	async createForMspWithFile(
		mspId: string,
		dto: {
			name: string;
			type: DocumentType;
			description?: string;
		},
		userId: string,
		file: Express.Multer.File | undefined,
	) {
		if (!file?.buffer) {
			throw new BadRequestException("Document file is required.");
		}
		const err = validatePdfDocument(file, "Document");
		if (err) throw new BadRequestException(err);

		const fileKey = await this.uploadMspDocument(file, mspId);

		const doc = await this.prisma.document.create({
			data: {
				name: dto.name,
				type: dto.type,
				url: fileKey,
				description: dto.description,
				uploadedBy: userId,
				mspId,
			},
		});

		this.logger.log(`Added document "${dto.name}" to MSP ${mspId}`);
		return doc;
	}

	private async uploadMspDocument(
		file: Express.Multer.File,
		mspId: string,
	): Promise<string> {
		const key = `${S3_PREFIX_ORGANIZATION_DOCS}/msp/${mspId}/${randomUUID()}.pdf`;
		const result = await this.filesService.uploadFile(file, key);
		return result.key;
	}

	async findByOrganizationId(
		organizationId: string,
		filters?: {
			search?: string;
			type?: DocumentType;
			dateFrom?: string;
			dateTo?: string;
		},
	) {
		const where: Record<string, unknown> = { organizationId };

		if (filters?.search?.trim()) {
			where.OR = [
				{
					name: {
						contains: filters.search.trim(),
						mode: "insensitive" as const,
					},
				},
				{
					description: {
						contains: filters.search.trim(),
						mode: "insensitive" as const,
					},
				},
			];
		}

		if (filters?.type) {
			where.type = filters.type;
		}

		if (filters?.dateFrom || filters?.dateTo) {
			where.uploadedAt = {};
			if (filters.dateFrom) {
				(where.uploadedAt as Record<string, Date>).gte = new Date(
					filters.dateFrom,
				);
			}
			if (filters.dateTo) {
				const toDate = new Date(filters.dateTo);
				toDate.setUTCHours(23, 59, 59, 999);
				(where.uploadedAt as Record<string, Date>).lte = toDate;
			}
		}

		return this.prisma.document.findMany({
			where,
			include: { user: true },
			orderBy: { name: "asc" },
		});
	}

	async createForOrganizationWithFile(
		organizationId: string,
		dto: {
			name: string;
			type: CreateDocumentDto["type"];
			description?: string;
		},
		userId: string,
		file: Express.Multer.File | undefined,
	) {
		if (!file?.buffer) {
			throw new BadRequestException("Document file is required.");
		}
		const err = validatePdfDocument(file, "Document");
		if (err) throw new BadRequestException(err);

		const fileKey = await this.uploadOrganizationDocument(file, organizationId);

		const doc = await this.prisma.document.create({
			data: {
				name: dto.name,
				type: dto.type,
				url: fileKey,
				description: dto.description,
				uploadedBy: userId,
				organizationId,
			},
		});

		this.logger.log(
			`Added document "${dto.name}" to organization ${organizationId}`,
		);
		return doc;
	}

	private async uploadOrganizationDocument(
		file: Express.Multer.File,
		organizationId: string,
	): Promise<string> {
		const key = `${S3_PREFIX_ORGANIZATION_DOCUMENTS}/${organizationId}/${randomUUID()}.pdf`;
		const result = await this.filesService.uploadFile(file, key);
		return result.key;
	}
}
