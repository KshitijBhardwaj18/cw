import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import {
	ComplianceChecklistItemPhase,
	Prisma,
	RequisitionStatus,
	WorkflowType,
} from "@repo/db";
import { PrismaService } from "src/prisma/prisma.service";
import type { CreateRequisitionTemplateDto } from "./dto/create-requisition-template.dto";
import type { QueryRequisitionTemplatesDto } from "./dto/query-requisition-templates.dto";
import type { UpdateRequisitionTemplateDto } from "./dto/update-requisition-template.dto";

const TEMPLATE_SELECT = {
	id: true,
	type: true,
	templateName: true,
	status: true,
	updatedAt: true,
	usageCount: true,
	shiftType: true,
	startTime: true,
	endTime: true,
	lengthWeeks: true,
	billRate: true,
	organizationOccupation: {
		select: {
			occupation: { select: { name: true, acronym: true } },
		},
	},
	organizationSpecialty: { select: { specialty: { select: { name: true } } } },
	location: { select: { name: true } },
	department: { select: { name: true } },
	complianceChecklist: {
		select: {
			name: true,
			items: { select: { id: true } },
		},
	},
} as const;

const TEMPLATE_DETAIL_SELECT = {
	id: true,
	type: true,
	templateName: true,
	locationId: true,
	organizationOccupationId: true,
	organizationSpecialtyId: true,
	departmentId: true,
	unitName: true,
	jobDescription: true,
	benefitsPerks: true,
	status: true,
	startDate: true,
	endDate: true,
	lengthWeeks: true,
	startTime: true,
	endTime: true,
	shiftType: true,
	shiftHours: true,
	shiftsPerWeek: true,
	hoursPerWeek: true,
	billRate: true,
	numberOfPositions: true,
	incentiveType: true,
	incentiveAmount: true,
	interviewRequired: true,
	hiringManagerId: true,
	complianceChecklistId: true,
	requiresApproval: true,
	approvalRole: true,
	workflowType: true,
	whoCanSubmit: true,
	internalNotes: true,
	templateVendors: { select: { vendorId: true } },
	complianceChecklist: {
		select: {
			items: {
				select: {
					complianceListItemId: true,
					phase: true,
				},
			},
		},
	},
	organizationOccupation: { select: { id: true, occupationId: true } },
	organizationSpecialty: { select: { id: true, specialtyId: true } },
} as const;

@Injectable()
export class RequisitionTemplatesService {
	constructor(private readonly prisma: PrismaService) {}

	private mapTemplateDetail(
		template: Prisma.RequisitionTemplateGetPayload<{
			select: typeof TEMPLATE_DETAIL_SELECT;
		}>,
	) {
		const {
			complianceChecklist,
			organizationOccupation,
			organizationSpecialty,
			...rest
		} = template;
		return {
			...rest,
			organizationOccupationId: organizationOccupation.id,
			organizationSpecialtyId: organizationSpecialty?.id ?? null,
			occupationId: organizationOccupation.occupationId,
			specialtyId: organizationSpecialty?.specialtyId ?? null,
			complianceChecklistItemPhases:
				complianceChecklist?.items.map((i) => ({
					complianceListItemId: i.complianceListItemId,
					phase: i.phase,
				})) ?? null,
		};
	}

