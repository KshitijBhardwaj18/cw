import { randomUUID } from "node:crypto";
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import type { Prisma } from "@repo/db";
import { $Enums } from "@repo/db";
import {
	COMPLIANCE_LIST_ITEM_CATEGORIES,
	S3_PREFIX_COMPLIANCE_LIST_DOCUMENTS,
	validatePdfDocument,
} from "@repo/shared";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { PrismaService } from "src/prisma/prisma.service";
import { FilesService } from "../files/files.service";
import { CreateComplianceItemDto } from "./dto/create-compliance-item.dto";
import { UpdateComplianceItemDto } from "./dto/update-compliance-item.dto";

const COMPLIANCE_SIGNED_URL_EXPIRES_IN = 3600;

interface ComplianceFiles {
	complianceDocument?: Express.Multer.File;
}

@Injectable()
export class ComplianceService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly filesService: FilesService,
	) {}

	async getComplianceSummary(search?: string) {
		const results = await Promise.all(
			COMPLIANCE_LIST_ITEM_CATEGORIES.map(async (category) => {
				const where = this.buildWhereFromQuery({ category, search });
				const [items, total] = await Promise.all([
					this.prismaService.complianceListItem.findMany({
						where,
						orderBy: { name: "asc" },
						take: 5,
					}),
					this.prismaService.complianceListItem.count({ where }),
				]);
				return { category, items, total };
			}),
		);
		return Object.fromEntries(
			results.map((r) => [r.category, { items: r.items, total: r.total }]),
		);
	}

	async getComplianceItems(query: {
		category?: $Enums.ComplianceListItemCategory;
		status?: $Enums.ComplianceListItemStatus;
		search?: string;
		ids?: string[];
		all?: boolean;
		page?: number;
		limit?: number;
	}) {
		const where = this.buildWhereFromQuery(query);
		return this.fetchComplianceItems(where, {
			page: query.page,
			limit: query.limit,
			all: query.all,
			usePaginationHint:
				query.category !== undefined ||
				query.page !== undefined ||
				query.limit !== undefined ||
				query.search !== undefined ||
				query.status !== undefined,
			hasIds: !!query.ids?.length,
			hasCategory: query.category !== undefined,
		});
	}

	async getWalletTemplatePickerItems(query: {
		category?: $Enums.ComplianceListItemCategory;
		search?: string;
		ids?: string[];
		all?: boolean;
		page?: number;
		limit?: number;
	}) {
		const where: Prisma.ComplianceListItemWhereInput = {
			...this.buildWhereFromQuery({
				category: query.category,
				status: $Enums.ComplianceListItemStatus.ACTIVE,
				search: query.search,
				ids: query.ids,
			}),
			displayToCandidate: true,
			responseStyle: {
				notIn: [$Enums.ComplianceListItemResponseStyle.INTERNAL_TASK],
			},
		};
		return this.fetchComplianceItems(where, {
			page: query.page,
			limit: query.limit,
			all: query.all,
			usePaginationHint:
				query.category !== undefined ||
				query.page !== undefined ||
				query.limit !== undefined ||
				query.search !== undefined,
			hasIds: !!query.ids?.length,
			hasCategory: query.category !== undefined,
		});
	}

	private async fetchComplianceItems(
		where: Prisma.ComplianceListItemWhereInput,
		opts: {
			page?: number;
			limit?: number;
			all?: boolean;
			usePaginationHint: boolean;
			hasIds: boolean;
			hasCategory: boolean;
		},
	) {
		const orderBy: Prisma.ComplianceListItemOrderByWithRelationInput[] =
			opts.hasCategory
				? [{ name: "asc" }]
				: [{ category: "asc" }, { name: "asc" }];

		const usePagination = !opts.hasIds && !opts.all && opts.usePaginationHint;

		if (usePagination) {
			const page = opts.page ?? 1;
			const limit = opts.limit ?? 10;
			const skip = (page - 1) * limit;
			const [data, total] = await Promise.all([
				this.prismaService.complianceListItem.findMany({
					where,
					orderBy,
					skip,
					take: limit,
				}),
				this.prismaService.complianceListItem.count({ where }),
			]);
			return {
				data,
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit) || 1,
			};
		}

		const data = await this.prismaService.complianceListItem.findMany({
			where,
			orderBy,
		});
		return {
			data,
			total: data.length,
			page: 1,
			limit: data.length,
			totalPages: data.length > 0 ? 1 : 0,
		};
	}

	async exportComplianceItemsCsv(query: {
		category?: $Enums.ComplianceListItemCategory;
		status?: $Enums.ComplianceListItemStatus;
		search?: string;
	}) {
		const where = this.buildWhereFromQuery(query);
		const orderBy: Prisma.ComplianceListItemOrderByWithRelationInput[] =
			query.category
				? [{ name: "asc" }]
				: [{ category: "asc" }, { name: "asc" }];

		const items = await this.prismaService.complianceListItem.findMany({
			where,
			orderBy,
		});

		const esc = (value: unknown) => {
			if (value === null || value === undefined) return "";
			const s = String(value);
			return /[",\n\r]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
		};

		const header = [
			"id",
			"name",
			"category",
			"expirationType",
			"expirationRuleValue",
			"expirationRuleUnit",
			"issuerRequirement",
			"issuer",
			"responseStyle",
			"file",
			"instructionalNotes",
			"displayToCandidate",
			"status",
			"createdAt",
			"updatedAt",
		].join(",");

		const rows = items.map((i) =>
			[
				i.id,
				i.name,
				i.category,
				i.expirationType,
				i.expirationRuleValue,
				i.expirationRuleUnit,
				i.issuerRequirement,
				i.issuer,
				i.responseStyle,
				i.file,
				i.instructionalNotes,
				i.displayToCandidate,
				i.status,
				i.createdAt.toISOString(),
				i.updatedAt.toISOString(),
			]
				.map(esc)
				.join(","),
		);

		const csv = [header, ...rows].join("\n");
		const categoryPart = query.category
			? `${query.category.toLowerCase()}-`
			: "";
		const filename = `compliance-list-items-${categoryPart}${new Date()
			.toISOString()
			.slice(0, 10)}.csv`;

		return { filename, csv };
	}

	private buildWhereFromQuery(query: {
		category?: $Enums.ComplianceListItemCategory;
		status?: $Enums.ComplianceListItemStatus;
		search?: string;
		ids?: string[];
	}): Prisma.ComplianceListItemWhereInput {
		const where: Prisma.ComplianceListItemWhereInput = {};

		if (query.ids?.length) {
			where.id = { in: query.ids };
		}
		if (query.category !== undefined) {
			where.category = query.category;
		}
		if (query.status !== undefined) {
			where.status = query.status;
		}
		if (query.search?.trim()) {
			Object.assign(where, this.buildSearchWhereClause(query.search));
		}

		return where;
	}

	private buildSearchWhereClause(
		search?: string,
	): Prisma.ComplianceListItemWhereInput {
		const term = search?.trim().toLowerCase();
		if (!term) return {};

		const orConditions: Prisma.ComplianceListItemWhereInput[] = [
			{ name: { contains: term, mode: "insensitive" } },
		];

		const expirationTypes = Object.values(
			$Enums.ComplianceListItemExpirationType,
		) as string[];
		const matchingExpiration = expirationTypes.filter((e) =>
			e.toLowerCase().includes(term),
		);
		if (matchingExpiration.length > 0) {
			orConditions.push({
				expirationType: {
					in: matchingExpiration as $Enums.ComplianceListItemExpirationType[],
				},
			});
		}

		const statuses = Object.values($Enums.ComplianceListItemStatus) as string[];
		const matchingStatus = statuses.filter((s) =>
			s.toLowerCase().includes(term),
		);
		if (matchingStatus.length > 0) {
			orConditions.push({
				status: { in: matchingStatus as $Enums.ComplianceListItemStatus[] },
			});
		}

		if (term === "yes") orConditions.push({ displayToCandidate: true });
		if (term === "no") orConditions.push({ displayToCandidate: false });

		return { OR: orConditions };
	}

	async createComplianceItem(
		data: Record<string, unknown>,
		files?: ComplianceFiles,
	) {
		const dto = plainToInstance(CreateComplianceItemDto, data);

		const validationErrors = await validate(dto);
		if (validationErrors.length > 0) {
			const messages = validationErrors.flatMap((e) =>
				Object.values(e.constraints ?? {}),
			);
			throw new BadRequestException(messages[0] ?? "Validation failed");
		}

		let fileKey: string | null = null;

		if (files?.complianceDocument?.buffer) {
			const err = validatePdfDocument(
				files.complianceDocument,
				"Compliance document",
			);
			if (err) throw new BadRequestException(err);

			fileKey = await this.uploadComplianceDocument(files.complianceDocument);
		}

		const isInternalTask =
			dto.responseStyle ===
			$Enums.ComplianceListItemResponseStyle.INTERNAL_TASK;
		const displayToCandidate = isInternalTask
			? false
			: (dto.displayToCandidate ?? true);

		const isLink =
			dto.responseStyle === $Enums.ComplianceListItemResponseStyle.LINK;
		const isDownloadAndUpload =
			dto.responseStyle ===
			$Enums.ComplianceListItemResponseStyle.DOWNLOAD_AND_UPLOAD;
		const fileValue = isLink
			? dto.file?.trim() || null
			: isDownloadAndUpload
				? fileKey
				: null;

		if (isLink && !fileValue) {
			throw new BadRequestException("Link URL is required for link items.");
		}
		if (isDownloadAndUpload && !fileValue) {
			throw new BadRequestException(
				"Attachment is required for download-and-upload items",
			);
		}

		return this.prismaService.complianceListItem.create({
			data: {
				name: dto.name,
				category: dto.category,
				expirationType: dto.expirationType,
				expirationRuleValue: dto.expirationRuleValue ?? null,
				expirationRuleUnit: dto.expirationRuleUnit ?? null,
				issuerRequirement: dto.issuerRequirement ?? false,
				issuer: dto.issuer ?? null,
				responseStyle: dto.responseStyle,
				file: fileValue,
				instructionalNotes: dto.instructionalNotes ?? null,
				displayToCandidate,
				status: dto.status ?? $Enums.ComplianceListItemStatus.ACTIVE,
			},
		});
	}

	async updateComplianceItem(
		id: string,
		data: Record<string, unknown>,
		files?: ComplianceFiles,
	) {
		const item = await this.prismaService.complianceListItem.findUnique({
			where: { id },
		});

		if (!item) {
			throw new NotFoundException("Compliance item not found.");
		}

		const dto = plainToInstance(UpdateComplianceItemDto, data);

		let fileValue: string | null | undefined;
		if (files?.complianceDocument?.buffer) {
			const err = validatePdfDocument(
				files.complianceDocument,
				"Compliance document",
			);
			if (err) throw new BadRequestException(err);
			fileValue = await this.uploadComplianceDocument(
				files.complianceDocument,
				id,
			);
		} else {
			fileValue = dto.file;
		}

		const validationErrors = await validate(dto);
		if (validationErrors.length > 0) {
			const messages = validationErrors.flatMap((e) =>
				Object.values(e.constraints ?? {}),
			);
			throw new BadRequestException(messages[0] ?? "Validation failed");
		}

		const updateData: Record<string, unknown> = {};
		if (dto.name !== undefined) updateData.name = dto.name;
		if (dto.category !== undefined) updateData.category = dto.category;
		if (dto.expirationType !== undefined)
			updateData.expirationType = dto.expirationType;
		if (dto.expirationRuleValue !== undefined)
			updateData.expirationRuleValue =
				dto.expirationType ===
				$Enums.ComplianceListItemExpirationType.EXPIRATION_RULE
					? dto.expirationRuleValue
					: null;
		if (dto.expirationRuleUnit !== undefined)
			updateData.expirationRuleUnit =
				dto.expirationType ===
				$Enums.ComplianceListItemExpirationType.EXPIRATION_RULE
					? dto.expirationRuleUnit
					: null;
		if (dto.issuerRequirement !== undefined) {
			updateData.issuerRequirement = dto.issuerRequirement;
			updateData.issuer = dto.issuerRequirement ? dto.issuer : null;
		}
		if (dto.responseStyle !== undefined) {
			updateData.responseStyle = dto.responseStyle;
			updateData.file =
				dto.responseStyle ===
					$Enums.ComplianceListItemResponseStyle.DOWNLOAD_AND_UPLOAD ||
				dto.responseStyle === $Enums.ComplianceListItemResponseStyle.LINK
					? (fileValue ?? null)
					: null;
		} else if (fileValue !== undefined) {
			updateData.file = fileValue;
		}
		if (dto.instructionalNotes !== undefined)
			updateData.instructionalNotes = dto.instructionalNotes;
		if (dto.displayToCandidate !== undefined)
			updateData.displayToCandidate = dto.displayToCandidate;
		if (dto.status !== undefined) updateData.status = dto.status;

		const finalResponseStyle =
			(updateData.responseStyle as
				| $Enums.ComplianceListItemResponseStyle
				| undefined) ?? item.responseStyle;
		if (
			finalResponseStyle ===
			$Enums.ComplianceListItemResponseStyle.INTERNAL_TASK
		) {
			updateData.displayToCandidate = false;
		}

		return this.prismaService.complianceListItem.update({
			where: { id },
			data: updateData as Prisma.ComplianceListItemUpdateInput,
		});
	}

	async getComplianceFileSignedUrl(itemId: string): Promise<string> {
		const item = await this.prismaService.complianceListItem.findUnique({
			where: { id: itemId },
			select: { file: true },
		});
		if (!item) {
			throw new NotFoundException("Compliance item not found.");
		}
		if (!item.file) {
			throw new NotFoundException(
				"Compliance document not found for this item",
			);
		}
		if (item.file.startsWith("http")) {
			return item.file;
		}
		return this.filesService.getSignedUrl(
			item.file,
			COMPLIANCE_SIGNED_URL_EXPIRES_IN,
		);
	}

	private async uploadComplianceDocument(
		file: Express.Multer.File,
		itemId?: string,
	): Promise<string> {
		const folder = itemId ?? randomUUID();
		const key = `${S3_PREFIX_COMPLIANCE_LIST_DOCUMENTS}/${folder}/${randomUUID()}.pdf`;
		const result = await this.filesService.uploadFile(file, key);
		return result.key;
	}

	async deleteComplianceItem(id: string): Promise<void> {
		const item = await this.prismaService.complianceListItem.findUnique({
			where: { id },
		});

		if (!item) {
			throw new NotFoundException("Compliance item not found.");
		}

		await this.prismaService.complianceListItem.delete({ where: { id } });
	}
}
