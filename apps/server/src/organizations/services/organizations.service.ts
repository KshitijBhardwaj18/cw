import { randomUUID } from "node:crypto";
import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import {
	MemberInviteStatus,
	OrganizationMemberStatus,
	type OrganizationType,
	UserRole,
} from "@repo/db";
import {
	BULK_INVITE_MAX_RECIPIENTS,
	getAgreementDocumentExtension,
	S3_PREFIX_PUBLIC_ORGANIZATION_AGREEMENTS,
	S3_PREFIX_PUBLIC_ORGANIZATION_LOGOS,
	validateAgreementDocument,
	validateImageFile,
} from "@repo/shared";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import slugifyLib from "slugify";
import { BackgroundJobsService } from "src/background-jobs/background-jobs.service";
import { config } from "src/common/config";
import { FilesService } from "../../files/files.service";
import { MatchingLogicService } from "../../matching-logic/matchinglogic.service";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateOrganizationDto } from "../dto/create-organization.dto";
import type { SendBulkInviteDto, SendInviteDto } from "../dto/send-invite.dto";
import { UpdateOrganizationDto } from "../dto/update-organization.dto";

interface OrganizationFiles {
	logo?: Express.Multer.File;
	serviceAgreement?: Express.Multer.File;
}

/** Placeholder for file fields during pre-upload validation (satisfies IsString) */
const FILE_PLACEHOLDER = "__file_provided__";

const SERVICE_AGREEMENT_SIGNED_URL_EXPIRES_IN = 3600;

const RESERVED_SLUGS = new Set([...config.slugs.reserved]);

