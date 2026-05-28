import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import { Prisma, ProjectStatus, RequisitionStatus } from "@repo/db";
import { PrismaService } from "src/prisma/prisma.service";
import type { AddProjectRequisitionsDto } from "./dto/add-project-requisitions.dto";
import type { CreateProjectDto } from "./dto/create-project.dto";
import type { QueryProjectRequisitionsDto } from "./dto/query-project-requisitions.dto";
import type { QueryProjectsDto } from "./dto/query-projects.dto";
import type { UpdateProjectDto } from "./dto/update-project.dto";

const PROJECTS_LIST_ALL_MAX = 500;

const PROJECT_REQUISITION_INCLUDE = {
	location: { select: { name: true, city: true, state: true } },
	organizationOccupation: {
		select: { occupation: { select: { name: true } } },
	},
	requisitionSpecialties: {
		select: {
			organizationSpecialty: {
				select: { specialty: { select: { name: true } } },
			},
		},
	},
} as const;

type ProjectRequisitionRow = Prisma.RequisitionGetPayload<{
	include: typeof PROJECT_REQUISITION_INCLUDE;
}>;

const ACTIVE_REQUISITION_STATUSES = [RequisitionStatus.PUBLISHED] as const;

function formatLocation(loc: ProjectRequisitionRow["location"]): string {
	if (!loc) return "—";
	return [loc.name, loc.city, loc.state].filter(Boolean).join(", ") || "—";
}

function mapRequisitionRowToApi(row: ProjectRequisitionRow) {
	const billRate = row.billRate != null ? Math.round(row.billRate) : null;
	const rateLabel = billRate != null ? `$${billRate}/hr` : "—";
	const startDateLabel = row.startDate ? row.startDate.toISOString() : "—";
	const isActive = (
		ACTIVE_REQUISITION_STATUSES as readonly RequisitionStatus[]
	).includes(row.status);

	return {
		id: row.id,
		title: row.jobTitle ?? "Untitled requisition",
		occupation: row.organizationOccupation?.occupation.name ?? "—",
		location: formatLocation(row.location),
		rateLabel,
		openPositions: isActive ? row.numberOfPositions : 0,
		specialty: (() => {
			const names = row.requisitionSpecialties
				.map((s) => s.organizationSpecialty.specialty.name)
				.filter(Boolean);
			if (names.length === 0) return "—";
			if (names.length === 1) return names[0];
			return `${names[0]} (+${names.length - 1})`;
		})(),
		startDateLabel,
		status: row.status,
	};
}

type ProjectListRow = Prisma.ProjectGetPayload<{
	include: { _count: { select: { requisitions: true } } };
}>;

@Injectable()
export class ProjectsService {
	private readonly logger = new Logger(ProjectsService.name);

	constructor(private readonly prisma: PrismaService) {}

	private async ensureOrgExists(orgId: string): Promise<void> {
		const org = await this.prisma.organization.findUnique({
			where: { id: orgId },
			select: { id: true },
		});
		if (!org) throw new NotFoundException("Organization not found.");
	}

	private mapProjectStatusToLabel(
		status: ProjectStatus,
	): "Active" | "Inactive" {
		return status === ProjectStatus.INACTIVE ? "Inactive" : "Active";
	}

	private mapListRow(row: ProjectListRow) {
		return {
			id: row.id,
			name: row.name,
			description: row.description ?? "",
			status: this.mapProjectStatusToLabel(row.status),
			requisitionCount: row._count.requisitions,
			updatedAt: row.updatedAt.toISOString(),
		};
	}

	private requisitionDisplayStatusWhere(
		st: QueryProjectRequisitionsDto["requisitionStatus"],
	): Prisma.RequisitionWhereInput | undefined {
		if (!st || st === "all") return undefined;
		return { status: st };
	}

	private requisitionSearchWhere(
		search: string | undefined,
	): Prisma.RequisitionWhereInput | undefined {
		const term = search?.trim();
		if (!term) return undefined;

		const or: Prisma.RequisitionWhereInput[] = [
			{ jobTitle: { contains: term, mode: "insensitive" } },
			{
				organizationOccupation: {
					occupation: { name: { contains: term, mode: "insensitive" } },
				},
			},
			{ location: { name: { contains: term, mode: "insensitive" } } },
			{ location: { city: { contains: term, mode: "insensitive" } } },
			{ location: { state: { contains: term, mode: "insensitive" } } },
		];

		return { OR: or };
	}

