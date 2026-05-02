import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import { $Enums, UserRole } from "@repo/db";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateDepartmentDto } from "../dto/create-department.dto";
import { UpdateDepartmentDto } from "../dto/update-department.dto";

@Injectable()
export class OrgDepartmentsService {
	constructor(private readonly prisma: PrismaService) {}

	async findDepartmentsByOrganizationId(
		organizationId: string,
		session: UserSession,
		page = 1,
		limit = 8,
		search?: string,
		locationId?: string,
	) {
		if (!session) {
			throw new UnauthorizedException("Unauthorized");
		}
		const org = await this.prisma.organization.findUnique({
			where: { id: organizationId },
		});

		if (!org) {
			throw new NotFoundException("Organization not found");
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

		const where = {
			organizationId,
			...(locationId && { locationId }),
			...searchFilter,
		};

		const skip = (page - 1) * limit;
		const [data, total] = await Promise.all([
			this.prisma.department.findMany({
				where,
				include: {
					location: { select: { id: true, name: true } },
					organizationOccupation: {
						select: {
							id: true,
							occupation: {
								select: { id: true, name: true, acronym: true },
							},
						},
					},
					organizationSpecialty: {
						select: {
							id: true,
							specialty: {
								select: { id: true, name: true, acronym: true },
							},
						},
					},
					departmentUsers: {
						select: {
							user: {
								select: { id: true, name: true, email: true },
							},
						},
					},
				},
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
			throw new UnauthorizedException("Unauthorized");
		}
		const org = await this.prisma.organization.findUnique({
			where: { id: organizationId },
		});

		if (!org) {
			throw new NotFoundException("Organization not found");
		}

		const location = await this.prisma.organizationLocation.findFirst({
			where: { id: dto.locationId, organizationId },
		});

		if (!location) {
			throw new NotFoundException("Location not found");
		}

		if (dto.organizationOccupationId) {
			const orgOcc = await this.prisma.organizationOccupation.findFirst({
				where: {
					id: dto.organizationOccupationId,
					organizationId,
				},
			});
			if (!orgOcc) {
				throw new NotFoundException("Organization occupation not found");
			}
		}

		if (dto.organizationSpecialtyId) {
			const orgSpec = await this.prisma.organizationSpecialty.findFirst({
				where: {
					id: dto.organizationSpecialtyId,
					organizationId,
				},
			});
			if (!orgSpec) {
				throw new NotFoundException("Organization specialty not found");
			}
			if (!dto.organizationOccupationId) {
				throw new BadRequestException(
					"Occupation is required when a specialty is selected",
				);
			}
			if (orgSpec.organizationOccupationId !== dto.organizationOccupationId) {
				throw new BadRequestException(
					"Selected specialty is not linked to the selected occupation",
				);
			}
		}

		return this.prisma.$transaction(async (tx) => {
			const department = await tx.department.create({
				data: {
					organization: { connect: { id: organizationId } },
					location: { connect: { id: dto.locationId } },
					name: dto.name,
					departmentType: dto.departmentType,
					costCenter: dto.costCenter?.trim() || null,
					...(dto.organizationOccupationId && {
						organizationOccupation: {
							connect: { id: dto.organizationOccupationId },
						},
					}),
					...(dto.organizationSpecialtyId && {
						organizationSpecialty: {
							connect: { id: dto.organizationSpecialtyId },
						},
					}),
					...(dto.organizationOccupationId &&
						dto.organizationSpecialtyId && {
							organizationOccupation: {
								connect: { id: dto.organizationOccupationId },
							},
							organizationSpecialty: {
								connect: { id: dto.organizationSpecialtyId },
							},
						}),
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
				include: {
					location: { select: { id: true, name: true } },
					organizationOccupation: {
						select: {
							id: true,
							occupation: {
								select: { id: true, name: true, acronym: true },
							},
						},
					},
					organizationSpecialty: {
						select: {
							id: true,
							specialty: {
								select: { id: true, name: true, acronym: true },
							},
						},
					},
					departmentUsers: {
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

	async updateDepartment(
		organizationId: string,
		departmentId: string,
		dto: UpdateDepartmentDto,
		session: UserSession,
	) {
		if (!session) {
			throw new UnauthorizedException("Unauthorized");
		}
		const org = await this.prisma.organization.findUnique({
			where: { id: organizationId },
		});

		if (!org) {
			throw new NotFoundException("Organization not found");
		}

		const department = await this.prisma.department.findFirst({
			where: { id: departmentId, organizationId },
		});

		if (!department) {
			throw new NotFoundException("Department not found");
		}

		if (dto.locationId) {
			const location = await this.prisma.organizationLocation.findFirst({
				where: { id: dto.locationId, organizationId },
			});
			if (!location) {
				throw new NotFoundException("Location not found");
			}
		}

		if (dto.organizationOccupationId) {
			const orgOcc = await this.prisma.organizationOccupation.findFirst({
				where: {
					id: dto.organizationOccupationId,
					organizationId,
				},
			});
			if (!orgOcc) {
				throw new NotFoundException("Organization occupation not found");
			}
		}

		const effectiveOccupationId =
			dto.organizationOccupationId ?? department.organizationOccupationId;
		const effectiveSpecialtyId =
			dto.organizationSpecialtyId ?? department.organizationSpecialtyId;
		if (effectiveSpecialtyId) {
			const orgSpec = await this.prisma.organizationSpecialty.findFirst({
				where: {
					id: effectiveSpecialtyId,
					organizationId,
				},
			});
			if (!orgSpec) {
				throw new NotFoundException("Organization specialty not found");
			}
			if (!effectiveOccupationId) {
				throw new BadRequestException(
					"Occupation is required when a specialty is selected",
				);
			}
			if (orgSpec.organizationOccupationId !== effectiveOccupationId) {
				throw new BadRequestException(
					"Selected specialty is not linked to the selected occupation",
				);
			}
		}

		return this.prisma.$transaction(async (tx) => {
			const updateData: Record<string, unknown> = {};
			if (dto.locationId !== undefined) updateData.locationId = dto.locationId;
			if (dto.name !== undefined) updateData.name = dto.name;
			if (dto.departmentType !== undefined)
				updateData.departmentType = dto.departmentType;
			if (dto.costCenter !== undefined)
				updateData.costCenter = dto.costCenter?.trim() || null;
			if (dto.organizationOccupationId !== undefined)
				updateData.organizationOccupationId =
					dto.organizationOccupationId ?? null;
			if (dto.organizationSpecialtyId !== undefined)
				updateData.organizationSpecialtyId =
					dto.organizationSpecialtyId ?? null;

			if (Object.keys(updateData).length > 0) {
				await tx.department.update({
					where: { id: departmentId },
					data: updateData as Parameters<
						typeof tx.department.update
					>[0]["data"],
				});
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
				include: {
					location: { select: { id: true, name: true } },
					organizationOccupation: {
						select: {
							id: true,
							occupation: {
								select: { id: true, name: true, acronym: true },
							},
						},
					},
					organizationSpecialty: {
						select: {
							id: true,
							specialty: {
								select: { id: true, name: true, acronym: true },
							},
						},
					},
					departmentUsers: {
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

	async findDepartmentById(
		organizationId: string,
		departmentId: string,
		session: UserSession,
	) {
		if (!session) {
			throw new UnauthorizedException("Unauthorized");
		}
		const org = await this.prisma.organization.findUnique({
			where: { id: organizationId },
		});

		if (!org) {
			throw new NotFoundException("Organization not found");
		}

		const department = await this.prisma.department.findFirst({
			where: { id: departmentId, organizationId },
			include: {
				location: { select: { id: true, name: true } },
				organizationOccupation: {
					select: {
						id: true,
						occupation: {
							select: { id: true, name: true, acronym: true },
						},
					},
				},
				organizationSpecialty: {
					select: {
						id: true,
						specialty: {
							select: { id: true, name: true, acronym: true },
						},
					},
				},
				departmentUsers: {
					select: {
						user: {
							select: { id: true, name: true, email: true },
						},
					},
				},
				departmentTimekeepingApprovers: {
					select: {
						user: {
							select: { id: true, name: true, email: true },
						},
					},
				},
			},
		});

		if (!department) {
			throw new NotFoundException("Department not found");
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
			throw new UnauthorizedException("Unauthorized");
		}
		const org = await this.prisma.organization.findUnique({
			where: { id: organizationId },
		});

		if (!org) {
			throw new NotFoundException("Organization not found");
		}

		const department = await this.prisma.department.findFirst({
			where: { id: departmentId, organizationId },
		});

		if (!department) {
			throw new NotFoundException("Department not found");
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
					`Invalid approver user IDs: users must be organization members (non-vendor, non-executive)`,
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
			throw new UnauthorizedException("Unauthorized");
		}
		const org = await this.prisma.organization.findUnique({
			where: { id: organizationId },
		});

		if (!org) {
			throw new NotFoundException("Organization not found");
		}

		const department = await this.prisma.department.findFirst({
			where: { id: departmentId, organizationId },
		});

		if (!department) {
			throw new NotFoundException("Department not found");
		}

		await this.prisma.department.delete({
			where: { id: departmentId },
		});
	}
}
