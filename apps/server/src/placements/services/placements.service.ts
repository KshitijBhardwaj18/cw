import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import {
	OfferEventType,
	OrganizationMemberStatus,
	PlacementStatus,
	PlacementTaskStatus,
	Prisma,
} from "@repo/db";
import type { PagePaginatedResponse } from "@repo/shared";
import { BackgroundJobsService } from "src/background-jobs/background-jobs.service";
import { PrismaService } from "src/prisma/prisma.service";
import type { CreatePlacementNoteDto } from "../dto/create-placement-note.dto";
import type { CreatePlacementTaskDto } from "../dto/create-placement-task.dto";
import type { EndPlacementDto } from "../dto/end-placement.dto";
import type { PlacementTabQuery } from "../dto/query-placements.dto";
import { assertPlacementInOrganization } from "../placement-assertions";
import {
	ENDABLE_PLACEMENT_STATUSES,
	PLACEMENT_TAB_STATUS,
} from "../placements.constants";
import {
	employmentTypeLabel,
	formatLongDate,
	formatShortDate,
	formatTimeEt,
	formatUsdPerHour,
	sourceTypeFromSubmission,
} from "../placements-formatters";
import {
	PLACEMENT_LIST_INCLUDE,
	type PlacementListRow,
} from "../placements-list.include";
import { PlacementComplianceService } from "./placement-compliance.service";

@Injectable()
export class PlacementsService {
	private readonly logger = new Logger(PlacementsService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly placementComplianceService: PlacementComplianceService,
		private readonly backgroundJobs: BackgroundJobsService,
	) {}

	private mapNote(n: {
		id: string;
		content: string;
		createdByRole: string | null;
		createdAt: Date;
		createdBy: { name: string | null } | null;
	}) {
		return {
			id: n.id,
			text: n.content,
			addedBy: n.createdBy?.name ?? "System",
			addedByRole: n.createdByRole ?? "",
			createdAt: formatShortDate(n.createdAt),
		};
	}

	private mapTask(t: {
		id: string;
		title: string;
		description: string | null;
		dueDate: Date | null;
		status: PlacementTaskStatus;
		createdAt: Date;
		assignedTo: { name: string | null } | null;
		createdBy: { name: string | null } | null;
	}) {
		return {
			id: t.id,
			title: t.title,
			description: t.description ?? undefined,
			dueDate: t.dueDate ? formatShortDate(t.dueDate) : "—",
			status:
				t.status === PlacementTaskStatus.COMPLETED ? "completed" : "pending",
			assignedTo: t.assignedTo?.name ?? "—",
			createdBy: t.createdBy?.name ?? "—",
			createdAt: formatShortDate(t.createdAt),
		};
	}

	private buildListWhere(
		orgId: string,
		tab: PlacementTabQuery,
		search?: string,
		workforceType?: string,
		vendorId?: string,
	): Prisma.PlacementWhereInput {
		const where: Prisma.PlacementWhereInput = {
			organizationId: orgId,
			status: { in: PLACEMENT_TAB_STATUS[tab] },
		};

		if (workforceType?.trim()) {
			where.workforceGroup = workforceType.trim();
		}

		if (vendorId?.trim()) {
			where.submission = { is: { vendorId: vendorId.trim() } };
		}

		const q = search?.trim();
		if (q) {
			where.OR = [
				{ jobTitle: { contains: q, mode: "insensitive" } },
				{
					submission: {
						is: {
							candidate: {
								is: {
									user: { is: { name: { contains: q, mode: "insensitive" } } },
								},
							},
						},
					},
				},
			];
		}

		return where;
	}

	private mapCard(
		p: PlacementListRow,
		compliancePercent: number,
	): {
		id: string;
		placementNumber: string;
		status: PlacementStatus;
		jobTitle: string | null;
		startDate: string | null;
		endDate: string | null;
		compliancePercent: number;
		candidateName: string;
		sourceType: string;
		locationName: string | null;
		departmentName: string | null;
		hiringManagerName: string | null;
		workforceGroup: string | null;
		vendorName: string | null;
		billRate: number | null;
	} {
		return {
			id: p.id,
			placementNumber: p.placementNumber,
			status: p.status,
			jobTitle:
				p.jobTitle ??
				p.submission.requisition?.jobTitle ??
				p.submission.requisition?.jobSummary ??
				null,
			startDate: p.startDate?.toISOString() ?? null,
			endDate: p.endDate?.toISOString() ?? null,
			compliancePercent,
			candidateName: p.submission.candidate.user?.name ?? "Unknown candidate",
			sourceType: sourceTypeFromSubmission(p.submission.vendorId),
			locationName: p.location?.name ?? null,
			departmentName: p.department?.name ?? null,
			hiringManagerName: p.hiringManager?.name ?? null,
			workforceGroup: p.workforceGroup ?? null,
			vendorName: p.submission.vendor?.name ?? null,
			billRate: p.billRate ?? null,
		};
	}

