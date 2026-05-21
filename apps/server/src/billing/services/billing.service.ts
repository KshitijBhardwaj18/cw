import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import type { PagePaginatedResponse } from "@repo/shared";
import {
	EXTERNAL_WORKFORCE_TYPES,
	INTERNAL_WORKFORCE_TYPES,
} from "@repo/shared";
import { BackgroundJobsService } from "src/background-jobs/background-jobs.service";
import { PrismaService } from "src/prisma/prisma.service";
import type { CreatePayCodeDto } from "../dto/create-pay-code.dto";
import type { QueryPayCodesDto } from "../dto/query-pay-codes.dto";
import type { UpdateBillingConfigDto } from "../dto/update-billing-config.dto";
import type { UpdatePayCodeDto } from "../dto/update-pay-code.dto";
import type { UpdateWorkforceBillingRateDto } from "../dto/update-workforce-billing-rate.dto";

const WORKFORCE_TYPES_WITH_BILLING_RATES = [
	...INTERNAL_WORKFORCE_TYPES,
	...EXTERNAL_WORKFORCE_TYPES,
] as const;

@Injectable()
export class BillingService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly backgroundJobs: BackgroundJobsService,
	) {}

	async getPayCodeStats(orgId: string) {
		const [total, active, categoryRows] = await Promise.all([
			this.prisma.organizationPayCode.count({
				where: { organizationId: orgId },
			}),
			this.prisma.organizationPayCode.count({
				where: { organizationId: orgId, isActive: true },
			}),
			this.prisma.organizationPayCode.groupBy({
				by: ["category"],
				where: { organizationId: orgId, isActive: true },
				_count: { id: true },
			}),
		]);

		return {
			total,
			active,
			categories: categoryRows.length,
		};
	}

	async listPayCodes(orgId: string, dto: QueryPayCodesDto) {
		const page = dto.page ?? 1;
		const limit = dto.limit ?? 20;
		const skip = (page - 1) * limit;

		const where = {
			organizationId: orgId,
			isActive: true,
			...(dto.search && {
				OR: [
					{
						code: { contains: dto.search, mode: "insensitive" as const },
					},
					{
						description: {
							contains: dto.search,
							mode: "insensitive" as const,
						},
					},
					{
						category: {
							contains: dto.search,
							mode: "insensitive" as const,
						},
					},
				],
			}),
		};

		const [total, codes] = await Promise.all([
			this.prisma.organizationPayCode.count({ where }),
			this.prisma.organizationPayCode.findMany({
				where,
				select: {
					id: true,
					code: true,
					category: true,
					description: true,
					multiplier: true,
					sortOrder: true,
					isActive: true,
				},
				orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { code: "asc" }],
				skip,
				take: limit,
			}),
		]);

		return {
			data: codes,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit) || 1,
		} satisfies PagePaginatedResponse<(typeof codes)[number]>;
	}

	async createPayCode(orgId: string, dto: CreatePayCodeDto) {
		const exists = await this.prisma.organizationPayCode.findUnique({
			where: { organizationId_code: { organizationId: orgId, code: dto.code } },
			select: { id: true },
		});
		if (exists)
			throw new BadRequestException(`Pay code '${dto.code}' already exists`);

		return this.prisma.organizationPayCode.create({
			data: {
				organizationId: orgId,
				code: dto.code,
				category: dto.category,
				description: dto.description,
				multiplier: dto.multiplier,
				isActive: dto.isActive ?? true,
			},
		});
	}

	async deletePayCode(orgId: string, payCodeId: string) {
		const code = await this.prisma.organizationPayCode.findFirst({
			where: { id: payCodeId, organizationId: orgId },
			select: { id: true },
		});
		if (!code) throw new NotFoundException("Pay code not found");

		await this.prisma.organizationPayCode.delete({ where: { id: payCodeId } });
		return { success: true };
	}

	async updatePayCode(orgId: string, payCodeId: string, dto: UpdatePayCodeDto) {
		const existing = await this.prisma.organizationPayCode.findFirst({
			where: { id: payCodeId, organizationId: orgId },
		});
		if (!existing) throw new NotFoundException("Pay code not found");

		const nextCode = dto.code ?? existing.code;
		if (nextCode !== existing.code) {
			const clash = await this.prisma.organizationPayCode.findFirst({
				where: {
					organizationId: orgId,
					code: nextCode,
					NOT: { id: payCodeId },
				},
				select: { id: true },
			});
			if (clash)
				throw new BadRequestException(`Pay code '${nextCode}' already exists`);
		}

		return this.prisma.organizationPayCode.update({
			where: { id: payCodeId },
			data: {
				...(dto.code !== undefined ? { code: dto.code } : {}),
				...(dto.category !== undefined ? { category: dto.category } : {}),
				...(dto.description !== undefined
					? { description: dto.description }
					: {}),
				...(dto.multiplier !== undefined ? { multiplier: dto.multiplier } : {}),
				...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
			},
		});
	}

	private generateClientBillingId(): string {
		const year = new Date().getFullYear();
		const rand = crypto
			.randomUUID()
			.replace(/-/g, "")
			.slice(0, 8)
			.toUpperCase();
		return `BIL-${year}-${rand}`;
	}

	async getConfig(orgId: string) {
		const existing = await this.prisma.billingConfig.findFirst({
			where: { organizationId: orgId, isActive: true },
		});
		if (!existing) {
			const created = await this.prisma.billingConfig.create({
				data: {
					organizationId: orgId,
					clientBillingId: this.generateClientBillingId(),
					invoiceDeliveryEmail: true,
				},
			});
			await this.backgroundJobs.scheduleBillingCycleRun({
				organizationId: created.organizationId,
				billingFrequency: created.billingFrequency,
				cycleStartDay: created.cycleStartDay,
			});
			return created;
		}
		return existing;
	}

	async updateConfig(orgId: string, dto: UpdateBillingConfigDto) {
		const config = await this.prisma.billingConfig.findFirst({
			where: { organizationId: orgId, isActive: true },
		});
		const deliveryFieldsInDto =
			dto.invoiceDeliveryEmail !== undefined ||
			dto.invoiceDeliverySftp !== undefined ||
			dto.invoiceDeliveryDownload !== undefined;

		if (deliveryFieldsInDto) {
			const nextDeliveryEmail =
				dto.invoiceDeliveryEmail ?? config?.invoiceDeliveryEmail ?? false;
			const nextDeliverySftp =
				dto.invoiceDeliverySftp ?? config?.invoiceDeliverySftp ?? false;
			const nextDeliveryDownload =
				dto.invoiceDeliveryDownload ?? config?.invoiceDeliveryDownload ?? false;
			if (!nextDeliveryEmail && !nextDeliverySftp && !nextDeliveryDownload) {
				throw new BadRequestException(
					"At least one invoice delivery method must be enabled",
				);
			}
		}
		if (!config) {
			const created = await this.prisma.billingConfig.create({
				data: {
					organizationId: orgId,
					clientBillingId: this.generateClientBillingId(),
					...dto,
				},
			});
			await this.backgroundJobs.scheduleBillingCycleRun({
				organizationId: created.organizationId,
				billingFrequency: created.billingFrequency,
				cycleStartDay: created.cycleStartDay,
			});
			return created;
		}
		const updated = await this.prisma.billingConfig.update({
			where: { id: config.id },
			data: dto,
		});
		await this.backgroundJobs.scheduleBillingCycleRun({
			organizationId: updated.organizationId,
			billingFrequency: updated.billingFrequency,
			cycleStartDay: updated.cycleStartDay,
		});
		return updated;
	}

	async triggerBillingCycleRunNow(orgId: string, delayMinutes = 0) {
		const config = await this.getConfig(orgId);
		const delayMs = Math.max(0, Math.floor(delayMinutes * 60_000));
		const job = await this.backgroundJobs.enqueueBillingCycleRunWithDelay(
			orgId,
			delayMs,
		);
		return {
			jobId: job.id,
			organizationId: orgId,
			billingFrequency: config.billingFrequency,
			cycleStartDay: config.cycleStartDay,
			delayMinutes: delayMs / 60_000,
			scheduledFor: new Date(Date.now() + delayMs).toISOString(),
		};
	}

	private async ensureWorkforceBillingRateRows(orgId: string) {
		const existing =
			await this.prisma.organizationWorkforceBillingRate.findMany({
				where: { organizationId: orgId },
				select: { workforceType: true },
			});
		const have = new Set(existing.map((e) => e.workforceType));
		const missing = WORKFORCE_TYPES_WITH_BILLING_RATES.filter(
			(w) => !have.has(w),
		);
		if (missing.length === 0) return;
		await this.prisma.organizationWorkforceBillingRate.createMany({
			data: missing.map((workforceType) => ({
				organizationId: orgId,
				workforceType,
				isActive: true,
				techFee: 0,
				feeType: "HOUR",
			})),
		});
	}

	async listWorkforceBillingRates(orgId: string) {
		await this.ensureWorkforceBillingRateRows(orgId);
		const rows = await this.prisma.organizationWorkforceBillingRate.findMany({
			where: { organizationId: orgId },
			orderBy: { workforceType: "asc" },
		});
		return rows.map((r) => ({
			id: r.id,
			organizationId: r.organizationId,
			workforceType: r.workforceType,
			isActive: r.isActive,
			techFee: Number(r.techFee),
			feeType: r.feeType,
			createdAt: r.createdAt,
			updatedAt: r.updatedAt,
		}));
	}

	async updateWorkforceBillingRate(
		orgId: string,
		rateId: string,
		dto: UpdateWorkforceBillingRateDto,
	) {
		const row = await this.prisma.organizationWorkforceBillingRate.findFirst({
			where: { id: rateId, organizationId: orgId },
		});
		if (!row) throw new NotFoundException("Workforce billing rate not found");

		const updated = await this.prisma.organizationWorkforceBillingRate.update({
			where: { id: rateId },
			data: {
				...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
				...(dto.techFee !== undefined ? { techFee: dto.techFee } : {}),
				...(dto.feeType !== undefined ? { feeType: dto.feeType } : {}),
			},
		});
		return {
			id: updated.id,
			organizationId: updated.organizationId,
			workforceType: updated.workforceType,
			isActive: updated.isActive,
			techFee: Number(updated.techFee),
			feeType: updated.feeType,
			createdAt: updated.createdAt,
			updatedAt: updated.updatedAt,
		};
	}
}
