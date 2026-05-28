import type { Prisma } from "@repo/db";

/**
 * "Vendor owns this placement" — true when *either*:
 *   - `placement.vendorId` matches (denormalised pointer, nullable on older rows / SetNull on vendor delete), OR
 *   - `placement.submission.vendorId` matches (source of truth — who submitted the candidate)
 *
 * Used by both list queries and action authorization so they stay symmetric.
 */
export function vendorPlacementOwnershipWhere(
	vendorId: string,
): Prisma.PlacementWhereInput {
	return {
		OR: [{ vendorId }, { submission: { is: { vendorId } } }],
	};
}

export function vendorPlacementWhere(
	orgId: string,
	placementId: string,
	vendorId: string,
): Prisma.PlacementWhereInput {
	return {
		id: placementId,
		organizationId: orgId,
		...vendorPlacementOwnershipWhere(vendorId),
	};
}
