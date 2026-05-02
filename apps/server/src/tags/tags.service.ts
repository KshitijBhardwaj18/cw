import { Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma, Tag } from "@repo/db";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateTagDto } from "./dto/create-tag.dto";
import type { PaginatedTagsQueryDto } from "./dto/paginated-tags.dto";
import type { UpdateTagDto } from "./dto/update-tag.dto";

@Injectable()
export class TagsService {
	constructor(private readonly prisma: PrismaService) {}

	async findAll(query: PaginatedTagsQueryDto) {
		const { search, type, showOnSubmission, page = 1, limit = 10 } = query;
		const skip = (page - 1) * limit;

		const where: Prisma.TagWhereInput = {};

		if (search?.trim()) {
			where.OR = [
				{ name: { contains: search.trim(), mode: "insensitive" } },
				{
					description: { contains: search.trim(), mode: "insensitive" },
				},
			];
		}

		if (type) {
			where.type = type;
		}

		if (showOnSubmission !== undefined) {
			where.showOnSubmission = showOnSubmission;
		}

		const [data, total] = await Promise.all([
			this.prisma.tag.findMany({
				where,
				skip,
				take: limit,
				orderBy: [{ type: "asc" }, { name: "asc" }],
			}),
			this.prisma.tag.count({ where }),
		]);

		return {
			data,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async findOne(id: string): Promise<Tag | null> {
		return this.prisma.tag.findUnique({
			where: { id },
		});
	}

	async create(dto: CreateTagDto, createdBy: string): Promise<Tag> {
		return this.prisma.tag.create({
			data: {
				name: dto.name,
				type: dto.type,
				description: dto.description ?? null,
				showOnSubmission: dto.showOnSubmission,
				createdBy,
			},
		});
	}

	async update(id: string, dto: UpdateTagDto): Promise<Tag> {
		const existing = await this.prisma.tag.findUnique({
			where: { id },
		});

		if (!existing) {
			throw new NotFoundException(`Tag with id ${id} not found`);
		}

		return this.prisma.tag.update({
			where: { id },
			data: {
				...(dto.name !== undefined && { name: dto.name }),
				...(dto.type !== undefined && { type: dto.type }),
				...(dto.description !== undefined && {
					description: dto.description ?? null,
				}),
				...(dto.showOnSubmission !== undefined && {
					showOnSubmission: dto.showOnSubmission,
				}),
			},
		});
	}

	async delete(id: string): Promise<void> {
		const existing = await this.prisma.tag.findUnique({
			where: { id },
		});

		if (!existing) {
			throw new NotFoundException(`Tag with id ${id} not found`);
		}

		await this.prisma.tag.delete({ where: { id } });
	}
}