	async list(orgId: string, query: QueryProjectsDto) {
		await this.ensureOrgExists(orgId);

		const search = query.search?.trim();
		const searchWhere: Prisma.ProjectWhereInput | undefined = search
			? {
					OR: [
						{ name: { contains: search, mode: "insensitive" } },
						{ description: { contains: search, mode: "insensitive" } },
					],
				}
			: undefined;

		const where: Prisma.ProjectWhereInput = {
			organizationId: orgId,
			AND: [
				...(query.projectStatus ? [{ status: query.projectStatus }] : []),
				...(searchWhere ? [searchWhere] : []),
			],
		};

		if (query.all) {
			const total = await this.prisma.project.count({ where });
			if (total > PROJECTS_LIST_ALL_MAX) {
				throw new BadRequestException(
					`Cannot return more than ${PROJECTS_LIST_ALL_MAX} projects in one request. Refine filters or use pagination.`,
				);
			}
			const rows = await this.prisma.project.findMany({
				where,
				orderBy: { updatedAt: "desc" },
				include: { _count: { select: { requisitions: true } } },
			});
			return {
				data: rows.map((r) => this.mapListRow(r)),
				total,
				page: 1,
				limit: total,
				totalPages: 1,
			};
		}

		const page = query.page ?? 1;
		const limit = query.limit ?? 20;
		const skip = (page - 1) * limit;

		const [rows, total] = await Promise.all([
			this.prisma.project.findMany({
				where,
				orderBy: { updatedAt: "desc" },
				skip,
				take: limit,
				include: { _count: { select: { requisitions: true } } },
			}),
			this.prisma.project.count({ where }),
		]);

		return {
			data: rows.map((r) => this.mapListRow(r)),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit) || 1,
		};
	}

	async create(orgId: string, dto: CreateProjectDto, userId: string) {
		await this.ensureOrgExists(orgId);
		const created = await this.prisma.project.create({
			data: {
				organizationId: orgId,
				name: dto.name,
				description: dto.description ?? null,
				status: dto.status,
				createdById: userId,
				updatedById: userId,
			},
			include: { _count: { select: { requisitions: true } } },
		});
		return this.mapListRow(created);
	}

	async findMeta(orgId: string, id: string) {
		await this.ensureOrgExists(orgId);
		const row = await this.prisma.project.findFirst({
			where: { id, organizationId: orgId },
			select: {
				id: true,
				name: true,
				description: true,
				status: true,
				updatedAt: true,
			},
		});
		if (!row) throw new NotFoundException("Project not found.");

		return {
			id: row.id,
			name: row.name,
			description: row.description ?? "",
			status: this.mapProjectStatusToLabel(row.status),
			updatedAt: row.updatedAt.toISOString(),
		};
	}

	async getStats(orgId: string, projectId: string) {
		await this.ensureOrgExists(orgId);
		const exists = await this.prisma.project.findFirst({
			where: { id: projectId, organizationId: orgId },
			select: { id: true },
		});
		if (!exists) throw new NotFoundException("Project not found.");

		const base = { projectId, organizationId: orgId };

		const activeWhere: Prisma.RequisitionWhereInput = {
			...base,
			status: { in: [...ACTIVE_REQUISITION_STATUSES] },
		};

		const [requisitionCount, agg, activeRequisitions] = await Promise.all([
			this.prisma.requisition.count({ where: base }),
			this.prisma.requisition.aggregate({
				where: activeWhere,
				_sum: { numberOfPositions: true },
			}),
			this.prisma.requisition.count({ where: activeWhere }),
		]);

		return {
			requisitionCount,
			totalOpenPositions: agg._sum.numberOfPositions ?? 0,
			activeRequisitions,
		};
	}

	async listRequisitions(
		orgId: string,
		projectId: string,
		query: QueryProjectRequisitionsDto,
	) {
		await this.ensureOrgExists(orgId);
		if (query.all) {
			throw new BadRequestException(
				"Use page and limit to paginate project requisitions.",
			);
		}

		const exists = await this.prisma.project.findFirst({
			where: { id: projectId, organizationId: orgId },
			select: { id: true },
		});
		if (!exists) throw new NotFoundException("Project not found.");

		const base: Prisma.RequisitionWhereInput = {
			projectId,
			organizationId: orgId,
		};
		const searchWhere = this.requisitionSearchWhere(query.search);
		const statusWhere = this.requisitionDisplayStatusWhere(
			query.requisitionStatus,
		);

		const where: Prisma.RequisitionWhereInput = {
			AND: [
				base,
				...(searchWhere ? [searchWhere] : []),
				...(statusWhere ? [statusWhere] : []),
			],
		};

		const page = query.page ?? 1;
		const limit = query.limit ?? 20;
		const skip = (page - 1) * limit;

		const [rows, total] = await Promise.all([
			this.prisma.requisition.findMany({
				where,
				include: PROJECT_REQUISITION_INCLUDE,
				orderBy: { updatedAt: "desc" },
				skip,
				take: limit,
			}),
			this.prisma.requisition.count({ where }),
		]);

		return {
			data: rows.map(mapRequisitionRowToApi),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit) || 1,
		};
	}

	async update(
		orgId: string,
		id: string,
		dto: UpdateProjectDto,
		userId: string,
	) {
		await this.ensureOrgExists(orgId);
		const existing = await this.prisma.project.findFirst({
			where: { id, organizationId: orgId },
			select: { id: true },
		});
		if (!existing) throw new NotFoundException("Project not found.");

		const updated = await this.prisma.project.update({
			where: { id },
			data: {
				...(dto.name !== undefined ? { name: dto.name } : {}),
				...(dto.description !== undefined
					? { description: dto.description ?? null }
					: {}),
				...(dto.status !== undefined ? { status: dto.status } : {}),
				updatedById: userId,
			},
			include: { _count: { select: { requisitions: true } } },
		});
		return this.mapListRow(updated);
	}

	async remove(orgId: string, id: string): Promise<void> {
		await this.ensureOrgExists(orgId);
		const existing = await this.prisma.project.findFirst({
			where: { id, organizationId: orgId },
			select: { id: true },
		});
		if (!existing) throw new NotFoundException("Project not found.");

		await this.prisma.project.delete({ where: { id } });
		this.logger.log(`Deleted project ${id} for organization ${orgId}`);
	}

	async addRequisitions(
		orgId: string,
		projectId: string,
		dto: AddProjectRequisitionsDto,
	): Promise<void> {
		await this.ensureOrgExists(orgId);

		if (dto.requisitionIds.length === 0) {
			throw new BadRequestException("Select at least one requisition.");
		}

		await this.prisma.$transaction(async (tx) => {
			const project = await tx.project.findFirst({
				where: { id: projectId, organizationId: orgId },
				select: { id: true },
			});
			if (!project) throw new NotFoundException("Project not found.");

			const uniqueIds = [...new Set(dto.requisitionIds)];
			const count = await tx.requisition.count({
				where: {
					id: { in: uniqueIds },
					organizationId: orgId,
				},
			});
			if (count !== uniqueIds.length) {
				throw new BadRequestException(
					"One or more requisitions were not found for this organization",
				);
			}

			await tx.requisition.updateMany({
				where: {
					id: { in: dto.requisitionIds },
					organizationId: orgId,
				},
				data: { projectId },
			});
		});
	}

	async removeRequisition(
		orgId: string,
		projectId: string,
		requisitionId: string,
	): Promise<void> {
		await this.ensureOrgExists(orgId);

		await this.prisma.$transaction(async (tx) => {
			const project = await tx.project.findFirst({
				where: { id: projectId, organizationId: orgId },
				select: { id: true },
			});
			if (!project) throw new NotFoundException("Project not found.");

			const updated = await tx.requisition.updateMany({
				where: {
					id: requisitionId,
					organizationId: orgId,
					projectId,
				},
				data: { projectId: null },
			});
			if (updated.count === 0) {
				throw new NotFoundException("Requisition not found on this project.");
			}
		});
	}
}
