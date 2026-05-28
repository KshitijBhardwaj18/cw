import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import {
	GrievanceStatus,
	GrievanceTaskStatus,
	OrganizationMemberStatus,
	PlacementStatus,
	Prisma,
} from "@repo/db";
import type { PagePaginatedResponse } from "@repo/shared";
import { PrismaService } from "src/prisma/prisma.service";
import type { CreateGrievanceDto } from "./dto/create-grievance.dto";
import type { CreateGrievanceTaskDto } from "./dto/create-grievance-task.dto";
import type { QueryGrievancesDto } from "./dto/query-grievances.dto";
import {
	GRIEVANCES_LIST_DEFAULT_LIMIT,
	GRIEVANCES_LIST_DEFAULT_PAGE,
} from "./dto/query-grievances.dto";
import type { UpdateGrievanceDto } from "./dto/update-grievance.dto";
import type { UpdateGrievanceTaskDto } from "./dto/update-grievance-task.dto";

const PLACEMENT_OPEN_STATUSES: PlacementStatus[] = [
	PlacementStatus.UPCOMING,
	PlacementStatus.ON_HOLD,
	PlacementStatus.ACTIVE,
];

@Injectable()
export class GrievancesService {
	constructor(private readonly prisma: PrismaService) {}

	private async assertCandidateInOrg(
		orgId: string,
		candidateId: string,
	): Promise<void> {
		const found = await this.prisma.candidate.findFirst({
			where: {
				id: candidateId,
				OR: [
					{ organizationId: orgId },
					{ placements: { some: { organizationId: orgId } } },
				],
			},
			select: { id: true },
		});
		if (!found) {
			throw new BadRequestException(
				"Worker is not associated with this organization",
			);
		}
	}

	private async assertPlacementForCandidate(
		orgId: string,
		candidateId: string,
		placementId: string,
	): Promise<void> {
		const p = await this.prisma.placement.findFirst({
			where: {
				id: placementId,
				organizationId: orgId,
				candidateId,
				status: { in: PLACEMENT_OPEN_STATUSES },
			},
			select: { id: true },
		});
		if (!p) {
			throw new BadRequestException(
				"Placement not found for this worker and organization",
			);
		}
	}

	private async nextGrievanceNumber(
		tx: Prisma.TransactionClient,
		orgId: string,
	): Promise<string> {
		const year = new Date().getFullYear();
		const prefix = `GRV-${year}-`;
		const n = await tx.grievance.count({
			where: {
				organizationId: orgId,
				grievanceNumber: { startsWith: prefix },
			},
		});
		return `${prefix}${String(n + 1).padStart(3, "0")}`;
	}

	async getLogOptions(orgId: string) {
		const [candidates, placements] = await Promise.all([
			this.prisma.candidate.findMany({
				where: {
					OR: [
						{ organizationId: orgId },
						{ placements: { some: { organizationId: orgId } } },
					],
				},
				select: {
					id: true,
					user: { select: { name: true } },
				},
				orderBy: { user: { name: "asc" } },
			}),
			this.prisma.placement.findMany({
				where: {
					organizationId: orgId,
					status: { in: PLACEMENT_OPEN_STATUSES },
				},
				select: {
					id: true,
					candidateId: true,
					placementNumber: true,
					jobTitle: true,
					location: { select: { name: true } },
				},
				orderBy: { createdAt: "desc" },
				take: 500,
			}),
		]);

		return {
			candidates: candidates.map((c) => ({
				id: c.id,
				name: c.user.name ?? "Unknown",
			})),
			placements: placements.map((p) => {
				const title = p.jobTitle?.trim() || p.placementNumber;
				const loc = p.location?.name?.trim();
				const label = loc ? `${title} — ${loc}` : title;
				return {
					id: p.id,
					candidateId: p.candidateId,
					label,
				};
			}),
		};
	}

	async getCounts(orgId: string) {
		const [total, groups] = await Promise.all([
			this.prisma.grievance.count({ where: { organizationId: orgId } }),
			this.prisma.grievance.groupBy({
				by: ["status"],
				where: { organizationId: orgId },
				_count: { _all: true },
			}),
		]);
		const m = new Map(groups.map((g) => [g.status, g._count._all]));
		return {
			total,
			open: m.get(GrievanceStatus.OPEN) ?? 0,
			inProgress: m.get(GrievanceStatus.IN_PROGRESS) ?? 0,
			resolved: m.get(GrievanceStatus.RESOLVED) ?? 0,
		};
	}

