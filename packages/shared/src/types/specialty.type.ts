import type { Prisma } from "@repo/db";

/** Matches the `include` used by SpecialtiesService.getAllSpecialties */
export type SpecialtyResponseType = Prisma.SpecialtyGetPayload<{
	include: {
		occupationSpecialties: {
			include: {
				occupation: { select: { id: true; name: true; acronym: true } };
			};
		};
	};
}>;

export type SpecialtyTableRowType = Pick<
	SpecialtyResponseType,
	"id" | "name" | "acronym" | "status"
> & {
	description?: string;
	group?: string;
	linkedOccupations: string[];
};

export interface PaginatedSpecialtyResponse {
	data: SpecialtyResponseType[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}