@Injectable()
export class OrganizationsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly filesService: FilesService,
		private readonly matchingLogicService: MatchingLogicService,
		private readonly backgroundJobsService: BackgroundJobsService,
	) {}

	private slugify(name: string): string {
		return slugifyLib(name, { lower: true, strict: true, trim: true }).slice(
			0,
			60,
		);
	}

	private async ensureUniqueSlug(
		baseSlug: string,
		excludeId?: string,
	): Promise<string> {
		const existing = await this.prisma.organization.findMany({
			where: { slug: { startsWith: baseSlug } },
			select: { id: true, slug: true },
		});

		const taken = new Set([
			...existing.filter((o) => o.id !== excludeId).map((o) => o.slug),
			...RESERVED_SLUGS,
		]);

		if (!taken.has(baseSlug)) return baseSlug;

		let counter = 1;
		let candidate = `${baseSlug}-${counter}`;
		while (taken.has(candidate)) {
			counter++;
			candidate = `${baseSlug}-${counter}`;
		}
		return candidate;
	}

	async suggestSlug(
		name: string,
		excludeOrganizationId?: string,
	): Promise<{ slug: string; modified: boolean }> {
		const base = this.slugify(name);
		const suggestion = await this.ensureUniqueSlug(base, excludeOrganizationId);
		return { slug: suggestion, modified: suggestion !== base };
	}

	async checkSlugAvailability(
		slug: string,
		excludeId?: string,
	): Promise<{ available: boolean; slug: string }> {
		const normalized = this.slugify(slug);
		if (RESERVED_SLUGS.has(normalized)) {
			return { available: false, slug: normalized };
		}
		const existing = await this.prisma.organization.findUnique({
			where: { slug: normalized },
			select: { id: true },
		});
		const available = !existing || existing.id === excludeId;
		return { available, slug: normalized };
	}

	async checkMyMembership(
		orgId: string,
		userId: string,
	): Promise<{ memberId: string; status: string }> {
		const member = await this.prisma.member.findFirst({
			where: { userId, organizationId: orgId },
			select: { id: true, status: true },
		});

		if (!member || member.status !== OrganizationMemberStatus.ACTIVE) {
			throw new ForbiddenException(
				"You are not an active member of this organization",
			);
		}

		return { memberId: member.id, status: member.status };
	}

	async getPublicBySlug(slug: string) {
		const normalized = slug.toLowerCase().trim();
		const org = await this.prisma.organization.findUnique({
			where: { slug: normalized },
			select: {
				id: true,
				name: true,
				slug: true,
				logo: true,
				isActive: true,
				timeZone: true,
				industry: true,
			},
		});
		if (!org?.isActive) {
			throw new NotFoundException("Organization not found.");
		}
		return org;
	}

	private buildMemberFilter(session: UserSession, roles: UserRole[]) {
		if (roles.includes(session.user.role as UserRole)) {
			return {};
		}
		return { members: { some: { userId: session.user.id } } };
	}

	async create(data: Record<string, unknown>, files: OrganizationFiles) {
		const dtoForValidation = plainToInstance(CreateOrganizationDto, {
			...data,
			logo: files.logo?.buffer ? FILE_PLACEHOLDER : undefined,
			serviceAgreement: files.serviceAgreement?.buffer
				? FILE_PLACEHOLDER
				: undefined,
		});
		const validationErrors = await validate(dtoForValidation);
		if (validationErrors.length > 0) {
			const messages = validationErrors.flatMap((e) =>
				Object.values(e.constraints ?? {}),
			);
			throw new BadRequestException(messages[0] ?? "Validation failed");
		}

		const logoUrl = await this.uploadLogo(files.logo);
		const serviceAgreementUrl = await this.uploadServiceAgreement(
			files.serviceAgreement,
		);

		const dto = plainToInstance(CreateOrganizationDto, {
			...data,
			logo: logoUrl ?? undefined,
			serviceAgreement: serviceAgreementUrl ?? undefined,
		});

		const baseSlug = this.slugify(dto.name);
		const slug = await this.ensureUniqueSlug(baseSlug);

		const createOrg = (s: string) =>
			this.prisma.$transaction(async (tx) => {
				const org = await tx.organization.create({
					data: {
						name: dto.name,
						slug: s,
						email: dto.email,
						phone: dto.phone,
						industry: dto.industry,
						organizationType: dto.organizationType,
						timeZone: dto.timeZone,
						website: dto.website ?? null,
						logo: dto.logo ?? null,
						serviceAgreement: dto.serviceAgreement ?? null,
						description: dto.description ?? null,
						isActive: dto.isActive ?? true,
						expectedAnnualSpend: dto.expectedAnnualSpend ?? null,
						agreementRenewalDate: dto.agreementRenewalDate
							? new Date(dto.agreementRenewalDate)
							: null,
					},
				});

				await tx.organizationLocation.createMany({
					data: dto.locations.map((loc) => ({
						organizationId: org.id,
						name: loc.name,
						address: loc.address,
						city: loc.city,
						state: loc.state,
						zipCode: loc.zipCode,
						locationType: loc.locationType,
						phone: loc.phone ?? null,
						email: loc.email ?? null,
						costCenter: loc.costCenter ?? null,
					})),
				});

				await tx.shiftRoutingSettings.create({
					data: {
						organizationId: org.id,
						enableRoutingDelay: false,
						delayDuration: 24,
						delayUnit: "HOURS",
					},
				});

				await this.matchingLogicService.seedDefaultMatchingLogic(org.id, tx);

				return tx.organization.findUniqueOrThrow({
					where: { id: org.id },
					include: {
						locations: true,
						_count: { select: { organizationVendors: true } },
					},
				});
			});

		try {
			return await createOrg(slug);
		} catch (err) {
			if (
				typeof err === "object" &&
				err !== null &&
				"code" in err &&
				(err as { code: string }).code === "P2002"
			) {
				const retrySlug = await this.ensureUniqueSlug(baseSlug);
				return createOrg(retrySlug);
			}
			throw err;
		}
	}

	async update(
		id: string,
		data: Record<string, unknown>,
		files: OrganizationFiles,
	) {
		await this.prisma.organization.findUniqueOrThrow({
			where: { id },
		});

		const dtoForValidation = plainToInstance(UpdateOrganizationDto, {
			...data,
			logo: files.logo?.buffer ? FILE_PLACEHOLDER : undefined,
			serviceAgreement: files.serviceAgreement?.buffer
				? FILE_PLACEHOLDER
				: undefined,
		});
		const validationErrors = await validate(dtoForValidation);
		if (validationErrors.length > 0) {
			const messages = validationErrors.flatMap((e) =>
				Object.values(e.constraints ?? {}),
			);
			throw new BadRequestException(messages[0] ?? "Validation failed");
		}

		const logoUrl = await this.uploadLogo(files.logo);
		const serviceAgreementUrl = await this.uploadServiceAgreement(
			files.serviceAgreement,
		);

		const dto = plainToInstance(UpdateOrganizationDto, {
			...data,
			...(logoUrl != null ? { logo: logoUrl } : {}),
			...(serviceAgreementUrl != null
				? { serviceAgreement: serviceAgreementUrl }
				: {}),
		});

		return this.prisma.$transaction(async (tx) => {
			const updateData: Record<string, unknown> = {};
			if (dto.name !== undefined) updateData.name = dto.name;
			if (dto.email !== undefined) updateData.email = dto.email;
			if (dto.phone !== undefined) updateData.phone = dto.phone;
			if (dto.industry !== undefined) updateData.industry = dto.industry;
			if (dto.organizationType !== undefined)
				updateData.organizationType = dto.organizationType;
			if (dto.timeZone !== undefined) updateData.timeZone = dto.timeZone;
			if (dto.website !== undefined) updateData.website = dto.website ?? null;
			if (dto.logo !== undefined) updateData.logo = dto.logo ?? null;
			if (dto.serviceAgreement !== undefined)
				updateData.serviceAgreement = dto.serviceAgreement ?? null;
			if (dto.description !== undefined)
				updateData.description = dto.description ?? null;
			if (dto.agreementRenewalDate !== undefined) {
				updateData.agreementRenewalDate = dto.agreementRenewalDate
					? new Date(dto.agreementRenewalDate)
					: null;
			}
			if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
			if (dto.expectedAnnualSpend !== undefined)
				updateData.expectedAnnualSpend = dto.expectedAnnualSpend ?? null;

			const hasOrgUpdates = Object.keys(updateData).length > 0;
			if (!hasOrgUpdates) {
				throw new BadRequestException(
					"At least one field is required to update.",
				);
			}

			await tx.organization.update({
				where: { id },
				data: updateData as Parameters<
					typeof tx.organization.update
				>[0]["data"],
			});

			return tx.organization.findUniqueOrThrow({
				where: { id },
				include: {
					locations: true,
					_count: { select: { organizationVendors: true } },
				},
			});
		});
	}

	private async uploadLogo(
		file: Express.Multer.File | undefined,
	): Promise<string | null> {
		if (!file?.buffer) return null;
		const err = validateImageFile(file, "Logo");
		if (err) throw new BadRequestException(err);
		const ext = file.mimetype === "image/png" ? "png" : "jpg";
		const folder = randomUUID();
		const key = `${S3_PREFIX_PUBLIC_ORGANIZATION_LOGOS}/${folder}/${randomUUID()}.${ext}`;
		const result = await this.filesService.uploadFile(file, key, {
			public: true,
		});
		return result.url;
	}

	private async uploadServiceAgreement(
		file: Express.Multer.File | undefined,
	): Promise<string | null> {
		if (!file?.buffer) return null;
		const err = validateAgreementDocument(file, "Service agreement");
		if (err) throw new BadRequestException(err);
		const ext = getAgreementDocumentExtension(file.mimetype);
		const folder = randomUUID();
		const key = `${S3_PREFIX_PUBLIC_ORGANIZATION_AGREEMENTS}/${folder}/${randomUUID()}.${ext}`;
		const result = await this.filesService.uploadFile(file, key);
		return result.key;
	}

	async findOne(id: string, session: UserSession) {
		if (!session) {
			throw new UnauthorizedException("Sign in required.");
		}
		const org = await this.prisma.organization.findUnique({
			where: { id },
			include: {
				_count: { select: { organizationVendors: true } },
			},
		});

		if (!org) {
			throw new NotFoundException("Organization not found.");
		}
		return org;
	}

	async getServiceAgreementSignedUrl(
		id: string,
		session: UserSession,
	): Promise<string> {
		if (!session) {
			throw new UnauthorizedException("Sign in required.");
		}
		const org = await this.prisma.organization.findUnique({
			where: { id },
			select: { serviceAgreement: true },
		});

		if (!org) {
			throw new NotFoundException("Organization not found.");
		}
		if (!org.serviceAgreement) {
			throw new NotFoundException(
				"Service agreement not found for this organization",
			);
		}

		return this.filesService.getSignedUrl(
			org.serviceAgreement,
			SERVICE_AGREEMENT_SIGNED_URL_EXPIRES_IN,
		);
	}

	async findAll(
		page = 1,
		limit = 8,
		session: UserSession,
		organizationType?: OrganizationType,
		search?: string,
	) {
		if (!session) {
			throw new UnauthorizedException("Sign in required.");
		}
		const roles = [UserRole.SUPER_ADMIN, UserRole.GENERAL_ADMIN];
		const memberFilter = this.buildMemberFilter(session, roles);

		const searchFilter = search
			? {
					OR: [
						{ name: { contains: search, mode: "insensitive" as const } },
						{ email: { contains: search, mode: "insensitive" as const } },
						{
							website: {
								contains: search,
								mode: "insensitive" as const,
							},
						},
					],
				}
			: {};

		const skip = (page - 1) * limit;
		const where = {
			...(organizationType && { organizationType }),
			...searchFilter,
			...memberFilter,
		};

		const [data, total] = await Promise.all([
			this.prisma.organization.findMany({
				skip,
				take: limit,
				where,
				include: {
					locations: true,
					_count: { select: { organizationVendors: true } },
				},
				orderBy: { name: "asc" },
			}),
			this.prisma.organization.count({ where }),
		]);

		return {
			data,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	private async ensureOrgExists(organizationId: string) {
		const org = await this.prisma.organization.findUnique({
			where: { id: organizationId },
			select: { id: true },
		});
		if (!org) {
			throw new NotFoundException("Organization not found.");
		}
	}

	async findGrouped(limitPerGroup: number, session: UserSession) {
		if (!session) {
			throw new UnauthorizedException("Sign in required.");
		}
		const roles = [UserRole.SUPER_ADMIN, UserRole.GENERAL_ADMIN];
		const memberFilter = this.buildMemberFilter(session, roles);

		const types = await this.prisma.organization.findMany({
			distinct: ["organizationType"],
			select: { organizationType: true },
			where: memberFilter,
			orderBy: { organizationType: "asc" },
		});

		const groups = await Promise.all(
			types.map(async ({ organizationType }) => {
				const where = { organizationType, ...memberFilter };
				const data = await this.prisma.organization.findMany({
					where,
					take: limitPerGroup,
					include: {
						locations: true,
						_count: { select: { organizationVendors: true } },
					},
					orderBy: { name: "asc" },
				});
				const total = await this.prisma.organization.count({ where });
				return { organizationType, data, total };
			}),
		);

		return { groups };
	}

	async delete(id: string, session: UserSession): Promise<void> {
		if (!session) {
			throw new UnauthorizedException("Sign in required.");
		}
		const org = await this.prisma.organization.findUnique({
			where: { id },
		});

		if (!org) {
			throw new NotFoundException("Organization not found.");
		}

		await this.prisma.organization.delete({ where: { id } });
	}

	async submitInvite(organizationId: string, dto: SendInviteDto) {
		await this.ensureOrgExists(organizationId);
		const member = await this.prisma.member.findFirst({
			where: { id: dto.memberId, organizationId },
		});
		if (!member) {
			throw new NotFoundException("Member not found in this organization.");
		}
		const scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : undefined;
		if (scheduledAt != null && scheduledAt.getTime() <= Date.now()) {
			throw new BadRequestException(
				"Scheduled send time must be in the future.",
			);
		}

		const job = await this.backgroundJobsService.createInviteSingleJob(
			organizationId,
			dto.memberId,
			scheduledAt,
		);

		await this.prisma.member.update({
			where: { id: dto.memberId },
			data: {
				lastInviteStatus: scheduledAt
					? MemberInviteStatus.SCHEDULED
					: MemberInviteStatus.PENDING,
				lastInviteScheduledFor: scheduledAt ?? null,
				lastInviteJobId: job.id,
			},
		});

		return job;
	}

	async submitBulkInvite(organizationId: string, dto: SendBulkInviteDto) {
		await this.ensureOrgExists(organizationId);
		if (dto.memberIds.length === 0) {
			throw new BadRequestException("Select at least one member to invite.");
		}
		if (dto.memberIds.length > BULK_INVITE_MAX_RECIPIENTS) {
			throw new BadRequestException(
				`You can invite at most ${BULK_INVITE_MAX_RECIPIENTS} members at a time.`,
			);
		}
		const members = await this.prisma.member.findMany({
			where: { id: { in: dto.memberIds }, organizationId },
			select: { id: true },
		});
		const foundIds = new Set(members.map((m) => m.id));
		const missing = dto.memberIds.filter((id) => !foundIds.has(id));
		if (missing.length > 0) {
			throw new BadRequestException(
				"One or more selected members were not found in this organization.",
			);
		}
		const scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : undefined;
		if (scheduledAt != null && scheduledAt.getTime() <= Date.now()) {
			throw new BadRequestException(
				"Scheduled send time must be in the future.",
			);
		}

		const job = await this.backgroundJobsService.createInviteBulkJob(
			organizationId,
			dto.memberIds,
			scheduledAt,
		);

		await this.prisma.member.updateMany({
			where: { id: { in: dto.memberIds } },
			data: {
				lastInviteStatus: scheduledAt
					? MemberInviteStatus.SCHEDULED
					: MemberInviteStatus.PENDING,
				lastInviteScheduledFor: scheduledAt ?? null,
				lastInviteJobId: job.id,
			},
		});

		return job;
	}

	async getInviteJob(organizationId: string, jobId: string) {
		await this.ensureOrgExists(organizationId);
		return this.backgroundJobsService.getJobById(jobId, organizationId);
	}
}
