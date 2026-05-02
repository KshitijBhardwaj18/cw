import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import type { CreateShiftTemplateDto } from "./dto/create-shift-template.dto";
import type { QueryShiftTemplatesDto } from "./dto/query-shift-templates.dto";
import type { UpdateBillingDto } from "./dto/update-billing.dto";
import type { UpdateShiftTemplateDto } from "./dto/update-shift-template.dto";

const TEMPLATE_SELECT = {
	id: true,
	templateName: true,
	shiftType: true,
	occupationId: true,
	departmentId: true,
	locationId: true,
	durationHours: true,
	baseRate: true,
	baseBillRate: true,
	vendorRateMarkupPercent: true,
	limitShiftVisibility: true,
	visibilityUnlockHours: true,
	offerIncentive: true,
	incentiveByHour: true,
	incentiveByShift: true,
	isActive: true,
	usageCount: true,
	createdAt: true,
	updatedAt: true,
	occupation: { select: { id: true, name: true, acronym: true } },
	department: { select: { id: true, name: true } },
	location: { select: { id: true, name: true } },
	createdBy: { select: { id: true, name: true } },
} as const;

@Injectable()
export class ShiftTemplatesService {
	constructor(private readonly prisma: PrismaService) {}

	async list(orgId: string, query: QueryShiftTemplatesDto) {
		const page = query.page ?? 1;
		const limit = query.limit ?? 20;
		const skip = (page - 1) * limit;

		const where = {
			organizationId: orgId,
			...(query.search
				? {
						templateName: {
							contains: query.search,
							mode: "insensitive" as const,
						},
					}
				: {}),
		};

		const [data, total] = await this.prisma.$transaction([
			this.prisma.shiftTemplate.findMany({
				where,
				select: TEMPLATE_SELECT,
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
			}),
			this.prisma.shiftTemplate.count({ where }),
		]);

		return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
	}

	async findOne(orgId: string, id: string) {
		const template = await this.prisma.shiftTemplate.findFirst({
			where: { id, organizationId: orgId },
			select: TEMPLATE_SELECT,
		});
		if (!template) throw new NotFoundException("Shift template not found");
		return template;
	}

	async create(orgId: string, dto: CreateShiftTemplateDto, userId: string) {
		return this.prisma.shiftTemplate.create({
			data: {
				organizationId: orgId,
				templateName: dto.templateName,
				occupationId: dto.occupationId,
				departmentId: dto.departmentId,
				locationId: dto.locationId,
				shiftType: dto.shiftType,
				durationHours: dto.durationHours,
				baseRate: dto.baseRate,
				baseBillRate: dto.baseBillRate,
				vendorRateMarkupPercent: dto.vendorRateMarkupPercent,
				limitShiftVisibility: dto.limitShiftVisibility,
				visibilityUnlockHours: dto.visibilityUnlockHours,
				offerIncentive: dto.offerIncentive,
				incentiveByHour: dto.incentiveByHour,
				incentiveByShift: dto.incentiveByShift,
				createdById: userId,
				updatedById: userId,
			},
			select: TEMPLATE_SELECT,
		});
	}

	async update(
		orgId: string,
		id: string,
		dto: UpdateShiftTemplateDto,
		userId: string,
	) {
		await this.findOne(orgId, id);
		return this.prisma.shiftTemplate.update({
			where: { id },
			data: { ...dto, updatedById: userId },
			select: TEMPLATE_SELECT,
		});
	}

	async updateBilling(
		orgId: string,
		id: string,
		dto: UpdateBillingDto,
		userId: string,
	) {
		await this.findOne(orgId, id);
		return this.prisma.shiftTemplate.update({
			where: { id },
			data: {
				baseBillRate: dto.baseBillRate,
				vendorRateMarkupPercent: dto.vendorRateMarkupPercent,
				offerIncentive: dto.offerIncentive,
				incentiveByHour: dto.incentiveByHour,
				incentiveByShift: dto.incentiveByShift,
				updatedById: userId,
			},
			select: TEMPLATE_SELECT,
		});
	}

	async remove(orgId: string, id: string) {
		await this.findOne(orgId, id);
		await this.prisma.shiftTemplate.delete({ where: { id } });
	}
}