	async getTabCounts(
		orgId: string,
		vendorId?: string,
	): Promise<{
		upcoming: number;
		active: number;
		completed: number;
		total: number;
		activeOnly: number;
		endingSoon: number;
	}> {
		const where: { organizationId: string; submission?: { vendorId: string } } =
			{ organizationId: orgId };
		if (vendorId) {
			where.submission = { vendorId };
		}
		const statusCounts = await this.prisma.placement.groupBy({
			by: ["status"],
			where,
			_count: { _all: true },
		});

		const countByStatus = new Map(
			statusCounts.map((s) => [s.status, s._count._all]),
		);
		const sumTab = (statuses: PlacementStatus[]) =>
			statuses.reduce((n, s) => n + (countByStatus.get(s) ?? 0), 0);

		const total = statusCounts.reduce((n, s) => n + s._count._all, 0);
		const activeOnly = countByStatus.get(PlacementStatus.ACTIVE) ?? 0;
		const endingSoon = countByStatus.get(PlacementStatus.ENDING_SOON) ?? 0;

		return {
			upcoming: sumTab(PLACEMENT_TAB_STATUS.upcoming),
			active: sumTab(PLACEMENT_TAB_STATUS.active),
			completed: sumTab(PLACEMENT_TAB_STATUS.completed),
			total,
			activeOnly,
			endingSoon,
		};
	}

