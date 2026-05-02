import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { CandidateWorkforceType, Prisma, TagStatus, TagType } from "@repo/db";
import { CANDIDATE_WORKFORCE_TYPE_OPTIONS, getLabel } from "@repo/shared";
import { PrismaService } from "src/prisma/prisma.service";
import type { AddWorkforceListMembersDto } from "./dto/add-workforce-list-members.dto";
import type { BulkTagWorkforceListDto } from "./dto/bulk-tag-workforce-list.dto";
import type { CreateWorkforceListDto } from "./dto/create-workforce-list.dto";
import type { WorkforceListMembersQueryDto } from "./dto/workforce-list-members-query.dto";
import type { WorkforceListsQueryDto } from "./dto/workforce-lists-query.dto";

@Injectable()
export class WorkforceListsService {
	constructor(private readonly prisma: PrismaService) {}

	private async ensureOrgExists(orgId: string) {
		const org = await this.prisma.organization.findUnique({
			where: { id: orgId },
			select: { id: true },
		});
		if (!org) {
			throw new NotFoundException("Organization not found");
		}
	}

	async list(orgId: string, query: WorkforceListsQueryDto) {
		await this.ensureOrgExists(orgId);

		const page = query.page ?? 1;
		const limit = query.limit ?? 12;
		const skip = (page - 1) * limit;

		const searchWhere = query.search
			? {
					OR: [
						{
							name: { contains: query.search, mode: "insensitive" as const },
						},
						{
							description: {
								contains: query.search,
								mode: "insensitive" as const,
							},
						},
					],
				}
			: {};

		const where = { organizationId: orgId, ...searchWhere };

		const [lists, total] = await Promise.all([
			this.prisma.workforceList.findMany({
				where,
				select: {
					id: true,
					name: true,
					description: true,
					updatedAt: true,
					_count: { select: { members: true } },
				},
				orderBy: { updatedAt: "desc" },
				skip,
				take: limit,
			}),
			this.prisma.workforceList.count({ where }),
		]);

		return {
			data: lists.map((l) => ({
				id: l.id,
				name: l.name,
				description: l.description ?? "",
				memberCount: l._count.members,
				updatedAt: l.updatedAt,
			})),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async create(orgId: string, dto: CreateWorkforceListDto, userId: string) {
		await this.ensureOrgExists(orgId);

		return this.prisma.workforceList.create({
			data: {
				organizationId: orgId,
				name: dto.name,
				description: dto.description?.trim() || null,
				createdById: userId,
				updatedById: userId,
			},
			select: { id: true, name: true, description: true, updatedAt: true },
		});
	}

	async remove(orgId: string, listId: string) {
		await this.ensureOrgExists(orgId);

		const list = await this.prisma.workforceList.findFirst({
			where: { id: listId, organizationId: orgId },
			select: { id: true },
		});
		if (!list) {
			throw new NotFoundException("Workforce list not found");
		}

		await this.prisma.workforceList.delete({ where: { id: listId } });
		return { success: true };
	}

	async get(orgId: string, listId: string) {
		await this.ensureOrgExists(orgId);

		const list = await this.prisma.workforceList.findFirst({
			where: { id: listId, organizationId: orgId },
			select: {
				id: true,
				name: true,
				description: true,
				updatedAt: true,
				_count: { select: { members: true } },
			},
		});
		if (!list) {
			throw new NotFoundException("Workforce list not found");
		}

		return {
			id: list.id,
			name: list.name,
			description: list.description ?? "",
			memberCount: list._count.members,
			updatedAt: list.updatedAt,
		};
	}

	private parseTagIds(tagIds: string | undefined) {
		if (!tagIds?.trim()) return [];
		return tagIds
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);
	}

	private buildMembersWhere(
		orgId: string,
		listId: string,
		query: WorkforceListMembersQueryDto,
	): Prisma.WorkforceListMemberWhereInput {
		const tagIds = this.parseTagIds(query.tagIds);

		const candidateWhere: Prisma.CandidateWhereInput = {
			organizationId: orgId,
			...(query.workforceType
				? { workforceType: query.workforceType as CandidateWorkforceType }
				: {}),
			...(query.occupationId ? { occupationId: query.occupationId } : {}),
			...(tagIds.length
				? { candidateTags: { some: { tagId: { in: tagIds } } } }
				: {}),
			...(query.search
				? {
						OR: [
							{
								user: {
									name: {
										contains: query.search,
										mode: "insensitive" as const,
									},
								},
							},
							{
								user: {
									email: {
										contains: query.search,
										mode: "insensitive" as const,
									},
								},
							},
							{
								occupation: {
									name: {
										contains: query.search,
										mode: "insensitive" as const,
									},
								},
							},
							{
								candidateTags: {
									some: {
										tag: {
											name: {
												contains: query.search,
												mode: "insensitive" as const,
											},
										},
									},
								},
							},
						],
					}
				: {}),
		};

		return { listId, candidate: candidateWhere };
	}

	async listMembers(
		orgId: string,
		listId: string,
		query: WorkforceListMembersQueryDto,
	) {
		await this.ensureOrgExists(orgId);

		const list = await this.prisma.workforceList.findFirst({
			where: { id: listId, organizationId: orgId },
			select: { id: true },
		});
		if (!list) {
			throw new NotFoundException("Workforce list not found");
		}

		const page = query.page ?? 1;
		const limit = query.limit ?? 20;
		const skip = (page - 1) * limit;

		const where = this.buildMembersWhere(orgId, listId, query);

		const [members, total] = await Promise.all([
			this.prisma.workforceListMember.findMany({
				where,
				select: {
					id: true,
					addedAt: true,
					candidate: {
						select: {
							id: true,
							workforceType: true,
							user: { select: { name: true, email: true } },
							occupation: { select: { name: true } },
							candidateTags: { select: { tag: { select: { name: true } } } },
						},
					},
				},
				orderBy: { addedAt: "desc" },
				skip,
				take: limit,
			}),
			this.prisma.workforceListMember.count({ where }),
		]);

		return {
			data: members.map((m) => ({
				id: m.id,
				candidateId: m.candidate.id,
				name: m.candidate.user.name,
				email: m.candidate.user.email,
				occupation: m.candidate.occupation.name,
				workforceType: m.candidate.workforceType,
				tags: m.candidate.candidateTags.map((t) => t.tag.name),
				addedAt: m.addedAt,
			})),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async addMembers(
		orgId: string,
		listId: string,
		dto: AddWorkforceListMembersDto,
		userId: string,
	) {
		await this.ensureOrgExists(orgId);

		const list = await this.prisma.workforceList.findFirst({
			where: { id: listId, organizationId: orgId },
			select: { id: true },
		});
		if (!list) {
			throw new NotFoundException("Workforce list not found");
		}

		const candidates = await this.prisma.candidate.findMany({
			where: { id: { in: dto.candidateIds }, organizationId: orgId },
			select: { id: true },
		});
		if (candidates.length !== dto.candidateIds.length) {
			throw new NotFoundException("One or more candidates were not found");
		}

		const existing = await this.prisma.workforceListMember.findMany({
			where: { listId, candidateId: { in: dto.candidateIds } },
			select: { candidateId: true },
		});
		const existingSet = new Set(existing.map((e) => e.candidateId));
		const toCreate = dto.candidateIds.filter((id) => !existingSet.has(id));
		if (!toCreate.length) {
			throw new ConflictException("Selected members are already in the list");
		}

		const created = await this.prisma.workforceListMember.createMany({
			data: toCreate.map((candidateId) => ({
				listId,
				candidateId,
				addedById: userId,
			})),
		});

		await this.prisma.workforceList.update({
			where: { id: listId },
			data: { updatedById: userId },
			select: { id: true },
		});

		return { addedCount: created.count };
	}

	async removeMember(orgId: string, listId: string, memberId: string) {
		await this.ensureOrgExists(orgId);

		const member = await this.prisma.workforceListMember.findFirst({
			where: { id: memberId, listId, list: { organizationId: orgId } },
			select: { id: true },
		});
		if (!member) {
			throw new NotFoundException("List member not found");
		}

		await this.prisma.workforceListMember.delete({ where: { id: memberId } });
		return { success: true };
	}

	async listAvailableCandidates(
		orgId: string,
		listId: string,
		query: WorkforceListMembersQueryDto,
	) {
		await this.ensureOrgExists(orgId);

		const list = await this.prisma.workforceList.findFirst({
			where: { id: listId, organizationId: orgId },
			select: { id: true },
		});
		if (!list) {
			throw new NotFoundException("Workforce list not found");
		}

		const page = query.page ?? 1;
		const limit = query.limit ?? 20;
		const skip = (page - 1) * limit;
		const tagIds = this.parseTagIds(query.tagIds);

		const candidateWhere: Prisma.CandidateWhereInput = {
			organizationId: orgId,
			workforceType: { not: null },
			...(query.workforceType
				? { workforceType: query.workforceType as CandidateWorkforceType }
				: {}),
			...(query.occupationId ? { occupationId: query.occupationId } : {}),
			...(tagIds.length
				? { candidateTags: { some: { tagId: { in: tagIds } } } }
				: {}),
			...(query.search
				? {
						OR: [
							{
								user: {
									name: {
										contains: query.search,
										mode: "insensitive" as const,
									},
								},
							},
							{
								user: {
									email: {
										contains: query.search,
										mode: "insensitive" as const,
									},
								},
							},
						],
					}
				: {}),
			NOT: {
				workforceListMembers: {
					some: { listId },
				},
			},
		};

		const [candidates, total] = await Promise.all([
			this.prisma.candidate.findMany({
				where: candidateWhere,
				select: {
					id: true,
					isActive: true,
					workforceType: true,
					user: { select: { name: true, email: true } },
					occupation: { select: { name: true } },
					candidateSpecialties: {
						select: { specialty: { select: { name: true } } },
						take: 1,
					},
					candidateTags: { select: { tag: { select: { name: true } } } },
				},
				orderBy: { updatedAt: "desc" },
				skip,
				take: limit,
			}),
			this.prisma.candidate.count({ where: candidateWhere }),
		]);

		return {
			data: candidates.map((c) => ({
				id: c.id,
				name: c.user.name,
				email: c.user.email,
				workforceType: c.workforceType,
				occupation: c.occupation.name,
				specialty: c.candidateSpecialties[0]?.specialty?.name ?? "—",
				tags: c.candidateTags.map((t) => t.tag.name),
				status: c.isActive ? "Active" : "Inactive",
			})),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	private normalizeTagName(input: string) {
		return input.trim().replaceAll(/\s+/g, " ").slice(0, 60).toLowerCase();
	}

	async bulkTag(
		orgId: string,
		listId: string,
		dto: BulkTagWorkforceListDto,
		userId: string,
	) {
		await this.ensureOrgExists(orgId);

		const list = await this.prisma.workforceList.findFirst({
			where: { id: listId, organizationId: orgId },
			select: { id: true },
		});
		if (!list) {
			throw new NotFoundException("Workforce list not found");
		}

		const tagName = this.normalizeTagName(dto.tagName);
		if (!tagName) {
			throw new BadRequestException("Tag name is required");
		}

		const tag = await this.prisma.tag.upsert({
			where: {
				name_type: {
					name: tagName,
					type: TagType.FLAG,
				},
			},
			create: {
				name: tagName,
				type: TagType.FLAG,
				description: null,
				showOnSubmission: false,
				status: TagStatus.ACTIVE,
				createdBy: userId,
			},
			update: {
				status: TagStatus.ACTIVE,
			},
			select: { id: true, name: true },
		});

		const memberWhere: Prisma.WorkforceListMemberWhereInput = dto.memberIds
			?.length
			? { listId, id: { in: dto.memberIds }, list: { organizationId: orgId } }
			: { listId, list: { organizationId: orgId } };

		const members = await this.prisma.workforceListMember.findMany({
			where: memberWhere,
			select: { candidateId: true },
		});

		if (!members.length) {
			throw new NotFoundException("No members found to tag");
		}

		const candidateIds = members.map((m) => m.candidateId);

		const result = await this.prisma.candidateTag.createMany({
			data: candidateIds.map((candidateId) => ({ candidateId, tagId: tag.id })),
			skipDuplicates: true,
		});

		await this.prisma.workforceList.update({
			where: { id: listId },
			data: { updatedById: userId },
			select: { id: true },
		});

		return {
			tagId: tag.id,
			tagName: tag.name,
			taggedCount: result.count,
		};
	}

	private csvEscape(value: unknown) {
		const str = value == null ? "" : String(value);
		return `"${str.replaceAll('"', '""')}"`;
	}

	async exportMembersCsv(
		orgId: string,
		listId: string,
		query: WorkforceListMembersQueryDto,
	) {
		await this.ensureOrgExists(orgId);

		const list = await this.prisma.workforceList.findFirst({
			where: { id: listId, organizationId: orgId },
			select: { id: true, name: true },
		});
		if (!list) throw new NotFoundException("Workforce list not found");

		const where = this.buildMembersWhere(orgId, listId, query);

		const total = await this.prisma.workforceListMember.count({ where });
		if (total > 10_000) {
			throw new BadRequestException(
				"Export is too large. Please narrow your filters and try again.",
			);
		}

		const members = await this.prisma.workforceListMember.findMany({
			where,
			select: {
				addedAt: true,
				candidate: {
					select: {
						workforceType: true,
						user: { select: { name: true, email: true } },
						occupation: { select: { name: true } },
						candidateTags: { select: { tag: { select: { name: true } } } },
					},
				},
			},
			orderBy: { addedAt: "desc" },
		});

		const header = [
			"Name",
			"Email",
			"Occupation",
			"Workforce Type",
			"Tags",
			"Added At",
		];

		const rows = members.map((m) => {
			const wt = m.candidate.workforceType;
			const wtLabel = wt ? getLabel(CANDIDATE_WORKFORCE_TYPE_OPTIONS, wt) : "";
			const tags = m.candidate.candidateTags.map((t) => t.tag.name).join(" | ");
			return [
				m.candidate.user.name,
				m.candidate.user.email,
				m.candidate.occupation.name,
				wtLabel,
				tags,
				m.addedAt.toISOString(),
			];
		});

		const csv = [header, ...rows]
			.map((r) => r.map((v) => this.csvEscape(v)).join(","))
			.join("\n");

		const safeName = list.name.trim().replaceAll(/[^a-zA-Z0-9-_ ]/g, "");
		const filename = `${safeName || list.id}-members.csv`;

		return { filename, csv };
	}
}