	private async syncComplianceChecklistItemPhasesTx(
		tx: Prisma.TransactionClient,
		orgId: string,
		checklistId: string,
		phases: {
			complianceListItemId: string;
			phase: ComplianceChecklistItemPhase;
		}[],
	): Promise<void> {
		const checklist = await tx.complianceChecklist.findFirst({
			where: { id: checklistId, organizationId: orgId },
			select: {
				items: { select: { complianceListItemId: true } },
			},
		});
		if (!checklist) {
			throw new BadRequestException(
				"Compliance checklist not found for this organization",
			);
		}
		const allowed = new Set(checklist.items.map((i) => i.complianceListItemId));
		if (phases.length !== allowed.size) {
			throw new BadRequestException(
				"complianceChecklistItemPhases must include every item on the checklist",
			);
		}
		for (const row of phases) {
			if (!allowed.has(row.complianceListItemId)) {
				throw new BadRequestException(
					"complianceChecklistItemPhases contains an item that is not on this checklist",
				);
			}
		}
		for (const row of phases) {
			await tx.complianceChecklistItem.update({
				where: {
					checklistId_complianceListItemId: {
						checklistId,
						complianceListItemId: row.complianceListItemId,
					},
				},
				data: { phase: row.phase },
			});
		}
	}

	private async ensureOrgExists(orgId: string) {
		const org = await this.prisma.organization.findUnique({
			where: { id: orgId },
			select: { id: true },
		});
		if (!org) throw new NotFoundException("Organization not found");
	}

