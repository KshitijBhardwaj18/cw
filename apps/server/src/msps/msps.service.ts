import { randomUUID } from "node:crypto";
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import {
	S3_PREFIX_ORGANIZATION_DOCS,
	S3_PREFIX_PUBLIC_ORGANIZATION_LOGOS,
	validateImageFile,
	validatePdfDocument,
} from "@repo/shared";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { FilesService } from "../files/files.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateMspDto } from "./dto/create-msp.dto";
import { UpdateMspDto } from "./dto/update-msp.dto";

const MSA_SIGNED_URL_EXPIRES_IN = 3600;

/** Placeholder for file fields during pre-upload validation (satisfies IsNotEmpty/IsString) */
const FILE_PLACEHOLDER = "__file_provided__";

interface MspFiles {
	logo?: Express.Multer.File;
	msaDocument?: Express.Multer.File;
}

interface MsaUploadResult {
	key: string;
	fileName: string;
}

@Injectable()
export class MspsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly filesService: FilesService,
	) {}

	async create(data: Record<string, unknown>, files: MspFiles) {
		if (!files.msaDocument?.buffer) {
			throw new BadRequestException("MSA document is required.");
		}

		// Validate DTO before S3 uploads to avoid orphaned files on validation failure
		const dtoForValidation = plainToInstance(CreateMspDto, {
			...data,
			logo: files.logo?.buffer ? FILE_PLACEHOLDER : undefined,
			msaDocument: files.msaDocument?.buffer ? FILE_PLACEHOLDER : undefined,
		});
		const validationErrors = await validate(dtoForValidation);
		if (validationErrors.length > 0) {
			const messages = validationErrors.flatMap((e) =>
				Object.values(e.constraints ?? {}),
			);
			throw new BadRequestException(messages[0] ?? "Validation failed");
		}

		const logoUrl = await this.uploadLogo(files.logo);
		const msaResult = await this.uploadMsa(files.msaDocument);

		const dto = plainToInstance(CreateMspDto, {
			...data,
			logo: logoUrl ?? undefined,
			msaDocument: msaResult?.key ?? undefined,
		});

		const { headquarters, billing, isBillingSame, ...mspData } = dto;

		const msp = await this.prisma.$transaction(async (tx) => {
			const headquartersAddress = await tx.address.create({
				data: {
					street: headquarters.street,
					city: headquarters.city,
					state: headquarters.state,
					zipCode: headquarters.zipCode,
					country: headquarters.country,
				},
			});

			let billingId: string | null = null;
			if (!isBillingSame && billing) {
				const billingAddress = await tx.address.create({
					data: {
						street: billing.street,
						city: billing.city,
						state: billing.state,
						zipCode: billing.zipCode,
						country: billing.country,
					},
				});
				billingId = billingAddress.id;
			}

			const created = await tx.mSP.create({
				data: {
					name: mspData.name,
					logo: mspData.logo ?? null,
					industry: mspData.industry,
					organizationType: mspData.organizationType,
					headquartersId: headquartersAddress.id,
					billingId,
					phoneNumber: mspData.phoneNumber,
					isBillingSame,
					timeZone: mspData.timeZone,
					msaDocument: mspData.msaDocument,
					msaFileName: msaResult?.fileName ?? null,
					msaUploadedAt: new Date(),
					msaAgreementRevisionDate: mspData.msaAgreementRevisionDate
						? new Date(mspData.msaAgreementRevisionDate)
						: null,
				},
			});

			return tx.mSP.findUniqueOrThrow({
				where: { id: created.id },
				include: {
					headquarters: true,
					billing: true,
					_count: { select: { msplinkedOrgs: true } },
				},
			});
		});

		const { msaDocument, ...rest } = msp;
		return { ...rest, hasMsaDocument: !!msaDocument };
	}

	async findOne(id: string) {
		const msp = await this.prisma.mSP.findUnique({
			where: { id },
			include: {
				headquarters: true,
				billing: true,
				_count: { select: { msplinkedOrgs: true } },
			},
		});
		if (!msp) return null;
		const { msaDocument, ...rest } = msp;
		return { ...rest, hasMsaDocument: !!msaDocument };
	}

	async update(id: string, data: Record<string, unknown>, files: MspFiles) {
		const existing = await this.prisma.mSP.findUnique({
			where: { id },
			include: { headquarters: true, billing: true },
		});
		if (!existing) return null;

		const dtoForValidation = plainToInstance(UpdateMspDto, {
			...data,
			...(files.logo?.buffer ? { logo: FILE_PLACEHOLDER } : {}),
			...(files.msaDocument?.buffer ? { msaDocument: FILE_PLACEHOLDER } : {}),
		});
		const validationErrors = await validate(dtoForValidation);
		if (validationErrors.length > 0) {
			const messages = validationErrors.flatMap((e) =>
				Object.values(e.constraints ?? {}),
			);
			throw new BadRequestException(messages[0] ?? "Validation failed");
		}

		const logoUrl = files.logo ? await this.uploadLogo(files.logo, id) : null;
		const msaResult = files.msaDocument
			? await this.uploadMsa(files.msaDocument, id)
			: null;

		const dto = plainToInstance(UpdateMspDto, {
			...data,
			...(logoUrl != null ? { logo: logoUrl } : {}),
			...(msaResult != null ? { msaDocument: msaResult.key } : {}),
		});

		const { headquarters, billing, isBillingSame, ...mspData } = dto;

		const msp = await this.prisma.$transaction(async (tx) => {
			if (headquarters) {
				await tx.address.update({
					where: { id: existing.headquartersId },
					data: {
						street: headquarters.street,
						city: headquarters.city,
						state: headquarters.state,
						zipCode: headquarters.zipCode,
						country: headquarters.country,
					},
				});
			}

			let billingId: string | null = null;
			if (isBillingSame === false && billing) {
				if (existing.billingId) {
					await tx.address.update({
						where: { id: existing.billingId },
						data: {
							street: billing.street,
							city: billing.city,
							state: billing.state,
							zipCode: billing.zipCode,
							country: billing.country,
						},
					});
					billingId = existing.billingId;
				} else {
					const billingAddress = await tx.address.create({
						data: {
							street: billing.street,
							city: billing.city,
							state: billing.state,
							zipCode: billing.zipCode,
							country: billing.country,
						},
					});
					billingId = billingAddress.id;
				}
			} else if (isBillingSame === true && existing.billingId) {
				if (existing.billingId !== existing.headquartersId) {
					await tx.address.delete({ where: { id: existing.billingId } });
				}
				billingId = null;
			} else {
				billingId = existing.billingId;
			}

			const updateData: Record<string, unknown> = {};
			if (mspData.name !== undefined) updateData.name = mspData.name;
			if (mspData.logo !== undefined) updateData.logo = mspData.logo ?? null;
			if (mspData.industry !== undefined)
				updateData.industry = mspData.industry;
			if (mspData.organizationType !== undefined)
				updateData.organizationType = mspData.organizationType;
			if (mspData.timeZone !== undefined)
				updateData.timeZone = mspData.timeZone;
			if (mspData.msaDocument !== undefined) {
				updateData.msaDocument = mspData.msaDocument;
				updateData.msaFileName = msaResult?.fileName ?? existing.msaFileName;
				updateData.msaUploadedAt = new Date();
			}
			if (mspData.msaAgreementRevisionDate !== undefined) {
				updateData.msaAgreementRevisionDate = new Date(
					mspData.msaAgreementRevisionDate,
				);
			}
			if (mspData.phoneNumber !== undefined)
				updateData.phoneNumber = mspData.phoneNumber;
			if (isBillingSame !== undefined) updateData.isBillingSame = isBillingSame;
			updateData.billingId = billingId;

			await tx.mSP.update({
				where: { id },
				data: updateData as Parameters<typeof tx.mSP.update>[0]["data"],
			});

			return tx.mSP.findUniqueOrThrow({
				where: { id },
				include: {
					headquarters: true,
					billing: true,
					_count: { select: { msplinkedOrgs: true } },
				},
			});
		});

		const { msaDocument, ...rest } = msp;
		return { ...rest, hasMsaDocument: !!msaDocument };
	}

	async delete(id: string): Promise<void> {
		const existing = await this.prisma.mSP.findUnique({ where: { id } });
		if (!existing) {
			throw new NotFoundException("MSP not found.");
		}

		await this.prisma.$transaction(async (tx) => {
			await tx.mSP.delete({ where: { id } });

			if (existing.headquartersId) {
				try {
					await tx.address.delete({
						where: { id: existing.headquartersId },
					});
				} catch {
					throw new NotFoundException("Headquarters address not found.");
				}
			}
			if (
				existing.billingId &&
				existing.billingId !== existing.headquartersId
			) {
				try {
					await tx.address.delete({
						where: { id: existing.billingId },
					});
				} catch {
					throw new NotFoundException("Billing address not found.");
				}
			}
		});
	}

	async findAll(page = 1, limit = 8, search?: string) {
		const searchFilter = search
			? {
					OR: [
						{ name: { contains: search, mode: "insensitive" as const } },
						{
							phoneNumber: {
								contains: search,
								mode: "insensitive" as const,
							},
						},
					],
				}
			: {};

		const skip = (page - 1) * limit;
		const where = searchFilter;

		const [data, total] = await Promise.all([
			this.prisma.mSP.findMany({
				where,
				skip,
				take: limit,
				include: {
					headquarters: true,
					billing: true,
					_count: { select: { msplinkedOrgs: true } },
				},
				orderBy: { name: "asc" },
			}),
			this.prisma.mSP.count({ where }),
		]);

		return {
			data: data.map((msp) => {
				const { msaDocument, ...rest } = msp;
				return { ...rest, hasMsaDocument: !!msaDocument };
			}),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async getMsaSignedUrl(mspId: string): Promise<string> {
		const msp = await this.prisma.mSP.findUnique({
			where: { id: mspId },
			select: { msaDocument: true },
		});
		if (!msp) {
			throw new NotFoundException("MSP not found.");
		}
		if (!msp.msaDocument) {
			throw new NotFoundException("MSA document not found for this MSP.");
		}
		return this.filesService.getSignedUrl(
			msp.msaDocument,
			MSA_SIGNED_URL_EXPIRES_IN,
		);
	}

	private async uploadLogo(
		file: Express.Multer.File | undefined,
		mspId?: string,
	): Promise<string | null> {
		if (!file?.buffer) return null;
		const err = validateImageFile(file, "Logo");
		if (err) throw new BadRequestException(err);
		const ext = file.mimetype === "image/png" ? "png" : "jpg";
		const folder = mspId ?? randomUUID();
		const key = `${S3_PREFIX_PUBLIC_ORGANIZATION_LOGOS}/${folder}/${randomUUID()}.${ext}`;
		const result = await this.filesService.uploadFile(file, key, {
			public: true,
		});
		return result.url;
	}

	private async uploadMsa(
		file: Express.Multer.File | undefined,
		mspId?: string,
	): Promise<MsaUploadResult | null> {
		if (!file?.buffer) return null;
		const err = validatePdfDocument(file, "MSA document");
		if (err) throw new BadRequestException(err);
		const folder = mspId ?? randomUUID();
		const originalName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
		const key = `${S3_PREFIX_ORGANIZATION_DOCS}/${folder}/${randomUUID()}_${originalName}`;
		const result = await this.filesService.uploadFile(file, key);
		return { key: result.key, fileName: file.originalname };
	}
}
