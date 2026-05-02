import type { Prisma } from "@repo/db";

/** Matches the `include` used by OccupationsService.getAllOccupations */
export type OccupationResponseType = Prisma.OccupationGetPayload<{
	include: {
		occupationSpecialties: {
			include: {
				specialty: { select: { id: true; name: true; acronym: true } };
			};
		};
	};
}>;

export type OccupationTableRowType = Pick<
	OccupationResponseType,
	"id" | "name" | "acronym" | "industry" | "code" | "status"
>;

export interface PaginatedOccupationResponse {
	data: OccupationResponseType[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}