	async list(
		orgId: string,
		query: {
			tab?: PlacementTabQuery;
			search?: string;
			workforceType?: string;
			compliance?: string;
			vendorId?: string;
			page?: number;
			limit?: number;
		},
	): Promise<PagePaginatedResponse<ReturnType<PlacementsService["mapCard"]>>> {
		const tab = query.tab ?? "active";
		const page = query.page ?? 1;
		const limit = query.limit ?? 10;
		const skip = (page - 1) * limit;

		const where = this.buildListWhere(
			orgId,
			tab,
			query.search,
			query.workforceType,
			query.vendorId,
		);

		const [total, rows] = await Promise.all([
			this.prisma.placement.count({ where }),
			this.prisma.placement.findMany({
				where,
				include: PLACEMENT_LIST_INCLUDE,
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
			}),
		]);

		const percentMap =
			await this.placementComplianceService.batchCompliancePercents(rows);

		let cards = rows.map((r) => this.mapCard(r, percentMap.get(r.id) ?? 100));

		if (query.compliance === "complete") {
			cards = cards.filter((c) => c.compliancePercent >= 100);
		} else if (query.compliance === "incomplete") {
			cards = cards.filter((c) => c.compliancePercent < 100);
		}

		return {
			data: cards,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit) || 1,
		};
	}

	async getDetail(orgId: string, placementId: string) {
		const p = await this.prisma.placement.findFirst({
			where: { id: placementId, organizationId: orgId },
			include: {
				submission: {
					include: {
						candidate: {
							select: {
								licenseNumber: true,
								user: {
									select: {
										name: true,
										email: true,
										phoneNumber: true,
									},
								},
								occupation: { select: { name: true } },
								candidateSpecialties: {
									select: { specialty: { select: { name: true } } },
									take: 1,
								},
							},
						},
						vendor: { select: { name: true } },
						requisition: {
							select: {
								jobTitle: true,
								jobSummary: true,
								location: { select: { name: true } },
								department: { select: { name: true } },
								hiringManager: { select: { name: true } },
								organizationSpecialty: {
									select: { specialty: { select: { name: true } } },
								},
							},
						},
					},
				},
				location: { select: { name: true } },
				department: { select: { name: true } },
				hiringManager: { select: { name: true } },
				vendorContact: {
					select: { name: true, email: true, phoneNumber: true },
				},
				acceptedBy: { select: { name: true } },
			},
		});

		if (!p) throw new NotFoundException("Placement not found");

		const cand = p.submission.candidate;
		const user = cand.user;
		const req = p.submission.requisition;
		const specialtyName =
			cand.candidateSpecialties[0]?.specialty?.name ??
			req?.organizationSpecialty?.specialty?.name ??
			"—";

		const shiftSchedule =
			p.shiftSchedule?.length > 0 ? p.shiftSchedule.join(", ") : "—";

		return {
			id: p.id,
			placementNumber: p.placementNumber,
			status: p.status,
			statusSubtext: p.acceptedAt
				? `Offer accepted${user?.name ? ` by ${user.name}` : ""}`
				: "Placement record",
			candidateName: user?.name ?? "—",
			candidateEmail: user?.email ?? "—",
			candidatePhone: user?.phoneNumber ?? "—",
			occupation: cand.occupation?.name ?? "—",
			specialty: specialtyName,
			licenseNumber: cand.licenseNumber ?? null,
			jobTitle: p.jobTitle ?? req?.jobTitle ?? req?.jobSummary ?? "—",
			requisition: req
				? (req.jobTitle ?? req.jobSummary ?? "Requisition")
				: "—",
			location: p.location?.name ?? req?.location?.name ?? "—",
			department: p.department?.name ?? req?.department?.name ?? "—",
			hiringManager: p.hiringManager?.name ?? req?.hiringManager?.name ?? "—",
			vendor: p.submission.vendor?.name ?? null,
			startDate: formatLongDate(p.startDate),
			endDate: formatLongDate(p.endDate),
			currentStatus: p.status,
			departmentUnit: p.unitName ?? p.department?.name ?? "—",
			workforceGroup: p.workforceGroup ?? "—",
			shiftType: p.shiftType != null ? String(p.shiftType) : "—",
			shiftSchedule,
			hoursPerWeek: p.hoursPerWeek != null ? `${p.hoursPerWeek} hours` : "—",
			billRate: formatUsdPerHour(p.billRate),
			payRate: formatUsdPerHour(p.payRate),
			overtimeEligible: p.overtimeEligible,
			vendorContact: p.vendorContact?.name ?? null,
			vendorContactInfo: p.vendorContact
				? [p.vendorContact.email, p.vendorContact.phoneNumber]
						.filter(Boolean)
						.join("\n")
				: null,
		};
	}

	async getOfferHistory(orgId: string, placementId: string) {
		const p = await this.prisma.placement.findFirst({
			where: { id: placementId, organizationId: orgId },
			include: {
				acceptedBy: { select: { name: true } },
				offerHistory: {
					select: {
						id: true,
						eventType: true,
						description: true,
						billRateSnapshot: true,
						payRateSnapshot: true,
						startDateSnapshot: true,
						performedAt: true,
						performedBy: { select: { name: true } },
					},
					orderBy: { performedAt: "asc" },
					take: 200,
				},
			},
		});

		if (!p) throw new NotFoundException("Placement not found");

		const summary =
			p.acceptedAt && p.acceptedBy
				? {
						acceptedByName: p.acceptedBy.name ?? "—",
						acceptedBySubtext: "Candidate acceptance",
						acceptanceDate: formatShortDate(p.acceptedAt),
						employmentType: employmentTypeLabel(p.employmentType),
						initialBillRate: formatUsdPerHour(p.billRate) ?? "—",
						initialPayRate: formatUsdPerHour(p.payRate) ?? "—",
						initialStartDate: formatShortDate(p.startDate),
					}
				: null;

		const events = p.offerHistory.map((e) => {
			const detailParts: string[] = [];
			if (e.billRateSnapshot != null)
				detailParts.push(
					`Bill Rate: ${formatUsdPerHour(e.billRateSnapshot) ?? ""}`,
				);
			if (e.payRateSnapshot != null)
				detailParts.push(
					`Pay Rate: ${formatUsdPerHour(e.payRateSnapshot) ?? ""}`,
				);
			if (e.startDateSnapshot)
				detailParts.push(`Start Date: ${formatShortDate(e.startDateSnapshot)}`);

			return {
				id: e.id,
				eventType: e.eventType as OfferEventType,
				description: e.description ?? "",
				details: detailParts.length > 0 ? detailParts.join("  ") : undefined,
				performedBy: e.performedBy?.name ?? "System",
				performedByRole: undefined,
				performedAt: formatShortDate(e.performedAt),
				performedAtTime: formatTimeEt(e.performedAt),
				timezone: undefined,
				billRate: formatUsdPerHour(e.billRateSnapshot) ?? undefined,
				payRate: formatUsdPerHour(e.payRateSnapshot) ?? undefined,
				startDate: e.startDateSnapshot
					? formatShortDate(e.startDateSnapshot)
					: undefined,
			};
		});

		return { summary, events };
	}

	async getNotes(orgId: string, placementId: string) {
		const placement = await this.prisma.placement.findFirst({
			where: { id: placementId, organizationId: orgId },
			include: {
				notes: {
					select: {
						id: true,
						content: true,
						createdByRole: true,
						createdAt: true,
						createdBy: { select: { name: true } },
					},
					orderBy: { createdAt: "desc" },
					take: 200,
				},
			},
		});
		if (!placement) throw new NotFoundException("Placement not found");
		return placement.notes.map((n) => this.mapNote(n));
	}

	async getTasks(orgId: string, placementId: string) {
		const placement = await this.prisma.placement.findFirst({
			where: { id: placementId, organizationId: orgId },
			include: {
				tasks: {
					select: {
						id: true,
						title: true,
						description: true,
						dueDate: true,
						status: true,
						createdAt: true,
						assignedTo: { select: { name: true } },
						createdBy: { select: { name: true } },
					},
					orderBy: { createdAt: "desc" },
					take: 200,
				},
			},
		});
		if (!placement) throw new NotFoundException("Placement not found");
		return placement.tasks.map((t) => this.mapTask(t));
	}

	async createNote(
		orgId: string,
		placementId: string,
		dto: CreatePlacementNoteDto,
		createdById: string,
	) {
		await assertPlacementInOrganization(this.prisma, orgId, placementId);

		const note = await this.prisma.placementNote.create({
			data: {
				placementId,
				content: dto.content,
				createdById,
				createdByRole: dto.createdByRole ?? null,
			},
			include: { createdBy: { select: { name: true } } },
		});

		return this.mapNote(note);
	}

	async createTask(
		orgId: string,
		placementId: string,
		dto: CreatePlacementTaskDto,
		createdById: string,
	) {
		await assertPlacementInOrganization(this.prisma, orgId, placementId);

		if (dto.assignedToId) {
			const member = await this.prisma.member.findFirst({
				where: {
					organizationId: orgId,
					userId: dto.assignedToId,
					status: OrganizationMemberStatus.ACTIVE,
				},
			});
			if (!member) {
				throw new BadRequestException(
					"Assignee must be an active member of this organization",
				);
			}
		}

		let dueDate: Date | null = null;
		if (dto.dueDate?.trim()) {
			const d = new Date(dto.dueDate.trim());
			if (Number.isNaN(d.getTime())) {
				throw new BadRequestException("Invalid due date");
			}
			dueDate = d;
		}

		const task = await this.prisma.placementTask.create({
			data: {
				placementId,
				title: dto.title,
				description: dto.description ?? null,
				dueDate,
				assignedToId: dto.assignedToId ?? null,
				createdById,
				status: PlacementTaskStatus.PENDING,
			},
			include: {
				assignedTo: { select: { name: true } },
				createdBy: { select: { name: true } },
			},
		});

		return this.mapTask(task);
	}

	async completeTask(
		orgId: string,
		placementId: string,
		taskId: string,
		_userId: string,
	) {
		const existing = await this.prisma.placementTask.findFirst({
			where: {
				id: taskId,
				placementId,
				placement: { organizationId: orgId },
			},
			include: {
				assignedTo: { select: { name: true } },
				createdBy: { select: { name: true } },
			},
		});
		if (!existing) throw new NotFoundException("Task not found");

		if (existing.status === PlacementTaskStatus.COMPLETED) {
			return this.mapTask(existing);
		}

		const task = await this.prisma.placementTask.update({
			where: { id: taskId },
			data: {
				status: PlacementTaskStatus.COMPLETED,
				completedAt: new Date(),
			},
			include: {
				assignedTo: { select: { name: true } },
				createdBy: { select: { name: true } },
			},
		});

		return this.mapTask(task);
	}

	async endPlacement(
		orgId: string,
		placementId: string,
		dto: EndPlacementDto,
		userId: string,
	) {
		this.logger.log(
			`endPlacement requested orgId=${orgId} placementId=${placementId} userId=${userId}`,
		);

		const placement = await this.prisma.placement.findFirst({
			where: { id: placementId, organizationId: orgId },
		});
		if (!placement) {
			this.logger.warn(
				`endPlacement: placement not found orgId=${orgId} placementId=${placementId}`,
			);
			throw new NotFoundException("Placement not found");
		}

		if (!ENDABLE_PLACEMENT_STATUSES.includes(placement.status)) {
			this.logger.warn(
				`endPlacement: not endable placementId=${placementId} status=${placement.status}`,
			);
			throw new BadRequestException("Placement is already ended");
		}

		const now = new Date();

		try {
			await this.prisma.$transaction([
				this.prisma.placement.update({
					where: { id: placementId },
					data: {
						status: PlacementStatus.TERMINATED,
						actualEndDate: now,
						terminationReason: dto.terminationReason ?? null,
						terminatedById: userId,
						updatedBy: userId,
					},
				}),
				this.prisma.placementOfferHistory.create({
					data: {
						placementId,
						eventType: OfferEventType.PLACEMENT_TERMINATED,
						description: dto.terminationReason ?? "Placement terminated",
						performedById: userId,
						performedAt: now,
					},
				}),
			]);
		} catch (err) {
			this.logger.error(
				`endPlacement: transaction failed orgId=${orgId} placementId=${placementId}`,
				err instanceof Error ? err.stack : err,
			);
			throw err;
		}

		this.logger.log(
			`endPlacement: success placementId=${placementId} previousStatus=${placement.status}`,
		);

		await this.backgroundJobs.enqueueCredentialExpirySummaryForPlacement(
			placementId,
		);
		await this.backgroundJobs.enqueueMonthlyMetricSnapshotForOrganization(
			orgId,
		);

		return { success: true };
	}
}