	async list(
		orgId: string,
		query: QueryGrievancesDto,
	): Promise<
		PagePaginatedResponse<{
			id: string;
			grievanceNumber: string;
			type: string;
			candidateId: string;
			workerName: string;
			placementId: string | null;
			placementLabel: string | null;
			description: string;
			status: string;
			createdAt: string;
		}>
	> {
		const page = query.page ?? GRIEVANCES_LIST_DEFAULT_PAGE;
		const limit = query.limit ?? GRIEVANCES_LIST_DEFAULT_LIMIT;
		const skip = (page - 1) * limit;

		const where: Prisma.GrievanceWhereInput = {
			organizationId: orgId,
			...(query.type ? { type: query.type } : {}),
			...(query.status ? { status: query.status } : {}),
			...(query.search?.trim()
				? {
						OR: [
							{
								grievanceNumber: {
									contains: query.search.trim(),
									mode: "insensitive",
								},
							},
							{
								description: {
									contains: query.search.trim(),
									mode: "insensitive",
								},
							},
							{
								candidate: {
									is: {
										user: {
											is: {
												name: {
													contains: query.search.trim(),
													mode: "insensitive",
												},
											},
										},
									},
								},
							},
						],
					}
				: {}),
		};

		const [total, rows] = await Promise.all([
			this.prisma.grievance.count({ where }),
			this.prisma.grievance.findMany({
				where,
				select: {
					id: true,
					grievanceNumber: true,
					type: true,
					candidateId: true,
					description: true,
					status: true,
					createdAt: true,
					candidate: {
						select: { user: { select: { name: true } } },
					},
					placement: {
						select: {
							id: true,
							jobTitle: true,
							placementNumber: true,
							location: { select: { name: true } },
						},
					},
				},
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
			}),
		]);

		const data = rows.map((r) => {
			const title =
				r.placement?.jobTitle?.trim() || r.placement?.placementNumber || null;
			const loc = r.placement?.location?.name?.trim();
			const placementLabel =
				title && loc ? `${title} — ${loc}` : (title ?? null);
			return {
				id: r.id,
				grievanceNumber: r.grievanceNumber,
				type: r.type,
				candidateId: r.candidateId,
				workerName: r.candidate.user?.name ?? "Unknown",
				placementId: r.placement?.id ?? null,
				placementLabel,
				description: r.description,
				status: r.status,
				createdAt: r.createdAt.toISOString(),
			};
		});

		return {
			data,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit) || 1,
		};
	}

	async getById(orgId: string, grievanceId: string) {
		const g = await this.prisma.grievance.findFirst({
			where: { id: grievanceId, organizationId: orgId },
			include: {
				candidate: {
					select: {
						user: { select: { name: true } },
						occupation: { select: { name: true } },
					},
				},
				placement: {
					select: {
						id: true,
						placementNumber: true,
						jobTitle: true,
						location: { select: { name: true } },
					},
				},
				tasks: {
					include: {
						assignedTo: { select: { name: true } },
					},
					orderBy: { createdAt: "asc" },
				},
			},
		});
		if (!g) throw new NotFoundException("Grievance not found.");

		const placementHospitalName = g.placement?.location?.name ?? null;
		const jobPart =
			g.placement?.jobTitle?.trim() || g.placement?.placementNumber;
		const placementLabel =
			jobPart && placementHospitalName
				? `${jobPart} — ${placementHospitalName}`
				: (jobPart ?? null);

		return {
			id: g.id,
			grievanceNumber: g.grievanceNumber,
			type: g.type,
			status: g.status,
			description: g.description,
			candidateId: g.candidateId,
			workerName: g.candidate.user?.name ?? "Unknown",
			candidateRoleLabel: g.candidate.occupation?.name ?? "—",
			placementId: g.placementId,
			placementLabel,
			placementHospitalName,
			placementNumericId: g.placement?.placementNumber ?? null,
			createdAt: g.createdAt.toISOString(),
			tasks: g.tasks.map((t) => ({
				id: t.id,
				category: t.category,
				description: t.description,
				status: t.status,
				assignedToUserId: t.assignedToUserId,
				assigneeName: t.assignedTo.name ?? "—",
				completedAt: t.completedAt?.toISOString() ?? null,
				createdAt: t.createdAt.toISOString(),
			})),
		};
	}

	async create(orgId: string, dto: CreateGrievanceDto, createdById: string) {
		await this.assertCandidateInOrg(orgId, dto.candidateId);
		if (dto.placementId) {
			await this.assertPlacementForCandidate(
				orgId,
				dto.candidateId,
				dto.placementId,
			);
		}

		let lastError: unknown;
		for (let attempt = 0; attempt < 5; attempt++) {
			try {
				const created = await this.prisma.$transaction(async (tx) => {
					const grievanceNumber = await this.nextGrievanceNumber(tx, orgId);
					return tx.grievance.create({
						data: {
							organizationId: orgId,
							grievanceNumber,
							type: dto.type,
							candidateId: dto.candidateId,
							placementId: dto.placementId ?? null,
							description: dto.description.trim(),
							createdById,
							status: GrievanceStatus.OPEN,
						},
						select: { id: true },
					});
				});
				return created;
			} catch (e) {
				lastError = e;
				if (
					e instanceof Prisma.PrismaClientKnownRequestError &&
					e.code === "P2002"
				) {
					continue;
				}
				throw e;
			}
		}
		throw lastError instanceof Error
			? lastError
			: new Error("Could not allocate grievance number");
	}

	async update(orgId: string, grievanceId: string, dto: UpdateGrievanceDto) {
		const n = await this.prisma.grievance.updateMany({
			where: { id: grievanceId, organizationId: orgId },
			data: {
				...(dto.status != null ? { status: dto.status } : {}),
			},
		});
		if (n.count === 0) throw new NotFoundException("Grievance not found.");
		return this.getById(orgId, grievanceId);
	}

	async createTask(
		orgId: string,
		grievanceId: string,
		dto: CreateGrievanceTaskDto,
		createdById: string | undefined,
	) {
		await this.ensureGrievance(orgId, grievanceId);
		const member = await this.prisma.member.findFirst({
			where: {
				organizationId: orgId,
				userId: dto.assignedToUserId,
				status: OrganizationMemberStatus.ACTIVE,
			},
			select: { id: true },
		});
		if (!member) {
			throw new BadRequestException(
				"Assignee must be an active member of this organization",
			);
		}

		await this.prisma.$transaction([
			this.prisma.grievanceTask.create({
				data: {
					grievanceId,
					category: dto.category.trim(),
					assignedToUserId: dto.assignedToUserId,
					description: dto.description.trim(),
					createdById: createdById ?? null,
					status: GrievanceTaskStatus.PENDING,
				},
			}),
			this.prisma.grievance.updateMany({
				where: {
					id: grievanceId,
					organizationId: orgId,
					status: GrievanceStatus.OPEN,
				},
				data: { status: GrievanceStatus.IN_PROGRESS },
			}),
		]);

		return this.getById(orgId, grievanceId);
	}

	async updateTask(
		orgId: string,
		grievanceId: string,
		taskId: string,
		dto: UpdateGrievanceTaskDto,
	) {
		await this.ensureGrievance(orgId, grievanceId);
		const task = await this.prisma.grievanceTask.findFirst({
			where: { id: taskId, grievanceId },
		});
		if (!task) throw new NotFoundException("Task not found.");

		const now = new Date();
		const nextStatus = dto.status ?? task.status;
		await this.prisma.grievanceTask.update({
			where: { id: taskId },
			data: {
				status: nextStatus,
				...(nextStatus === GrievanceTaskStatus.COMPLETED
					? { completedAt: now }
					: { completedAt: null }),
			},
		});

		if (nextStatus === GrievanceTaskStatus.COMPLETED) {
			const remaining = await this.prisma.grievanceTask.count({
				where: {
					grievanceId,
					status: { not: GrievanceTaskStatus.COMPLETED },
				},
			});
			if (remaining === 0) {
				await this.prisma.grievance.updateMany({
					where: { id: grievanceId, organizationId: orgId },
					data: { status: GrievanceStatus.RESOLVED },
				});
			}
		} else {
			await this.prisma.grievance.updateMany({
				where: {
					id: grievanceId,
					organizationId: orgId,
					status: GrievanceStatus.RESOLVED,
				},
				data: { status: GrievanceStatus.IN_PROGRESS },
			});
		}

		return this.getById(orgId, grievanceId);
	}

	private async ensureGrievance(
		orgId: string,
		grievanceId: string,
	): Promise<void> {
		const n = await this.prisma.grievance.count({
			where: { id: grievanceId, organizationId: orgId },
		});
		if (n === 0) throw new NotFoundException("Grievance not found.");
	}
}
