import { Prisma } from "@repo/db";

export const PLACEMENT_LIST_INCLUDE = {
	submission: {
		select: {
			vendorId: true,
			candidate: {
				select: {
					user: { select: { name: true } },
					workforceListMembers: {
						orderBy: { addedAt: "asc" },
						select: { list: { select: { id: true, name: true } } },
					},
				},
			},
			vendor: { select: { name: true } },
			requisition: { select: { jobTitle: true, jobSummary: true } },
		},
	},
	location: { select: { name: true } },
	department: { select: { name: true } },
	hiringManager: { select: { name: true } },
} satisfies Prisma.PlacementInclude;

export type PlacementListRow = Prisma.PlacementGetPayload<{
	include: typeof PLACEMENT_LIST_INCLUDE;
}>;
