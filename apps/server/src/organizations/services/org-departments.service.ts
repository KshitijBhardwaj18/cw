import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import { $Enums, Prisma, UserRole } from "@repo/db";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateDepartmentDto } from "../dto/create-department.dto";
import { UpdateDepartmentDto } from "../dto/update-department.dto";

const DEPARTMENT_INCLUDE = {
	location: { select: { id: true, name: true } },
	departmentOccupations: {
		select: {
			organizationOccupation: {
				select: {
					id: true,
					occupation: { select: { id: true, name: true, acronym: true } },
				},
			},
		},
	},
	departmentSpecialties: {
		select: {
			organizationSpecialty: {
				select: {
					id: true,
					organizationOccupationId: true,
					specialty: { select: { id: true, name: true, acronym: true } },
				},
			},
		},
	},
	departmentUsers: {
		select: {
			user: { select: { id: true, name: true, email: true } },
		},
	},
} as const satisfies Prisma.DepartmentInclude;

const DEPARTMENT_DETAIL_INCLUDE = {
	...DEPARTMENT_INCLUDE,
	departmentTimekeepingApprovers: {
		select: {
			user: { select: { id: true, name: true, email: true } },
		},
	},
} as const satisfies Prisma.DepartmentInclude;

@Injectable()
export class OrgDepartmentsService {
	constructor(private readonly prisma: PrismaService) {}

	private async validateDepartmentScope(
		organizationId: string,
		opts: {
			locationId?: string;
			occupationIds?: string[];
			specialtyIds?: string[];
		},
	): Promise<void> {
		if (opts.locationId) {
			const location = await this.prisma.organizationLocation.findFirst({
				where: { id: opts.locationId, organizationId },
				select: { id: true },
			});
			if (!location) {
				throw new NotFoundException("Location not found.");
			}
		}

		const occupationIds = Array.from(new Set(opts.occupationIds ?? []));
		const specialtyIds = Array.from(new Set(opts.specialtyIds ?? []));

		let occupationsById = new Map<string, { id: string }>();
		if (occupationIds.length > 0) {
			const found = await this.prisma.organizationOccupation.findMany({
				where: { id: { in: occupationIds }, organizationId },
				select: { id: true },
			});
			if (found.length !== occupationIds.length) {
				throw new NotFoundException("One or more occupations not found.");
			}
			occupationsById = new Map(found.map((o) => [o.id, o]));
		}

		if (specialtyIds.length > 0) {
			if (occupationIds.length === 0) {
				throw new BadRequestException(
					"Select at least one occupation when picking specialties",
				);
			}
			const found = await this.prisma.organizationSpecialty.findMany({
				where: { id: { in: specialtyIds }, organizationId },
				select: { id: true, organizationOccupationId: true },
			});
			if (found.length !== specialtyIds.length) {
				throw new NotFoundException("One or more specialties not found.");
			}
			const stray = found.filter(
				(s) => !occupationsById.has(s.organizationOccupationId),
			);
			if (stray.length > 0) {
				throw new BadRequestException(
					"Each specialty must belong to one of the selected occupations",
				);
			}
		}
	}

