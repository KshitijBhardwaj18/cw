import { NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

export async function assertPlacementInOrganization(
	prisma: PrismaService,
	orgId: string,
	placementId: string,
): Promise<void> {
	const n = await prisma.placement.count({
		where: { id: placementId, organizationId: orgId },
	});
	if (n === 0) throw new NotFoundException("Placement not found");
}
