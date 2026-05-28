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
import {
	formatCurrency,
	getInitials,
	isInternalWorkforceType,
} from "@repo/shared";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { resolveVendorActor } from "src/common/utils/resolve-vendor-actor";
import { PrismaService } from "src/prisma/prisma.service";
import {
	ShiftVisibilityService,
	VENDOR_USER_WORKFORCE_TYPES,
	type ViewerVisibilityContext,
} from "src/shift-routing/shift-visibility.service";
import type { QueryCandidateShiftsDto } from "../dto/per-diem-shift-assignment/query-candidate-shifts.dto";
import { VendorPerDiemShiftsQueryDto } from "../dto/per-diem-shifts/vendor-per-diem-shifts-query.dto";
import { buildTimecardSnapshotFromAssignment } from "../utils/timecard-snapshot-from-assignment";

@Injectable()
export class PerDiemShiftAssignmentService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly visibility: ShiftVisibilityService,
	) {}

	private candidateShiftMatchWhere(candidate: {
		occupationId: string;
		specialtyIds: string[];
	}): Prisma.PerDiemShiftWhereInput {
		return {
			occupationId: candidate.occupationId,
			OR: [
				{ specialties: { none: {} } },
				{
					specialties: {
						some: { specialtyId: { in: candidate.specialtyIds } },
					},
				},
			],
		};
	}

	private assertCandidateQualifiesForShift(
		candidate: { occupationId: string; specialtyIds: string[] },
		shift: { occupationId: string; specialtyIds: string[] },
	): void {
		if (candidate.occupationId !== shift.occupationId) {
			throw new ForbiddenException(
				"Candidate's occupation does not match this shift",
			);
		}
		if (
			shift.specialtyIds.length > 0 &&
			!shift.specialtyIds.some((id) => candidate.specialtyIds.includes(id))
		) {
			throw new ForbiddenException(
				"Candidate does not hold any of the specialties required for this shift",
			);
		}
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
		specialties: {
			select: { specialty: { select: { name: true } } },
		},
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
			specialties: { specialty: { name: string } }[];
			department: { name: string } | null;
			location: { name: string };
			shiftTemplate: { templateName: string } | null;
		},
		isClaimed: boolean,
		assignment?: {
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
					notes: string | null;
				}>;
			} | null;
		} | null,
	) {
		const tc = buildTimecardSnapshotFromAssignment(assignment ?? null);
		const status =
			shift.status === PerDiemShiftStatus.OPEN &&
			shift.shiftDate < this.getTodayStartUtc()
				? PerDiemShiftStatus.EXPIRED
				: shift.status;
		return {
			id: shift.id,
			title: `${shift.shiftTemplate?.templateName ?? "Per Diem"} - ${shift.occupation.name}`,
			status,
			date: shift.shiftDate.toISOString().slice(0, 10),
			startTime: shift.startTime,
			endTime: shift.endTime,
			totalHours: shift.totalShiftHours,
			ratePerHour: shift.shiftRate,
			occupation: shift.occupation.name,
			specialties: shift.specialties.map((ss) => ss.specialty.name),
			department: shift.department?.name ?? null,
			location: shift.location.name,
			isUrgent: shift.isUrgent,
			shiftType: shift.shiftType,
			isClaimed,
			...tc,
		};
	}

	private getTodayStartUtc(): Date {
		const d = new Date();
		d.setUTCHours(0, 0, 0, 0);
		return d;
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
			select: {
				id: true,
				occupationId: true,
				workforceType: true,
				candidateSpecialties: { select: { specialtyId: true } },
			},
		});

		const page = dto.page ?? 1;
		const limit = dto.limit ?? 10;
		const skip = (page - 1) * limit;

		if (!candidate) {
			return {
				data: [],
				total: 0,
				page,
				limit,
				totalPages: 0,
			};
		}

		const qualifications = {
			occupationId: candidate.occupationId,
			specialtyIds: candidate.candidateSpecialties.map((s) => s.specialtyId),
		};

		const visibilityWhere = await this.visibility.buildShiftVisibilityWhere(
			orgId,
			{
				kind: "candidate",
				workforceType: candidate.workforceType ?? null,
			},
		);

		const where = this.buildCandidateShiftWhere(orgId, dto, {
			status: PerDiemShiftStatus.OPEN,
			...this.candidateShiftMatchWhere(qualifications),
			...(this.parseDateFilter(dto.date)
				? {}
				: { shiftDate: { gte: this.getTodayStartUtc() } }),
			AND: [visibilityWhere],
		});

		const claimedShiftIds = new Set(
			(
				await this.prisma.perDiemAssignment.findMany({
					where: { candidateId: candidate.id },
					select: { shiftId: true },
				})
			).map((a) => a.shiftId),
		);

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
											notes: true,
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
			select: { id: true, workforceType: true },
		});

		const visibilityWhere = await this.visibility.buildShiftVisibilityWhere(
			orgId,
			{
				kind: "candidate",
				workforceType: candidate?.workforceType ?? null,
			},
		);

		const todayStart = this.getTodayStartUtc();
		const [available, active, completed] = await Promise.all([
			this.prisma.perDiemShift.count({
				where: {
					organizationId: orgId,
					status: PerDiemShiftStatus.OPEN,
					shiftDate: { gte: todayStart },
					AND: [visibilityWhere],
				},
			}),
			candidate
				? this.prisma.perDiemAssignment.count({
						where: {
							candidateId: candidate.id,
							shift: {
								organizationId: orgId,
								shiftDate: { gte: todayStart },
								status: {
									notIn: [
										PerDiemShiftStatus.COMPLETED,
										PerDiemShiftStatus.CANCELLED,
										PerDiemShiftStatus.EXPIRED,
									],
								},
							},
						},
					})
				: Promise.resolve(0),
			candidate
				? this.prisma.perDiemAssignment.count({
						where: {
							candidateId: candidate.id,
							shift: {
								organizationId: orgId,
								OR: [
									{ status: PerDiemShiftStatus.COMPLETED },
									{ shiftDate: { lt: todayStart } },
								],
							},
						},
					})
				: Promise.resolve(0),
		]);

		return {
			available,
			active,
			completed,
			myShifts: active + completed,
			isInternal: isInternalWorkforceType(candidate?.workforceType),
		};
	}

	async claimShift(userId: string, orgId: string, shiftId: string) {
		const candidate = await this.prisma.candidate.findFirst({
			where: { userId, organizationId: orgId },
			select: {
				id: true,
				vendorId: true,
				occupationId: true,
				workforceType: true,
				candidateSpecialties: { select: { specialtyId: true } },
			},
		});
		if (!candidate) throw new NotFoundException("Candidate profile not found.");

		const shift = await this.prisma.perDiemShift.findFirst({
			where: { id: shiftId, organizationId: orgId },
			select: {
				id: true,
				status: true,
				shiftDate: true,
				publishedAt: true,
				occupationId: true,
				specialties: { select: { specialtyId: true } },
				shiftTemplate: {
					select: {
						limitShiftVisibility: true,
						visibilityUnlockDuration: true,
						visibilityUnlockUnit: true,
					},
				},
			},
		});
		if (!shift) throw new NotFoundException("Shift not found.");
		if (shift.status !== PerDiemShiftStatus.OPEN) {
			throw new BadRequestException("This shift is no longer available.");
		}
		const todayStartUtc = new Date();
		todayStartUtc.setUTCHours(0, 0, 0, 0);
		if (shift.shiftDate < todayStartUtc) {
			throw new BadRequestException("This shift has already passed.");
		}

		const routingConfig = await this.visibility.resolveOrgRoutingConfig(orgId);
		const canSee = this.visibility.canViewerSeeShift(
			{ kind: "candidate", workforceType: candidate.workforceType ?? null },
			{ publishedAt: shift.publishedAt, shiftTemplate: shift.shiftTemplate },
			routingConfig,
		);
		if (!canSee) {
			throw new ForbiddenException(
				"This shift is not yet available to your workforce tier",
			);
		}

		this.assertCandidateQualifiesForShift(
			{
				occupationId: candidate.occupationId,
				specialtyIds: candidate.candidateSpecialties.map((s) => s.specialtyId),
			},
			{
				occupationId: shift.occupationId,
				specialtyIds: shift.specialties.map((s) => s.specialtyId),
			},
		);

		const existing = await this.prisma.perDiemAssignment.findFirst({
			where: { shiftId, candidateId: candidate.id },
			select: { id: true },
		});
		if (existing)
			throw new ConflictException("You have already claimed this shift.");

		await this.prisma.$transaction([
			this.prisma.perDiemAssignment.create({
				data: {
					shiftId,
					candidateId: candidate.id,
					vendorId: candidate.vendorId,
				},
			}),
			this.prisma.perDiemShift.update({
				where: { id: shiftId },
				data: { status: PerDiemShiftStatus.IN_PROGRESS },
				select: { id: true },
			}),
		]);

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
										notes: true,
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
			select: {
				id: true,
				vendorId: true,
				occupationId: true,
				candidateSpecialties: { select: { specialtyId: true } },
			},
		});
		if (!candidate) {
			throw new NotFoundException("Candidate not found in this organization.");
		}

		if (actorRole === UserRole.VENDOR_USER) {
			const vendorUser = await this.prisma.vendorUser.findUnique({
				where: { userId: actorUserId },
				select: { vendorId: true },
			});
			if (!vendorUser) {
				throw new ForbiddenException("Vendor profile not found.");
			}
			if (candidate.vendorId !== vendorUser.vendorId) {
				throw new ForbiddenException(
					"You can only assign shifts to your agency's candidates",
				);
			}
		}

		const shift = await this.prisma.perDiemShift.findFirst({
			where: { id: shiftId, organizationId: orgId },
			select: {
				id: true,
				status: true,
				shiftDate: true,
				publishedAt: true,
				occupationId: true,
				specialties: { select: { specialtyId: true } },
				shiftTemplate: {
					select: {
						limitShiftVisibility: true,
						visibilityUnlockDuration: true,
						visibilityUnlockUnit: true,
					},
				},
			},
		});
		if (!shift) throw new NotFoundException("Shift not found.");
		if (shift.status !== PerDiemShiftStatus.OPEN) {
			throw new BadRequestException("This shift is no longer available.");
		}
		const todayStartUtc = new Date();
		todayStartUtc.setUTCHours(0, 0, 0, 0);
		if (shift.shiftDate < todayStartUtc) {
			throw new BadRequestException("This shift has already passed.");
		}

		if (actorRole === UserRole.VENDOR_USER) {
			const routingConfig =
				await this.visibility.resolveOrgRoutingConfig(orgId);
			const canSee = this.visibility.canViewerSeeShift(
				{ kind: "vendor", workforceTypes: VENDOR_USER_WORKFORCE_TYPES },
				{ publishedAt: shift.publishedAt, shiftTemplate: shift.shiftTemplate },
				routingConfig,
			);
			if (!canSee) {
				throw new ForbiddenException(
					"This shift is not yet available to vendor partners",
				);
			}
		}

		this.assertCandidateQualifiesForShift(
			{
				occupationId: candidate.occupationId,
				specialtyIds: candidate.candidateSpecialties.map((s) => s.specialtyId),
			},
			{
				occupationId: shift.occupationId,
				specialtyIds: shift.specialties.map((s) => s.specialtyId),
			},
		);

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
			throw new ConflictException("This shift is already filled.");
		}

		await this.prisma.$transaction([
			this.prisma.perDiemAssignment.create({
				data: {
					shiftId,
					candidateId: candidate.id,
					vendorId: candidate.vendorId,
				},
			}),
			this.prisma.perDiemShift.update({
				where: { id: shiftId },
				data: { status: PerDiemShiftStatus.IN_PROGRESS },
				select: { id: true },
			}),
		]);

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
			specialties: { specialty: { name: string } }[];
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
		const requirements = s.specialties
			.map((ss) => ss.specialty.name)
			.filter(Boolean);
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
		if (!org) throw new NotFoundException("Organization not found.");

		const vendorViewer = this.resolveVendorVisibilityContext(session);

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

		const visibilityWhere = await this.visibility.buildShiftVisibilityWhere(
			orgId,
			vendorViewer,
		);

		const where: Prisma.PerDiemShiftWhereInput = {
			organizationId: orgId,
			status: PerDiemShiftStatus.OPEN,
			...urgencyWhere,
			...(query.specialtyId
				? { specialties: { some: { specialtyId: query.specialtyId } } }
				: {}),
			...(dateIso
				? {
						shiftDate: {
							gte: new Date(`${dateIso}T00:00:00.000Z`),
							lt: new Date(`${dateIso}T23:59:59.999Z`),
						},
					}
				: { shiftDate: { gte: this.getTodayStartUtc() } }),
			...(searchWhere ? searchWhere : {}),
			AND: [visibilityWhere],
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
					specialties: {
						select: { specialty: { select: { name: true } } },
					},
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

	private resolveVendorVisibilityContext(
		session?: UserSession,
	): ViewerVisibilityContext {
		const actor = resolveVendorActor(session);
		if (!actor.vendorId) {
			return { kind: "bypass" };
		}
		return {
			kind: "vendor",
			workforceTypes: VENDOR_USER_WORKFORCE_TYPES,
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
		if (!org) throw new NotFoundException("Organization not found.");

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
			...(query.specialtyId
				? { specialties: { some: { specialtyId: query.specialtyId } } }
				: {}),
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
					specialties: {
						select: { specialty: { select: { name: true } } },
					},
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
											notes: true,
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
		if (!org) throw new NotFoundException("Organization not found.");

		const actor = resolveVendorActor(session);
		const vendorViewer = this.resolveVendorVisibilityContext(session);
		const visibilityWhere = await this.visibility.buildShiftVisibilityWhere(
			orgId,
			vendorViewer,
		);

		const availableWhere: Prisma.PerDiemShiftWhereInput = {
			organizationId: orgId,
			status: PerDiemShiftStatus.OPEN,
			shiftDate: { gte: this.getTodayStartUtc() },
			AND: [visibilityWhere],
		};
		const assignedWhere: Prisma.PerDiemShiftWhereInput = {
			organizationId: orgId,
			status: {
				in: [PerDiemShiftStatus.IN_PROGRESS, PerDiemShiftStatus.COMPLETED],
			},
			assignments: {
				some: { candidate: { vendorId: actor.vendorId } },
			},
		};

		const [
			availableTotal,
			assignedTotal,
			availableHighUrgency,
			assignedHighUrgency,
			inProgress,
			completed,
		] = await Promise.all([
			this.prisma.perDiemShift.count({ where: availableWhere }),
			this.prisma.perDiemShift.count({ where: assignedWhere }),
			this.prisma.perDiemShift.count({
				where: { ...availableWhere, isUrgent: true },
			}),
			this.prisma.perDiemShift.count({
				where: { ...assignedWhere, isUrgent: true },
			}),
			this.prisma.perDiemShift.count({
				where: { ...assignedWhere, status: PerDiemShiftStatus.IN_PROGRESS },
			}),
			this.prisma.perDiemShift.count({
				where: { ...assignedWhere, status: PerDiemShiftStatus.COMPLETED },
			}),
		]);

		return {
			totalShifts: availableTotal + assignedTotal,
			highUrgency: availableHighUrgency + assignedHighUrgency,
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
		if (!org) throw new NotFoundException("Organization not found.");

		const actor = resolveVendorActor(session);

		const shift = await this.prisma.perDiemShift.findFirst({
			where: {
				id: shiftId,
				organizationId: orgId,
				status: PerDiemShiftStatus.OPEN,
				shiftDate: { gte: this.getTodayStartUtc() },
			},
			select: {
				id: true,
				occupationId: true,
				publishedAt: true,
				specialties: { select: { specialtyId: true } },
				shiftTemplate: {
					select: {
						limitShiftVisibility: true,
						visibilityUnlockDuration: true,
						visibilityUnlockUnit: true,
					},
				},
			},
		});
		if (!shift) {
			throw new NotFoundException("Shift not found or not available.");
		}

		if (actor.vendorId) {
			const routingConfig =
				await this.visibility.resolveOrgRoutingConfig(orgId);
			const canSee = this.visibility.canViewerSeeShift(
				{ kind: "vendor", workforceTypes: VENDOR_USER_WORKFORCE_TYPES },
				{ publishedAt: shift.publishedAt, shiftTemplate: shift.shiftTemplate },
				routingConfig,
			);
			if (!canSee) {
				throw new NotFoundException("Shift not found or not available.");
			}
		}

		const shiftSpecialtyIds = shift.specialties.map((s) => s.specialtyId);

		const candidates = await this.prisma.candidate.findMany({
			where: {
				organizationId: orgId,
				vendorId: actor.vendorId,
				occupationId: shift.occupationId,
				isActive: true,
				...(shiftSpecialtyIds.length > 0
					? {
							candidateSpecialties: {
								some: { specialtyId: { in: shiftSpecialtyIds } },
							},
						}
					: {}),
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