	async findDepartmentsByOrganizationId(
		organizationId: string,
		session: UserSession,
		page = 1,
		limit = 8,
		search?: string,
		locationId?: string,
		organizationOccupationId?: string,
		organizationSpecialtyId?: string,
	) {
		if (!session) {
			throw new UnauthorizedException("Sign in required.");
		}
		const org = await this.prisma.organization.findUnique({
			where: { id: organizationId },
		});

		if (!org) {
			throw new NotFoundException("Organization not found.");
		}

		const searchFilter = search?.trim()
			? {
					OR: [
						{
							name: {
								contains: search.trim(),
								mode: "insensitive" as const,
							},
						},
						{
							costCenter: {
								contains: search.trim(),
								mode: "insensitive" as const,
							},
						},
					],
				}
			: {};

		const where: Prisma.DepartmentWhereInput = {
			organizationId,
			...(locationId && { locationId }),
			...(organizationOccupationId && {
				departmentOccupations: {
					some: { organizationOccupationId },
				},
			}),
			...(organizationSpecialtyId && {
				departmentSpecialties: {
					some: { organizationSpecialtyId },
				},
			}),
			...searchFilter,
		};

		const skip = (page - 1) * limit;
		const [data, total] = await Promise.all([
			this.prisma.department.findMany({
				where,
				include: DEPARTMENT_INCLUDE,
				orderBy: { name: "asc" },
				skip,
				take: limit,
			}),
			this.prisma.department.count({ where }),
		]);

		return {
			data,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async createDepartment(
		organizationId: string,
		dto: CreateDepartmentDto,
		session: UserSession,
	) {
		if (!session) {
			throw new UnauthorizedException("Sign in required.");
		}
		const org = await this.prisma.organization.findUnique({
			where: { id: organizationId },
		});

		if (!org) {
			throw new NotFoundException("Organization not found.");
		}

		const occupationIds = Array.from(
			new Set(dto.organizationOccupationIds ?? []),
		);
		const specialtyIds = Array.from(
			new Set(dto.organizationSpecialtyIds ?? []),
		);

		await this.validateDepartmentScope(organizationId, {
			locationId: dto.locationId,
			occupationIds,
			specialtyIds,
		});

		return this.prisma.$transaction(async (tx) => {
			const department = await tx.department.create({
				data: {
					organization: { connect: { id: organizationId } },
					location: { connect: { id: dto.locationId } },
					name: dto.name,
					departmentType: dto.departmentType,
					costCenter: dto.costCenter?.trim() || null,
					departmentOccupations: {
						create: occupationIds.map((id) => ({
							organizationOccupationId: id,
						})),
					},
					departmentSpecialties: {
						create: specialtyIds.map((id) => ({
							organizationSpecialtyId: id,
						})),
					},
				},
			});

			if (dto.relatedUserIds?.length) {
				const existingMembers = await tx.member.findMany({
					where: {
						organizationId,
						userId: { in: dto.relatedUserIds },
					},
					select: { userId: true },
				});
				const validUserIds = existingMembers.map((m) => m.userId);
				if (validUserIds.length > 0) {
					await tx.departmentUser.createMany({
						data: validUserIds.map((userId) => ({
							departmentId: department.id,
							userId,
						})),
						skipDuplicates: true,
					});
				}
			}

			return tx.department.findUniqueOrThrow({
				where: { id: department.id },
				include: DEPARTMENT_INCLUDE,
			});
		});
	}

	async updateDepartment(
		organizationId: string,
		departmentId: string,
		dto: UpdateDepartmentDto,
		session: UserSession,
	) {
		if (!session) {
			throw new UnauthorizedException("Sign in required.");
		}
		const org = await this.prisma.organization.findUnique({
			where: { id: organizationId },
		});

		if (!org) {
			throw new NotFoundException("Organization not found.");
		}

		const department = await this.prisma.department.findFirst({
			where: { id: departmentId, organizationId },
			include: {
				departmentOccupations: { select: { organizationOccupationId: true } },
				departmentSpecialties: { select: { organizationSpecialtyId: true } },
			},
		});

		if (!department) {
			throw new NotFoundException("Department not found.");
		}

		const nextOccupationIds = Array.from(
			new Set(
				dto.organizationOccupationIds ??
					department.departmentOccupations.map(
						(o) => o.organizationOccupationId,
					),
			),
		);
		const nextSpecialtyIds = Array.from(
			new Set(
				dto.organizationSpecialtyIds ??
					department.departmentSpecialties.map(
						(s) => s.organizationSpecialtyId,
					),
			),
		);

		await this.validateDepartmentScope(organizationId, {
			locationId: dto.locationId,
			occupationIds: nextOccupationIds,
			specialtyIds: nextSpecialtyIds,
		});

		return this.prisma.$transaction(async (tx) => {
			const updateData: Prisma.DepartmentUpdateInput = {};
			if (dto.locationId !== undefined) {
				updateData.location = { connect: { id: dto.locationId } };
			}
			if (dto.name !== undefined) updateData.name = dto.name;
			if (dto.departmentType !== undefined)
				updateData.departmentType = dto.departmentType;
			if (dto.costCenter !== undefined)
				updateData.costCenter = dto.costCenter?.trim() || null;

			if (Object.keys(updateData).length > 0) {
				await tx.department.update({
					where: { id: departmentId },
					data: updateData,
				});
			}

			if (dto.organizationOccupationIds !== undefined) {
				await tx.departmentOccupation.deleteMany({ where: { departmentId } });
				if (nextOccupationIds.length > 0) {
					await tx.departmentOccupation.createMany({
						data: nextOccupationIds.map((id) => ({
							departmentId,
							organizationOccupationId: id,
						})),
						skipDuplicates: true,
					});
				}
			}

			if (dto.organizationSpecialtyIds !== undefined) {
				await tx.departmentSpecialty.deleteMany({ where: { departmentId } });
				if (nextSpecialtyIds.length > 0) {
					await tx.departmentSpecialty.createMany({
						data: nextSpecialtyIds.map((id) => ({
							departmentId,
							organizationSpecialtyId: id,
						})),
						skipDuplicates: true,
					});
				}
			}

			if (dto.relatedUserIds !== undefined) {
				await tx.departmentUser.deleteMany({
					where: { departmentId },
				});
				if (dto.relatedUserIds.length > 0) {
					const existingMembers = await tx.member.findMany({
						where: {
							organizationId,
							userId: { in: dto.relatedUserIds },
						},
						select: { userId: true },
					});
					const validUserIds = existingMembers.map((m) => m.userId);
					if (validUserIds.length > 0) {
						await tx.departmentUser.createMany({
							data: validUserIds.map((userId) => ({
								departmentId,
								userId,
							})),
							skipDuplicates: true,
						});
					}
				}
			}

			return tx.department.findUniqueOrThrow({
				where: { id: departmentId },
				include: DEPARTMENT_INCLUDE,
			});
		});
	}

	async findDepartmentById(
		organizationId: string,
		departmentId: string,
		session: UserSession,
	) {
		if (!session) {
			throw new UnauthorizedException("Sign in required.");
		}
		const org = await this.prisma.organization.findUnique({
			where: { id: organizationId },
		});

		if (!org) {
			throw new NotFoundException("Organization not found.");
		}

		const department = await this.prisma.department.findFirst({
			where: { id: departmentId, organizationId },
			include: DEPARTMENT_DETAIL_INCLUDE,
		});

		if (!department) {
			throw new NotFoundException("Department not found.");
		}

		return department;
	}

	async updateDepartmentTimekeepingApprovers(
		organizationId: string,
		departmentId: string,
		userIds: string[],
		session: UserSession,
	) {
		if (!session) {
			throw new UnauthorizedException("Sign in required.");
		}
		const org = await this.prisma.organization.findUnique({
			where: { id: organizationId },
		});

		if (!org) {
			throw new NotFoundException("Organization not found.");
		}

		const department = await this.prisma.department.findFirst({
			where: { id: departmentId, organizationId },
		});

		if (!department) {
			throw new NotFoundException("Department not found.");
		}

		if (userIds.length > 0) {
			const validMembers = await this.prisma.member.findMany({
				where: {
					organizationId,
					userId: { in: userIds },
					user: { role: { not: UserRole.VENDOR_USER } },
					role: { not: $Enums.MemberRole.EXECUTIVE },
				},
				select: { userId: true },
			});
			const validUserIds = validMembers.map((m) => m.userId);
			const invalid = userIds.filter((id) => !validUserIds.includes(id));
			if (invalid.length > 0) {
				throw new BadRequestException(
					"Approvers must be active organization members (non-vendor, non-executive).",
				);
			}
		}

		return this.prisma.$transaction(async (tx) => {
			await tx.departmentTimekeepingApprover.deleteMany({
				where: { departmentId },
			});
			if (userIds.length > 0) {
				await tx.departmentTimekeepingApprover.createMany({
					data: userIds.map((userId) => ({
						departmentId,
						userId,
					})),
					skipDuplicates: true,
				});
			}
			return tx.department.findUniqueOrThrow({
				where: { id: departmentId },
				include: {
					departmentTimekeepingApprovers: {
						select: {
							user: {
								select: { id: true, name: true, email: true },
							},
						},
					},
				},
			});
		});
	}

	async deleteDepartment(
		organizationId: string,
		departmentId: string,
		session: UserSession,
	): Promise<void> {
		if (!session) {
			throw new UnauthorizedException("Sign in required.");
		}
		const org = await this.prisma.organization.findUnique({
			where: { id: organizationId },
		});

		if (!org) {
			throw new NotFoundException("Organization not found.");
		}

		const department = await this.prisma.department.findFirst({
			where: { id: departmentId, organizationId },
		});

		if (!department) {
			throw new NotFoundException("Department not found.");
		}

		await this.prisma.department.delete({
			where: { id: departmentId },
		});
	}
}
