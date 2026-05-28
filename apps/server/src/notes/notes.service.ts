import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { NoteType } from "@repo/db";
import { PrismaService } from "../prisma/prisma.service";
import { CreateNoteDto } from "./dto/create-note.dto";

@Injectable()
export class NotesService {
	private readonly logger = new Logger(NotesService.name);

	constructor(private readonly prisma: PrismaService) {}

	async findByVendorId(
		vendorId: string,
		filters?: {
			search?: string;
			type?: NoteType;
			dateFrom?: string;
			dateTo?: string;
		},
	) {
		const where: Record<string, unknown> = { vendorId };

		if (filters?.search?.trim()) {
			where.notes = {
				contains: filters.search.trim(),
				mode: "insensitive" as const,
			};
		}

		if (filters?.type) {
			where.type = filters.type;
		}

		if (filters?.dateFrom || filters?.dateTo) {
			where.createdAt = {};
			if (filters.dateFrom) {
				(where.createdAt as Record<string, Date>).gte = new Date(
					filters.dateFrom,
				);
			}
			if (filters.dateTo) {
				const toDate = new Date(filters.dateTo);
				toDate.setHours(23, 59, 59, 999);
				(where.createdAt as Record<string, Date>).lte = toDate;
			}
		}

		return this.prisma.note.findMany({
			where,
			include: {
				user: true,
				vendor: {
					include: {
						organizationVendors: {
							include: { organization: true },
						},
					},
				},
			},
			orderBy: { createdAt: "desc" },
		});
	}

	async createForVendor(
		vendorId: string,
		dto: Omit<CreateNoteDto, "vendorId">,
		userId: string,
	) {
		const note = await this.prisma.note.create({
			data: {
				type: dto.type,
				notes: dto.notes,
				createdBy: userId,
				vendorId,
			},
		});

		this.logger.log(`Added note to vendor ${vendorId}`);
		return note;
	}

	async findByMspId(mspId: string, search?: string) {
		const where: Record<string, unknown> = { mspId };

		if (search?.trim()) {
			where.notes = {
				contains: search.trim(),
				mode: "insensitive" as const,
			};
		}

		return this.prisma.note.findMany({
			where,
			include: {
				user: true,
				msp: true,
			},
			orderBy: { createdAt: "desc" },
		});
	}

	async createForMsp(
		mspId: string,
		dto: { type: NoteType; notes: string },
		userId: string,
	) {
		const note = await this.prisma.note.create({
			data: {
				type: dto.type,
				notes: dto.notes,
				createdBy: userId,
				mspId,
			},
		});

		this.logger.log(`Added note to MSP ${mspId}`);
		return note;
	}

	async findByOrganizationId(
		organizationId: string,
		filters?: {
			search?: string;
			type?: NoteType;
			dateFrom?: string;
			dateTo?: string;
		},
	) {
		const where: Record<string, unknown> = { organizationId };

		if (filters?.search?.trim()) {
			where.notes = {
				contains: filters.search.trim(),
				mode: "insensitive" as const,
			};
		}

		if (filters?.type) {
			where.type = filters.type;
		}

		if (filters?.dateFrom || filters?.dateTo) {
			where.createdAt = {};
			if (filters.dateFrom) {
				(where.createdAt as Record<string, Date>).gte = new Date(
					filters.dateFrom,
				);
			}
			if (filters.dateTo) {
				const toDate = new Date(filters.dateTo);
				toDate.setHours(23, 59, 59, 999);
				(where.createdAt as Record<string, Date>).lte = toDate;
			}
		}

		return this.prisma.note.findMany({
			where,
			include: {
				user: true,
				organization: true,
			},
			orderBy: { createdAt: "desc" },
		});
	}

	async createForOrganization(
		organizationId: string,
		dto: Omit<CreateNoteDto, "vendorId">,
		userId: string,
	) {
		const note = await this.prisma.note.create({
			data: {
				type: dto.type,
				notes: dto.notes,
				createdBy: userId,
				organizationId,
			},
		});

		this.logger.log(`Added note to organization ${organizationId}`);
		return note;
	}

	async delete(id: string): Promise<void> {
		const note = await this.prisma.note.findUnique({
			where: { id },
			select: { id: true, vendorId: true, mspId: true },
		});
		if (!note) {
			throw new NotFoundException("Note not found.");
		}
		await this.prisma.note.delete({ where: { id } });
		this.logger.log(`Deleted note ${id}`);
	}

	async update(id: string, dto: { type?: NoteType; notes?: string }) {
		const note = await this.prisma.note.findUnique({
			where: { id },
			include: { user: true },
		});
		if (!note) {
			throw new NotFoundException("Note not found.");
		}
		const updated = await this.prisma.note.update({
			where: { id },
			data: {
				...(dto.type !== undefined && { type: dto.type }),
				...(dto.notes !== undefined && { notes: dto.notes }),
			},
		});
		this.logger.log(`Updated note ${id}`);
		return updated;
	}
}
