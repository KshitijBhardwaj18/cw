import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import {
	OrganizationVendorStatus,
	PerDiemShiftStatus,
	Prisma,
	UserRole,
} from "@repo/db";
import { formatCurrency, getInitials } from "@repo/shared";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { BackgroundJobsService } from "src/background-jobs/background-jobs.service";
import { resolveVendorActor } from "src/common/utils/resolve-vendor-actor";
import { PrismaService } from "src/prisma/prisma.service";
import type { QueryCandidateShiftsDto } from "../dto/per-diem-shift-assignment/query-candidate-shifts.dto";
import { VendorPerDiemShiftsQueryDto } from "../dto/per-diem-shifts/vendor-per-diem-shifts-query.dto";
import { buildTimecardSnapshotFromAssignment } from "../utils/timecard-snapshot-from-assignment";

@Injectable()
export class PerDiemShiftAssignmentService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly backgroundJobs: BackgroundJobsService,
	) {}

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

	private readonly CANDIDATE_SHIFT_SELECT = {
		id: true,
		status: true,
		shiftDate: true,
		startTime: true,
		endTime: true,
		totalShiftHours: true,
		shiftRate: true,
		shiftType: true,
		isUrgent: true,
		occupation: { select: { name: true } },
		specialty: { select: { name: true } },
		department: { select: { name: true } },
		location: { select: { name: true } },
		shiftTemplate: { select: { templateName: true } },
	} as const;

	private mapCandidateShiftItem(
		shift: {
			id: string;
			status: string;
			shiftDate: Date;
			startTime: string;
			endTime: string;
			totalShiftHours: number;
			shiftRate: number;
			shiftType: string;
			isUrgent: boolean;
			occupation: { name: string };
			specialty: { name: string } | null;
			department: { name: string } | null;
			location: { name: string };
			shiftTemplate: { templateName: string } | null;
		},
		isClaimed: boolean,
		assignment?: {
			candidateFeedback: string | null;
			status: string;
			timesheet: {
				entries: Array<{
					workDate: Date;
					clockIn: string | null;
					clockOut: string | null;
					breakMinutes: number;
					regularHours: number;
					overtimeHours: number;
					hours: number | null;
				}>;
			} | null;
		} | null,
	) {
		const tc = buildTimecardSnapshotFromAssignment(assignment ?? null);
		return {
			id: shift.id,
			title: `${shift.shiftTemplate?.templateName ?? "Per Diem"} - ${shift.occupation.name}`,
			status: shift.status,
			date: shift.shiftDate.toISOString().slice(0, 10),
			startTime: shift.startTime,
			endTime: shift.endTime,
			totalHours: shift.totalShiftHours,
			ratePerHour: shift.shiftRate,
			occupation: shift.occupation.name,
			specialty: shift.specialty?.name ?? null,
			department: shift.department?.name ?? null,
			location: shift.location.name,
			isUrgent: shift.isUrgent,
			shiftType: shift.shiftType,
			isClaimed,
			...tc,
		};
	}

	private buildCandidateShiftWhere(
		orgId: string,
		dto: QueryCandidateShiftsDto,
		extra: Prisma.PerDiemShiftWhereInput = {},
	): Prisma.PerDiemShiftWhereInput {
		const dateIso = this.parseDateFilter(dto.date);
		return {
			organizationId: orgId,
			...extra,
			...(dto.shiftType ? { shiftType: dto.shiftType } : {}),
			...(dateIso
				? {
						shiftDate: {
							gte: new Date(`${dateIso}T00:00:00.000Z`),
							lt: new Date(`${dateIso}T23:59:59.999Z`),
						},
					}
				: {}),
			...(dto.search
				? {
						OR: [
							{
								shiftTemplate: {
									templateName: { contains: dto.search, mode: "insensitive" },
								},
							},
							{
								occupation: {
									name: { contains: dto.search, mode: "insensitive" },
								},
							},
							{
								department: {
									name: { contains: dto.search, mode: "insensitive" },
								},
							},
							{
								location: {
									name: { contains: dto.search, mode: "insensitive" },
								},
							},
						],
					}
				: {}),
		};
	}

	async listCandidateAvailableShifts(
		userId: string,
		orgId: string,
		dto: QueryCandidateShiftsDto,
	) {
		const candidate = await this.prisma.candidate.findFirst({
			where: { userId, organizationId: orgId },
			select: { id: true },
		});

		const page = dto.page ?? 1;
		const limit = dto.limit ?? 10;
		const skip = (page - 1) * limit;

		const where = this.buildCandidateShiftWhere(orgId, dto, {
			status: PerDiemShiftStatus.OPEN,
			isPublic: true,
		});

		const claimedShiftIds = candidate
			? new Set(
					(
						await this.prisma.perDiemAssignment.findMany({
							where: { candidateId: candidate.id },
							select: { shiftId: true },
						})
					).map((a) => a.shiftId),
				)
			: new Set<string>();

		const [items, total] = await Promise.all([
			this.prisma.perDiemShift.findMany({
				where,
				select: this.CANDIDATE_SHIFT_SELECT,
				orderBy: [{ shiftDate: "asc" }, { startTime: "asc" }],
				skip,
				take: limit,
			}),
			this.prisma.perDiemShift.count({ where }),
		]);

		return {
			data: items.map((s) =>
				this.mapCandidateShiftItem(s, claimedShiftIds.has(s.id)),
			),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async listCandidateMyShifts(
		userId: string,
		orgId: string,
		dto: QueryCandidateShiftsDto,
	) {
		const candidate = await this.prisma.candidate.findFirst({
			where: { userId, organizationId: orgId },
			select: { id: true },
		});

		if (!candidate) {
			return {
				data: [],
				total: 0,
				page: 1,
				limit: dto.limit ?? 10,
				totalPages: 0,
			};
		}

		const page = dto.page ?? 1;
		const limit = dto.limit ?? 10;
		const skip = (page - 1) * limit;

		const where = this.buildCandidateShiftWhere(orgId, dto, {
			assignments: { some: { candidateId: candidate.id } },
		});

		const [items, total] = await Promise.all([
			this.prisma.perDiemShift.findMany({
				where,
				select: {
					...this.CANDIDATE_SHIFT_SELECT,
					assignments: {
						where: { candidateId: candidate.id },
						take: 1,
						orderBy: { assignedAt: "desc" },
						select: {
							candidateFeedback: true,
							status: true,
							timesheet: {
								select: {
									entries: {
										orderBy: { createdAt: "asc" },
										select: {
											workDate: true,
											clockIn: true,
											clockOut: true,
											breakMinutes: true,
											regularHours: true,
											overtimeHours: true,
											hours: true,
										},
									},
								},
							},
						},
					},
				},
				orderBy: [{ shiftDate: "asc" }, { startTime: "asc" }],
				skip,
				take: limit,
			}),
			this.prisma.perDiemShift.count({ where }),
		]);

		return {
			data: items.map((s) =>
				this.mapCandidateShiftItem(s, true, s.assignments[0] ?? null),
			),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async getCandidateShiftCounts(userId: string, orgId: string) {
		const candidate = await this.prisma.candidate.findFirst({
			where: { userId, organizationId: orgId },
			select: { id: true },
		});

		const [available, myShifts] = await Promise.all([
			this.prisma.perDiemShift.count({
				where: {
					organizationId: orgId,
					status: PerDiemShiftStatus.OPEN,
					isPublic: true,
				},
			}),
			candidate
				? this.prisma.perDiemAssignment.count({
						where: {
							candidateId: candidate.id,
							shift: { organizationId: orgId },
						},
					})
				: Promise.resolve(0),
		]);

		return { available, myShifts };
	}

	async claimShift(userId: string, orgId: string, shiftId: string) {
		const candidate = await this.prisma.candidate.findFirst({
			where: { userId, organizationId: orgId },
			select: { id: true },
		});
		if (!candidate) throw new NotFoundException("Candidate profile not found");

		const shift = await this.prisma.perDiemShift.findFirst({
			where: { id: shiftId, organizationId: orgId, isPublic: true },
			select: { id: true, status: true },
		});
		if (!shift) throw new NotFoundException("Shift not found");
		if (shift.status !== PerDiemShiftStatus.OPEN) {
			throw new BadRequestException("This shift is no longer available");
		}

		const existing = await this.prisma.perDiemAssignment.findFirst({
			where: { shiftId, candidateId: candidate.id },
			select: { id: true },
		});
		if (existing)
			throw new ConflictException("You have already claimed this shift");

		await this.prisma.$transaction([
			this.prisma.perDiemAssignment.create({
				data: { shiftId, candidateId: candidate.id },
			}),
			this.prisma.perDiemShift.update({
				where: { id: shiftId },
				data: { status: PerDiemShiftStatus.IN_PROGRESS },
				select: { id: true },
			}),
		]);
		await this.backgroundJobs.enqueueMonthlyMetricSnapshotForOrganization(
			orgId,
		);

		return { success: true };
	}

	async listCandidateShiftsForCalendar(
		userId: string,
		orgId: string,
		year: number,
		month: number,
	) {
		const candidate = await this.prisma.candidate.findFirst({
			where: { userId, organizationId: orgId },
			select: { id: true },
		});

		if (!candidate) return { shifts: [] };

		const monthStart = new Date(Date.UTC(year, month - 1, 1));
		const monthEnd = new Date(Date.UTC(year, month, 1));

		const shifts = await this.prisma.perDiemShift.findMany({
			where: {
				organizationId: orgId,
				assignments: { some: { candidateId: candidate.id } },
				shiftDate: { gte: monthStart, lt: monthEnd },
			},
			select: {
				...this.CANDIDATE_SHIFT_SELECT,
				assignments: {
					where: { candidateId: candidate.id },
					take: 1,
					orderBy: { assignedAt: "desc" },
					select: {
						candidateFeedback: true,
						status: true,
						timesheet: {
							select: {
								entries: {
									orderBy: { createdAt: "asc" },
									select: {
										workDate: true,
										clockIn: true,
										clockOut: true,
										breakMinutes: true,
										regularHours: true,
										overtimeHours: true,
										hours: true,
									},
								},
							},
						},
					},
				},
			},
			orderBy: [{ shiftDate: "asc" }, { startTime: "asc" }],
		});

		return {
			shifts: shifts.map((s) =>
				this.mapCandidateShiftItem(s, true, s.assignments[0] ?? null),
			),
		};
	}

	async assignShiftToCandidate(
		actorUserId: string,
		actorRole: UserRole,
		orgId: string,
		shiftId: string,
		candidateId: string,
		_session?: UserSession,
	) {
		const candidate = await this.prisma.candidate.findFirst({
			where: { id: candidateId, organizationId: orgId },
			select: { id: true, vendorId: true },
		});
		if (!candidate) {
			throw new NotFoundException("Candidate not found in this organization");
		}

		if (actorRole === UserRole.VENDOR_USER) {
			const vendorUser = await this.prisma.vendorUser.findUnique({
				where: { userId: actorUserId },
				select: { vendorId: true },
			});
			if (!vendorUser) {
				throw new ForbiddenException("Vendor profile not found");
			}
			if (candidate.vendorId !== vendorUser.vendorId) {
				throw new ForbiddenException(
					"You can only assign shifts to your agency's candidates",
				);
			}
		}

		const shift = await this.prisma.perDiemShift.findFirst({
			where: { id: shiftId, organizationId: orgId, isPublic: true },
			select: { id: true, status: true },
		});
		if (!shift) throw new NotFoundException("Shift not found");
		if (shift.status !== PerDiemShiftStatus.OPEN) {
			throw new BadRequestException("This shift is no longer available");
		}

		const existingForCandidate = await this.prisma.perDiemAssignment.findFirst({
			where: { shiftId, candidateId: candidate.id },
			select: { id: true },
		});
		if (existingForCandidate) {
			throw new ConflictException(
				"This candidate is already assigned to this shift",
			);
		}

		const existingForShift = await this.prisma.perDiemAssignment.findFirst({
			where: { shiftId },
			select: { id: true },
		});
		if (existingForShift) {
			throw new ConflictException("This shift is already filled");
		}

		await this.prisma.$transaction([
			this.prisma.perDiemAssignment.create({
				data: { shiftId, candidateId: candidate.id },
			}),
			this.prisma.perDiemShift.update({
				where: { id: shiftId },
				data: { status: PerDiemShiftStatus.IN_PROGRESS },
				select: { id: true },
			}),
		]);
		await this.backgroundJobs.enqueueMonthlyMetricSnapshotForOrganization(
			orgId,
		);

		return { success: true };
	}

	/** Ensures the vendor has an ACTIVE organization_vendor link for `organizationId`. */
	async assertVendorOrgAccess(
		organizationId: string,
		session?: UserSession,
	): Promise<void> {
		const actor = resolveVendorActor(session);
		const link = await this.prisma.organizationVendor.findFirst({
			where: {
				vendorId: actor.vendorId,
				organizationId,
				status: OrganizationVendorStatus.ACTIVE,
			},
			select: { id: true },
		});
		if (!link) {
			throw new ForbiddenException(
				"Your vendor is not linked to this organization",
			);
		}
	}

	private buildVendorShiftSearchWhere(
		search: string | undefined,
	): Prisma.PerDiemShiftWhereInput | undefined {
		if (!search?.trim()) return undefined;
		const q = search.trim();
		return {
			OR: [
				{
					shiftTemplate: {
						templateName: { contains: q, mode: "insensitive" },
					},
				},
				{ occupation: { name: { contains: q, mode: "insensitive" } } },
				{ department: { name: { contains: q, mode: "insensitive" } } },
				{ location: { name: { contains: q, mode: "insensitive" } } },
			],
		};
	}

	private mapShiftToVendorClaimItem(
		s: {
			id: string;
			isUrgent: boolean;
			shiftDate: Date;
			startTime: string;
			endTime: string;
			totalShiftHours: number;
			vendorRate: number;
			occupation: { name: string };
			specialty: { name: string } | null;
			department: { name: string } | null;
			location: { name: string; city: string; state: string };
		},
		opts: {
			assignmentId?: string | null;
			openings: number;
			assignment?: Parameters<typeof buildTimecardSnapshotFromAssignment>[0];
		},
	) {
		const urgency: "High" | "Medium" | "Low" = s.isUrgent ? "High" : "Medium";
		const requirements = s.specialty?.name
			? [s.specialty.name]
			: ([] as string[]);
		const timecard =
			opts.assignment !== undefined && opts.assignment !== null
				? buildTimecardSnapshotFromAssignment(opts.assignment)
				: {};
		return {
			id: s.id,
			role: s.occupation.name,
			urgency,
			facilityName: `${s.location.name} - ${s.department?.name ?? "—"}`,
			location: { city: s.location.city, state: s.location.state },
			requirements,
			date: s.shiftDate.toISOString().slice(0, 10),
			startTime: s.startTime,
			endTime: s.endTime,
			duration: `${Number(s.totalShiftHours.toFixed(2))} hrs`,
			billRate: `${formatCurrency(s.vendorRate)}/hr`,
			openings: opts.openings,
			...(opts.assignmentId ? { assignmentId: opts.assignmentId } : {}),
			...timecard,
		};
	}

	async listVendorAvailableShifts(
		orgId: string,
		query: VendorPerDiemShiftsQueryDto,
		session?: UserSession,
	) {
		const org = await this.prisma.organization.findUnique({
			where: { id: orgId },
			select: { id: true },
		});
		if (!org) throw new NotFoundException("Organization not found");

		resolveVendorActor(session);

		const page = query.page ?? 1;
		const limit = query.limit ?? 10;
		const skip = (page - 1) * limit;
		const dateIso = this.parseDateFilter(query.date);

		const urgencyWhere: Prisma.PerDiemShiftWhereInput = {};
		if (query.urgency === "high") urgencyWhere.isUrgent = true;
		if (query.urgency === "medium" || query.urgency === "low") {
			urgencyWhere.isUrgent = false;
		}

		const searchWhere = this.buildVendorShiftSearchWhere(query.search);

		const where: Prisma.PerDiemShiftWhereInput = {
			organizationId: orgId,
			status: PerDiemShiftStatus.OPEN,
			isPublic: true,
			...urgencyWhere,
			...(query.specialtyId ? { specialtyId: query.specialtyId } : {}),
			...(dateIso
				? {
						shiftDate: {
							gte: new Date(`${dateIso}T00:00:00.000Z`),
							lt: new Date(`${dateIso}T23:59:59.999Z`),
						},
					}
				: {}),
			...(searchWhere ? searchWhere : {}),
		};

		const [items, total] = await Promise.all([
			this.prisma.perDiemShift.findMany({
				where,
				select: {
					id: true,
					isUrgent: true,
					shiftDate: true,
					startTime: true,
					endTime: true,
					totalShiftHours: true,
					vendorRate: true,
					occupation: { select: { name: true } },
					specialty: { select: { name: true } },
					department: { select: { name: true } },
					location: {
						select: { name: true, city: true, state: true },
					},
				},
				orderBy: [{ shiftDate: "asc" }, { startTime: "asc" }],
				skip,
				take: limit,
			}),
			this.prisma.perDiemShift.count({ where }),
		]);

		return {
			data: items.map((s) =>
				this.mapShiftToVendorClaimItem(s, { openings: 1 }),
			),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async listVendorAssignedShifts(
		orgId: string,
		query: VendorPerDiemShiftsQueryDto,
		session?: UserSession,
	) {
		const org = await this.prisma.organization.findUnique({
			where: { id: orgId },
			select: { id: true },
		});
		if (!org) throw new NotFoundException("Organization not found");

		const actor = resolveVendorActor(session);

		const page = query.page ?? 1;
		const limit = query.limit ?? 10;
		const skip = (page - 1) * limit;
		const dateIso = this.parseDateFilter(query.date);

		const urgencyWhere: Prisma.PerDiemShiftWhereInput = {};
		if (query.urgency === "high") urgencyWhere.isUrgent = true;
		if (query.urgency === "medium" || query.urgency === "low") {
			urgencyWhere.isUrgent = false;
		}

		const searchWhere = this.buildVendorShiftSearchWhere(query.search);

		const where: Prisma.PerDiemShiftWhereInput = {
			organizationId: orgId,
			status: {
				in: [PerDiemShiftStatus.IN_PROGRESS, PerDiemShiftStatus.COMPLETED],
			},
			assignments: {
				some: { candidate: { vendorId: actor.vendorId } },
			},
			...urgencyWhere,
			...(query.specialtyId ? { specialtyId: query.specialtyId } : {}),
			...(dateIso
				? {
						shiftDate: {
							gte: new Date(`${dateIso}T00:00:00.000Z`),
							lt: new Date(`${dateIso}T23:59:59.999Z`),
						},
					}
				: {}),
			...(searchWhere ? searchWhere : {}),
		};

		const [items, total] = await Promise.all([
			this.prisma.perDiemShift.findMany({
				where,
				select: {
					id: true,
					isUrgent: true,
					shiftDate: true,
					startTime: true,
					endTime: true,
					totalShiftHours: true,
					vendorRate: true,
					occupation: { select: { name: true } },
					specialty: { select: { name: true } },
					department: { select: { name: true } },
					location: {
						select: { name: true, city: true, state: true },
					},
					assignments: {
						where: { candidate: { vendorId: actor.vendorId } },
						orderBy: { assignedAt: "desc" },
						take: 1,
						select: {
							id: true,
							candidateFeedback: true,
							status: true,
							timesheet: {
								select: {
									entries: {
										orderBy: { createdAt: "asc" },
										select: {
											workDate: true,
											clockIn: true,
											clockOut: true,
											breakMinutes: true,
											regularHours: true,
											overtimeHours: true,
											hours: true,
										},
									},
								},
							},
						},
					},
				},
				orderBy: [{ shiftDate: "desc" }, { startTime: "desc" }],
				skip,
				take: limit,
			}),
			this.prisma.perDiemShift.count({ where }),
		]);

		return {
			data: items.map((s) => {
				const a = s.assignments[0];
				return this.mapShiftToVendorClaimItem(s, {
					openings: 0,
					assignmentId: a?.id ?? null,
					assignment: a ?? null,
				});
			}),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async getVendorShiftMetrics(orgId: string, session?: UserSession) {
		const org = await this.prisma.organization.findUnique({
			where: { id: orgId },
			select: { id: true },
		});
		if (!org) throw new NotFoundException("Organization not found");

		const actor = resolveVendorActor(session);

		const basePublic = {
			organizationId: orgId,
			isPublic: true,
		} satisfies Prisma.PerDiemShiftWhereInput;

		const [totalShifts, highUrgency, inProgress, completed] = await Promise.all(
			[
				this.prisma.perDiemShift.count({
					where: {
						...basePublic,
						status: { not: PerDiemShiftStatus.CANCELLED },
					},
				}),
				this.prisma.perDiemShift.count({
					where: {
						...basePublic,
						status: PerDiemShiftStatus.OPEN,
						isUrgent: true,
					},
				}),
				this.prisma.perDiemShift.count({
					where: {
						organizationId: orgId,
						status: PerDiemShiftStatus.IN_PROGRESS,
						assignments: {
							some: { candidate: { vendorId: actor.vendorId } },
						},
					},
				}),
				this.prisma.perDiemShift.count({
					where: {
						organizationId: orgId,
						status: PerDiemShiftStatus.COMPLETED,
						assignments: {
							some: { candidate: { vendorId: actor.vendorId } },
						},
					},
				}),
			],
		);

		return {
			totalShifts,
			highUrgency,
			inProgress,
			completed,
		};
	}

	async listVendorAssignableCandidates(
		orgId: string,
		shiftId: string,
		session?: UserSession,
	) {
		const org = await this.prisma.organization.findUnique({
			where: { id: orgId },
			select: { id: true },
		});
		if (!org) throw new NotFoundException("Organization not found");

		const actor = resolveVendorActor(session);

		const shift = await this.prisma.perDiemShift.findFirst({
			where: {
				id: shiftId,
				organizationId: orgId,
				status: PerDiemShiftStatus.OPEN,
				isPublic: true,
			},
			select: { id: true, occupationId: true },
		});
		if (!shift) {
			throw new NotFoundException("Shift not found or not available");
		}

		const candidates = await this.prisma.candidate.findMany({
			where: {
				organizationId: orgId,
				vendorId: actor.vendorId,
				occupationId: shift.occupationId,
				isActive: true,
			},
			select: {
				id: true,
				user: { select: { name: true } },
				occupation: { select: { name: true } },
			},
			orderBy: { user: { name: "asc" } },
		});

		return {
			data: candidates.map((c) => ({
				id: c.id,
				name: c.user.name,
				role: c.occupation.name,
				initials: getInitials(c.user.name),
			})),
		};
	}
}
