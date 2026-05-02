import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@repo/db";
import { BackgroundJobsService } from "src/background-jobs/background-jobs.service";
import { PrismaService } from "src/prisma/prisma.service";
import type { CancelPerDiemShiftDto } from "../dto/per-diem-shifts/cancel-per-diem-shift.dto";
import type { CreatePerDiemShiftDto } from "../dto/per-diem-shifts/create-per-diem-shift.dto";
import type { PerDiemShiftsQueryDto } from "../dto/per-diem-shifts/per-diem-shifts-query.dto";

@Injectable()
export class PerDiemShiftsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly backgroundJobs: BackgroundJobsService,
	) {}

	private parseShiftDate(shiftDate: string) {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(shiftDate)) {
			throw new BadRequestException("shiftDate must be in YYYY-MM-DD format");
		}
		const d = new Date(`${shiftDate}T00:00:00.000Z`);
		if (Number.isNaN(d.getTime())) {
			throw new BadRequestException("Invalid shiftDate");
		}
		return d;
	}

	async create(orgId: string, dto: CreatePerDiemShiftDto, userId: string) {
		const org = await this.prisma.organization.findUnique({
			where: { id: orgId },
			select: { id: true },
		});
		if (!org) throw new NotFoundException("Organization not found");

		const template = await this.prisma.shiftTemplate.findFirst({
			where: { id: dto.shiftTemplateId, organizationId: orgId },
			select: {
				id: true,
				occupationId: true,
				departmentId: true,
				locationId: true,
			},
		});
		if (!template) throw new NotFoundException("Shift template not found");

		const shiftDate = this.parseShiftDate(dto.shiftDate);
		const totalCost = dto.totalShiftHours * dto.shiftRate;

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
				specialtyId: dto.specialtyId ?? null,
				departmentId: template.departmentId,
				locationId: template.locationId,
				shiftRate: dto.shiftRate,
				vendorRate: dto.vendorRate,
				totalCost,
				isPublic: dto.isPublic ?? true,
				isUrgent: dto.isUrgent ?? false,
				createdById: userId,
				updatedById: userId,
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
				isPublic: true,
				isUrgent: true,
				createdAt: true,
			},
		});
		await this.backgroundJobs.enqueueMonthlyMetricSnapshotForOrganization(
			orgId,
		);
		return created;
	}

	private parseDateFilter(date: string | undefined) {
		if (!date?.trim()) return null;
		if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
			throw new BadRequestException("date must be in YYYY-MM-DD format");
		}
		const d = new Date(`${date}T00:00:00.000Z`);
		if (Number.isNaN(d.getTime())) {
			throw new BadRequestException("Invalid date");
		}
		return d.toISOString().slice(0, 10);
	}

	async list(orgId: string, query: PerDiemShiftsQueryDto) {
		const org = await this.prisma.organization.findUnique({
			where: { id: orgId },
			select: { id: true },
		});
		if (!org) throw new NotFoundException("Organization not found");

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
						specialty: {
							name: {
								contains: query.specialty,
								mode: "insensitive",
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
					isPublic: true,
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
					specialty: { select: { name: true } },
					department: { select: { name: true } },
					location: { select: { name: true } },
					shiftTemplate: { select: { templateName: true } },
					assignments: {
						select: {
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

		return {
			data: items.map((s) => {
				const claimed = s.assignments[0];
				return {
					id: s.id,
					title: `${s.shiftTemplate?.templateName ?? "Per Diem Shift"} - ${s.occupation.name}`,
					status: s.status,
					isPublic: s.isPublic,
					date: s.shiftDate.toISOString().slice(0, 10),
					timeRange: `${s.startTime} - ${s.endTime}`,
					ratePerHour: s.shiftRate,
					occupation: s.occupation.name,
					specialty: s.specialty?.name ?? "—",
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
		query: { search?: string; department?: string; occupation?: string },
	) {
		const org = await this.prisma.organization.findUnique({
			where: { id: orgId },
			select: { id: true },
		});
		if (!org) throw new NotFoundException("Organization not found");

		const { start, end } = this.getNextThreeDaysRange();

		const where: Prisma.PerDiemShiftWhereInput = {
			organizationId: orgId,
			shiftDate: { gte: start, lte: end },
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

		const shifts = await this.prisma.perDiemShift.findMany({
			where,
			select: {
				id: true,
				status: true,
				isPublic: true,
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
				specialty: { select: { name: true } },
				department: { select: { name: true } },
				location: { select: { id: true, name: true } },
				shiftTemplate: { select: { templateName: true } },
				assignments: {
					select: {
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
			isPublic: boolean;
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
		};

		const locationsMap = new Map<
			string,
			{ id: string; name: string; shifts: CommandCenterShiftItem[] }
		>();
		for (const s of shifts) {
			const claimed = s.assignments[0];
			const shiftItem = {
				id: s.id,
				title: `${s.shiftTemplate?.templateName ?? "Per Diem Shift"} - ${s.occupation.name}`,
				status: s.status,
				isPublic: s.isPublic,
				date: s.shiftDate.toISOString().slice(0, 10),
				timeRange: `${s.startTime} - ${s.endTime}`,
				ratePerHour: s.shiftRate,
				occupation: s.occupation.name,
				specialty: s.specialty?.name ?? "—",
				department: s.department?.name ?? "—",
				location: s.location.name,
				claimedBy: claimed?.candidate.user.name ?? null,
				claimedAt: claimed?.assignedAt.toISOString() ?? null,
				vendorRatePerHour: s.vendorRate,
				shiftType: s.shiftType,
				totalHours: s.totalShiftHours,
				totalCost: s.totalCost ?? s.totalShiftHours * s.shiftRate,
				notifications: 0,
				createdBy: "—",
				createdAt: s.createdAt.toISOString(),
			};

			const loc = locationsMap.get(s.location.id) ?? {
				id: s.location.id,
				name: s.location.name,
				shifts: [],
			};
			loc.shifts.push(shiftItem);
			locationsMap.set(s.location.id, loc);
		}

		let locations = Array.from(locationsMap.values());
		if (query.search?.trim()) {
			const q = query.search.trim().toLowerCase();
			locations = locations.filter((l) => l.name.toLowerCase().includes(q));
		}

		const allShifts = locations.flatMap((l) => l.shifts);
		const counts = {
			"total-shifts": allShifts.length,
			filled: allShifts.filter((s) => s.claimedBy != null).length,
			open: allShifts.filter((s) => s.status === "OPEN").length,
			"in-progress": allShifts.filter((s) => s.status === "IN_PROGRESS").length,
		};

		const departments = Array.from(
			new Set(
				shifts
					.map((s) => s.department?.name)
					.filter((n): n is string => Boolean(n)),
			),
		).sort();
		const occupations = Array.from(
			new Set(shifts.map((s) => s.occupation.name)),
		).sort();
		const departmentOccupationsMap = new Map<string, Set<string>>();
		for (const s of shifts) {
			const dept = s.department?.name;
			if (!dept) continue;
			const set = departmentOccupationsMap.get(dept) ?? new Set<string>();
			set.add(s.occupation.name);
			departmentOccupationsMap.set(dept, set);
		}
		const departmentOccupations = Array.from(departmentOccupationsMap.entries())
			.map(([department, set]) => ({
				department,
				occupations: Array.from(set.values()).sort(),
			}))
			.sort((a, b) => a.department.localeCompare(b.department));

		return {
			locations,
			counts,
			filtersMeta: {
				departments,
				occupations,
				departmentOccupations,
			},
		};
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
		if (!shift) throw new NotFoundException("Shift not found");

		if (shift.status === "COMPLETED") {
			throw new BadRequestException("Completed shifts cannot be cancelled");
		}
		if (shift.status === "CANCELLED") {
			return { success: true };
		}

		await this.prisma.perDiemShift.update({
			where: { id: shiftId },
			data: { status: "CANCELLED" as const, updatedById: userId },
			select: { id: true },
		});
		await this.backgroundJobs.enqueueMonthlyMetricSnapshotForOrganization(
			orgId,
		);

		return { success: true };
	}
}