	async list(orgId: string, query: QueryRequisitionTemplatesDto) {
		await this.ensureOrgExists(orgId);

		const page = query.page ?? 1;
		const limit = query.limit ?? 12;
		const skip = (page - 1) * limit;

		const where: Prisma.RequisitionTemplateWhereInput = {
			organizationId: orgId,
			...(query.search
				? {
						OR: [
							{
								templateName: {
									contains: query.search,
									mode: "insensitive",
								},
							},
							{
								organizationOccupation: {
									occupation: {
										name: {
											contains: query.search,
											mode: "insensitive",
										},
									},
								},
							},
							{
								organizationSpecialty: {
									specialty: {
										name: {
											contains: query.search,
											mode: "insensitive",
										},
									},
								},
							},
							{
								location: {
									name: {
										contains: query.search,
										mode: "insensitive",
									},
								},
							},
						],
					}
				: {}),
			...(query.status
				? {
						status: query.status as RequisitionStatus,
					}
				: {}),
			...(query.organizationOccupationId
				? {
						organizationOccupationId: query.organizationOccupationId,
					}
				: {}),
			...(query.organizationSpecialtyId
				? {
						organizationSpecialtyId: query.organizationSpecialtyId,
					}
				: {}),
		};

		const [data, total] = await this.prisma.$transaction([
			this.prisma.requisitionTemplate.findMany({
				where,
				select: TEMPLATE_SELECT,
				orderBy: { updatedAt: "desc" },
				skip,
				take: limit,
			}),
			this.prisma.requisitionTemplate.count({ where }),
		]);

		return {
			data: data.map((item) => {
				const shiftPart = item.shiftType
					? `${item.shiftType.replace(/_/g, " ")}`
					: "Shift";
				const timePart =
					item.startTime && item.endTime
						? `${item.startTime}–${item.endTime}`
						: "";
				const shiftSummary = timePart
					? `${shiftPart} • ${timePart}`
					: shiftPart;
				const durationPart =
					item.lengthWeeks != null ? `${item.lengthWeeks} wk` : "Duration TBD";
				return {
					id: item.id,
					type: item.type,
					status: item.status,
					title: `${item.organizationOccupation.occupation.acronym || item.organizationOccupation.occupation.name} - ${item.location.name} - ${item.organizationSpecialty?.specialty.name ?? "General"}`,
					templateName: item.templateName,
					occupation: item.organizationOccupation.occupation.name,
					specialty: item.organizationSpecialty?.specialty.name ?? "—",
					location: item.location.name,
					departmentLabel: item.department.name,
					shiftSummary,
					billRateLabel: item.billRate != null ? `$${item.billRate}/hr` : "—",
					complianceTemplateName: item.complianceChecklist?.name ?? "—",
					lastUsedLabel: `Updated ${item.updatedAt.toLocaleDateString("en-US")}`,
					usedCount: item.usageCount,
					complianceItemCount: item.complianceChecklist?.items.length ?? 0,
					lastUpdated: item.updatedAt.toISOString(),
					durationLabel: durationPart,
				};
			}),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async create(
		orgId: string,
		dto: CreateRequisitionTemplateDto,
		userId: string,
	) {
		await this.ensureOrgExists(orgId);

		const [orgOccupation, orgSpecialty, department, checklist] =
			await Promise.all([
				this.prisma.organizationOccupation.findFirst({
					where: { organizationId: orgId, occupationId: dto.occupationId },
					select: { id: true },
				}),
				dto.specialtyId
					? this.prisma.organizationSpecialty.findFirst({
							where: { organizationId: orgId, specialtyId: dto.specialtyId },
							select: { id: true },
						})
					: Promise.resolve(null),
				this.prisma.department.findFirst({
					where: { id: dto.departmentId, organizationId: orgId },
					select: {
						id: true,
						locationId: true,
						organizationOccupationId: true,
					},
				}),
				this.prisma.complianceChecklist.findFirst({
					where: {
						id: dto.complianceChecklistId,
						organizationId: orgId,
						isActive: true,
					},
					select: { id: true },
				}),
			]);

		if (!orgOccupation) {
			throw new BadRequestException(
				"Selected occupation is not configured for this organization",
			);
		}
		if (dto.specialtyId && !orgSpecialty) {
			throw new BadRequestException(
				"Selected specialty is not configured for this organization",
			);
		}
		if (!department) {
			throw new BadRequestException(
				"Department not found for this organization",
			);
		}
		if (!checklist) {
			throw new BadRequestException(
				"Compliance checklist not found or inactive",
			);
		}
		if (!department.organizationOccupationId) {
			throw new BadRequestException(
				"This department is missing an organization occupation. Update the department (occupation) before using it for a requisition template",
			);
		}
		if (department.organizationOccupationId !== orgOccupation.id) {
			throw new BadRequestException(
				"Department does not match selected occupation",
			);
		}

		const selectedVendorIds = dto.selectedVendorsOnly
			? (dto.selectedVendorIds ?? [])
			: [];
		if (dto.selectedVendorsOnly && selectedVendorIds.length === 0) {
			throw new BadRequestException("Select at least one vendor");
		}
		if (selectedVendorIds.length > 0) {
			const linkedVendorsCount = await this.prisma.organizationVendor.count({
				where: { organizationId: orgId, vendorId: { in: selectedVendorIds } },
			});
			if (linkedVendorsCount !== selectedVendorIds.length) {
				throw new BadRequestException(
					"One or more selected vendors are not linked to this organization",
				);
			}
		}

		const created = await this.prisma.$transaction(async (tx) => {
			const template = await tx.requisitionTemplate.create({
				data: {
					organizationId: orgId,
					type: dto.type,
					templateName: dto.templateName,
					organizationOccupationId: orgOccupation.id,
					organizationSpecialtyId: orgSpecialty?.id ?? null,
					locationId: department.locationId,
					departmentId: department.id,
					unitName: dto.unitName ?? null,
					jobDescription: dto.jobDescription,
					benefitsPerks: dto.benefitsPerks ?? [],
					status: dto.status,
					startDate: new Date(dto.startDate),
					endDate: dto.endDate ? new Date(dto.endDate) : null,
					lengthWeeks: dto.lengthWeeks,
					startTime: dto.startTime,
					endTime: dto.endTime,
					shiftType: dto.shiftType,
					shiftHours: dto.shiftHours,
					shiftsPerWeek: dto.shiftsPerWeek,
					hoursPerWeek: dto.hoursPerWeek ?? null,
					billRate: dto.billRate,
					numberOfPositions: dto.numberOfPositions,
					incentiveType: dto.incentiveType ?? null,
					incentiveAmount: dto.incentiveAmount ?? null,
					interviewRequired: dto.interviewRequired ?? null,
					hiringManagerId: dto.hiringManagerId ?? null,
					complianceChecklistId: checklist.id,
					requiresApproval: dto.requiresApproval,
					approvalRole: dto.requiresApproval
						? (dto.approvalRole ?? null)
						: null,
					workflowType: dto.workflowType as WorkflowType,
					whoCanSubmit: dto.selectedVendorsOnly
						? "selected_vendors"
						: "all_vendors",
					internalNotes: dto.internalNotes ?? null,
					createdBy: userId,
					updatedBy: userId,
				},
				select: { id: true },
			});

			if (selectedVendorIds.length > 0) {
				await tx.requisitionTemplateVendor.createMany({
					data: selectedVendorIds.map((vendorId) => ({
						templateId: template.id,
						vendorId,
					})),
					skipDuplicates: true,
				});
			}

			if (dto.complianceChecklistItemPhases != null) {
				await this.syncComplianceChecklistItemPhasesTx(
					tx,
					orgId,
					checklist.id,
					dto.complianceChecklistItemPhases,
				);
			}

			return tx.requisitionTemplate.findUnique({
				where: { id: template.id },
				select: TEMPLATE_SELECT,
			});
		});
		return created;
	}

	async findOne(orgId: string, id: string) {
		const template = await this.prisma.requisitionTemplate.findFirst({
			where: { id, organizationId: orgId },
			select: TEMPLATE_DETAIL_SELECT,
		});
		if (!template)
			throw new NotFoundException("Requisition template not found");
		return this.mapTemplateDetail(template);
	}

	async update(
		orgId: string,
		id: string,
		dto: UpdateRequisitionTemplateDto,
		userId: string,
	) {
		const existing = await this.findOne(orgId, id);
		const updateData: Prisma.RequisitionTemplateUncheckedUpdateInput = {
			updatedBy: userId,
		};
		if (dto.specialtyId !== undefined && dto.occupationId !== undefined) {
			const [orgOccupation, orgSpecialty] = await Promise.all([
				this.prisma.organizationOccupation.findFirst({
					where: { organizationId: orgId, occupationId: dto.occupationId },
					select: { id: true },
				}),
				this.prisma.organizationSpecialty.findFirst({
					where: { organizationId: orgId, specialtyId: dto.specialtyId },
					select: { id: true, organizationOccupationId: true },
				}),
			]);
			if (!orgOccupation) {
				throw new BadRequestException(
					"Selected occupation is not configured for this organization",
				);
			}
			if (!orgSpecialty) {
				throw new BadRequestException(
					"Selected specialty is not configured for this organization",
				);
			}
			if (orgSpecialty.organizationOccupationId !== orgOccupation.id) {
				throw new BadRequestException(
					"Selected specialty is not linked to the selected occupation",
				);
			}
			updateData.organizationOccupationId = orgOccupation.id;
			updateData.organizationSpecialtyId = orgSpecialty.id;
		}
		if (dto.departmentId !== undefined) {
			const department = await this.prisma.department.findFirst({
				where: { id: dto.departmentId, organizationId: orgId },
				select: { id: true, locationId: true, organizationOccupationId: true },
			});
			if (!department) {
				throw new BadRequestException(
					"Department not found for this organization",
				);
			}
			if (!department.organizationOccupationId) {
				throw new BadRequestException(
					"This department is missing an organization occupation. Update the department (occupation) before using it for a requisition template",
				);
			}
			if (
				department.organizationOccupationId !==
				existing.organizationOccupationId
			) {
				throw new BadRequestException(
					"Department does not match selected occupation",
				);
			}
			updateData.departmentId = department.id;
		}
		if (dto.templateName !== undefined)
			updateData.templateName = dto.templateName;
		if (dto.unitName !== undefined) updateData.unitName = dto.unitName ?? null;
		if (dto.jobDescription !== undefined)
			updateData.jobDescription = dto.jobDescription;
		if (dto.benefitsPerks !== undefined)
			updateData.benefitsPerks = dto.benefitsPerks;
		if (dto.status !== undefined) updateData.status = dto.status;
		if (dto.startDate !== undefined)
			updateData.startDate = new Date(dto.startDate);
		if (dto.endDate !== undefined)
			updateData.endDate = dto.endDate ? new Date(dto.endDate) : null;
		if (dto.lengthWeeks !== undefined) updateData.lengthWeeks = dto.lengthWeeks;
		if (dto.startTime !== undefined) updateData.startTime = dto.startTime;
		if (dto.endTime !== undefined) updateData.endTime = dto.endTime;
		if (dto.shiftType !== undefined) updateData.shiftType = dto.shiftType;
		if (dto.shiftHours !== undefined) updateData.shiftHours = dto.shiftHours;
		if (dto.shiftsPerWeek !== undefined)
			updateData.shiftsPerWeek = dto.shiftsPerWeek;
		if (dto.hoursPerWeek !== undefined)
			updateData.hoursPerWeek = dto.hoursPerWeek;
		if (dto.billRate !== undefined) updateData.billRate = dto.billRate;
		if (dto.numberOfPositions !== undefined)
			updateData.numberOfPositions = dto.numberOfPositions;
		if (dto.incentiveType !== undefined)
			updateData.incentiveType = dto.incentiveType ?? null;
		if (dto.incentiveAmount !== undefined)
			updateData.incentiveAmount = dto.incentiveAmount ?? null;
		if (dto.interviewRequired !== undefined)
			updateData.interviewRequired = dto.interviewRequired ?? null;
		if (dto.hiringManagerId !== undefined)
			updateData.hiringManagerId = dto.hiringManagerId ?? null;
		if (dto.complianceChecklistId !== undefined)
			updateData.complianceChecklistId = dto.complianceChecklistId;
		if (dto.requiresApproval !== undefined)
			updateData.requiresApproval = dto.requiresApproval;
		if (dto.approvalRole !== undefined) {
			updateData.approvalRole = dto.approvalRole;
		}
		if (dto.requiresApproval === false) {
			updateData.approvalRole = null;
		}
		if (dto.workflowType !== undefined)
			updateData.workflowType = dto.workflowType as WorkflowType;
		if (dto.selectedVendorsOnly !== undefined) {
			updateData.whoCanSubmit = dto.selectedVendorsOnly
				? "selected_vendors"
				: "all_vendors";
		}
		if (dto.internalNotes !== undefined)
			updateData.internalNotes = dto.internalNotes ?? null;

		const result = await this.prisma.$transaction(async (tx) => {
			if (
				dto.selectedVendorIds &&
				(dto.selectedVendorsOnly ??
					existing.whoCanSubmit === "selected_vendors")
			) {
				await tx.requisitionTemplateVendor.deleteMany({
					where: { templateId: id },
				});
				if (dto.selectedVendorIds.length > 0) {
					await tx.requisitionTemplateVendor.createMany({
						data: dto.selectedVendorIds.map((vendorId) => ({
							templateId: id,
							vendorId,
						})),
					});
				}
			}
			await tx.requisitionTemplate.update({ where: { id }, data: updateData });
			const effectiveChecklistId =
				dto.complianceChecklistId !== undefined
					? dto.complianceChecklistId
					: existing.complianceChecklistId;
			if (dto.complianceChecklistItemPhases !== undefined) {
				if (!effectiveChecklistId) {
					throw new BadRequestException(
						"Cannot set compliance item phases without a compliance checklist on the template",
					);
				}
				await this.syncComplianceChecklistItemPhasesTx(
					tx,
					orgId,
					effectiveChecklistId,
					dto.complianceChecklistItemPhases,
				);
			}
			const updated = await tx.requisitionTemplate.findUnique({
				where: { id },
				select: TEMPLATE_DETAIL_SELECT,
			});
			if (!updated)
				throw new NotFoundException("Requisition template not found");
			return this.mapTemplateDetail(updated);
		});
		return result;
	}
}
