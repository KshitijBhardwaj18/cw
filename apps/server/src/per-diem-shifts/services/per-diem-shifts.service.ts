import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@repo/db";
import { PrismaService } from "src/prisma/prisma.service";
import type { CancelPerDiemShiftDto } from "../dto/per-diem-shifts/cancel-per-diem-shift.dto";
import type { CreatePerDiemShiftDto } from "../dto/per-diem-shifts/create-per-diem-shift.dto";
import type { PerDiemShiftsQueryDto } from "../dto/per-diem-shifts/per-diem-shifts-query.dto";
import type { UpdatePerDiemShiftDto } from "../dto/per-diem-shifts/update-per-diem-shift.dto";

@Injectable()
export class PerDiemShiftsService {
	constructor(private readonly prisma: PrismaService) {}

	private parseShiftDate(shiftDate: string) {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(shiftDate)) {
			throw new BadRequestException("Shift date must be in YYYY-MM-DD format.");
		}
		const d = new Date(`${shiftDate}T00:00:00.000Z`);
		if (Number.isNaN(d.getTime())) {
			throw new BadRequestException("Enter a valid shift date.");
		}
		return d;
	}

	async create(orgId: string, dto: CreatePerDiemShiftDto, userId: string) {
		const org = await this.prisma.organization.findUnique({
			where: { id: orgId },
			select: { id: true },
		});
		if (!org) throw new NotFoundException("Organization not found.");

		const template = await this.prisma.shiftTemplate.findFirst({
			where: { id: dto.shiftTemplateId, organizationId: orgId },
			select: {
				id: true,
				occupationId: true,
				departmentId: true,
				locationId: true,
			},
		});
		if (!template) throw new NotFoundException("Shift template not found.");

		const shiftDate = this.parseShiftDate(dto.shiftDate);
		const totalCost = dto.totalShiftHours * dto.shiftRate;

		const specialtyIds = Array.from(new Set(dto.specialtyIds ?? []));

		const created = await this.prisma.perDiemShift.create({
			data: {
				organizationId: orgId,
				shiftTemplateId: template.id,
				shiftDate,
				startTime: dto.startTime,
				endTime: dto.endTime,
				totalShiftHours: dto.totalShiftHours,
				shiftType: dto.shiftType,
				occupationId: template.occupationId,
				departmentId: template.departmentId,
				locationId: template.locationId,
				shiftRate: dto.shiftRate,
				vendorRate: dto.vendorRate,
				totalCost,
				isUrgent: dto.isUrgent ?? false,
				publishedAt: new Date(),
				createdById: userId,
				updatedById: userId,
				...(specialtyIds.length > 0
					? {
							specialties: {
								create: specialtyIds.map((specialtyId) => ({
									specialtyId,
								})),
							},
						}
					: {}),
			},
			select: {
				id: true,
				status: true,
				shiftDate: true,
				startTime: true,
				endTime: true,
				totalShiftHours: true,
				shiftType: true,
				shiftRate: true,
				vendorRate: true,
				totalCost: true,
				isUrgent: true,
				createdAt: true,
			},
		});
		return created;
	}

	private parseDateFilter(date: string | undefined) {
		if (!date?.trim()) return null;
		if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
			throw new BadRequestException("Date must be in YYYY-MM-DD format.");
		}
		const d = new Date(`${date}T00:00:00.000Z`);
		if (Number.isNaN(d.getTime())) {
			throw new BadRequestException("Enter a valid date.");
		}
		return d.toISOString().slice(0, 10);
	}

	private async detectConflicts(
		claimed: Array<{
			shiftId: string;
			candidateId: string;
			shiftDate: Date;
			shiftType: string;
		}>,
	): Promise<Set<string>> {
		if (claimed.length === 0) return new Set();

		const candidateIds = [...new Set(claimed.map((c) => c.candidateId))];
		const shiftDates = [...new Set(claimed.map((c) => c.shiftDate))];

		const allAssignments = await this.prisma.perDiemAssignment.findMany({
			where: {
				candidateId: { in: candidateIds },
				status: { not: "cancelled" },
				shift: { shiftDate: { in: shiftDates } },
			},
			select: {
				candidateId: true,
				shiftId: true,
				shift: { select: { shiftDate: true, shiftType: true } },
			},
		});

		// candidateId → [{shiftId, dateKey, shiftType}]
		const byCandidate = new Map<
			string,
			Array<{ shiftId: string; dateKey: string; shiftType: string }>
		>();
		for (const a of allAssignments) {
			const dateKey = a.shift.shiftDate.toISOString().slice(0, 10);
			const list = byCandidate.get(a.candidateId) ?? [];
			list.push({ shiftId: a.shiftId, dateKey, shiftType: a.shift.shiftType });
			byCandidate.set(a.candidateId, list);
		}

		// Only Day↔Night patterns are flagged as safety conflicts
		const OPPOSING: Record<string, string> = { DAY: "NIGHT", NIGHT: "DAY" };

		const conflictSet = new Set<string>();
		for (const item of claimed) {
			const opposing = OPPOSING[item.shiftType];
			if (!opposing) continue;
			const itemDateKey = item.shiftDate.toISOString().slice(0, 10);
			const candidateShifts = byCandidate.get(item.candidateId) ?? [];
			const hasConflict = candidateShifts.some(
				(a) =>
					a.shiftId !== item.shiftId &&
					a.dateKey === itemDateKey &&
					a.shiftType === opposing,
			);
			if (hasConflict) conflictSet.add(item.shiftId);
		}

		return conflictSet;
	}

	async list(orgId: string, query: PerDiemShiftsQueryDto) {
		const org = await this.prisma.organization.findUnique({
			where: { id: orgId },
			select: { id: true },
		});
		if (!org) throw new NotFoundException("Organization not found.");

		const page = query.page ?? 1;
		const limit = query.limit ?? 10;
		const skip = (page - 1) * limit;

		const dateIso = this.parseDateFilter(query.date);

		const baseWhere: Prisma.PerDiemShiftWhereInput = {
			organizationId: orgId,
			...(query.shiftType ? { shiftType: query.shiftType } : {}),
			...(query.department
				? {
						department: {
							name: {
								contains: query.department,
								mode: "insensitive",
							},
						},
					}
				: {}),
			...(query.location
				? {
						location: {
							name: {
								contains: query.location,
								mode: "insensitive",
							},
						},
					}
				: {}),
			...(query.occupation
				? {
						occupation: {
							name: {
								contains: query.occupation,
								mode: "insensitive",
							},
						},
					}
				: {}),
			...(query.specialty
				? {
						specialties: {
							some: {
								specialty: {
									name: {
										contains: query.specialty,
										mode: "insensitive",
									},
								},
							},
						},
					}
				: {}),
			...(dateIso
				? {
						shiftDate: {
							gte: new Date(`${dateIso}T00:00:00.000Z`),
							lt: new Date(`${dateIso}T23:59:59.999Z`),
						},
					}
				: {}),
			...(query.search
				? {
						OR: [
							{
								shiftTemplate: {
									templateName: {
										contains: query.search,
										mode: "insensitive",
									},
								},
							},
							{
								occupation: {
									name: { contains: query.search, mode: "insensitive" },
								},
							},
							{
								department: {
									name: { contains: query.search, mode: "insensitive" },
								},
							},
							{
								location: {
									name: { contains: query.search, mode: "insensitive" },
								},
							},
						],
					}
				: {}),
		};

		const where: Prisma.PerDiemShiftWhereInput = {
			...baseWhere,
			...(query.status ? { status: query.status } : {}),
		};

		const [items, total, grouped] = await Promise.all([
			this.prisma.perDiemShift.findMany({
				where,
				select: {
					id: true,
					status: true,
					shiftDate: true,
					startTime: true,
					endTime: true,
					shiftRate: true,
					vendorRate: true,
					shiftType: true,
					totalShiftHours: true,
					totalCost: true,
					createdAt: true,
					occupation: { select: { name: true } },
					specialties: {
						select: { specialty: { select: { name: true } } },
					},
					department: { select: { name: true } },
					location: { select: { name: true } },
					shiftTemplate: { select: { templateName: true } },
					assignments: {
						select: {
							candidateId: true,
							candidate: { select: { user: { select: { name: true } } } },
							assignedAt: true,
						},
						orderBy: { assignedAt: "desc" },
						take: 1,
					},
					createdBy: { select: { name: true } },
				},
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
			}),
			this.prisma.perDiemShift.count({ where }),
			this.prisma.perDiemShift.groupBy({
				by: ["status"],
				where: baseWhere,
				_count: { _all: true },
			}),
		]);

		const countsByStatus = grouped.reduce<Record<string, number>>((acc, g) => {
			acc[g.status] = g._count._all;
			return acc;
		}, {});

		const claimedForConflict = items
			.map((s) => ({
				shiftId: s.id,
				candidateId: s.assignments[0]?.candidateId ?? null,
				shiftDate: s.shiftDate,
				shiftType: s.shiftType as string,
			}))
			.filter(
				(
					x,
				): x is {
					shiftId: string;
					candidateId: string;
					shiftDate: Date;
					shiftType: string;
				} => x.candidateId != null,
			);
		const conflictSet = await this.detectConflicts(claimedForConflict);

		return {
			data: items.map((s) => {
				const claimed = s.assignments[0];
				const hasConflict = conflictSet.has(s.id);
				return {
					id: s.id,
					title: `${s.shiftTemplate?.templateName ?? "Per Diem Shift"} - ${s.occupation.name}`,
					status: s.status,
					date: s.shiftDate.toISOString().slice(0, 10),
					timeRange: `${s.startTime} - ${s.endTime}`,
					ratePerHour: s.shiftRate,
					occupation: s.occupation.name,
					specialty:
						s.specialties.length > 0
							? s.specialties
									.map((ss) => ss.specialty.name)
									.filter(Boolean)
									.join(", ")
							: "—",
					department: s.department?.name ?? "—",
					location: s.location.name,
					claimedBy: claimed?.candidate.user.name ?? null,
					claimedAt: claimed?.assignedAt.toISOString() ?? null,
					vendorRatePerHour: s.vendorRate,
					shiftType: s.shiftType,
					totalHours: s.totalShiftHours,
					totalCost: s.totalCost ?? s.totalShiftHours * s.shiftRate,
					notifications: 0,
					createdBy: s.createdBy?.name ?? "—",
					createdAt: s.createdAt.toISOString(),
					hasConflict,
					conflictReason: hasConflict
						? "Safety Conflict: Consecutive Day/Night shifts detected"
						: null,
				};
			}),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
			counts: {
				ALL: Object.values(countsByStatus).reduce((a, b) => a + b, 0),
				OPEN: countsByStatus.OPEN ?? 0,
				IN_PROGRESS: countsByStatus.IN_PROGRESS ?? 0,
				COMPLETED: countsByStatus.COMPLETED ?? 0,
				CANCELLED: countsByStatus.CANCELLED ?? 0,
				EXPIRED: countsByStatus.EXPIRED ?? 0,
			},
		};
	}

	private getNextThreeDaysRange() {
		const start = new Date();
		start.setUTCHours(0, 0, 0, 0);
		const end = new Date(start);
		end.setUTCDate(end.getUTCDate() + 3);
		end.setUTCHours(23, 59, 59, 999);
		return { start, end };
	}

	async getCommandCenterLocations(
		orgId: string,
		query: {
			search?: string;
			department?: string;
			occupation?: string;
			page: number;
			limit: number;
		},
	) {
		const { start, end } = this.getNextThreeDaysRange();
		const skip = (query.page - 1) * query.limit;

		const where: Prisma.PerDiemShiftWhereInput = {
			organizationId: orgId,
			shiftDate: { gte: start, lte: end },
			...(query.search?.trim()
				? {
						location: {
							name: { contains: query.search.trim(), mode: "insensitive" },
						},
					}
				: {}),
			...(query.department
				? {
						department: {
							name: { contains: query.department, mode: "insensitive" },
						},
					}
				: {}),
			...(query.occupation
				? {
						occupation: {
							name: { contains: query.occupation, mode: "insensitive" },
						},
					}
				: {}),
		};

		const [summary, pagedLocationIds, totalLocationsResult] = await Promise.all(
			[
				this.prisma.perDiemShift.groupBy({
					by: ["status"],
					where,
					_count: { _all: true },
				}),
				this.prisma.perDiemShift.findMany({
					where,
					select: { locationId: true },
					distinct: ["locationId"],
					orderBy: { locationId: "asc" },
					skip,
					take: query.limit,
				}),
				this.prisma.$queryRaw<Array<{ count: number }>>`
				SELECT COUNT(DISTINCT "locationId")::int AS count
				FROM per_diem_shifts
				WHERE "organizationId" = ${orgId}::uuid
					AND "shiftDate" >= ${start}
					AND "shiftDate" <= ${end}
			`,
			],
		);

		const locationIds = pagedLocationIds.map((r) => r.locationId);
		const totalLocations = Number(totalLocationsResult[0]?.count ?? 0);

		const shifts =
			locationIds.length === 0
				? []
				: await this.prisma.perDiemShift.findMany({
						where: { ...where, locationId: { in: locationIds } },
						select: {
							id: true,
							status: true,
							shiftDate: true,
							startTime: true,
							endTime: true,
							shiftRate: true,
							vendorRate: true,
							shiftType: true,
							totalShiftHours: true,
							totalCost: true,
							createdAt: true,
							occupation: { select: { name: true } },
							specialties: {
								select: { specialty: { select: { name: true } } },
							},
							department: { select: { name: true } },
							location: { select: { id: true, name: true } },
							shiftTemplate: { select: { templateName: true } },
							createdBy: { select: { name: true } },
							assignments: {
								where: { status: { not: "cancelled" } },
								select: {
									candidateId: true,
									candidate: { select: { user: { select: { name: true } } } },
									assignedAt: true,
								},
								orderBy: { assignedAt: "desc" },
								take: 1,
							},
						},
						orderBy: [
							{ locationId: "asc" },
							{ shiftDate: "asc" },
							{ startTime: "asc" },
						],
					});

		type CommandCenterShiftItem = {
			id: string;
			title: string;
			status: string;
			date: string;
			timeRange: string;
			ratePerHour: number;
			occupation: string;
			specialty: string;
			department: string;
			location: string;
			claimedBy: string | null;
			claimedAt: string | null;
			vendorRatePerHour: number;
			shiftType: string;
			totalHours: number;
			totalCost: number;
			notifications: number;
			createdBy: string;
			createdAt: string;
			hasConflict: boolean;
			conflictReason: string | null;
		};

		const ccClaimedForConflict = shifts
			.map((s) => ({
				shiftId: s.id,
				candidateId: s.assignments[0]?.candidateId ?? null,
				shiftDate: s.shiftDate,
				shiftType: s.shiftType as string,
			}))
			.filter(
				(
					x,
				): x is {
					shiftId: string;
					candidateId: string;
					shiftDate: Date;
					shiftType: string;
				} => x.candidateId != null,
			);
		const ccConflictSet = await this.detectConflicts(ccClaimedForConflict);

		const locationsMap = new Map<
			string,
			{ id: string; name: string; shifts: CommandCenterShiftItem[] }
		>();
		for (const s of shifts) {
			const claimed = s.assignments[0] ?? null;
			const hasConflict = ccConflictSet.has(s.id);
			const shiftItem: CommandCenterShiftItem = {
				id: s.id,
				title: `${s.shiftTemplate?.templateName ?? "Per Diem Shift"} - ${s.occupation.name}`,
				status: s.status,
				date: s.shiftDate.toISOString().slice(0, 10),
				timeRange: `${s.startTime} - ${s.endTime}`,
				ratePerHour: s.shiftRate,
				occupation: s.occupation.name,
				specialty:
					s.specialties.length > 0
						? s.specialties
								.map((ss) => ss.specialty.name)
								.filter(Boolean)
								.join(", ")
						: "—",
				department: s.department?.name ?? "—",
				location: s.location.name,
				claimedBy: claimed?.candidate.user.name ?? null,
				claimedAt: claimed?.assignedAt.toISOString() ?? null,
				vendorRatePerHour: s.vendorRate,
				shiftType: s.shiftType,
				totalHours: s.totalShiftHours,
				totalCost: s.totalCost ?? s.totalShiftHours * s.shiftRate,
				notifications: 0,
				createdBy: s.createdBy?.name ?? "—",
				createdAt: s.createdAt.toISOString(),
				hasConflict,
				conflictReason: hasConflict
					? "Safety Conflict: Consecutive Day/Night shifts detected"
					: null,
			};

			const loc = locationsMap.get(s.location.id) ?? {
				id: s.location.id,
				name: s.location.name,
				shifts: [],
			};
			loc.shifts.push(shiftItem);
			locationsMap.set(s.location.id, loc);
		}

		const countByStatus = Object.fromEntries(
			summary.map((r) => [r.status, r._count._all]),
		);
		const counts = {
			"total-shifts": summary.reduce((a, r) => a + r._count._all, 0),
			filled: (countByStatus.IN_PROGRESS ?? 0) + (countByStatus.COMPLETED ?? 0),
			open: countByStatus.OPEN ?? 0,
			"in-progress": countByStatus.IN_PROGRESS ?? 0,
		};

		const filtersMeta = await this.prisma.perDiemShift.findMany({
			where,
			select: {
				department: { select: { name: true } },
				occupation: { select: { name: true } },
			},
			distinct: ["departmentId", "occupationId"],
		});

		const departmentOccupationsMap = new Map<string, Set<string>>();
		for (const r of filtersMeta) {
			const dept = r.department?.name;
			if (!dept) continue;
			const set = departmentOccupationsMap.get(dept) ?? new Set<string>();
			set.add(r.occupation.name);
			departmentOccupationsMap.set(dept, set);
		}

		return {
			locations: Array.from(locationsMap.values()),
			page: query.page,
			limit: query.limit,
			totalLocations,
			counts,
			filtersMeta: {
				departments: Array.from(departmentOccupationsMap.keys()).sort(),
				occupations: Array.from(
					new Set(filtersMeta.map((r) => r.occupation.name)),
				).sort(),
				departmentOccupations: Array.from(departmentOccupationsMap.entries())
					.map(([department, set]) => ({
						department,
						occupations: Array.from(set).sort(),
					}))
					.sort((a, b) => a.department.localeCompare(b.department)),
			},
		};
	}

	async findOne(orgId: string, shiftId: string) {
		const shift = await this.prisma.perDiemShift.findFirst({
			where: { id: shiftId, organizationId: orgId },
			select: {
				id: true,
				status: true,
				shiftTemplateId: true,
				shiftDate: true,
				startTime: true,
				endTime: true,
				shiftType: true,
				totalShiftHours: true,
				shiftRate: true,
				vendorRate: true,
				isUrgent: true,
				publishedAt: true,
				occupation: { select: { id: true, name: true } },
				department: { select: { id: true, name: true } },
				location: { select: { id: true, name: true } },
				specialties: {
					select: { specialty: { select: { id: true, name: true } } },
				},
				shiftTemplate: {
					select: {
						id: true,
						templateName: true,
						baseRate: true,
						baseBillRate: true,
						vendorRateMarkupPercent: true,
						durationHours: true,
						shiftType: true,
						occupation: { select: { id: true, name: true } },
						department: { select: { id: true, name: true } },
						location: { select: { id: true, name: true } },
					},
				},
				assignments: { select: { id: true }, take: 1 },
			},
		});
		if (!shift) throw new NotFoundException("Shift not found.");

		return {
			id: shift.id,
			status: shift.status,
			shiftTemplateId: shift.shiftTemplateId,
			shiftDate: shift.shiftDate.toISOString().slice(0, 10),
			startTime: shift.startTime,
			endTime: shift.endTime,
			shiftType: shift.shiftType,
			totalShiftHours: shift.totalShiftHours,
			shiftRate: shift.shiftRate,
			vendorRate: shift.vendorRate,
			isUrgent: shift.isUrgent,
			occupation: shift.occupation,
			department: shift.department,
			location: shift.location,
			specialtyIds: shift.specialties.map((s) => s.specialty.id),
			specialties: shift.specialties.map((s) => s.specialty),
			shiftTemplate: shift.shiftTemplate,
			hasAssignments: shift.assignments.length > 0,
			isEditable: shift.status === "OPEN" && shift.assignments.length === 0,
		};
	}

	async update(
		orgId: string,
		shiftId: string,
		dto: UpdatePerDiemShiftDto,
		userId: string,
	) {
		const shift = await this.prisma.perDiemShift.findFirst({
			where: { id: shiftId, organizationId: orgId },
			select: {
				id: true,
				status: true,
				assignments: { select: { id: true }, take: 1 },
			},
		});
		if (!shift) throw new NotFoundException("Shift not found.");
		if (shift.status !== "OPEN") {
			throw new BadRequestException(
				"Only open shifts can be edited. Cancel and recreate if changes are needed.",
			);
		}
		if (shift.assignments.length > 0) {
			throw new BadRequestException(
				"This shift has already been claimed and can no longer be edited.",
			);
		}

		const data: Prisma.PerDiemShiftUpdateInput = {
			updatedBy: { connect: { id: userId } },
		};
		if (dto.shiftDate !== undefined)
			data.shiftDate = this.parseShiftDate(dto.shiftDate);
		if (dto.startTime !== undefined) data.startTime = dto.startTime;
		if (dto.endTime !== undefined) data.endTime = dto.endTime;
		if (dto.shiftType !== undefined) data.shiftType = dto.shiftType;
		if (dto.totalShiftHours !== undefined)
			data.totalShiftHours = dto.totalShiftHours;
		if (dto.shiftRate !== undefined) data.shiftRate = dto.shiftRate;
		if (dto.vendorRate !== undefined) data.vendorRate = dto.vendorRate;
		if (dto.isUrgent !== undefined) data.isUrgent = dto.isUrgent;

		if (dto.totalShiftHours !== undefined || dto.shiftRate !== undefined) {
			const hours =
				dto.totalShiftHours ??
				(
					await this.prisma.perDiemShift.findUniqueOrThrow({
						where: { id: shiftId },
						select: { totalShiftHours: true },
					})
				).totalShiftHours;
			const rate =
				dto.shiftRate ??
				(
					await this.prisma.perDiemShift.findUniqueOrThrow({
						where: { id: shiftId },
						select: { shiftRate: true },
					})
				).shiftRate;
			data.totalCost = hours * rate;
		}

		const specialtyIds =
			dto.specialtyIds !== undefined
				? Array.from(new Set(dto.specialtyIds))
				: null;

		await this.prisma.$transaction(async (tx) => {
			await tx.perDiemShift.update({
				where: { id: shiftId },
				data,
				select: { id: true },
			});

			if (specialtyIds !== null) {
				await tx.perDiemShiftSpecialty.deleteMany({ where: { shiftId } });
				if (specialtyIds.length > 0) {
					await tx.perDiemShiftSpecialty.createMany({
						data: specialtyIds.map((specialtyId) => ({
							shiftId,
							specialtyId,
						})),
					});
				}
			}
		});

		return this.findOne(orgId, shiftId);
	}

	async cancel(
		orgId: string,
		shiftId: string,
		_dto: CancelPerDiemShiftDto,
		userId: string,
	) {
		const shift = await this.prisma.perDiemShift.findFirst({
			where: { id: shiftId, organizationId: orgId },
			select: { id: true, status: true },
		});
		if (!shift) throw new NotFoundException("Shift not found.");

		if (shift.status === "COMPLETED") {
			throw new BadRequestException("Completed shifts cannot be cancelled.");
		}
		if (shift.status === "CANCELLED") {
			return { success: true };
		}

		await this.prisma.perDiemShift.update({
			where: { id: shiftId },
			data: { status: "CANCELLED" as const, updatedById: userId },
			select: { id: true },
		});

		return { success: true };
	}
}
